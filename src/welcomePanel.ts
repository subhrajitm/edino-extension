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
                <div class="welcome-container compact">
                    <div class="header compact">
                        <div class="header-main">
                            <h1>🚀 Edino</h1>
                            <p>20+ Languages • 50+ Templates • Instant Setup</p>
                        </div>
                        <div class="header-stats">
                            <div class="stat">
                                <span class="stat-number">20+</span>
                                <span class="stat-label">Languages</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">50+</span>
                                <span class="stat-label">Templates</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number">⚡</span>
                                <span class="stat-label">Fast</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <div class="action-row">
                            <button class="action-btn primary compact" onclick="createProject()">
                                <span class="btn-icon">⚡</span>
                                <span class="btn-text">Quick Start</span>
                                <span class="btn-desc">Basic templates</span>
                            </button>
                            <button class="action-btn secondary compact" onclick="createAdvancedProject()">
                                <span class="btn-icon">🎯</span>
                                <span class="btn-text">Advanced</span>
                                <span class="btn-desc">50+ templates</span>
                            </button>
                        </div>
                    </div>

                    <div class="templates-grid">
                        <div class="template-section">
                            <h3>🔥 Popular</h3>
                            <div class="template-cards">
                                <div class="template-card compact" onclick="createProject('fullstack')">
                                    <div class="template-icon">🚀</div>
                                    <div class="template-info">
                                        <h4>Full Stack</h4>
                                        <p>React + Node + MongoDB</p>
                                        <div class="template-tags">
                                            <span class="tag">React</span>
                                            <span class="tag">Node.js</span>
                                            <span class="tag">MongoDB</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="template-card compact" onclick="createProject('frontend')">
                                    <div class="template-icon">🎨</div>
                                    <div class="template-info">
                                        <h4>Frontend</h4>
                                        <p>React + TypeScript + Vite</p>
                                        <div class="template-tags">
                                            <span class="tag">React</span>
                                            <span class="tag">TypeScript</span>
                                            <span class="tag">Vite</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="template-card compact" onclick="createProject('backend')">
                                    <div class="template-icon">⚙️</div>
                                    <div class="template-info">
                                        <h4>Backend</h4>
                                        <p>Express + JWT + MongoDB</p>
                                        <div class="template-tags">
                                            <span class="tag">Express</span>
                                            <span class="tag">JWT</span>
                                            <span class="tag">MongoDB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="template-section">
                            <h3>🌐 Languages</h3>
                            <div class="language-grid compact">
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">🐍</span>
                                    <span class="lang-name">Python</span>
                                    <span class="lang-frameworks">FastAPI, Django</span>
                                </div>
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">☕</span>
                                    <span class="lang-name">Java</span>
                                    <span class="lang-frameworks">Spring Boot</span>
                                </div>
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">🦀</span>
                                    <span class="lang-name">Rust</span>
                                    <span class="lang-frameworks">Actix, Rocket</span>
                                </div>
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">🐹</span>
                                    <span class="lang-name">Go</span>
                                    <span class="lang-frameworks">Gin, Echo</span>
                                </div>
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">📱</span>
                                    <span class="lang-name">Mobile</span>
                                    <span class="lang-frameworks">React Native</span>
                                </div>
                                <div class="lang-item" onclick="createAdvancedProject()">
                                    <span class="lang-icon">🖥️</span>
                                    <span class="lang-name">Desktop</span>
                                    <span class="lang-frameworks">Electron</span>
                                </div>
                            </div>
                        </div>

                        <div class="template-section">
                            <h3>⚡ Features</h3>
                            <div class="features-grid compact">
                                <div class="feature-item compact">
                                    <span class="feature-icon">📁</span>
                                    <span class="feature-text">Industry Standards</span>
                                </div>
                                <div class="feature-item compact">
                                    <span class="feature-icon">⚡</span>
                                    <span class="feature-text">Pre-configured</span>
                                </div>
                                <div class="feature-item compact">
                                    <span class="feature-icon">🧪</span>
                                    <span class="feature-text">Testing Ready</span>
                                </div>
                                <div class="feature-item compact">
                                    <span class="feature-icon">📚</span>
                                    <span class="feature-text">Documentation</span>
                                </div>
                                <div class="feature-item compact">
                                    <span class="feature-icon">🐳</span>
                                    <span class="feature-text">Docker Ready</span>
                                </div>
                                <div class="feature-item compact">
                                    <span class="feature-icon">🔧</span>
                                    <span class="feature-text">Modern Tools</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer compact">
                        <div class="footer-info">
                            <span class="version">v1.0.0</span>
                            <span class="separator">•</span>
                            <span class="docs-link" onclick="showDocumentation()">📚 Docs</span>
                            <span class="separator">•</span>
                            <span class="github-link">⭐ GitHub</span>
                        </div>
                        <div class="footer-actions">
                            <button class="footer-btn" onclick="createProject()">🚀 Quick Start</button>
                            <button class="footer-btn" onclick="createAdvancedProject()">🎯 Browse All</button>
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
