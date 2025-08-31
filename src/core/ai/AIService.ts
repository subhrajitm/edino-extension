import * as vscode from 'vscode';
import { AIRecommendationEngine, UserProfile, TemplateRecommendation, CustomizationSuggestion, UserContext } from './AIRecommendationEngine';
import { TemplateConfig, ProjectType, Language, FrontendFramework, BackendFramework } from '../../types';
import { Logger } from '../../utils/logger';

export interface AIProjectSuggestion {
    name: string;
    description: string;
    template: TemplateConfig;
    confidence: number;
    reasons: string[];
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'expert';
}

export interface AICustomizationRequest {
    projectType: ProjectType;
    language: Language;
    framework?: FrontendFramework | BackendFramework;
    requirements: string[];
    preferences: {
        complexity: 'simple' | 'medium' | 'complex';
        includeTesting: boolean;
        includeDocumentation: boolean;
        includeCI: boolean;
        database?: string;
        authentication?: boolean;
        deployment?: string;
    };
}

export interface AIGeneratedConfig {
    name: string;
    description: string;
    dependencies: string[];
    scripts: Record<string, string>;
    features: string[];
    structure: string[];
    recommendations: string[];
}

export class AIService {
    private static instance: AIService;
    private aiEngine: AIRecommendationEngine;
    private logger = Logger.getInstance();
    private currentUser: string = 'default-user';

