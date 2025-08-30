import { TemplateConfig, ProjectType, Language, FrontendFramework, BackendFramework, MobileFramework, DesktopFramework } from '../../types';
import { Logger } from '../../utils/logger';

export interface UserProfile {
    id: string;
    preferences: UserPreferences;
    projectHistory: ProjectHistory[];
    skillLevel: SkillLevel;
    techStack: TechStack[];
    usagePatterns: UsagePattern[];
}

export interface UserPreferences {
    preferredLanguages: Language[];
    preferredFrameworks: (FrontendFramework | BackendFramework | MobileFramework | DesktopFramework)[];
    complexityPreference: 'simple' | 'medium' | 'complex';
    includeTesting: boolean;
    includeDocumentation: boolean;
    includeCI: boolean;
}

export interface ProjectHistory {
    id: string;
    name: string;
    template: string;
    type: ProjectType;
    language: Language;
    createdAt: Date;
    success: boolean;
    completionTime?: number;
}

export interface TechStack {
    language: Language;
    frameworks: (FrontendFramework | BackendFramework | MobileFramework | DesktopFramework)[];
    proficiency: 'beginner' | 'intermediate' | 'expert';
}

export interface UsagePattern {
    templateId: string;
    usageCount: number;
    lastUsed: Date;
    successRate: number;
}

export enum SkillLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    EXPERT = 'expert'
}

export interface TemplateRecommendation {
    template: TemplateConfig;
    score: number;
    reasons: string[];
    confidence: number;
}

export interface CustomizationSuggestion {
    field: string;
    value: any;
    reason: string;
    confidence: number;
}

export interface UserContext {
    currentProject?: string;
    recentTemplates: string[];
    commonPatterns: string[];
    timeOfDay: number;
    dayOfWeek: number;
}

export class AIRecommendationEngine {
    private static instance: AIRecommendationEngine;
    private userProfiles: Map<string, UserProfile> = new Map();
    private templateScores: Map<string, number> = new Map();
    private logger = Logger.getInstance();
    private learningRate = 0.1;
    private decayFactor = 0.95;

    private constructor() {
        this.initializeDefaultProfiles();
    }

    public static getInstance(): AIRecommendationEngine {
        if (!AIRecommendationEngine.instance) {
            AIRecommendationEngine.instance = new AIRecommendationEngine();
        }
        return AIRecommendationEngine.instance;
    }

    private initializeDefaultProfiles(): void {
        // Create default profiles for different user types
        const beginnerProfile: UserProfile = {
            id: 'default-beginner',
            preferences: {
                preferredLanguages: [Language.JAVASCRIPT, Language.PYTHON],
                preferredFrameworks: [FrontendFramework.REACT, BackendFramework.EXPRESS],
                complexityPreference: 'simple',
                includeTesting: false,
                includeDocumentation: true,
                includeCI: false
            },
            projectHistory: [],
            skillLevel: SkillLevel.BEGINNER,
            techStack: [
                {
                    language: Language.JAVASCRIPT,
                    frameworks: [FrontendFramework.REACT],
                    proficiency: 'beginner'
                }
            ],
            usagePatterns: []
        };

        this.userProfiles.set(beginnerProfile.id, beginnerProfile);
    }

    public async analyzeUserProfile(userProfile: UserProfile): Promise<TemplateRecommendation[]> {
        this.logger.info(`Analyzing user profile for ${userProfile.id}`);
        
        const recommendations: TemplateRecommendation[] = [];
        const templates = this.getAllTemplates(); // This would come from TemplateManager

        for (const template of templates) {
            const score = this.calculateTemplateScore(template, userProfile);
            const reasons = this.generateRecommendationReasons(template, userProfile);
            const confidence = this.calculateConfidence(template, userProfile);

            if (score > 0.3) { // Only recommend templates with decent scores
                recommendations.push({
                    template,
                    score,
                    reasons,
                    confidence
                });
            }
        }

        // Sort by score (highest first)
        recommendations.sort((a, b) => b.score - a.score);

        this.logger.info(`Generated ${recommendations.length} recommendations for user ${userProfile.id}`);
        return recommendations.slice(0, 10); // Return top 10
    }

