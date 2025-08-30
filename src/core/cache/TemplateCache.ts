import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateConfig } from '../../types';
import { Logger } from '../../utils/logger';

export interface CacheConfig {
    maxSize: number;
    ttl: number; // Time to live in milliseconds
    preloadEnabled: boolean;
    preloadCount: number;
}

export interface CachedTemplate {
    template: TemplateConfig;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    maxSize: number;
    hitRate: number;
    evictions: number;
}

export class TemplateCache {
    private static instance: TemplateCache;
    private cache: Map<string, CachedTemplate> = new Map();
    private config: CacheConfig;
    private stats: {
        hits: number;
        misses: number;
        evictions: number;
    };
    private logger = Logger.getInstance();
    private cleanupInterval?: NodeJS.Timeout;

    private constructor() {
        this.config = {
            maxSize: 100,
            ttl: 30 * 60 * 1000, // 30 minutes
            preloadEnabled: true,
            preloadCount: 10
        };
        
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        this.startCleanupInterval();
    }

    public static getInstance(): TemplateCache {
        if (!TemplateCache.instance) {
            TemplateCache.instance = new TemplateCache();
        }
        return TemplateCache.instance;
    }

    public configure(config: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...config };
        this.logger.info('Template cache reconfigured', this.config);
    }

    public async getTemplate(id: string): Promise<TemplateConfig | null> {
        const cached = this.cache.get(id);
        
        if (!cached) {
            this.stats.misses++;
            return null;
        }

        // Check if template has expired
        if (Date.now() - cached.timestamp > this.config.ttl) {
            this.cache.delete(id);
            this.stats.misses++;
            return null;
        }

        // Update access statistics
        cached.accessCount++;
        cached.lastAccessed = Date.now();
        this.stats.hits++;

        return cached.template;
    }

    public async setTemplate(id: string, template: TemplateConfig): Promise<void> {
        // Check if cache is full
        if (this.cache.size >= this.config.maxSize) {
            await this.evictLeastUsed();
        }

        const cachedTemplate: CachedTemplate = {
            template,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now()
        };

        this.cache.set(id, cachedTemplate);
        this.logger.debug(`Template ${id} cached`);
    }

    public async invalidateTemplate(id: string): Promise<void> {
        const wasDeleted = this.cache.delete(id);
        if (wasDeleted) {
            this.logger.debug(`Template ${id} invalidated from cache`);
        }
    }

    public async invalidateAll(): Promise<void> {
        const size = this.cache.size;
        this.cache.clear();
        this.logger.info(`Cache cleared, ${size} templates removed`);
    }

    public async preloadPopularTemplates(templates: TemplateConfig[]): Promise<void> {
        if (!this.config.preloadEnabled) {
            return;
        }

        this.logger.info('Preloading popular templates');
        
        // Sort templates by popularity (access count) and preload top N
        const sortedTemplates = templates
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, this.config.preloadCount);

        for (const template of sortedTemplates) {
            await this.setTemplate(template.name, template);
        }

        this.logger.info(`Preloaded ${sortedTemplates.length} templates`);
    }

    public async warmCache(templateIds: string[]): Promise<void> {
        this.logger.info(`Warming cache with ${templateIds.length} templates`);
        
        // This would typically load templates from storage
        // For now, we'll just log the warming process
        for (const id of templateIds) {
            this.logger.debug(`Warming cache for template: ${id}`);
        }
    }

    public getStats(): CacheStats {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            size: this.cache.size,
            maxSize: this.config.maxSize,
            hitRate,
            evictions: this.stats.evictions
        };
    }

    public getCachedTemplateIds(): string[] {
        return Array.from(this.cache.keys());
    }

    public async persistCache(cachePath: string): Promise<void> {
        try {
            const cacheData = {
                config: this.config,
                stats: this.stats,
                templates: Array.from(this.cache.entries())
            };

            await fs.ensureDir(path.dirname(cachePath));
            await fs.writeJson(cachePath, cacheData, { spaces: 2 });
            
            this.logger.info(`Cache persisted to ${cachePath}`);
        } catch (error) {
            this.logger.error('Error persisting cache', error as Error);
        }
    }

    public async loadCache(cachePath: string): Promise<void> {
        try {
            if (await fs.pathExists(cachePath)) {
                const cacheData = await fs.readJson(cachePath);
                
                this.config = cacheData.config;
                this.stats = cacheData.stats;
                
                // Reconstruct cache map
                this.cache.clear();
                for (const [id, cachedTemplate] of cacheData.templates) {
                    this.cache.set(id, cachedTemplate);
                }
                
                this.logger.info(`Cache loaded from ${cachePath}`);
            }
        } catch (error) {
            this.logger.error('Error loading cache', error as Error);
        }
    }

    private async evictLeastUsed(): Promise<void> {
        if (this.cache.size === 0) return;

        // Find template with lowest access count and oldest access time
        let leastUsedId: string | null = null;
        let lowestScore = Infinity;

        for (const [id, cached] of this.cache.entries()) {
            // Calculate score based on access count and recency
            const recencyScore = Date.now() - cached.lastAccessed;
            const accessScore = 1 / (cached.accessCount + 1); // Avoid division by zero
            const totalScore = recencyScore * accessScore;

            if (totalScore < lowestScore) {
                lowestScore = totalScore;
                leastUsedId = id;
            }
        }

        if (leastUsedId) {
            this.cache.delete(leastUsedId);
            this.stats.evictions++;
            this.logger.debug(`Evicted template ${leastUsedId} from cache`);
        }
    }

    private startCleanupInterval(): void {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredEntries();
        }, 5 * 60 * 1000);
    }

    private cleanupExpiredEntries(): void {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [id, cached] of this.cache.entries()) {
            if (now - cached.timestamp > this.config.ttl) {
                this.cache.delete(id);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            this.logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }

    public dispose(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
