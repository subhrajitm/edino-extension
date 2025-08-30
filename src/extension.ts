import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectGenerator } from './projectGenerator';
import { ProjectType, Language, FrontendFramework, BackendFramework } from './types';
import { WelcomePanel } from './welcomePanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Edino Project Generator is now active!');

    // Register the main project creation command
    let createProjectDisposable = vscode.commands.registerCommand('edino.createProject', async () => {
        try {
            // Show welcome message
            vscode.window.showInformationMessage('🚀 Welcome to Edino Project Generator! Let\'s create something amazing.');

            // Get the current workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('❌ Please open a workspace folder first to create your project.');
                return;
            }

            // Check if a folder is selected in the explorer
            const activeTextEditor = vscode.window.activeTextEditor;
            let selectedFolderPath: string | undefined;
            let projectName: string | undefined;
            let isFolderSelected = false;

            if (activeTextEditor) {
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

            // If no folder is selected, provide better guidance
            if (!selectedFolderPath) {
                const folderChoice = await vscode.window.showQuickPick(
                    [
                        { label: '📁 Select a folder', description: 'Choose an existing folder for your project', value: 'select' },
                        { label: '🆕 Create new folder', description: 'Create a new folder with custom name', value: 'create' }
                    ],
                    {
                        placeHolder: 'How would you like to set up your project location?',
                        ignoreFocusOut: true
                    }
                );

                if (!folderChoice) {
                    return;
                }

                if (folderChoice.value === 'select') {
                    const selectedItems = await vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: 'Select Project Folder',
                        title: 'Choose the folder where you want to create your project'
                    });

                    if (selectedItems && selectedItems.length > 0) {
                        selectedFolderPath = selectedItems[0].fsPath;
                        projectName = path.basename(selectedFolderPath);
                        isFolderSelected = true;
                    } else {
                        return;
                    }
                } else {
                    // Create new folder flow
                    const inputProjectName = await vscode.window.showInputBox({
                        prompt: 'What would you like to name your project?',
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

                    const targetDir = await vscode.window.showInputBox({
                        prompt: 'Where should we create your project? (relative to workspace)',
                        placeHolder: 'projects',
                        value: 'projects'
                    });

                    if (!targetDir) {
                        return;
                    }

                    projectName = inputProjectName;
                    selectedFolderPath = path.join(workspaceFolder.uri.fsPath, targetDir, projectName);
                }
            }

            // Show project type selection with better descriptions
            const projectType = await vscode.window.showQuickPick(
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

            if (!projectType) {
                return;
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
            vscode.window.showErrorMessage(`❌ Failed to create project: ${error}`);
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

            // Check if a folder is selected in the explorer
            const activeTextEditor = vscode.window.activeTextEditor;
            let selectedFolderPath: string | undefined;
            let projectName: string | undefined;
            let isFolderSelected = false;

            if (activeTextEditor) {
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

            // If no folder is selected, check if we're already in a folder
            if (!selectedFolderPath) {
                // Check if we're already in a subfolder of the workspace
                const currentFolder = workspaceFolder.uri.fsPath;
                const currentFolderName = path.basename(currentFolder);
                
                // If we're not in the root workspace folder, use the current folder
                if (currentFolderName !== workspaceFolder.name) {
                    selectedFolderPath = currentFolder;
                    projectName = currentFolderName;
                    isFolderSelected = true;
                } else {
                    // Only ask for folder selection if we're in the root workspace
                    const folderChoice = await vscode.window.showQuickPick(
                        [
                            { label: '📁 Select a folder', description: 'Choose an existing folder for your project', value: 'select' },
                            { label: '🆕 Create new folder', description: 'Create a new folder with custom name', value: 'create' }
                        ],
                        {
                            placeHolder: 'How would you like to set up your project location?',
                            ignoreFocusOut: true
                        }
                    );

                    if (!folderChoice) {
                        return;
                    }

                    if (folderChoice.value === 'select') {
                        const selectedItems = await vscode.window.showOpenDialog({
                            canSelectFiles: false,
                            canSelectFolders: true,
                            canSelectMany: false,
                            openLabel: 'Select Project Folder',
                            title: 'Choose the folder where you want to create your project'
                        });

                        if (selectedItems && selectedItems.length > 0) {
                            selectedFolderPath = selectedItems[0].fsPath;
                            projectName = path.basename(selectedFolderPath);
                            isFolderSelected = true;
                        } else {
                            return;
                        }
                    } else {
                        // Create new folder flow
                        const inputProjectName = await vscode.window.showInputBox({
                            prompt: 'What would you like to name your project?',
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
• Framework: ${template.value.framework}
• Database: ${template.value.database || 'None'}
• Testing: ${template.value.testing}
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
            vscode.window.showErrorMessage(`❌ Failed to create advanced project: ${error}`);
        }
    });

    context.subscriptions.push(createAdvancedProjectDisposable);

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

    context.subscriptions.push(showWelcomeDisposable, statusBarItem);
}

export function deactivate() {}