    public async learnFromUserChoice(
        userId: string, 
        templateId: string, 
        success: boolean, 
        context: UserContext
    ): Promise<void> {
        this.logger.info(`Learning from user choice: ${userId} chose ${templateId}, success: ${success}`);

        const userProfile = this.userProfiles.get(userId);
        if (!userProfile) {
            this.logger.warn(`User profile not found for ${userId}`);
            return;
        }

        // Update project history
        const projectHistory: ProjectHistory = {
            id: `project-${Date.now()}`,
            name: `Project ${Date.now()}`,
            template: templateId,
            type: ProjectType.FRONTEND, // This would be determined from the template
            language: Language.JAVASCRIPT, // This would be determined from the template
            createdAt: new Date(),
            success,
            completionTime: success ? Date.now() : undefined
        };

        userProfile.projectHistory.push(projectHistory);

        // Update usage patterns
        const existingPattern = userProfile.usagePatterns.find(p => p.templateId === templateId);
        if (existingPattern) {
            existingPattern.usageCount++;
            existingPattern.lastUsed = new Date();
            existingPattern.successRate = (existingPattern.successRate + (success ? 1 : 0)) / 2;
        } else {
            userProfile.usagePatterns.push({
                templateId,
                usageCount: 1,
                lastUsed: new Date(),
                successRate: success ? 1 : 0
            });
        }

        // Update template scores based on success
        const currentScore = this.templateScores.get(templateId) || 0;
        const newScore = success 
            ? currentScore + this.learningRate 
            : currentScore - this.learningRate;
        
        this.templateScores.set(templateId, Math.max(0, newScore));

        // Apply decay to all scores
        this.applyScoreDecay();

        this.logger.info(`Updated learning model for user ${userId}`);
    }

    public async suggestCustomizations(
        template: TemplateConfig, 
        userContext: UserContext
    ): Promise<CustomizationSuggestion[]> {
        this.logger.info(`Generating customization suggestions for template ${template.name}`);

        const suggestions: CustomizationSuggestion[] = [];

        // Suggest testing framework based on user context
        if (template.testing && userContext.recentTemplates.some(t => t.includes('test'))) {
            suggestions.push({
                field: 'testing',
                value: template.testing,
                reason: 'Based on your recent testing preferences',
                confidence: 0.8
            });
        }

        // Suggest database based on project type
        if (template.database && template.type === ProjectType.BACKEND) {
            suggestions.push({
                field: 'database',
                value: template.database,
                reason: 'Recommended for backend projects',
                confidence: 0.7
            });
        }

        // Suggest build tool based on language
        if (template.buildTool && template.language === Language.TYPESCRIPT) {
            suggestions.push({
                field: 'buildTool',
                value: template.buildTool,
                reason: 'Optimized for TypeScript development',
                confidence: 0.9
            });
        }

        // Suggest features based on complexity preference
        if (template.features && template.complexity === 'simple') {
            const simpleFeatures = template.features.filter(f => 
                !f.includes('advanced') && !f.includes('complex')
            );
            if (simpleFeatures.length > 0) {
                suggestions.push({
                    field: 'features',
                    value: simpleFeatures,
                    reason: 'Simplified features for easier development',
                    confidence: 0.6
                });
            }
        }

        this.logger.info(`Generated ${suggestions.length} customization suggestions`);
        return suggestions;
    }

    public async predictUserNeeds(userProfile: UserProfile): Promise<TemplateRecommendation[]> {
        this.logger.info(`Predicting user needs for ${userProfile.id}`);

        // Analyze recent patterns
        const recentTemplates = userProfile.projectHistory
            .slice(-5)
            .map(h => h.template);

        // Find similar users
        const similarUsers = this.findSimilarUsers(userProfile);

        // Generate predictions based on patterns and similar users
        const predictions = await this.generatePredictions(userProfile, recentTemplates, similarUsers);

        return predictions;
    }

    public async optimizeRecommendations(feedback: UserFeedback): Promise<void> {
        this.logger.info('Optimizing recommendations based on feedback');

        // Adjust learning rate based on feedback quality
        if (feedback.quality === 'high') {
            this.learningRate = Math.min(0.2, this.learningRate * 1.1);
        } else if (feedback.quality === 'low') {
            this.learningRate = Math.max(0.05, this.learningRate * 0.9);
        }

        // Update model parameters based on feedback
        this.updateModelParameters(feedback);

        this.logger.info(`Optimization complete, new learning rate: ${this.learningRate}`);
    }

    private calculateTemplateScore(template: TemplateConfig, userProfile: UserProfile): number {
        let score = 0;

        // Language preference (40% weight)
        const languageMatch = userProfile.preferences.preferredLanguages.includes(template.language);
        score += languageMatch ? 0.4 : 0;

        // Framework preference (30% weight)
        const frameworkMatch = template.framework && 
            userProfile.preferences.preferredFrameworks.includes(template.framework);
        score += frameworkMatch ? 0.3 : 0;

        // Complexity preference (20% weight)
        const complexityMatch = template.complexity === userProfile.preferences.complexityPreference;
        score += complexityMatch ? 0.2 : 0;

        // Skill level match (10% weight)
        const skillMatch = this.calculateSkillMatch(template, userProfile.skillLevel);
        score += skillMatch * 0.1;

        // Historical success (bonus)
        const historicalSuccess = this.getHistoricalSuccess(template.name, userProfile);
        score += historicalSuccess * 0.1;

        return Math.min(1, score);
    }

