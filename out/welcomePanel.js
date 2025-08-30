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
                    
                    <!-- Search Bar -->
                    <div class="search-section">
                        <div class="search-container">
                            <input type="text" id="searchInput" class="search-input" placeholder="Search templates, languages, frameworks..." />
                            <div class="search-clear" id="searchClear" style="display: none;">×</div>
                        </div>
                        <div class="search-stats" id="searchStats" style="display: none;">
                            <span id="searchResults">0 results</span>
                        </div>
                    </div>
                    
                    <!-- Quick Actions List -->
                    <div class="section" id="quickActionsSection">
                        <h3 class="section-title">Quick Actions</h3>
                        <div class="action-list">
                            <div class="action-item primary" data-action="quick">
                                <div class="action-content">
                                    <div class="action-title">Quick Start</div>
                                    <div class="action-desc">Basic templates for common projects</div>
                                </div>
                                <div class="action-arrow">→</div>
                            </div>
                            <div class="action-item secondary" data-action="advanced">
                                <div class="action-content">
                                    <div class="action-title">Advanced Templates</div>
                                    <div class="action-desc">Browse 50+ specialized templates</div>
                                </div>
                                <div class="action-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- All Templates List -->
                    <div class="section" id="templatesSection">
                        <h3 class="section-title">All Templates</h3>
                        <div class="template-list" id="templateList">
                            <!-- Frontend Templates -->
                            <div class="template-item" data-search="frontend react typescript vite tailwind" data-template="frontend" data-language="typescript" data-framework="react">
                                <div class="template-content">
                                    <div class="template-title">React App</div>
                                    <div class="template-stack">React + TypeScript + Vite + Tailwind</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Vite</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="frontend vue typescript vite pinia" data-template="frontend" data-language="typescript" data-framework="vue">
                                <div class="template-content">
                                    <div class="template-title">Vue.js App</div>
                                    <div class="template-stack">Vue 3 + TypeScript + Vite + Pinia</div>
                                    <div class="template-tags">
                                        <span class="tag">Vue</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Vite</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="frontend angular typescript standalone" data-template="frontend" data-language="typescript" data-framework="angular">
                                <div class="template-content">
                                    <div class="template-title">Angular App</div>
                                    <div class="template-stack">Angular 17+ + Standalone Components</div>
                                    <div class="template-tags">
                                        <span class="tag">Angular</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">RxJS</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="frontend svelte sveltekit typescript" data-template="frontend" data-language="typescript" data-framework="svelte">
                                <div class="template-content">
                                    <div class="template-title">Svelte App</div>
                                    <div class="template-stack">Svelte + SvelteKit + TypeScript</div>
                                    <div class="template-tags">
                                        <span class="tag">Svelte</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">SvelteKit</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- Backend Templates -->
                            <div class="template-item" data-search="backend nodejs express typescript mongodb jwt" data-template="backend" data-language="typescript" data-framework="express">
                                <div class="template-content">
                                    <div class="template-title">Node.js API</div>
                                    <div class="template-stack">Express + TypeScript + MongoDB + JWT</div>
                                    <div class="template-tags">
                                        <span class="tag">Express</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="backend nestjs typescript postgresql typeorm" data-template="backend" data-language="typescript" data-framework="nestjs">
                                <div class="template-content">
                                    <div class="template-title">NestJS API</div>
                                    <div class="template-stack">NestJS + TypeScript + PostgreSQL</div>
                                    <div class="template-tags">
                                        <span class="tag">NestJS</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">PostgreSQL</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="backend python fastapi sqlalchemy postgresql" data-template="backend" data-language="python" data-framework="fastapi">
                                <div class="template-content">
                                    <div class="template-title">Python FastAPI</div>
                                    <div class="template-stack">FastAPI + SQLAlchemy + PostgreSQL</div>
                                    <div class="template-tags">
                                        <span class="tag">FastAPI</span>
                                        <span class="tag">Python</span>
                                        <span class="tag">PostgreSQL</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="backend java spring boot mysql jpa" data-template="backend" data-language="java" data-framework="spring">
                                <div class="template-content">
                                    <div class="template-title">Spring Boot API</div>
                                    <div class="template-stack">Spring Boot + Java + MySQL</div>
                                    <div class="template-tags">
                                        <span class="tag">Spring</span>
                                        <span class="tag">Java</span>
                                        <span class="tag">MySQL</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- Full Stack Templates -->
                            <div class="template-item" data-search="fullstack react nodejs typescript mongodb" data-template="fullstack" data-language="typescript" data-framework="react">
                                <div class="template-content">
                                    <div class="template-title">React + Node.js Full Stack</div>
                                    <div class="template-stack">React + Node.js + TypeScript + MongoDB</div>
                                    <div class="template-tags">
                                        <span class="tag">React</span>
                                        <span class="tag">Node.js</span>
                                        <span class="tag">MongoDB</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- Mobile Templates -->
                            <div class="template-item" data-search="mobile react native typescript navigation" data-template="mobile" data-language="typescript" data-framework="react-native">
                                <div class="template-content">
                                    <div class="template-title">React Native App</div>
                                    <div class="template-stack">React Native + TypeScript + Navigation</div>
                                    <div class="template-tags">
                                        <span class="tag">React Native</span>
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Mobile</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <div class="template-item" data-search="mobile flutter dart state management" data-template="mobile" data-language="dart" data-framework="flutter">
                                <div class="template-content">
                                    <div class="template-title">Flutter App</div>
                                    <div class="template-stack">Flutter + Dart + State Management</div>
                                    <div class="template-tags">
                                        <span class="tag">Flutter</span>
                                        <span class="tag">Dart</span>
                                        <span class="tag">Mobile</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- Desktop Templates -->
                            <div class="template-item" data-search="desktop electron react typescript" data-template="desktop" data-language="typescript" data-framework="electron">
                                <div class="template-content">
                                    <div class="template-title">Electron App</div>
                                    <div class="template-stack">Electron + React + TypeScript</div>
                                    <div class="template-tags">
                                        <span class="tag">Electron</span>
                                        <span class="tag">React</span>
                                        <span class="tag">Desktop</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- Library Templates -->
                            <div class="template-item" data-search="library typescript rollup testing" data-template="library" data-language="typescript">
                                <div class="template-content">
                                    <div class="template-title">TypeScript Library</div>
                                    <div class="template-stack">TypeScript + Rollup + Testing</div>
                                    <div class="template-tags">
                                        <span class="tag">TypeScript</span>
                                        <span class="tag">Rollup</span>
                                        <span class="tag">Library</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- CLI Templates -->
                            <div class="template-item" data-search="cli nodejs typescript commander" data-template="cli" data-language="typescript">
                                <div class="template-content">
                                    <div class="template-title">Node.js CLI</div>
                                    <div class="template-stack">TypeScript + Commander.js + Testing</div>
                                    <div class="template-tags">
                                        <span class="tag">Node.js</span>
                                        <span class="tag">CLI</span>
                                        <span class="tag">TypeScript</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                            
                            <!-- AI/ML Templates -->
                            <div class="template-item" data-search="ai ml python numpy pandas scikit" data-template="ai-ml" data-language="python">
                                <div class="template-content">
                                    <div class="template-title">Python AI/ML</div>
                                    <div class="template-stack">NumPy + Pandas + Scikit-learn</div>
                                    <div class="template-tags">
                                        <span class="tag">Python</span>
                                        <span class="tag">AI/ML</span>
                                        <span class="tag">Data Science</span>
                                    </div>
                                </div>
                                <div class="template-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- Languages List -->
                    <div class="section" id="languagesSection">
                        <h3 class="section-title">Supported Languages</h3>
                        <div class="language-list" id="languageList">
                            <div class="lang-item" data-search="python fastapi django flask" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Python</div>
                                    <div class="lang-frameworks">FastAPI, Django, Flask</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" data-search="java spring boot maven" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Java</div>
                                    <div class="lang-frameworks">Spring Boot, Maven</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" data-search="rust actix rocket cargo" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Rust</div>
                                    <div class="lang-frameworks">Actix, Rocket, Cargo</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" data-search="go gin echo fiber" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Go</div>
                                    <div class="lang-frameworks">Gin, Echo, Fiber</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" data-search="mobile react native flutter" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Mobile</div>
                                    <div class="lang-frameworks">React Native, Flutter</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                            <div class="lang-item" data-search="desktop electron tauri" data-action="advanced">
                                <div class="lang-content">
                                    <div class="lang-name">Desktop</div>
                                    <div class="lang-frameworks">Electron, Tauri</div>
                                </div>
                                <div class="lang-arrow">→</div>
                            </div>
                        </div>
                    </div>

                    <!-- No Results Message -->
                    <div class="no-results" id="noResults" style="display: none;">
                        <div class="no-results-content">
                            <div class="no-results-title">No results found</div>
                            <div class="no-results-desc">Try searching for different keywords or browse all templates</div>
                            <div class="no-results-action">
                                <button class="action-item secondary" data-action="clear-search">Clear Search</button>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer-list">
                        <div class="footer-links">
                            <span class="footer-link" data-action="documentation">Documentation</span>
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