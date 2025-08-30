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
            console.log('Received message from webview:', message);
            switch (message.command) {
                case 'createProject':
                    console.log('Executing createProject command');
                    vscode.commands.executeCommand('edino.createProject');
                    return;
                case 'createAdvancedProject':
                    console.log('Executing createAdvancedProject command');
                    vscode.commands.executeCommand('edino.createAdvancedProject');
                    return;
                case 'showDocumentation':
                    console.log('Executing showDocumentation command');
                    this._showDocumentation();
                    return;
                default:
                    console.log('Unknown command received:', message.command);
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
                <div class="welcome-container list-view">
                    <!-- Compact Header -->
                    <div class="header-list">
                        <div class="header-title">
                            <h1>Edino</h1>
                            <span class="header-subtitle">Project Generator</span>
                        </div>
                        <div class="header-meta">
                            <span class="meta-item">20+ Languages</span>
                            <span class="meta-item">50+ Templates</span>
                            <span class="meta-item">Fast</span>
                        </div>
                    </div>
                    
                    <!-- Quick Actions List -->
                    <div class="section">
                        <h3 class="section-title">Quick Actions</h3>
                        <div class="action-list">
                            <div class="action-item primary" onclick="createProject()">
                                <div class="action-content">
                                    <div class="action-title">Quick Start</div>
                                    <div class="action-desc">Basic templates for common projects</div>
                                </div>
                                <div class="action-arrow">→</div>
                            </div>
                            <div class="action-item secondary" onclick="createAdvancedProject()">
                                <div class="action-content">
                                    <div class="action-title">Advanced Templates</div>
                                    <div class="action-desc">Browse 50+ specialized templates</div>
                                </div>
                                <div class="action-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Popular Templates List -->
                    <div class="section">
                        <h3 class="section-title">Popular Templates</h3>
                        <div class="template-list">
                            <div class="template-item" onclick="createProject('fullstack')">
                                <div class="template-content">
                                    <div class="template-title">Full Stack App</div>
                                    <div class="template-stack">React + Node.js + MongoDB</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">Node.js</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" onclick="createProject('frontend')">
                                <div class="template-content">
                                    <div class="template-title">Frontend App</div>
                                    <div class="template-stack">React + TypeScript + Vite</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Vite</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" onclick="createProject('backend')">
                                <div class="template-content">
                                    <div class="template-title">Backend API</div>
                                    <div class="template-stack">Express + JWT + MongoDB</div>
                                    <div class="template-tags">
                                        <span class="tag">Express</span>
                                        <span class="tag">JWT</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Languages List -->
                    <div class="section">
                        <h3 class="section-title">Supported Languages</h3>
                        <div class="language-list">
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Python</div>
                                    <div class="lang-frameworks">FastAPI, Django, Flask</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Java</div>
                                    <div class="lang-frameworks">Spring Boot, Maven</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Rust</div>
                                    <div class="lang-frameworks">Actix, Rocket, Cargo</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Go</div>
                                    <div class="lang-frameworks">Gin, Echo, Fiber</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Mobile</div>
                                    <div class="lang-frameworks">React Native, Flutter</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" onclick="createAdvancedProject()">
                                <div class="lang-content">
                                    <div class="lang-name">Desktop</div>
                                    <div class="lang-frameworks">Electron, Tauri</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer-list">
                        <div class="footer-links">
                            <span class="footer-link" onclick="showDocumentation()">Documentation</span>
                            <span class="footer-link">GitHub</span>
                            <span class="footer-version">v1.0.0</span>
                        </div>
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