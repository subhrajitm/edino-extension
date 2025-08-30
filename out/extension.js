"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const projectGenerator_1 = require("./projectGenerator");
const types_1 = require("./types");
const welcomePanel_1 = require("./welcomePanel");
function activate(context) {
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
            // Check if a folder is selected in the explorer
            const activeTextEditor = vscode.window.activeTextEditor;
            let selectedFolderPath;
            let projectName;
            if (activeTextEditor) {
                // Get the folder containing the active file
                const activeFilePath = activeTextEditor.document.uri.fsPath;
                const activeFolderPath = path.dirname(activeFilePath);
                // Check if the active folder is within the workspace
                if (activeFolderPath.startsWith(workspaceFolder.uri.fsPath)) {
                    selectedFolderPath = activeFolderPath;
                    projectName = path.basename(activeFolderPath);
                }
            }
            // If no folder is selected, check for selected items in explorer
            if (!selectedFolderPath) {
                const selectedItems = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Project Folder',
                    title: 'Select folder for project creation'
                });
                if (selectedItems && selectedItems.length > 0) {
                    selectedFolderPath = selectedItems[0].fsPath;
                    projectName = path.basename(selectedFolderPath);
                }
            }
            // Show project type selection
            const projectType = await vscode.window.showQuickPick([
                { label: '🚀 Full Stack', value: types_1.ProjectType.FULL_STACK },
                { label: '🎨 Frontend', value: types_1.ProjectType.FRONTEND },
                { label: '⚙️ Backend', value: types_1.ProjectType.BACKEND }
            ], {
                placeHolder: 'Select project type',
                ignoreFocusOut: true
            });
            if (!projectType) {
                return;
            }
            // If no folder was selected, ask for project name and target directory
            if (!selectedFolderPath) {
                // Get project name
                const inputProjectName = await vscode.window.showInputBox({
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
                if (!inputProjectName) {
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
                projectName = inputProjectName;
                selectedFolderPath = path.join(workspaceFolder.uri.fsPath, targetDir, projectName);
            }
            else {
                // Use the selected folder path directly
                selectedFolderPath = path.join(selectedFolderPath, projectName || 'project');
            }
            // Check if directory already exists
            if (await fs.pathExists(selectedFolderPath)) {
                const overwrite = await vscode.window.showWarningMessage(`Directory "${projectName}" already exists. Do you want to overwrite it?`, { modal: true }, 'Yes');
                if (!overwrite) {
                    return;
                }
                await fs.remove(selectedFolderPath);
            }
            // Create project structure
            const generator = new projectGenerator_1.ProjectGenerator();
            await generator.generateProject(projectType.value, selectedFolderPath, projectName || 'project');
            // Show success message
            vscode.window.showInformationMessage(`Project "${projectName}" created successfully!`, 'Open Folder').then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create project: ${error}`);
        }
    });
    context.subscriptions.push(createProjectDisposable);
    // Register advanced project creation command
    let createAdvancedProjectDisposable = vscode.commands.registerCommand('edino.createAdvancedProject', async () => {
        try {
            const generator = new projectGenerator_1.ProjectGenerator();
            const templates = generator.getAvailableTemplates();
            // Get the current workspace folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('Please open a workspace folder first.');
                return;
            }
            // Check if a folder is selected in the explorer
            const activeTextEditor = vscode.window.activeTextEditor;
            let selectedFolderPath;
            let projectName;
            if (activeTextEditor) {
                // Get the folder containing the active file
                const activeFilePath = activeTextEditor.document.uri.fsPath;
                const activeFolderPath = path.dirname(activeFilePath);
                // Check if the active folder is within the workspace
                if (activeFolderPath.startsWith(workspaceFolder.uri.fsPath)) {
                    selectedFolderPath = activeFolderPath;
                    projectName = path.basename(activeFolderPath);
                }
            }
            // If no folder is selected, check for selected items in explorer
            if (!selectedFolderPath) {
                const selectedItems = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Project Folder',
                    title: 'Select folder for project creation'
                });
                if (selectedItems && selectedItems.length > 0) {
                    selectedFolderPath = selectedItems[0].fsPath;
                    projectName = path.basename(selectedFolderPath);
                }
            }
            // Show template selection
            const template = await vscode.window.showQuickPick(templates.map((t) => ({
                label: `${t.name}`,
                description: t.description,
                detail: `${t.language} • ${t.complexity} • ${t.features.join(', ')}`,
                value: t
            })), {
                placeHolder: 'Select a template',
                ignoreFocusOut: true
            });
            if (!template) {
                return;
            }
            // If no folder was selected, ask for project name
            if (!selectedFolderPath) {
                // Get project name
                const inputProjectName = await vscode.window.showInputBox({
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
                if (!inputProjectName) {
                    return;
                }
                projectName = inputProjectName;
                selectedFolderPath = path.join(workspaceFolder.uri.fsPath, projectName);
            }
            else {
                // Use the selected folder path directly
                selectedFolderPath = path.join(selectedFolderPath, projectName || 'project');
            }
            // Check if directory already exists
            if (await fs.pathExists(selectedFolderPath)) {
                const overwrite = await vscode.window.showWarningMessage(`Directory "${projectName}" already exists. Do you want to overwrite it?`, { modal: true }, 'Yes');
                if (!overwrite) {
                    return;
                }
                await fs.remove(selectedFolderPath);
            }
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
            // Generate project
            await generator.generateAdvancedProject(config, selectedFolderPath);
            // Show success message
            vscode.window.showInformationMessage(`Advanced project "${projectName}" created successfully!`, 'Open Folder').then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(selectedFolderPath));
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create advanced project: ${error}`);
        }
    });
    context.subscriptions.push(createAdvancedProjectDisposable);
    // Register the welcome screen command
    let showWelcomeDisposable = vscode.commands.registerCommand('edino.showWelcome', () => {
        welcomePanel_1.WelcomePanel.createOrShow(context.extensionUri);
    });
    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "$(rocket) Edino";
    statusBarItem.tooltip = "Create New Project";
    statusBarItem.command = 'edino.createProject';
    statusBarItem.show();
    // Register webview provider for the sidebar
    const welcomeProvider = new welcomePanel_1.WelcomePanel(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('edino-welcome', welcomeProvider));
    context.subscriptions.push(showWelcomeDisposable, statusBarItem);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map