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
                <div class="welcome-container ultra-compact">
                    <!-- Ultra Compact Header -->
                    <div class="header-ultra">
                        <div class="header-brand-ultra">
                            <span class="brand-icon">⚡</span>
                            <span class="brand-name">Edino</span>
                        </div>
                        <div class="header-actions">
                            <button class="action-btn primary" data-action="quick">Quick Start</button>
                            <button class="action-btn secondary" data-action="advanced">Advanced</button>
                        </div>
                    </div>
                    
                    <!-- Ultra Compact Search -->
                    <div class="search-ultra">
                        <input type="text" id="searchInput" class="search-input-ultra" placeholder="Search templates..." />
                        <div class="search-clear-ultra" id="searchClear" style="display: none;">×</div>
                    </div>
                    
                    <!-- Ultra Compact Templates -->
                    <div class="templates-ultra">
                        <div class="template-row">
                            <div class="template-item-ultra" data-search="frontend react typescript vite" data-template="frontend" data-language="typescript" data-framework="react">
                                <span class="template-icon-ultra">⚛️</span>
                                <span class="template-name-ultra">React</span>
                                <span class="template-stack-ultra">TS + Vite</span>
                            </div>
                            <div class="template-item-ultra" data-search="frontend vue typescript vite" data-template="frontend" data-language="typescript" data-framework="vue">
                                <span class="template-icon-ultra">💚</span>
                                <span class="template-name-ultra">Vue</span>
                                <span class="template-stack-ultra">TS + Vite</span>
                            </div>
                            <div class="template-item-ultra" data-search="frontend angular typescript" data-template="frontend" data-language="typescript" data-framework="angular">
                                <span class="template-icon-ultra">🅰️</span>
                                <span class="template-name-ultra">Angular</span>
                                <span class="template-stack-ultra">TS + RxJS</span>
                            </div>
                            <div class="template-item-ultra" data-search="frontend svelte sveltekit" data-template="frontend" data-language="typescript" data-framework="svelte">
                                <span class="template-icon-ultra">⚡</span>
                                <span class="template-name-ultra">Svelte</span>
                                <span class="template-stack-ultra">TS + Kit</span>
                            </div>
                        </div>
                        
                        <div class="template-row">
                            <div class="template-item-ultra" data-search="backend nodejs express typescript" data-template="backend" data-language="typescript" data-framework="express">
                                <span class="template-icon-ultra">🟢</span>
                                <span class="template-name-ultra">Express</span>
                                <span class="template-stack-ultra">TS + MongoDB</span>
                            </div>
                            <div class="template-item-ultra" data-search="backend nestjs typescript" data-template="backend" data-language="typescript" data-framework="nestjs">
                                <span class="template-icon-ultra">🪺</span>
                                <span class="template-name-ultra">NestJS</span>
                                <span class="template-stack-ultra">TS + PostgreSQL</span>
                            </div>
                            <div class="template-item-ultra" data-search="backend python fastapi" data-template="backend" data-language="python" data-framework="fastapi">
                                <span class="template-icon-ultra">🐍</span>
                                <span class="template-name-ultra">FastAPI</span>
                                <span class="template-stack-ultra">Python + SQL</span>
                            </div>
                            <div class="template-item-ultra" data-search="backend java spring boot" data-template="backend" data-language="java" data-framework="spring">
                                <span class="template-icon-ultra">☕</span>
                                <span class="template-name-ultra">Spring</span>
                                <span class="template-stack-ultra">Java + MySQL</span>
                            </div>
                        </div>
                        
                        <div class="template-row">
                            <div class="template-item-ultra" data-search="fullstack react nodejs typescript" data-template="fullstack" data-language="typescript" data-framework="react">
                                <span class="template-icon-ultra">🔄</span>
                                <span class="template-name-ultra">Full Stack</span>
                                <span class="template-stack-ultra">React + Node</span>
                            </div>
                            <div class="template-item-ultra" data-search="mobile react native typescript" data-template="mobile" data-language="typescript" data-framework="react-native">
                                <span class="template-icon-ultra">📱</span>
                                <span class="template-name-ultra">React Native</span>
                                <span class="template-stack-ultra">TS + Mobile</span>
                            </div>
                            <div class="template-item-ultra" data-search="mobile flutter dart" data-template="mobile" data-language="dart" data-framework="flutter">
                                <span class="template-icon-ultra">🦋</span>
                                <span class="template-name-ultra">Flutter</span>
                                <span class="template-stack-ultra">Dart + Mobile</span>
                            </div>
                            <div class="template-item-ultra" data-search="desktop electron react" data-template="desktop" data-language="typescript" data-framework="electron">
                                <span class="template-icon-ultra">💻</span>
                                <span class="template-name-ultra">Electron</span>
                                <span class="template-stack-ultra">React + Desktop</span>
                            </div>
                        </div>
                        
                        <div class="template-row">
                            <div class="template-item-ultra" data-search="library typescript rollup" data-template="library" data-language="typescript">
                                <span class="template-icon-ultra">📦</span>
                                <span class="template-name-ultra">Library</span>
                                <span class="template-stack-ultra">TS + Rollup</span>
                            </div>
                            <div class="template-item-ultra" data-search="cli nodejs typescript commander" data-template="cli" data-language="typescript">
                                <span class="template-icon-ultra">⌨️</span>
                                <span class="template-name-ultra">CLI</span>
                                <span class="template-stack-ultra">TS + Commander</span>
                            </div>
                            <div class="template-item-ultra" data-search="ai ml python numpy pandas" data-template="ai-ml" data-language="python">
                                <span class="template-icon-ultra">🤖</span>
                                <span class="template-name-ultra">AI/ML</span>
                                <span class="template-stack-ultra">Python + ML</span>
                            </div>
                        </div>
                    </div>

                    <!-- Ultra Compact No Results -->
                    <div class="no-results-ultra" id="noResults" style="display: none;">
                        <span class="no-results-text">No results found</span>
                        <button class="clear-search-btn-ultra" data-action="clear-search">Clear</button>
                    </div>

                    <!-- Ultra Compact Footer -->
                    <div class="footer-ultra">
                        <span class="footer-link-ultra" data-action="documentation">Docs</span>
                        <span class="footer-version-ultra">v1.0.0</span>
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

