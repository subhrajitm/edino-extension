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
                <div class="welcome-container">
                    <div class="header">
                        <h1>🚀 Edino Project Generator</h1>
                        <p>Create professional projects with 20+ programming languages and frameworks</p>
                    </div>
                    
                    <div class="quick-start">
                        <h2>⚡ Quick Start</h2>
                        <div class="project-types">
                            <div class="project-card" onclick="createProject('fullstack')">
                                <div class="card-icon">🚀</div>
                                <h3>Full Stack</h3>
                                <p>React + Node.js + MongoDB</p>
                                <div class="tech-stack">
                                    <span class="tech">React</span>
                                    <span class="tech">Node.js</span>
                                    <span class="tech">MongoDB</span>
                                </div>
                                <button class="create-btn">Create Project</button>
                            </div>
                            
                            <div class="project-card" onclick="createProject('frontend')">
                                <div class="card-icon">🎨</div>
                                <h3>Frontend</h3>
                                <p>React with TypeScript & Vite</p>
                                <div class="tech-stack">
                                    <span class="tech">React</span>
                                    <span class="tech">TypeScript</span>
                                    <span class="tech">Vite</span>
                                </div>
                                <button class="create-btn">Create Project</button>
                            </div>
                            
                            <div class="project-card" onclick="createProject('backend')">
                                <div class="card-icon">⚙️</div>
                                <h3>Backend</h3>
                                <p>Express.js API with JWT</p>
                                <div class="tech-stack">
                                    <span class="tech">Express</span>
                                    <span class="tech">JWT</span>
                                    <span class="tech">MongoDB</span>
                                </div>
                                <button class="create-btn">Create Project</button>
                            </div>
                        </div>
                    </div>

                    <div class="advanced-section">
                        <h2>🌟 Advanced Templates</h2>
                        <p>Choose from 20+ languages and frameworks</p>
                        
                        <div class="language-grid">
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🐍</div>
                                <h4>Python</h4>
                                <p>FastAPI, Django, Flask</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">☕</div>
                                <h4>Java</h4>
                                <p>Spring Boot, JPA, MySQL</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🦀</div>
                                <h4>Rust</h4>
                                <p>Actix, Rocket, Cargo</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🐹</div>
                                <h4>Go</h4>
                                <p>Gin, Echo, GORM</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">📱</div>
                                <h4>Mobile</h4>
                                <p>React Native, Flutter</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🖥️</div>
                                <h4>Desktop</h4>
                                <p>Electron, Tauri</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🤖</div>
                                <h4>AI/ML</h4>
                                <p>NumPy, Pandas, Scikit-learn</p>
                            </div>
                            
                            <div class="language-card" onclick="createAdvancedProject()">
                                <div class="lang-icon">🔧</div>
                                <h4>CLI</h4>
                                <p>Node.js CLI tools</p>
                            </div>
                        </div>
                        
                        <div class="advanced-cta">
                            <button class="action-btn primary large" onclick="createAdvancedProject()">
                                🎯 Browse All Templates
                            </button>
                        </div>
                    </div>
                    
                    <div class="features">
                        <h2>✨ Features</h2>
                        <div class="features-grid">
                            <div class="feature-item">
                                <span class="feature-icon">📁</span>
                                <h4>Industry Standards</h4>
                                <p>Professional folder structures</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">⚡</span>
                                <h4>Pre-configured</h4>
                                <p>Dependencies & build tools</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🧪</span>
                                <h4>Testing Ready</h4>
                                <p>Testing frameworks included</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📚</span>
                                <h4>Documentation</h4>
                                <p>Comprehensive README files</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🐳</span>
                                <h4>Docker Support</h4>
                                <p>Containerization ready</p>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🔧</span>
                                <h4>Modern Tooling</h4>
                                <p>Latest frameworks & tools</p>
                            </div>
                        </div>
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