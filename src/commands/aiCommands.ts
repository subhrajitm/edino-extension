import * as vscode from 'vscode';
import { AIService, AIProjectSuggestion, AICustomizationRequest, AIGeneratedConfig } from '../core/ai/AIService';
import { ProjectType, Language, FrontendFramework, BackendFramework } from '../types';
import { Logger } from '../utils/logger';

export class AICommands {
    private static instance: AICommands;
    private aiService: AIService;
    private logger = Logger.getInstance();

    private constructor() {
        this.aiService = AIService.getInstance();
    }

    public static getInstance(): AICommands {
        if (!AICommands.instance) {
            AICommands.instance = new AICommands();
        }
        return AICommands.instance;
    }

    /**
     * Register all AI-powered commands
     */
    public registerCommands(context: vscode.ExtensionContext): void {
        // AI Project Recommendations
        let aiRecommendationsDisposable = vscode.commands.registerCommand('edino.aiRecommendations', async () => {
            await this.showAIRecommendations();
        });

        // AI Smart Project Creation
        let aiSmartProjectDisposable = vscode.commands.registerCommand('edino.aiSmartProject', async () => {
            await this.createAISmartProject();
        });

        // AI Project Customization
        let aiCustomizationDisposable = vscode.commands.registerCommand('edino.aiCustomization', async () => {
            await this.showAICustomization();
        });

        // AI Tech Stack Suggestions
        let aiTechStackDisposable = vscode.commands.registerCommand('edino.aiTechStack', async () => {
            await this.showAITechStack();
        });

        // AI Project Name Suggestions
        let aiProjectNamesDisposable = vscode.commands.registerCommand('edino.aiProjectNames', async () => {
            await this.showAIProjectNames();
        });

        context.subscriptions.push(
            aiRecommendationsDisposable,
            aiSmartProjectDisposable,
            aiCustomizationDisposable,
            aiTechStackDisposable,
            aiProjectNamesDisposable
        );
    }

    /**
     * Show AI-powered project recommendations
     */
    private async showAIRecommendations(): Promise<void> {
        try {
            this.logger.info('Showing AI recommendations');
            
            // Show loading message
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '🤖 Getting AI recommendations...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Analyzing your preferences...' });
                
                const recommendations = await this.aiService.getProjectRecommendations();
                
                progress.report({ increment: 100, message: 'Recommendations ready!' });
                
                if (recommendations.length === 0) {
                    vscode.window.showInformationMessage('No AI recommendations available at the moment.');
                    return;
                }

                // Create recommendation items for QuickPick
                const recommendationItems = recommendations.map(rec => ({
                    label: `🎯 ${rec.name}`,
                    description: rec.description,
                    detail: `Confidence: ${Math.round(rec.confidence * 100)}% | Time: ${rec.estimatedTime} | Difficulty: ${rec.difficulty}`,
                    value: rec
                }));

                const selected = await vscode.window.showQuickPick(recommendationItems, {
                    placeHolder: 'Choose an AI-recommended project...',
                    ignoreFocusOut: true
                });