    private calculateSkillMatch(template: TemplateConfig, skillLevel: SkillLevel): number {
        const complexityScores = {
            'simple': { [SkillLevel.BEGINNER]: 1, [SkillLevel.INTERMEDIATE]: 0.7, [SkillLevel.EXPERT]: 0.3 },
            'medium': { [SkillLevel.BEGINNER]: 0.5, [SkillLevel.INTERMEDIATE]: 1, [SkillLevel.EXPERT]: 0.8 },
            'complex': { [SkillLevel.BEGINNER]: 0.2, [SkillLevel.INTERMEDIATE]: 0.6, [SkillLevel.EXPERT]: 1 }
        };

        return complexityScores[template.complexity]?.[skillLevel] || 0.5;
    }

    private getHistoricalSuccess(templateName: string, userProfile: UserProfile): number {
        const templateHistory = userProfile.projectHistory.filter(h => h.template === templateName);
        if (templateHistory.length === 0) return 0;

        const successCount = templateHistory.filter(h => h.success).length;
        return successCount / templateHistory.length;
    }

    private generateRecommendationReasons(template: TemplateConfig, userProfile: UserProfile): string[] {
        const reasons: string[] = [];

        if (userProfile.preferences.preferredLanguages.includes(template.language)) {
            reasons.push(`Uses your preferred language: ${template.language}`);
        }

        if (template.framework && userProfile.preferences.preferredFrameworks.includes(template.framework)) {
            reasons.push(`Uses your preferred framework: ${template.framework}`);
        }

        if (template.complexity === userProfile.preferences.complexityPreference) {
            reasons.push(`Matches your preferred complexity level`);
        }

        const historicalSuccess = this.getHistoricalSuccess(template.name, userProfile);
        if (historicalSuccess > 0.7) {
            reasons.push(`You've had success with this template before`);
        }

        return reasons;
    }

    private calculateConfidence(template: TemplateConfig, userProfile: UserProfile): number {
        let confidence = 0.5; // Base confidence

        // Increase confidence based on data quality
        if (userProfile.projectHistory.length > 5) confidence += 0.2;
        if (userProfile.usagePatterns.length > 3) confidence += 0.2;
        if (this.getHistoricalSuccess(template.name, userProfile) > 0) confidence += 0.1;

        return Math.min(1, confidence);
    }

    private findSimilarUsers(userProfile: UserProfile): UserProfile[] {
        // Simple similarity calculation based on preferences and skill level
        return Array.from(this.userProfiles.values())
            .filter(profile => profile.id !== userProfile.id)
            .sort((a, b) => {
                const similarityA = this.calculateUserSimilarity(userProfile, a);
                const similarityB = this.calculateUserSimilarity(userProfile, b);
                return similarityB - similarityA;
            })
            .slice(0, 3); // Return top 3 similar users
    }

    private calculateUserSimilarity(userA: UserProfile, userB: UserProfile): number {
        let similarity = 0;

        // Skill level similarity
        if (userA.skillLevel === userB.skillLevel) similarity += 0.3;

        // Language preference similarity
        const commonLanguages = userA.preferences.preferredLanguages
            .filter(lang => userB.preferences.preferredLanguages.includes(lang));
        similarity += (commonLanguages.length / Math.max(userA.preferences.preferredLanguages.length, 1)) * 0.4;

        // Framework preference similarity
        const commonFrameworks = userA.preferences.preferredFrameworks
            .filter(fw => userB.preferences.preferredFrameworks.includes(fw));
        similarity += (commonFrameworks.length / Math.max(userA.preferences.preferredFrameworks.length, 1)) * 0.3;

        return similarity;
    }

    private async generatePredictions(
        userProfile: UserProfile, 
        recentTemplates: string[], 
        similarUsers: UserProfile[]
    ): Promise<TemplateRecommendation[]> {
        // This would implement more sophisticated prediction algorithms
        // For now, return recommendations based on similar users
        const recommendations: TemplateRecommendation[] = [];

        for (const similarUser of similarUsers) {
            const successfulTemplates = similarUser.projectHistory
                .filter(h => h.success)
                .map(h => h.template);

            for (const templateName of successfulTemplates) {
                const template = this.getTemplateByName(templateName);
                if (template && !recentTemplates.includes(templateName)) {
                    recommendations.push({
                        template,
                        score: 0.7,
                        reasons: [`Similar users found success with this template`],
                        confidence: 0.6
                    });
                }
            }
        }

        return recommendations.slice(0, 5);
    }

    private applyScoreDecay(): void {
        for (const [templateId, score] of this.templateScores.entries()) {
            this.templateScores.set(templateId, score * this.decayFactor);
        }
    }

    private updateModelParameters(feedback: UserFeedback): void {
        // Update model parameters based on feedback
        // This would implement more sophisticated parameter tuning
    }

    private getTemplateByName(name: string): TemplateConfig | null {
        // This would get template from TemplateManager
        // For now, return null
        return null;
    }

    private getAllTemplates(): TemplateConfig[] {
        // This would get all templates from TemplateManager
        // For now, return empty array
        return [];
    }
}

export interface UserFeedback {
    userId: string;
    templateId: string;
    quality: 'high' | 'medium' | 'low';
    suggestions: string[];
    timestamp: Date;
}
