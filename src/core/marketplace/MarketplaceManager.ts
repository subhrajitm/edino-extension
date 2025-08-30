import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateConfig } from '../../types';
import { Logger } from '../../utils/logger';

export interface MarketplaceTemplate extends TemplateConfig {
    id: string;
    author: Author;
    publisher: Publisher;
    version: string;
    downloads: number;
    rating: number;
    reviews: Review[];
    price: Price;
    categories: string[];
    tags: string[];
    compatibility: Compatibility;
    license: License;
    publishedAt: Date;
    updatedAt: Date;
    status: TemplateStatus;
}

export interface Author {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    website?: string;
    verified: boolean;
    joinDate: Date;
}

export interface Publisher {
    id: string;
    name: string;
    description: string;
    logo?: string;
    website?: string;
    verified: boolean;
    templatesCount: number;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    helpful: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Price {
    type: 'free' | 'paid' | 'subscription';
    amount?: number;
    currency?: string;
    subscriptionPeriod?: 'monthly' | 'yearly';
}

export interface Compatibility {
    vscodeVersion: string;
    nodeVersion: string;
    platforms: string[];
    dependencies: string[];
}

export interface License {
    type: string;
    url: string;
    description: string;
}

export enum TemplateStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SUSPENDED = 'suspended',
    ARCHIVED = 'archived'
}

export interface SearchQuery {
    query?: string;
    categories?: string[];
    languages?: string[];
    frameworks?: string[];
    priceRange?: {
        min: number;
        max: number;
    };
    rating?: number;
    sortBy?: 'downloads' | 'rating' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface SearchResult {
    templates: MarketplaceTemplate[];
    total: number;
    page: number;
    totalPages: number;
    facets: SearchFacets;
}

export interface SearchFacets {
    categories: Array<{ name: string; count: number }>;
    languages: Array<{ name: string; count: number }>;
    frameworks: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
}

export interface PublishRequest {
    template: TemplateConfig;
    author: Author;
    price: Price;
    categories: string[];
    tags: string[];
    description: string;
    readme: string;
    license: License;
}

export class MarketplaceManager {
    private static instance: MarketplaceManager;
    private templates: Map<string, MarketplaceTemplate> = new Map();
    private authors: Map<string, Author> = new Map();
    private publishers: Map<string, Publisher> = new Map();
    private logger = Logger.getInstance();
    private storagePath: string;

    private constructor() {
        this.storagePath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', '.edino', 'marketplace');
    }

    public static getInstance(): MarketplaceManager {
        if (!MarketplaceManager.instance) {
            MarketplaceManager.instance = new MarketplaceManager();
        }
        return MarketplaceManager.instance;
    }

    public async initialize(): Promise<void> {
        this.logger.info('Initializing Marketplace Manager');
        await this.loadMarketplaceData();
    }

    public async publishTemplate(request: PublishRequest): Promise<MarketplaceTemplate> {
        this.logger.info(`Publishing template: ${request.template.name}`);

        // Validate template
        const validation = await this.validateTemplate(request.template);
        if (!validation.isValid) {
            throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }

        // Create marketplace template
        const marketplaceTemplate: MarketplaceTemplate = {
            ...request.template,
            id: this.generateTemplateId(),
            author: request.author,
            publisher: this.getOrCreatePublisher(request.author),
            version: '1.0.0',
            downloads: 0,
            rating: 0,
            reviews: [],
            price: request.price,
            categories: request.categories,
            tags: request.tags,
            compatibility: this.generateCompatibility(request.template),
            license: request.license,
            publishedAt: new Date(),
            updatedAt: new Date(),
            status: TemplateStatus.PUBLISHED
        };

        // Save template
        this.templates.set(marketplaceTemplate.id, marketplaceTemplate);
        this.authors.set(request.author.id, request.author);
        
        // Update publisher stats
        const publisher = this.publishers.get(marketplaceTemplate.publisher.id);
        if (publisher) {
            publisher.templatesCount++;
        }

        await this.saveMarketplaceData();
        
        this.logger.info(`Template published successfully: ${marketplaceTemplate.id}`);
        return marketplaceTemplate;
    }

