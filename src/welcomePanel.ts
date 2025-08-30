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
                switch (message.command) {
                    case 'createProject':
                        vscode.commands.executeCommand('edino.createProject');
                        return;
                    case 'createAdvancedProject':
                        vscode.commands.executeCommand('edino.createAdvancedProject');
                        return;
                    case 'showDocumentation':
                        this._showDocumentation();
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
                        
                        <div class="project-card advanced" onclick="createAdvancedProject()">
                            <div class="card-icon">🌟</div>
                            <h3>Advanced Templates</h3>
                            <p>Multiple languages: Python, Java, Go, Rust, and more</p>
                            <button class="create-btn">Choose Template</button>
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

    private _showDocumentation() {
        vscode.window.showInformationMessage('Documentation: Check the README.md file in your generated projects for detailed setup instructions.');
    }
}