                if (selected) {
                    await this.showRecommendationDetails(selected.value);
                }
            });

        } catch (error) {
            this.logger.error('Error showing AI recommendations:', error as Error);
            vscode.window.showErrorMessage('Failed to get AI recommendations. Please try again.');
        }
    }

    /**
     * Show detailed information about a recommendation
     */
    private async showRecommendationDetails(recommendation: AIProjectSuggestion): Promise<void> {
        const details = `🤖 **AI Recommendation: ${recommendation.name}**

📝 **Description**: ${recommendation.description}

🎯 **Confidence**: ${Math.round(recommendation.confidence * 100)}%
⏱️ **Estimated Time**: ${recommendation.estimatedTime}
📊 **Difficulty**: ${recommendation.difficulty}

🔍 **Why this project?**
${recommendation.reasons.map(reason => `• ${reason}`).join('\n')}

📋 **Template Details**:
• Type: ${recommendation.template.type}
• Language: ${recommendation.template.language}
• Framework: ${recommendation.template.framework || 'None'}
• Complexity: ${recommendation.template.complexity}
• Features: ${recommendation.template.features.join(', ')}

Would you like to create this project?`;

        const choice = await vscode.window.showInformationMessage(
            details,
            { modal: true },
            '✅ Create Project',
            '🔄 Get More Recommendations',
            '❌ Cancel'
        );

        if (choice === '✅ Create Project') {
            // Trigger project creation with the recommended template
            vscode.commands.executeCommand('edino.createProject', recommendation.template.type, {
                language: recommendation.template.language,
                framework: recommendation.template.framework,
                title: recommendation.name
            });
        } else if (choice === '🔄 Get More Recommendations') {
            await this.showAIRecommendations();
        }
    }

    /**
     * Create an AI-powered smart project
     */
    private async createAISmartProject(): Promise<void> {
        try {
            this.logger.info('Creating AI smart project');
            
            // Get project type
            const projectType = await vscode.window.showQuickPick([
                { label: '🎨 Frontend', value: ProjectType.FRONTEND },
                { label: '⚙️ Backend', value: ProjectType.BACKEND },
                { label: '🚀 Full Stack', value: ProjectType.FULL_STACK },
                { label: '📱 Mobile', value: ProjectType.MOBILE },
                { label: '💻 Desktop', value: ProjectType.DESKTOP },
                { label: '📦 Library', value: ProjectType.LIBRARY },
                { label: '⌨️ CLI', value: ProjectType.CLI },
                { label: '🤖 AI/ML', value: ProjectType.AI_ML }
            ], {
                placeHolder: 'What type of project would you like to create?',
                ignoreFocusOut: true
            });

            if (!projectType) return;

            // Get language
            const language = await vscode.window.showQuickPick([
                { label: 'JavaScript', value: Language.JAVASCRIPT },
                { label: 'TypeScript', value: Language.TYPESCRIPT },
                { label: 'Python', value: Language.PYTHON },
                { label: 'Java', value: Language.JAVA },
                { label: 'C#', value: Language.C_SHARP },
                { label: 'Go', value: Language.GO },
                { label: 'Rust', value: Language.RUST },
                { label: 'PHP', value: Language.PHP },
                { label: 'Ruby', value: Language.RUBY },
                { label: 'Dart', value: Language.DART }
            ], {
                placeHolder: 'Choose your preferred language',
                ignoreFocusOut: true
            });

            if (!language) return;

            // Get complexity
            const complexity = await vscode.window.showQuickPick([
                { label: '🚀 Simple', description: 'Basic setup, minimal features', value: 'simple' },
                { label: '⚡ Medium', description: 'Standard features, good structure', value: 'medium' },
                { label: '🔥 Complex', description: 'Advanced features, enterprise-ready', value: 'complex' }
            ], {
                placeHolder: 'Choose project complexity',
                ignoreFocusOut: true
            });

            if (!complexity) return;

            // Get preferences
            const preferences = await this.getProjectPreferences();

            // Generate AI configuration
            const request: AICustomizationRequest = {
                projectType: projectType.value,
                language: language.value,
                requirements: [],
                preferences: {
                    complexity: complexity.value as 'simple' | 'medium' | 'complex',
                    includeTesting: preferences.includeTesting,
                    includeDocumentation: preferences.includeDocumentation,
                    includeCI: preferences.includeCI,
                    database: preferences.database,
                    authentication: preferences.authentication,
                    deployment: preferences.deployment
                }
            };

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '🤖 Generating AI project configuration...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Analyzing requirements...' });
                
                const config = await this.aiService.generateProjectConfig(request);
                
                progress.report({ increment: 100, message: 'Configuration ready!' });
                
                await this.showAIConfiguration(config, request);
            });

        } catch (error) {
            this.logger.error('Error creating AI smart project:', error as Error);
            vscode.window.showErrorMessage('Failed to create AI smart project. Please try again.');
        }
    }

    /**
     * Get project preferences from user
     */
    private async getProjectPreferences(): Promise<{
        includeTesting: boolean;
        includeDocumentation: boolean;
        includeCI: boolean;
        database?: string;
        authentication?: boolean;
        deployment?: string;
    }> {
        const preferences = {
            includeTesting: false,
            includeDocumentation: false,
            includeCI: false,
            database: undefined as string | undefined,
            authentication: undefined as boolean | undefined,
            deployment: undefined as string | undefined
        };

        // Testing
        const testing = await vscode.window.showQuickPick([
            { label: '✅ Yes', value: true },
            { label: '❌ No', value: false }
        ], {
            placeHolder: 'Include testing setup?',
            ignoreFocusOut: true
        });
        if (testing) preferences.includeTesting = testing.value;

        // Documentation
        const documentation = await vscode.window.showQuickPick([
            { label: '✅ Yes', value: true },
            { label: '❌ No', value: false }
        ], {
            placeHolder: 'Include documentation setup?',
            ignoreFocusOut: true
        });
        if (documentation) preferences.includeDocumentation = documentation.value;

        // CI/CD
        const ci = await vscode.window.showQuickPick([
            { label: '✅ Yes', value: true },
            { label: '❌ No', value: false }
        ], {
            placeHolder: 'Include CI/CD setup?',
            ignoreFocusOut: true
        });
        if (ci) preferences.includeCI = ci.value;

        return preferences;
    }

    /**
     * Show AI-generated configuration
     */
    private async showAIConfiguration(config: AIGeneratedConfig, request: AICustomizationRequest): Promise<void> {
        const configDetails = `🤖 **AI-Generated Project Configuration**

📝 **Project Name**: ${config.name}
📄 **Description**: ${config.description}

📦 **Dependencies**: ${config.dependencies.join(', ')}
🔧 **Scripts**: ${Object.keys(config.scripts).join(', ')}
✨ **Features**: ${config.features.join(', ')}
📁 **Structure**: ${config.structure.join(', ')}

💡 **AI Recommendations**:
${config.recommendations.map(rec => `• ${rec}`).join('\n')}

Would you like to create this AI-optimized project?`;

        const choice = await vscode.window.showInformationMessage(
            configDetails,
            { modal: true },
            '✅ Create AI Project',
            '🔄 Regenerate',
            '❌ Cancel'
        );

        if (choice === '✅ Create AI Project') {
            // Create the project with AI configuration
            vscode.commands.executeCommand('edino.createProject', request.projectType, {
                language: request.language,
                aiConfig: config
            });
        } else if (choice === '🔄 Regenerate') {
            await this.createAISmartProject();
        }
    }

    /**
     * Show AI customization options
     */
    private async showAICustomization(): Promise<void> {
        try {
            this.logger.info('Showing AI customization');
            
            const customization = await vscode.window.showQuickPick([
                { label: '🔧 Testing Framework', value: 'testing' },
                { label: '🗄️ Database', value: 'database' },
                { label: '🔐 Authentication', value: 'authentication' },
                { label: '🚀 Deployment', value: 'deployment' },
                { label: '📦 Dependencies', value: 'dependencies' },
                { label: '📁 Project Structure', value: 'structure' }
            ], {
                placeHolder: 'What would you like to customize with AI?',
                ignoreFocusOut: true
            });

            if (!customization) return;

            await this.showCustomizationDetails(customization.value);

        } catch (error) {
            this.logger.error('Error showing AI customization:', error as Error);
            vscode.window.showErrorMessage('Failed to show AI customization. Please try again.');
        }
    }

    /**
     * Show customization details
     */
    private async showCustomizationDetails(type: string): Promise<void> {
        const details = {
            testing: '🔧 **AI Testing Framework Suggestions**\n\nJest, Vitest, Playwright, Cypress, and more based on your project type and language.',
            database: '🗄️ **AI Database Recommendations**\n\nPostgreSQL, MongoDB, Redis, SQLite, and more based on your project requirements.',
            authentication: '🔐 **AI Authentication Suggestions**\n\nJWT, OAuth, Passport, Auth0, and more based on your security needs.',
            deployment: '🚀 **AI Deployment Recommendations**\n\nVercel, Netlify, Railway, AWS, and more based on your project type.',
            dependencies: '📦 **AI Dependency Suggestions**\n\nEssential packages and libraries based on your project requirements.',
            structure: '📁 **AI Project Structure**\n\nOptimal folder structure and organization based on best practices.'
        };

        vscode.window.showInformationMessage(details[type as keyof typeof details] || 'Customization details not available.');
    }

    /**
     * Show AI tech stack suggestions
     */
    private async showAITechStack(): Promise<void> {
        try {
            this.logger.info('Showing AI tech stack suggestions');
            
            const projectType = await vscode.window.showQuickPick([
                { label: '🎨 Frontend', value: ProjectType.FRONTEND },
                { label: '⚙️ Backend', value: ProjectType.BACKEND },
                { label: '🚀 Full Stack', value: ProjectType.FULL_STACK }
            ], {
                placeHolder: 'What type of project?',
                ignoreFocusOut: true
            });

            if (!projectType) return;

            const complexity = await vscode.window.showQuickPick([
                { label: '🚀 Simple', value: 'simple' },
                { label: '⚡ Medium', value: 'medium' },
                { label: '🔥 Complex', value: 'complex' }
            ], {
                placeHolder: 'Choose complexity level',
                ignoreFocusOut: true
            });

            if (!complexity) return;

            const techStack = await this.aiService.suggestTechStack(projectType.value, complexity.value as 'simple' | 'medium' | 'complex');

            const techStackDetails = `🤖 **AI Tech Stack Recommendations**

${techStack.frontend ? `🎨 **Frontend**: ${techStack.frontend.join(', ')}\n` : ''}
${techStack.backend ? `⚙️ **Backend**: ${techStack.backend.join(', ')}\n` : ''}
${techStack.database ? `🗄️ **Database**: ${techStack.database.join(', ')}\n` : ''}
${techStack.testing ? `🧪 **Testing**: ${techStack.testing.join(', ')}\n` : ''}
${techStack.deployment ? `🚀 **Deployment**: ${techStack.deployment.join(', ')}\n` : ''}

This stack is optimized for ${complexity.value} ${projectType.value.toLowerCase()} projects.`;

            vscode.window.showInformationMessage(techStackDetails);

        } catch (error) {
            this.logger.error('Error showing AI tech stack:', error as Error);
            vscode.window.showErrorMessage('Failed to show AI tech stack. Please try again.');
        }
    }

    /**
     * Show AI project name suggestions
     */
    private async showAIProjectNames(): Promise<void> {
        try {
            this.logger.info('Showing AI project name suggestions');
            
            const projectType = await vscode.window.showQuickPick([
                { label: '🎨 Frontend', value: ProjectType.FRONTEND },
                { label: '⚙️ Backend', value: ProjectType.BACKEND },
                { label: '🚀 Full Stack', value: ProjectType.FULL_STACK },
                { label: '📱 Mobile', value: ProjectType.MOBILE },
                { label: '💻 Desktop', value: ProjectType.DESKTOP },
                { label: '📦 Library', value: ProjectType.LIBRARY },
                { label: '⌨️ CLI', value: ProjectType.CLI },
                { label: '🤖 AI/ML', value: ProjectType.AI_ML }
            ], {
                placeHolder: 'What type of project?',
                ignoreFocusOut: true
            });

            if (!projectType) return;

            const language = await vscode.window.showQuickPick([
                { label: 'JavaScript', value: Language.JAVASCRIPT },
                { label: 'TypeScript', value: Language.TYPESCRIPT },
                { label: 'Python', value: Language.PYTHON },
                { label: 'Java', value: Language.JAVA },
                { label: 'C#', value: Language.C_SHARP },
                { label: 'Go', value: Language.GO },
                { label: 'Rust', value: Language.RUST },
                { label: 'PHP', value: Language.PHP },
                { label: 'Ruby', value: Language.RUBY },
                { label: 'Dart', value: Language.DART }
            ], {
                placeHolder: 'Choose language',
                ignoreFocusOut: true
            });

            if (!language) return;

            const suggestions = await this.aiService.suggestProjectNames(projectType.value, language.value);

            const selected = await vscode.window.showQuickPick(suggestions.map(name => ({
                label: name,
                description: `AI-suggested name for ${projectType.value.toLowerCase()} project`
            })), {
                placeHolder: 'Choose an AI-suggested project name',
                ignoreFocusOut: true
            });

            if (selected) {
                vscode.window.showInformationMessage(`Selected project name: ${selected.label}`);
                // You could store this for use in project creation
            }

        } catch (error) {
            this.logger.error('Error showing AI project names:', error as Error);
            vscode.window.showErrorMessage('Failed to show AI project names. Please try again.');
        }
    }
}
