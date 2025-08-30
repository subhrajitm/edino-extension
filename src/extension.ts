import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectGenerator } from './projectGenerator';
import { ProjectType, Language, FrontendFramework, BackendFramework } from './types';
import { WelcomePanel } from './welcomePanel';
import { PluginManager } from './core/plugin/PluginManager';
import { TemplateCache } from './core/cache/TemplateCache';
import { AIRecommendationEngine } from './core/ai/AIRecommendationEngine';
import { ProjectPreviewManager } from './core/preview/ProjectPreviewManager';
import { TeamManager } from './core/team/TeamManager';
import { MarketplaceManager } from './core/marketplace/MarketplaceManager';
import { Logger } from './utils/logger';

// Global error handler
function handleError(error: Error, context: string) {
    console.error(`❌ Error in ${context}:`, error);
    vscode.window.showErrorMessage(`Edino Error: ${error.message}`);
}

// Global success handler
function handleSuccess(message: string) {
    console.log(`✅ ${message}`);
    vscode.window.showInformationMessage(message);
}

export async function activate(context: vscode.ExtensionContext) {
    try {
        console.log('🚀 Edino Project Generator is now active!');
        handleSuccess('Edino Project Generator activated successfully!');

        // Initialize core systems
        await initializeCoreSystems(context);

        // Register the main project creation command
        let createProjectDisposable = vscode.commands.registerCommand('edino.createProject', async (templateType?: string, templateInfo?: any) => {
            try {
                // Show welcome message
                vscode.window.showInformationMessage('🚀 Welcome to Edino Project Generator! Let\'s create something amazing.');

                // Get the current workspace folder
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('❌ Please open a workspace folder first to create your project.');
                    return;
                }

                // Smart folder detection and workspace handling
                const activeTextEditor = vscode.window.activeTextEditor;
                let selectedFolderPath: string | undefined;
                let projectName: string | undefined;
                let isFolderSelected = false;

                // Check if we're already in a subfolder of the workspace
                const currentFolder = workspaceFolder.uri.fsPath;
                const currentFolderName = path.basename(currentFolder);

                // If we're not in the root workspace folder, use the current folder
                if (currentFolderName !== workspaceFolder.name) {
                    selectedFolderPath = currentFolder;
                    projectName = currentFolderName;
                    isFolderSelected = true;
                } else if (activeTextEditor) {
                    // Get the folder containing the active file
                    const activeFilePath = activeTextEditor.document.uri.fsPath;
                    const activeFolderPath = path.dirname(activeFilePath);
                    
                    // Check if the active folder is within the workspace
                    if (activeFolderPath.startsWith(workspaceFolder.uri.fsPath)) {
                        selectedFolderPath = activeFolderPath;
                        projectName = path.basename(activeFolderPath);
                        isFolderSelected = true;
                    }
                }

                // If no folder is selected, use workspace root or ask for project name
                if (!selectedFolderPath) {
                    // Check if workspace root has content (indicating it's a project folder)
                    const workspaceContents = await fs.readdir(workspaceFolder.uri.fsPath);
                    const hasProjectFiles = workspaceContents.some(file => 
                        file === 'package.json' || 
                        file === 'requirements.txt' || 
                        file === 'pom.xml' || 
                        file === 'Cargo.toml' ||
                        file === 'go.mod' ||
                        file === 'composer.json' ||
                        file === 'Gemfile' ||
                        file === 'pubspec.yaml' ||
                        file === 'README.md' ||
                        file === '.gitignore'
                    );

                    if (hasProjectFiles) {
                        // Workspace root appears to be a project folder, use it
                        selectedFolderPath = workspaceFolder.uri.fsPath;
                        projectName = workspaceFolder.name;
                        isFolderSelected = true;
                    } else {
                        // Ask user for project name to create in workspace root
                        const inputProjectName = await vscode.window.showInputBox({
                            prompt: 'What would you like to name your project? (will be created in workspace root)',
                            placeHolder: 'my-awesome-project',
                            value: 'my-awesome-project',
                            validateInput: (value) => {
                                if (!value) {
                                    return 'Project name is required';
                                }
                                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                                }
                                return null;
                            }
                        });

                        if (!inputProjectName) {
                            return;
                        }

                        projectName = inputProjectName;
                        selectedFolderPath = path.join(workspaceFolder.uri.fsPath, projectName);
                    }
                }

                // Determine project type based on template selection or user choice
                let projectType;
                
                if (templateType && ['fullstack', 'frontend', 'backend'].includes(templateType)) {
                    // Use the specific template type that was clicked
                    const templateMap = {
                        'fullstack': { label: '🚀 Full Stack', value: ProjectType.FULL_STACK },
                        'frontend': { label: '🎨 Frontend', value: ProjectType.FRONTEND },
                        'backend': { label: '⚙️ Backend', value: ProjectType.BACKEND }
                    };
                    projectType = templateMap[templateType as keyof typeof templateMap];
                } else {
                    // Show project type selection with better descriptions
                    const selectedType = await vscode.window.showQuickPick(
                        [
                            { 
                                label: '🚀 Full Stack', 
                                description: 'Complete web application with frontend and backend',
                                detail: 'Includes React/Vue frontend + Node.js/Python backend + database',
                                value: ProjectType.FULL_STACK 
                            },
                            { 
                                label: '🎨 Frontend', 
                                description: 'User interface and client-side application',
                                detail: 'React, Vue, Angular, Svelte with modern build tools',
                                value: ProjectType.FRONTEND 
                            },
                            { 
                                label: '⚙️ Backend', 
                                description: 'Server-side API and business logic',
                                detail: 'Node.js, Python, Java, Go with database integration',
                                value: ProjectType.BACKEND 
                            }
                        ],
                        {
                            placeHolder: 'What type of project would you like to create?',
                            ignoreFocusOut: true
                        }
                    );

                    if (!selectedType) {
                        return;
                    }
                    projectType = selectedType;
                }

                // Show project summary before creation
                const projectSummary = `📋 Project Summary:
• Name: ${projectName}
• Type: ${projectType.label}
• Location: ${selectedFolderPath}
• Setup: ${isFolderSelected ? 'Use existing folder' : 'Create new folder'}`;

                const confirm = await vscode.window.showInformationMessage(
                    projectSummary,
                    { modal: true },
                    '✅ Create Project',
                    '❌ Cancel'
                );

                if (confirm !== '✅ Create Project') {
                    return;
                }

                // Check if directory already exists
                if (await fs.pathExists(selectedFolderPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        `⚠️ The folder "${projectName}" already exists. What would you like to do?`,
                        { modal: true },
                        '🔄 Overwrite',
                        '📁 Use Different Name',
                        '❌ Cancel'
                    );
                    
                    if (overwrite === '❌ Cancel') {
                        return;
                    } else if (overwrite === '📁 Use Different Name') {
                        const newName = await vscode.window.showInputBox({
                            prompt: 'Enter a different project name',
                            placeHolder: `${projectName}-new`,
                            value: `${projectName}-new`,
                            validateInput: (value) => {
                                if (!value) {
                                    return 'Project name is required';
                                }
                                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                                }
                                return null;
                            }
                        });
                        
                        if (!newName) {
                            return;
                        }
                        
                        projectName = newName;
                        selectedFolderPath = path.join(path.dirname(selectedFolderPath), newName);
                    } else {
                        // Overwrite
                        await fs.remove(selectedFolderPath);
                    }
                }

                // Show progress during project creation
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Creating ${projectType.label} project...`,
                    cancellable: false
                }, async (progress) => {
                    progress.report({ increment: 0, message: 'Initializing project structure...' });
                    
                    // Create project structure
                    const generator = new ProjectGenerator();
                    await generator.generateProject(projectType.value, selectedFolderPath, projectName || 'project');
                    
                    progress.report({ increment: 100, message: 'Project created successfully!' });
                });

                // Show success message with next steps
                const nextSteps = await vscode.window.showInformationMessage(
                    `🎉 Project "${projectName}" created successfully!`,
                    '📂 Open Project',
                    '🚀 Start Development',
                    '📖 View README'
                );

                if (nextSteps === '📂 Open Project') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                } else if (nextSteps === '🚀 Start Development') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                    // Show terminal with common commands
                    const terminal = vscode.window.createTerminal('Project Setup');
                    terminal.show();
                    terminal.sendText(`cd "${selectedFolderPath}" && echo "🚀 Your project is ready! Common commands:" && echo "npm install  # Install dependencies" && echo "npm start    # Start development server" && echo "npm test     # Run tests"`);
                } else if (nextSteps === '📖 View README') {
                    const readmePath = path.join(selectedFolderPath, 'README.md');
                    if (await fs.pathExists(readmePath)) {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(readmePath));
                    }
                }

            } catch (error) {
                handleError(error as Error, 'edino.createProject');
            }
        });

        context.subscriptions.push(createProjectDisposable);

        // Register advanced project creation command
        let createAdvancedProjectDisposable = vscode.commands.registerCommand('edino.createAdvancedProject', async () => {
            try {
                // Show welcome message
                vscode.window.showInformationMessage('🚀 Welcome to Edino Advanced Project Generator! Choose from 20+ templates.');

                const generator = new ProjectGenerator();
                const templates = generator.getAvailableTemplates();
                
                // Get the current workspace folder
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    vscode.window.showErrorMessage('❌ Please open a workspace folder first to create your project.');
                    return;
                }

                // Smart folder detection
                const activeTextEditor = vscode.window.activeTextEditor;
                let selectedFolderPath: string | undefined;
                let projectName: string | undefined;
                let isFolderSelected = false;

                // Check if we're already in a subfolder of the workspace
                const currentFolder = workspaceFolder.uri.fsPath;
                const currentFolderName = path.basename(currentFolder);

                // If we're not in the root workspace folder, use the current folder
                if (currentFolderName !== workspaceFolder.name) {
                    selectedFolderPath = currentFolder;
                    projectName = currentFolderName;
                    isFolderSelected = true;
                } else if (activeTextEditor) {
                    // Get the folder containing the active file
                    const activeFilePath = activeTextEditor.document.uri.fsPath;
                    const activeFolderPath = path.dirname(activeFilePath);
                    
                    // Check if the active folder is within the workspace
                    if (activeFolderPath.startsWith(workspaceFolder.uri.fsPath)) {
                        selectedFolderPath = activeFolderPath;
                        projectName = path.basename(activeFolderPath);
                        isFolderSelected = true;
                    }
                }

                // If no folder is selected, use workspace root or ask for project name
                if (!selectedFolderPath) {
                    // Check if workspace root has content (indicating it's a project folder)
                    const workspaceContents = await fs.readdir(workspaceFolder.uri.fsPath);
                    const hasProjectFiles = workspaceContents.some(file => 
                        file === 'package.json' || 
                        file === 'requirements.txt' || 
                        file === 'pom.xml' || 
                        file === 'Cargo.toml' ||
                        file === 'go.mod' ||
                        file === 'composer.json' ||
                        file === 'Gemfile' ||
                        file === 'pubspec.yaml' ||
                        file === 'README.md' ||
                        file === '.gitignore'
                    );

                    if (hasProjectFiles) {
                        // Workspace root appears to be a project folder, use it
                        selectedFolderPath = workspaceFolder.uri.fsPath;
                        projectName = workspaceFolder.name;
                        isFolderSelected = true;
                    } else {
                        // Ask user for project name to create in workspace root
                        const inputProjectName = await vscode.window.showInputBox({
                            prompt: 'What would you like to name your project? (will be created in workspace root)',
                            placeHolder: 'my-awesome-project',
                            value: 'my-awesome-project',
                            validateInput: (value) => {
                                if (!value) {
                                    return 'Project name is required';
                                }
                                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                                }
                                return null;
                            }
                        });

                        if (!inputProjectName) {
                            return;
                        }

                        projectName = inputProjectName;
                        selectedFolderPath = path.join(workspaceFolder.uri.fsPath, projectName);
                    }
                }
                
                // Show template selection with better organization
                const template = await vscode.window.showQuickPick(
                    templates.map((t: any) => ({
                        label: `${t.name}`,
                        description: t.description,
                        detail: `${t.language} • ${t.complexity} • ${t.features.join(', ')}`,
                        value: t
                    })),
                    {
                        placeHolder: 'Choose from 20+ professional templates...',
                        ignoreFocusOut: true
                    }
                );

                if (!template) {
                    return;
                }

                // Show project summary before creation
                const projectSummary = `📋 Advanced Project Summary:
• Name: ${projectName}
• Template: ${template.value.name}
• Language: ${template.value.language}
• Framework: ${template.value.framework || 'None'}
• Complexity: ${template.value.complexity}
• Features: ${template.value.features.join(', ')}
• Location: ${selectedFolderPath}
• Setup: ${isFolderSelected ? 'Use existing folder' : 'Create new folder'}`;

                const confirm = await vscode.window.showInformationMessage(
                    projectSummary,
                    { modal: true },
                    '✅ Create Advanced Project',
                    '❌ Cancel'
                );

                if (confirm !== '✅ Create Advanced Project') {
                    return;
                }

                // Check if directory already exists
                if (await fs.pathExists(selectedFolderPath)) {
                    const overwrite = await vscode.window.showWarningMessage(
                        `⚠️ The folder "${projectName}" already exists. What would you like to do?`,
                        { modal: true },
                        '🔄 Overwrite',
                        '📁 Use Different Name',
                        '❌ Cancel'
                    );
                    
                    if (overwrite === '❌ Cancel') {
                        return;
                    } else if (overwrite === '📁 Use Different Name') {
                        const newName = await vscode.window.showInputBox({
                            prompt: 'Enter a different project name',
                            placeHolder: `${projectName}-new`,
                            value: `${projectName}-new`,
                            validateInput: (value) => {
                                if (!value) {
                                    return 'Project name is required';
                                }
                                if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
                                    return 'Project name can only contain letters, numbers, hyphens, and underscores';
                                }
                                return null;
                            }
                        });
                        
                        if (!newName) {
                            return;
                        }
                        
                        projectName = newName;
                        selectedFolderPath = path.join(path.dirname(selectedFolderPath), newName);
                    } else {
                        // Overwrite
                        await fs.remove(selectedFolderPath);
                    }
                }

                // Show progress during project creation
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Creating ${template.value.name} project...`,
                    cancellable: false
                }, async (progress) => {
                    progress.report({ increment: 0, message: 'Initializing advanced project structure...' });
                    
                    // Create project configuration
                    const config = {
                        name: projectName || 'project',
                        type: template.value.type,
                        language: template.value.language,
                        framework: template.value.framework,
                        database: template.value.database,
                        testing: template.value.testing,
                        buildTool: template.value.buildTool,
                        features: template.value.features,
                        description: template.value.description,
                        version: '1.0.0',
                        author: 'Developer'
                    };

                    progress.report({ increment: 50, message: 'Generating project files...' });
                    
                    // Generate project
                    await generator.generateAdvancedProject(config, selectedFolderPath);
                    
                    progress.report({ increment: 100, message: 'Advanced project created successfully!' });
                });

                // Show success message with next steps
                const nextSteps = await vscode.window.showInformationMessage(
                    `🎉 Advanced project "${projectName}" created successfully!`,
                    '📂 Open Project',
                    '🚀 Start Development',
                    '📖 View README',
                    '🔧 Install Dependencies'
                );

                if (nextSteps === '📂 Open Project') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                } else if (nextSteps === '🚀 Start Development') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                    // Show terminal with common commands
                    const terminal = vscode.window.createTerminal('Project Setup');
                    terminal.show();
                    terminal.sendText(`cd "${selectedFolderPath}" && echo "🚀 Your ${template.value.name} project is ready!" && echo "📦 Install dependencies:" && echo "npm install  # or yarn install" && echo "🚀 Start development:" && echo "npm start    # or yarn start" && echo "🧪 Run tests:" && echo "npm test     # or yarn test"`);
                } else if (nextSteps === '📖 View README') {
                    const readmePath = path.join(selectedFolderPath, 'README.md');
                    if (await fs.pathExists(readmePath)) {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(readmePath));
                    }
                } else if (nextSteps === '🔧 Install Dependencies') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                    const terminal = vscode.window.createTerminal('Install Dependencies');
                    terminal.show();
                    terminal.sendText(`cd "${selectedFolderPath}" && npm install`);
                }

            } catch (error) {
                handleError(error as Error, 'edino.createAdvancedProject');
            }
        });

        context.subscriptions.push(createAdvancedProjectDisposable);

        // Register new commands for advanced features
        let showAITemplatesDisposable = vscode.commands.registerCommand('edino.showAITemplates', async () => {
            try {
                const aiEngine = AIRecommendationEngine.getInstance();
                // This would show AI-powered template recommendations
                vscode.window.showInformationMessage('🤖 AI-powered template recommendations coming soon!');
            } catch (error) {
                handleError(error as Error, 'edino.showAITemplates');
            }
        });

        let showProjectPreviewDisposable = vscode.commands.registerCommand('edino.showProjectPreview', async () => {
            try {
                const previewManager = ProjectPreviewManager.getInstance();
                // This would show project preview
                vscode.window.showInformationMessage('👀 Project preview feature coming soon!');
            } catch (error) {
                handleError(error as Error, 'edino.showProjectPreview');
            }
        });

        let showTeamTemplatesDisposable = vscode.commands.registerCommand('edino.showTeamTemplates', async () => {
            try {
                const teamManager = TeamManager.getInstance();
                // This would show team templates
                vscode.window.showInformationMessage('👥 Team templates feature coming soon!');
            } catch (error) {
                handleError(error as Error, 'edino.showTeamTemplates');
            }
        });

        let showMarketplaceDisposable = vscode.commands.registerCommand('edino.showMarketplace', async () => {
            try {
                const marketplaceManager = MarketplaceManager.getInstance();
                // This would show marketplace
                vscode.window.showInformationMessage('🛒 Template marketplace coming soon!');
            } catch (error) {
                handleError(error as Error, 'edino.showMarketplace');
            }
        });

        // Register the welcome screen command
        let showWelcomeDisposable = vscode.commands.registerCommand('edino.showWelcome', () => {
            WelcomePanel.createOrShow(context.extensionUri);
        });

        // Register status bar item
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        statusBarItem.text = "$(rocket) Edino";
        statusBarItem.tooltip = "Create New Project";
        statusBarItem.command = 'edino.createProject';
        statusBarItem.show();

        // Register webview provider for the sidebar
        const welcomeProvider = new WelcomePanel(context.extensionUri);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('edino-welcome', welcomeProvider)
        );

        context.subscriptions.push(
            showWelcomeDisposable, 
            statusBarItem,
            showAITemplatesDisposable,
            showProjectPreviewDisposable,
            showTeamTemplatesDisposable,
            showMarketplaceDisposable
        );

    } catch (error) {
        handleError(error as Error, 'activate');
    }
}

