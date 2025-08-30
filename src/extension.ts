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
            // Get the current workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('Please open a workspace folder first.');
                return;
            }

            // Show project type selection
            const projectType = await vscode.window.showQuickPick(
                [
                    { label: '🚀 Full Stack', value: ProjectType.FULL_STACK },
                    { label: '🎨 Frontend', value: ProjectType.FRONTEND },
                    { label: '⚙️ Backend', value: ProjectType.BACKEND }
                ],
                {
                    placeHolder: 'Select project type',
                    ignoreFocusOut: true
                }
            );

            if (!projectType) {
                return;
            }

            // Get project name
            const projectName = await vscode.window.showInputBox({
                prompt: 'Enter project name',
                placeHolder: 'my-awesome-project',
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

            if (!projectName) {
                return;
            }

            // Get target directory
            const targetDir = await vscode.window.showInputBox({
                prompt: 'Enter target directory (relative to workspace)',
                placeHolder: 'projects',
                value: 'projects'
            });

            if (!targetDir) {
                return;
            }

            const fullTargetPath = path.join(workspaceFolder.uri.fsPath, targetDir, projectName);

            // Check if directory already exists
            if (await fs.pathExists(fullTargetPath)) {
                const overwrite = await vscode.window.showWarningMessage(
                    `Directory "${projectName}" already exists. Do you want to overwrite it?`,
                    { modal: true },
                    'Yes'
                );
                if (!overwrite) {
                    return;
                }
                await fs.remove(fullTargetPath);
            }

            // Create project structure
            const generator = new ProjectGenerator();
            await generator.generateProject(projectType.value, fullTargetPath, projectName);

            // Show success message
            vscode.window.showInformationMessage(
                `Project "${projectName}" created successfully!`,
                'Open Folder'
            ).then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullTargetPath));
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create project: ${error}`);
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

    context.subscriptions.push(createProjectDisposable, showWelcomeDisposable, statusBarItem);

    // Register advanced project creation command
    let createAdvancedProjectDisposable = vscode.commands.registerCommand('edino.createAdvancedProject', async () => {
        try {
            const generator = new ProjectGenerator();
            const templates = generator.getAvailableTemplates();
            
            // Show template selection
            const template = await vscode.window.showQuickPick(
                templates.map(t => ({
                    label: `${t.name}`,
                    description: t.description,
                    detail: `${t.language} • ${t.complexity} • ${t.features.join(', ')}`,
                    value: t
                })),
                {
                    placeHolder: 'Select a template',
                    ignoreFocusOut: true
                }
            );

            if (!template) {
                return;
            }

            // Get project name
            const projectName = await vscode.window.showInputBox({
                prompt: 'Enter project name',
                placeHolder: 'my-awesome-project',
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

            if (!projectName) {
                return;
            }

            // Get workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('Please open a workspace folder first.');
                return;
            }

            const fullTargetPath = path.join(workspaceFolder.uri.fsPath, projectName);

            // Check if directory already exists
            if (await fs.pathExists(fullTargetPath)) {
                const overwrite = await vscode.window.showWarningMessage(
                    `Directory "${projectName}" already exists. Do you want to overwrite it?`,
                    { modal: true },
                    'Yes'
                );
                if (!overwrite) {
                    return;
                }
                await fs.remove(fullTargetPath);
            }

            // Create project configuration
            const config = {
                name: projectName,
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

            // Generate project
            await generator.generateAdvancedProject(config, fullTargetPath);

            // Show success message
            vscode.window.showInformationMessage(
                `Advanced project "${projectName}" created successfully!`,
                'Open Folder'
            ).then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullTargetPath));
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create advanced project: ${error}`);
        }
    });

    context.subscriptions.push(createAdvancedProjectDisposable);
}

export function deactivate() {}
