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
                const overwrite = await vscode.window.showWarningMessage(`Directory "${projectName}" already exists. Do you want to overwrite it?`, { modal: true }, 'Yes');
                if (!overwrite) {
                    return;
                }
                await fs.remove(fullTargetPath);
            }
            // Create project structure
            const generator = new projectGenerator_1.ProjectGenerator();
            await generator.generateProject(projectType.value, fullTargetPath, projectName);
            // Show success message
            vscode.window.showInformationMessage(`Project "${projectName}" created successfully!`, 'Open Folder').then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullTargetPath));
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create project: ${error}`);
        }
    });
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
    context.subscriptions.push(createProjectDisposable, showWelcomeDisposable, statusBarItem);
    // Register advanced project creation command
    let createAdvancedProjectDisposable = vscode.commands.registerCommand('edino.createAdvancedProject', async () => {
        try {
            const generator = new projectGenerator_1.ProjectGenerator();
            const templates = generator.getAvailableTemplates();
            // Show template selection
            const template = await vscode.window.showQuickPick(templates.map(t => ({
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
                const overwrite = await vscode.window.showWarningMessage(`Directory "${projectName}" already exists. Do you want to overwrite it?`, { modal: true }, 'Yes');
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
            vscode.window.showInformationMessage(`Advanced project "${projectName}" created successfully!`, 'Open Folder').then(selection => {
                if (selection === 'Open Folder') {
                    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(fullTargetPath));
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create advanced project: ${error}`);
        }
    });
    context.subscriptions.push(createAdvancedProjectDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map