async function initializeCoreSystems(context: vscode.ExtensionContext): Promise<void> {
    const logger = Logger.getInstance();
    logger.info('Initializing core systems...');

    try {
        // Initialize Plugin Manager
        const pluginManager = PluginManager.getInstance();
        await pluginManager.initialize(context);
        logger.info('Plugin Manager initialized');

        // Initialize Template Cache
        const templateCache = TemplateCache.getInstance();
        templateCache.configure({
            maxSize: 100,
            ttl: 30 * 60 * 1000, // 30 minutes
            preloadEnabled: true,
            preloadCount: 10
        });
        logger.info('Template Cache initialized');

        // Initialize AI Recommendation Engine
        const aiEngine = AIRecommendationEngine.getInstance();
        logger.info('AI Recommendation Engine initialized');

        // Initialize Project Preview Manager
        const previewManager = ProjectPreviewManager.getInstance();
        logger.info('Project Preview Manager initialized');

        // Initialize Team Manager
        const teamManager = TeamManager.getInstance();
        await teamManager.initialize();
        logger.info('Team Manager initialized');

        // Initialize Marketplace Manager
        const marketplaceManager = MarketplaceManager.getInstance();
        await marketplaceManager.initialize();
        logger.info('Marketplace Manager initialized');

        logger.info('All core systems initialized successfully');
    } catch (error) {
        logger.error('Error initializing core systems', error as Error);
        throw error;
    }
}

export function deactivate() {}
