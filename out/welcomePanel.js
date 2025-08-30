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
exports.WelcomePanel = void 0;
const vscode = __importStar(require("vscode"));
class WelcomePanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (WelcomePanel.currentPanel && WelcomePanel.currentPanel._panel) {
            const panel = WelcomePanel.currentPanel._panel;
            if ('reveal' in panel) {
                panel.reveal(column);
            }
            return;
        }
        const panel = vscode.window.createWebviewPanel(WelcomePanel.viewType, 'Edino Project Generator', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'resources')
            ]
        });
        WelcomePanel.currentPanel = new WelcomePanel(extensionUri);
        WelcomePanel.currentPanel._panel = panel;
        WelcomePanel.currentPanel._update();
    }
    constructor(extensionUri) {
        this._disposables = [];
        this._extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._panel = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'resources')
            ]
        };
        this._update();
        webviewView.onDidDispose(() => this.dispose(), null, this._disposables);
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'createProject':
                    vscode.commands.executeCommand('edino.createProject');
                    return;
                case 'showDocumentation':
                    this._showDocumentation();
                    return;
            }
        }, null, this._disposables);
    }
    dispose() {
        WelcomePanel.currentPanel = undefined;
        if (this._panel && 'dispose' in this._panel) {
            this._panel.dispose();
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    async _update() {
        if (!this._panel)
            return;
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'style.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'resources', 'script.js'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edino Project Generator</title>
                <link rel="stylesheet" href="${styleResetUri}">
            </head>
            <body>
                <div class="welcome-container">
                    <div class="header">
                        <h1>🚀 Edino Project Generator</h1>
                        <p>Quickly create new projects with pre-configured structures</p>
                    </div>
                    
                    <div class="project-types">
                        <div class="project-card" onclick="createProject('fullstack')">
                            <div class="card-icon">🚀</div>
                            <h3>Full Stack</h3>
                            <p>Complete React frontend + Node.js backend with MongoDB</p>
                            <button class="create-btn">Create Project</button>
                        </div>
                        
                        <div class="project-card" onclick="createProject('frontend')">
                            <div class="card-icon">🎨</div>
                            <h3>Frontend</h3>
                            <p>React application with routing and components</p>
                            <button class="create-btn">Create Project</button>
                        </div>
                        
                        <div class="project-card" onclick="createProject('backend')">
                            <div class="card-icon">⚙️</div>
                            <h3>Backend</h3>
                            <p>Node.js/Express API with authentication</p>
                            <button class="create-btn">Create Project</button>
                        </div>
                    </div>
                    
                    <div class="features">
                        <h2>✨ Features</h2>
                        <ul>
                            <li>✅ Industry-standard folder structures</li>
                            <li>✅ Pre-configured dependencies</li>
                            <li>✅ Comprehensive documentation</li>
                            <li>✅ Testing setup included</li>
                            <li>✅ Production-ready configuration</li>
                        </ul>
                    </div>
                    
                    <div class="actions">
                        <button class="action-btn primary" onclick="createProject()">
                            🚀 Create New Project
                        </button>
                        <button class="action-btn secondary" onclick="showDocumentation()">
                            📚 View Documentation
                        </button>
                    </div>
                </div>
                
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
    _showDocumentation() {
        vscode.window.showInformationMessage('Documentation: Check the README.md file in your generated projects for detailed setup instructions.');
    }
}
exports.WelcomePanel = WelcomePanel;
WelcomePanel.viewType = 'edino-welcome';
//# sourceMappingURL=welcomePanel.js.map