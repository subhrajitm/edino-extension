import * as vscode from 'vscode';
import * as path from 'path';

export class WelcomePanel implements vscode.WebviewViewProvider {
    public static currentPanel: WelcomePanel | undefined;
    public static readonly viewType = 'edino-welcome';
    private _panel?: vscode.WebviewView | vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (WelcomePanel.currentPanel && WelcomePanel.currentPanel._panel) {
            const panel = WelcomePanel.currentPanel._panel as vscode.WebviewPanel;
            if ('reveal' in panel) {
                panel.reveal(column);
            }
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            WelcomePanel.viewType,
            'Edino Project Generator',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'resources')
                ]
            }
        );

        WelcomePanel.currentPanel = new WelcomePanel(extensionUri);
        WelcomePanel.currentPanel._panel = panel;
        WelcomePanel.currentPanel._update();
    }

    public constructor(extensionUri: vscode.Uri) {
        this._extensionUri = extensionUri;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._panel = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'resources')
            ]
        };

        this._update();

        webviewView.onDidDispose(() => this.dispose(), null, this._disposables);

        webviewView.webview.onDidReceiveMessage(
            message => {
                console.log('Received message from webview:', message);
                switch (message.command) {
                    case 'createProject':
                        console.log('Executing createProject command with type:', message.type);
                        vscode.commands.executeCommand('edino.createProject', message.type);
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
            },
            null,
            this._disposables
        );
    }

    public dispose() {
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

    private async _update() {
        if (!this._panel) return;
        
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
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

                    <!-- Popular Templates List -->
                    <div class="section" id="templatesSection">
                        <h3 class="section-title">Popular Templates</h3>
                        <div class="template-list" id="templateList">
                            <div class="template-item" data-search="full stack react node mongodb" data-template="fullstack">
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
                            
                            <div class="template-item" data-search="frontend react typescript vite" data-template="frontend">
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
                            
                            <div class="template-item" data-search="backend api express jwt mongodb" data-template="backend">
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

    private _showDocumentation() {
        vscode.window.showInformationMessage('Documentation: Check the README.md file in your generated projects for detailed setup instructions.');
    }
}