    private constructor() {
        this.aiEngine = AIRecommendationEngine.getInstance();
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Get AI-powered project recommendations based on user context
     */
    public async getProjectRecommendations(context?: UserContext): Promise<AIProjectSuggestion[]> {
        this.logger.info('Getting AI project recommendations');
        
        try {
            const userProfile = await this.getOrCreateUserProfile();
            const recommendations = await this.aiEngine.analyzeUserProfile(userProfile);
            
            return recommendations.map(rec => ({
                name: this.generateProjectName(rec.template),
                description: this.generateProjectDescription(rec.template),
                template: rec.template,
                confidence: rec.confidence,
                reasons: rec.reasons,
                estimatedTime: this.estimateProjectTime(rec.template),
                difficulty: this.assessDifficulty(rec.template)
            }));
        } catch (error) {
            this.logger.error('Error getting AI recommendations:', error as Error);
            return [];
        }
    }

    /**
     * Get intelligent project customization suggestions
     */
    public async getCustomizationSuggestions(request: AICustomizationRequest): Promise<CustomizationSuggestion[]> {
        this.logger.info('Getting AI customization suggestions');
        
        try {
            const suggestions: CustomizationSuggestion[] = [];
            
            // Suggest testing framework based on language
            if (request.preferences.includeTesting) {
                const testingSuggestion = this.suggestTestingFramework(request.language);
                if (testingSuggestion) {
                    suggestions.push(testingSuggestion);
                }
            }

            // Suggest database based on project type and language
            if (request.preferences.database) {
                const dbSuggestion = this.suggestDatabase(request.language, request.projectType);
                if (dbSuggestion) {
                    suggestions.push(dbSuggestion);
                }
            }

            // Suggest authentication method
            if (request.preferences.authentication) {
                const authSuggestion = this.suggestAuthentication(request.language, request.framework);
                if (authSuggestion) {
                    suggestions.push(authSuggestion);
                }
            }

            // Suggest deployment platform
            if (request.preferences.deployment) {
                const deploySuggestion = this.suggestDeployment(request.projectType, request.language);
                if (deploySuggestion) {
                    suggestions.push(deploySuggestion);
                }
            }

            return suggestions;
        } catch (error) {
            this.logger.error('Error getting customization suggestions:', error as Error);
            return [];
        }
    }

    /**
     * Generate AI-powered project configuration
     */
    public async generateProjectConfig(request: AICustomizationRequest): Promise<AIGeneratedConfig> {
        this.logger.info('Generating AI project configuration');
        
        try {
            const config: AIGeneratedConfig = {
                name: this.generateSmartProjectName(request),
                description: this.generateSmartDescription(request),
                dependencies: this.suggestDependencies(request),
                scripts: this.generateScripts(request),
                features: this.suggestFeatures(request),
                structure: this.suggestProjectStructure(request),
                recommendations: this.generateRecommendations(request)
            };

            return config;
        } catch (error) {
            this.logger.error('Error generating project config:', error as Error);
            throw error;
        }
    }

    /**
     * Learn from user's project creation and success
     */
    public async learnFromProjectCreation(
        templateId: string, 
        success: boolean, 
        context: UserContext
    ): Promise<void> {
        this.logger.info(`Learning from project creation: ${templateId}, success: ${success}`);
        
        try {
            await this.aiEngine.learnFromUserChoice(this.currentUser, templateId, success, context);
        } catch (error) {
            this.logger.error('Error learning from project creation:', error as Error);
        }
    }

    /**
     * Get AI-powered project name suggestions
     */
    public async suggestProjectNames(projectType: ProjectType, language: Language): Promise<string[]> {
        const suggestions: string[] = [];
        
        const typePrefixes = {
            [ProjectType.FRONTEND]: ['web', 'ui', 'client', 'frontend'],
            [ProjectType.BACKEND]: ['api', 'server', 'backend', 'service'],
            [ProjectType.FULL_STACK]: ['app', 'platform', 'system', 'portal'],
            [ProjectType.MOBILE]: ['mobile', 'app', 'native', 'cross-platform'],
            [ProjectType.DESKTOP]: ['desktop', 'app', 'client', 'tool'],
            [ProjectType.LIBRARY]: ['lib', 'package', 'module', 'sdk'],
            [ProjectType.CLI]: ['cli', 'tool', 'command', 'utility'],
            [ProjectType.AI_ML]: ['ai', 'ml', 'model', 'intelligence']
        };

        const languageSuffixes = {
            [Language.JAVASCRIPT]: ['js', 'javascript'],
            [Language.TYPESCRIPT]: ['ts', 'typescript'],
            [Language.PYTHON]: ['py', 'python'],
            [Language.JAVA]: ['java'],
            [Language.C_SHARP]: ['csharp', 'dotnet'],
            [Language.GO]: ['go'],
            [Language.RUST]: ['rs', 'rust'],
            [Language.PHP]: ['php'],
            [Language.RUBY]: ['rb', 'ruby'],
            [Language.DART]: ['dart', 'flutter']
        };

        const prefixes = (typePrefixes as any)[projectType] || ['project'];
        const suffixes = (languageSuffixes as any)[language] || ['app'];

        // Generate combinations
        for (const prefix of prefixes) {
            for (const suffix of suffixes) {
                suggestions.push(`${prefix}-${suffix}-app`);
                suggestions.push(`${prefix}-${suffix}-project`);
                suggestions.push(`my-${prefix}-${suffix}`);
            }
        }

        return suggestions.slice(0, 10);
    }

    /**
     * Get AI-powered technology stack recommendations
     */
    public async suggestTechStack(projectType: ProjectType, complexity: 'simple' | 'medium' | 'complex'): Promise<{
        frontend?: string[];
        backend?: string[];
        database?: string[];
        testing?: string[];
        deployment?: string[];
    }> {
        const recommendations: any = {};

        switch (projectType) {
            case ProjectType.FRONTEND:
                recommendations.frontend = this.suggestFrontendStack(complexity);
                recommendations.testing = this.suggestFrontendTesting(complexity);
                recommendations.deployment = this.suggestFrontendDeployment(complexity);
                break;
            case ProjectType.BACKEND:
                recommendations.backend = this.suggestBackendStack(complexity);
                recommendations.database = this.suggestDatabaseStack(complexity);
                recommendations.testing = this.suggestBackendTesting(complexity);
                recommendations.deployment = this.suggestBackendDeployment(complexity);
                break;
            case ProjectType.FULL_STACK:
                recommendations.frontend = this.suggestFrontendStack(complexity);
                recommendations.backend = this.suggestBackendStack(complexity);
                recommendations.database = this.suggestDatabaseStack(complexity);
                recommendations.testing = this.suggestFullStackTesting(complexity);
                recommendations.deployment = this.suggestFullStackDeployment(complexity);
                break;
        }

        return recommendations;
    }

    // Private helper methods

    private async getOrCreateUserProfile(): Promise<UserProfile> {
        // In a real implementation, this would load from storage
        // For now, return a default profile
        return {
            id: this.currentUser,
            preferences: {
                preferredLanguages: [Language.JAVASCRIPT, Language.TYPESCRIPT],
                preferredFrameworks: [FrontendFramework.REACT, BackendFramework.EXPRESS],
                complexityPreference: 'medium',
                includeTesting: true,
                includeDocumentation: true,
                includeCI: false
            },
            projectHistory: [],
            skillLevel: 'intermediate' as any,
            techStack: [],
            usagePatterns: []
        };
    }

    private generateProjectName(template: TemplateConfig): string {
        const names = [
            'awesome-app',
            'my-project',
            'next-gen-app',
            'smart-platform',
            'innovative-solution'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    private generateProjectDescription(template: TemplateConfig): string {
        return `A modern ${template.type.toLowerCase()} application built with ${template.language} and ${template.framework || 'modern tools'}.`;
    }

    private estimateProjectTime(template: TemplateConfig): string {
        const timeEstimates = {
            'simple': '1-2 hours',
            'medium': '4-8 hours',
            'complex': '1-2 days'
        };
        return timeEstimates[template.complexity as keyof typeof timeEstimates] || '2-4 hours';
    }

    private assessDifficulty(template: TemplateConfig): 'beginner' | 'intermediate' | 'expert' {
        return template.complexity as 'beginner' | 'intermediate' | 'expert';
    }

    private suggestTestingFramework(language: Language): CustomizationSuggestion | null {
        const testingFrameworks = {
            [Language.JAVASCRIPT]: 'Jest',
            [Language.TYPESCRIPT]: 'Jest',
            [Language.PYTHON]: 'pytest',
            [Language.JAVA]: 'JUnit',
            [Language.C_SHARP]: 'xUnit'
        };

        const framework = (testingFrameworks as any)[language];
        if (framework) {
            return {
                field: 'testingFramework',
                value: framework,
                reason: `Recommended testing framework for ${language}`,
                confidence: 0.9
            };
        }
        return null;
    }

    private suggestDatabase(language: Language, projectType: ProjectType): CustomizationSuggestion | null {
        const databases = {
            [Language.JAVASCRIPT]: 'MongoDB',
            [Language.TYPESCRIPT]: 'PostgreSQL',
            [Language.PYTHON]: 'PostgreSQL',
            [Language.JAVA]: 'MySQL'
        };

        const database = (databases as any)[language];
        if (database) {
            return {
                field: 'database',
                value: database,
                reason: `Recommended database for ${language} ${projectType.toLowerCase()} projects`,
                confidence: 0.8
            };
        }
        return null;
    }

    private suggestAuthentication(language: Language, framework?: FrontendFramework | BackendFramework): CustomizationSuggestion | null {
        return {
            field: 'authentication',
            value: 'JWT',
            reason: 'JWT is a popular and secure authentication method',
            confidence: 0.7
        };
    }

    private suggestDeployment(projectType: ProjectType, language: Language): CustomizationSuggestion | null {
        const deployments = {
            [ProjectType.FRONTEND]: 'Vercel',
            [ProjectType.BACKEND]: 'Railway',
            [ProjectType.FULL_STACK]: 'Netlify'
        };

        const deployment = (deployments as any)[projectType];
        if (deployment) {
            return {
                field: 'deployment',
                value: deployment,
                reason: `Recommended deployment platform for ${projectType.toLowerCase()} projects`,
                confidence: 0.8
            };
        }
        return null;
    }

    private generateSmartProjectName(request: AICustomizationRequest): string {
        const typeNames = {
            [ProjectType.FRONTEND]: 'web-app',
            [ProjectType.BACKEND]: 'api-server',
            [ProjectType.FULL_STACK]: 'fullstack-app',
            [ProjectType.MOBILE]: 'mobile-app',
            [ProjectType.DESKTOP]: 'desktop-app',
            [ProjectType.LIBRARY]: 'library',
            [ProjectType.CLI]: 'cli-tool',
            [ProjectType.AI_ML]: 'ai-model'
        };

        return `my-${(typeNames as any)[request.projectType]}-${Date.now()}`;
    }

    private generateSmartDescription(request: AICustomizationRequest): string {
        return `A ${request.preferences.complexity} ${request.projectType.toLowerCase()} project built with ${request.language}.`;
    }

    private suggestDependencies(request: AICustomizationRequest): string[] {
        const deps: string[] = [];
        
        // Add language-specific dependencies
        switch (request.language) {
            case Language.JAVASCRIPT:
                deps.push('express', 'cors', 'helmet');
                break;
            case Language.TYPESCRIPT:
                deps.push('express', 'cors', 'helmet', '@types/node');
                break;
            case Language.PYTHON:
                deps.push('fastapi', 'uvicorn', 'pydantic');
                break;
        }

        // Add testing dependencies
        if (request.preferences.includeTesting) {
            switch (request.language) {
                case Language.JAVASCRIPT:
                case Language.TYPESCRIPT:
                    deps.push('jest', '@types/jest');
                    break;
                case Language.PYTHON:
                    deps.push('pytest', 'pytest-asyncio');
                    break;
            }
        }

        return deps;
    }

    private generateScripts(request: AICustomizationRequest): Record<string, string> {
        const scripts: Record<string, string> = {
            start: 'node dist/index.js',
            build: 'tsc',
            dev: 'ts-node src/index.ts'
        };

        if (request.preferences.includeTesting) {
            scripts.test = 'jest';
            scripts['test:watch'] = 'jest --watch';
        }

        return scripts;
    }

    private suggestFeatures(request: AICustomizationRequest): string[] {
        const features: string[] = ['Modern architecture', 'Type safety'];
        
        if (request.preferences.includeTesting) {
            features.push('Comprehensive testing');
        }
        if (request.preferences.includeDocumentation) {
            features.push('API documentation');
        }
        if (request.preferences.includeCI) {
            features.push('CI/CD pipeline');
        }

        return features;
    }

    private suggestProjectStructure(request: AICustomizationRequest): string[] {
        const structure: string[] = ['src/', 'dist/', 'tests/'];
        
        if (request.preferences.includeDocumentation) {
            structure.push('docs/');
        }
        if (request.preferences.includeCI) {
            structure.push('.github/');
        }

        return structure;
    }

    private generateRecommendations(request: AICustomizationRequest): string[] {
        const recommendations: string[] = [];
        
        recommendations.push(`Consider using ${request.language} best practices`);
        
        if (request.preferences.complexity === 'complex') {
            recommendations.push('Implement proper error handling and logging');
            recommendations.push('Add monitoring and analytics');
        }

        return recommendations;
    }

    private suggestFrontendStack(complexity: string): string[] {
        const stacks = {
            simple: ['React', 'Vite', 'Tailwind CSS'],
            medium: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router'],
            complex: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'Zustand', 'React Query']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestBackendStack(complexity: string): string[] {
        const stacks = {
            simple: ['Express', 'CORS', 'Helmet'],
            medium: ['Express', 'TypeScript', 'CORS', 'Helmet', 'Joi', 'Morgan'],
            complex: ['Express', 'TypeScript', 'CORS', 'Helmet', 'Joi', 'Morgan', 'Winston', 'Rate Limiter']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestDatabaseStack(complexity: string): string[] {
        const stacks = {
            simple: ['SQLite'],
            medium: ['PostgreSQL', 'Prisma'],
            complex: ['PostgreSQL', 'Prisma', 'Redis', 'MongoDB']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestFrontendTesting(complexity: string): string[] {
        const stacks = {
            simple: ['Jest', 'React Testing Library'],
            medium: ['Jest', 'React Testing Library', 'MSW'],
            complex: ['Jest', 'React Testing Library', 'MSW', 'Cypress', 'Playwright']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestBackendTesting(complexity: string): string[] {
        const stacks = {
            simple: ['Jest', 'Supertest'],
            medium: ['Jest', 'Supertest', 'MSW'],
            complex: ['Jest', 'Supertest', 'MSW', 'Database seeding', 'Load testing']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestFullStackTesting(complexity: string): string[] {
        const stacks = {
            simple: ['Jest', 'React Testing Library', 'Supertest'],
            medium: ['Jest', 'React Testing Library', 'Supertest', 'MSW', 'Integration tests'],
            complex: ['Jest', 'React Testing Library', 'Supertest', 'MSW', 'Cypress', 'E2E tests', 'Performance tests']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestFrontendDeployment(complexity: string): string[] {
        const stacks = {
            simple: ['Vercel', 'Netlify'],
            medium: ['Vercel', 'Netlify', 'Cloudflare Pages'],
            complex: ['Vercel', 'Netlify', 'Cloudflare Pages', 'AWS S3', 'CDN']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestBackendDeployment(complexity: string): string[] {
        const stacks = {
            simple: ['Railway', 'Render'],
            medium: ['Railway', 'Render', 'Heroku'],
            complex: ['Railway', 'Render', 'Heroku', 'AWS', 'Docker', 'Kubernetes']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }

    private suggestFullStackDeployment(complexity: string): string[] {
        const stacks = {
            simple: ['Vercel', 'Railway'],
            medium: ['Vercel', 'Railway', 'Netlify', 'Render'],
            complex: ['Vercel', 'Railway', 'Netlify', 'Render', 'AWS', 'Docker', 'Kubernetes']
        };
        return stacks[complexity as keyof typeof stacks] || stacks.medium;
    }
}