    public async searchTemplates(query: SearchQuery): Promise<SearchResult> {
        this.logger.info('Searching templates', query);

        let results = Array.from(this.templates.values())
            .filter(t => t.status === TemplateStatus.PUBLISHED);

        // Apply filters
        if (query.query) {
            const searchTerm = query.query.toLowerCase();
            results = results.filter(t => 
                t.name.toLowerCase().includes(searchTerm) ||
                t.description.toLowerCase().includes(searchTerm) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        if (query.categories?.length) {
            results = results.filter(t => 
                query.categories!.some(cat => t.categories.includes(cat))
            );
        }

        if (query.languages?.length) {
            results = results.filter(t => 
                query.languages!.includes(t.language)
            );
        }

        if (query.frameworks?.length) {
            results = results.filter(t => 
                t.framework && query.frameworks!.includes(t.framework)
            );
        }

        if (query.priceRange) {
            results = results.filter(t => {
                if (t.price.type === 'free') return true;
                if (t.price.amount) {
                    return t.price.amount >= query.priceRange!.min && 
                           t.price.amount <= query.priceRange!.max;
                }
                return false;
            });
        }

        if (query.rating) {
            results = results.filter(t => t.rating >= query.rating!);
        }

        // Apply sorting
        const sortBy = query.sortBy || 'downloads';
        const sortOrder = query.sortOrder || 'desc';
        
        results.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'downloads':
                    comparison = a.downloads - b.downloads;
                    break;
                case 'rating':
                    comparison = a.rating - b.rating;
                    break;
                case 'date':
                    comparison = a.publishedAt.getTime() - b.publishedAt.getTime();
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        // Apply pagination
        const page = query.page || 1;
        const limit = query.limit || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = results.slice(startIndex, endIndex);

        // Generate facets
        const facets = this.generateSearchFacets(results);

        const searchResult: SearchResult = {
            templates: paginatedResults,
            total: results.length,
            page,
            totalPages: Math.ceil(results.length / limit),
            facets
        };

        this.logger.info(`Search completed: ${results.length} results found`);
        return searchResult;
    }

    public async downloadTemplate(templateId: string): Promise<TemplateConfig> {
        this.logger.info(`Downloading template: ${templateId}`);

        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // Increment download count
        template.downloads++;
        template.updatedAt = new Date();

        await this.saveMarketplaceData();

        // Return template config (without marketplace-specific fields)
        const { 
            id, author, publisher, downloads, rating, reviews, price, 
            categories, tags, compatibility, license, publishedAt, 
            updatedAt, status, ...templateConfig 
        } = template;

        // Ensure tags property exists
        const finalTemplateConfig = {
            ...templateConfig,
            tags: tags || []
        };

        this.logger.info(`Template downloaded successfully: ${templateId}`);
        return finalTemplateConfig;
    }

    public async rateTemplate(templateId: string, rating: number, comment?: string): Promise<void> {
        this.logger.info(`Rating template: ${templateId}, rating: ${rating}`);

        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        // Create review
        const review: Review = {
            id: this.generateReviewId(),
            userId: 'current-user', // This would come from auth context
            userName: 'Anonymous User',
            rating,
            comment: comment || '',
            helpful: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        template.reviews.push(review);

        // Update average rating
        const totalRating = template.reviews.reduce((sum, r) => sum + r.rating, 0);
        template.rating = totalRating / template.reviews.length;
        template.updatedAt = new Date();

        await this.saveMarketplaceData();
        this.logger.info(`Template rated successfully: ${templateId}`);
    }

    public async getTemplateDetails(templateId: string): Promise<MarketplaceTemplate> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        return template;
    }

    public async getPopularTemplates(limit: number = 10): Promise<MarketplaceTemplate[]> {
        return Array.from(this.templates.values())
            .filter(t => t.status === TemplateStatus.PUBLISHED)
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, limit);
    }

    public async getNewTemplates(limit: number = 10): Promise<MarketplaceTemplate[]> {
        return Array.from(this.templates.values())
            .filter(t => t.status === TemplateStatus.PUBLISHED)
            .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
            .slice(0, limit);
    }

    public async getTemplatesByAuthor(authorId: string): Promise<MarketplaceTemplate[]> {
        return Array.from(this.templates.values())
            .filter(t => t.author.id === authorId && t.status === TemplateStatus.PUBLISHED);
    }

    public async getTemplatesByPublisher(publisherId: string): Promise<MarketplaceTemplate[]> {
        return Array.from(this.templates.values())
            .filter(t => t.publisher.id === publisherId && t.status === TemplateStatus.PUBLISHED);
    }

    public async updateTemplate(templateId: string, updates: Partial<MarketplaceTemplate>): Promise<void> {
        this.logger.info(`Updating template: ${templateId}`);

        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // Update template
        Object.assign(template, updates);
        template.updatedAt = new Date();

        await this.saveMarketplaceData();
        this.logger.info(`Template updated successfully: ${templateId}`);
    }

    public async suspendTemplate(templateId: string, reason: string): Promise<void> {
        this.logger.info(`Suspending template: ${templateId}, reason: ${reason}`);

        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        template.status = TemplateStatus.SUSPENDED;
        template.updatedAt = new Date();

        await this.saveMarketplaceData();
        this.logger.info(`Template suspended successfully: ${templateId}`);
    }

    private async validateTemplate(template: TemplateConfig): Promise<{ isValid: boolean; errors: string[] }> {
        const errors: string[] = [];

        // Basic validation
        if (!template.name) errors.push('Template name is required');
        if (!template.description) errors.push('Template description is required');
        if (!template.type) errors.push('Template type is required');
        if (!template.language) errors.push('Template language is required');

        // Check for duplicate names
        const existingTemplate = Array.from(this.templates.values())
            .find(t => t.name === template.name);
        if (existingTemplate) {
            errors.push('Template name already exists');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private generateTemplateId(): string {
        return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateReviewId(): string {
        return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private getOrCreatePublisher(author: Author): Publisher {
        // For now, create a publisher for each author
        // In a real implementation, this would be more sophisticated
        const publisherId = `publisher-${author.id}`;
        
        let publisher = this.publishers.get(publisherId);
        if (!publisher) {
            publisher = {
                id: publisherId,
                name: `${author.name}'s Templates`,
                description: `Templates by ${author.name}`,
                verified: author.verified,
                templatesCount: 0
            };
            this.publishers.set(publisherId, publisher);
        }

        return publisher;
    }

    private generateCompatibility(template: TemplateConfig): Compatibility {
        return {
            vscodeVersion: '^1.74.0',
            nodeVersion: '^16.0.0',
            platforms: ['win32', 'darwin', 'linux'],
            dependencies: []
        };
    }

    private generateSearchFacets(templates: MarketplaceTemplate[]): SearchFacets {
        const categories = new Map<string, number>();
        const languages = new Map<string, number>();
        const frameworks = new Map<string, number>();
        const priceRanges = new Map<string, number>();

        for (const template of templates) {
            // Categories
            for (const category of template.categories) {
                categories.set(category, (categories.get(category) || 0) + 1);
            }

            // Languages
            languages.set(template.language, (languages.get(template.language) || 0) + 1);

            // Frameworks
            if (template.framework) {
                frameworks.set(template.framework, (frameworks.get(template.framework) || 0) + 1);
            }

            // Price ranges
            let priceRange = 'Free';
            if (template.price.type === 'paid' && template.price.amount) {
                if (template.price.amount <= 5) priceRange = '$0-$5';
                else if (template.price.amount <= 10) priceRange = '$5-$10';
                else priceRange = '$10+';
            }
            priceRanges.set(priceRange, (priceRanges.get(priceRange) || 0) + 1);
        }

        return {
            categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
            languages: Array.from(languages.entries()).map(([name, count]) => ({ name, count })),
            frameworks: Array.from(frameworks.entries()).map(([name, count]) => ({ name, count })),
            priceRanges: Array.from(priceRanges.entries()).map(([range, count]) => ({ range, count }))
        };
    }

    private async loadMarketplaceData(): Promise<void> {
        try {
            const marketplacePath = path.join(this.storagePath, 'marketplace.json');
            if (await fs.pathExists(marketplacePath)) {
                const data = await fs.readJson(marketplacePath);
                this.templates = new Map(Object.entries(data.templates || {}));
                this.authors = new Map(Object.entries(data.authors || {}));
                this.publishers = new Map(Object.entries(data.publishers || {}));
                this.logger.info(`Loaded ${this.templates.size} marketplace templates`);
            }
        } catch (error) {
            this.logger.error('Error loading marketplace data', error as Error);
        }
    }

    private async saveMarketplaceData(): Promise<void> {
        try {
            await fs.ensureDir(this.storagePath);
            const marketplacePath = path.join(this.storagePath, 'marketplace.json');
            
            const data = {
                templates: Object.fromEntries(this.templates),
                authors: Object.fromEntries(this.authors),
                publishers: Object.fromEntries(this.publishers),
                lastUpdated: new Date().toISOString()
            };

            await fs.writeJson(marketplacePath, data, { spaces: 2 });
            this.logger.debug('Marketplace data saved successfully');
        } catch (error) {
            this.logger.error('Error saving marketplace data', error as Error);
        }
    }
}
