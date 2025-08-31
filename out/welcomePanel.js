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
                    console.log('Executing createProject command with type:', message.type, 'and template info:', message.templateInfo);
                    vscode.commands.executeCommand('edino.createProject', message.type, message.templateInfo);
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
                <div class="welcome-container professional">
                    <!-- Professional Header -->
                    <div class="header-professional">
                        <div class="header-brand">
                            <div class="brand-logo">⚡</div>
                            <div class="brand-text">
                                <h1>Edino</h1>
                                <span class="brand-subtitle">Project Generator</span>
                            </div>
                        </div>
                        <div class="header-stats">
                            <div class="stat-item">
                                <span class="stat-number">15</span>
                                <span class="stat-label">Templates</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">8</span>
                                <span class="stat-label">Categories</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">4</span>
                                <span class="stat-label">Languages</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Compact Search -->
                    <div class="search-professional">
                        <div class="search-wrapper">
                            <div class="search-icon">🔍</div>
                            <input type="text" id="searchInput" class="search-input-pro" placeholder="Search templates..." />
                            <div class="search-clear-pro" id="searchClear" style="display: none;">×</div>
                        </div>
                        <div class="search-results" id="searchStats" style="display: none;">
                            <span id="searchResults">0 results</span>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <div class="action-card primary" data-action="quick">
                            <div class="action-icon">🚀</div>
                            <div class="action-info">
                                <h3>Quick Start</h3>
                                <p>Basic templates for common projects</p>
                            </div>
                            <div class="action-chevron">›</div>
                        </div>
                        <div class="action-card secondary" data-action="advanced">
                            <div class="action-icon">⚙️</div>
                            <div class="action-info">
                                <h3>Advanced</h3>
                                <p>Browse all specialized templates</p>
                            </div>
                            <div class="action-chevron">›</div>
                        </div>
                    </div>

                    <!-- Template Categories -->
                    <div class="template-categories">
                        <div class="category-section">
                            <h3 class="category-title">Frontend</h3>
                            <div class="template-grid">
                                <div class="template-card" data-search="frontend react typescript vite" data-template="frontend" data-language="typescript" data-framework="react">
                                    <div class="template-header">
                                        <div class="template-icon">⚛️</div>
                                        <div class="template-meta">
                                            <h4>React App</h4>
                                            <span class="template-type">Frontend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">React + TypeScript + Vite</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">Vite</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="frontend vue typescript vite" data-template="frontend" data-language="typescript" data-framework="vue">
                                    <div class="template-header">
                                        <div class="template-icon">💚</div>
                                        <div class="template-meta">
                                            <h4>Vue.js App</h4>
                                            <span class="template-type">Frontend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Vue 3 + TypeScript + Vite</div>
                                    <div class="template-tags">
                                        <span class="tag">Vue</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">Vite</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="frontend angular typescript" data-template="frontend" data-language="typescript" data-framework="angular">
                                    <div class="template-header">
                                        <div class="template-icon">🅰️</div>
                                        <div class="template-meta">
                                            <h4>Angular App</h4>
                                            <span class="template-type">Frontend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Angular 17+ + Standalone</div>
                                    <div class="template-tags">
                                        <span class="tag">Angular</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">RxJS</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="frontend svelte sveltekit" data-template="frontend" data-language="typescript" data-framework="svelte">
                                    <div class="template-header">
                                        <div class="template-icon">⚡</div>
                                        <div class="template-meta">
                                            <h4>Svelte App</h4>
                                            <span class="template-type">Frontend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Svelte + SvelteKit</div>
                                    <div class="template-tags">
                                        <span class="tag">Svelte</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">Kit</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="category-section">
                            <h3 class="category-title">Backend</h3>
                            <div class="template-grid">
                                <div class="template-card" data-search="backend nodejs express typescript" data-template="backend" data-language="typescript" data-framework="express">
                                    <div class="template-header">
                                        <div class="template-icon">🟢</div>
                                        <div class="template-meta">
                                            <h4>Node.js API</h4>
                                            <span class="template-type">Backend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Express + TypeScript + MongoDB</div>
                                    <div class="template-tags">
                                        <span class="tag">Express</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="backend nestjs typescript" data-template="backend" data-language="typescript" data-framework="nestjs">
                                    <div class="template-header">
                                        <div class="template-icon">🪺</div>
                                        <div class="template-meta">
                                            <h4>NestJS API</h4>
                                            <span class="template-type">Backend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">NestJS + TypeScript + PostgreSQL</div>
                                    <div class="template-tags">
                                        <span class="tag">NestJS</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">PostgreSQL</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="backend python fastapi" data-template="backend" data-language="python" data-framework="fastapi">
                                    <div class="template-header">
                                        <div class="template-icon">🐍</div>
                                        <div class="template-meta">
                                            <h4>Python FastAPI</h4>
                                            <span class="template-type">Backend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">FastAPI + SQLAlchemy + PostgreSQL</div>
                                    <div class="template-tags">
                                        <span class="tag">FastAPI</span>
                                        <span class="tag">Python</span>
                                        <span class="tag">SQLAlchemy</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="backend java spring boot" data-template="backend" data-language="java" data-framework="spring">
                                    <div class="template-header">
                                        <div class="template-icon">☕</div>
                                        <div class="template-meta">
                                            <h4>Spring Boot API</h4>
                                            <span class="template-type">Backend</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Spring Boot + Java + MySQL</div>
                                    <div class="template-tags">
                                        <span class="tag">Spring</span>
                                        <span class="tag">Java</span>
                                        <span class="tag">MySQL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="category-section">
                            <h3 class="category-title">Full Stack & Mobile</h3>
                            <div class="template-grid">
                                <div class="template-card" data-search="fullstack react nodejs typescript" data-template="fullstack" data-language="typescript" data-framework="react">
                                    <div class="template-header">
                                        <div class="template-icon">🔄</div>
                                        <div class="template-meta">
                                            <h4>React + Node.js</h4>
                                            <span class="template-type">Full Stack</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">React + Node.js + TypeScript + MongoDB</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">Node.js</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="mobile react native typescript" data-template="mobile" data-language="typescript" data-framework="react-native">
                                    <div class="template-header">
                                        <div class="template-icon">📱</div>
                                        <div class="template-meta">
                                            <h4>React Native</h4>
                                            <span class="template-type">Mobile</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">React Native + TypeScript + Navigation</div>
                                    <div class="template-tags">
                                        <span class="tag">React Native</span>
                                        <span class="tag">TS</span>
                                        <span class="tag">Mobile</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="mobile flutter dart" data-template="mobile" data-language="dart" data-framework="flutter">
                                    <div class="template-header">
                                        <div class="template-icon">🦋</div>
                                        <div class="template-meta">
                                            <h4>Flutter App</h4>
                                            <span class="template-type">Mobile</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Flutter + Dart + State Management</div>
                                    <div class="template-tags">
                                        <span class="tag">Flutter</span>
                                        <span class="tag">Dart</span>
                                        <span class="tag">Mobile</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="desktop electron react" data-template="desktop" data-language="typescript" data-framework="electron">
                                    <div class="template-header">
                                        <div class="template-icon">💻</div>
                                        <div class="template-meta">
                                            <h4>Electron App</h4>
                                            <span class="template-type">Desktop</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">Electron + React + TypeScript</div>
                                    <div class="template-tags">
                                        <span class="tag">Electron</span>
                                        <span class="tag">React</span>
                                        <span class="tag">Desktop</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="category-section">
                            <h3 class="category-title">Specialized</h3>
                            <div class="template-grid">
                                <div class="template-card" data-search="library typescript rollup" data-template="library" data-language="typescript">
                                    <div class="template-header">
                                        <div class="template-icon">📦</div>
                                        <div class="template-meta">
                                            <h4>TypeScript Library</h4>
                                            <span class="template-type">Library</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">TypeScript + Rollup + Testing</div>
                                    <div class="template-tags">
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Rollup</span>
                                        <span class="tag">Library</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="cli nodejs typescript commander" data-template="cli" data-language="typescript">
                                    <div class="template-header">
                                        <div class="template-icon">⌨️</div>
                                        <div class="template-meta">
                                            <h4>Node.js CLI</h4>
                                            <span class="template-type">CLI</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">TypeScript + Commander.js + Testing</div>
                                    <div class="template-tags">
                                        <span class="tag">Node.js</span>
                                        <span class="tag">CLI</span>
                                        <span class="tag">TS</span>
                                    </div>
                                </div>
                                
                                <div class="template-card" data-search="ai ml python numpy pandas" data-template="ai-ml" data-language="python">
                                    <div class="template-header">
                                        <div class="template-icon">🤖</div>
                                        <div class="template-meta">
                                            <h4>Python AI/ML</h4>
                                            <span class="template-type">AI/ML</span>
                                        </div>
                                    </div>
                                    <div class="template-stack">NumPy + Pandas + Scikit-learn</div>
                                    <div class="template-tags">
                                        <span class="tag">Python</span>
                                        <span class="tag">AI/ML</span>
                                        <span class="tag">Data Science</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- No Results -->
                    <div class="no-results-pro" id="noResults" style="display: none;">
                        <div class="no-results-content">
                            <div class="no-results-icon">🔍</div>
                            <h3>No results found</h3>
                            <p>Try searching for different keywords or browse all templates</p>
                            <button class="clear-search-btn" data-action="clear-search">Clear Search</button>
                        </div>
                    </div>

                    <!-- Professional Footer -->
                    <div class="footer-professional">
                        <div class="footer-content">
                            <div class="footer-links">
                                <span class="footer-link" data-action="documentation">Documentation</span>
                                <span class="footer-link">GitHub</span>
                            </div>
                            <div class="footer-version">v1.0.0</div>
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