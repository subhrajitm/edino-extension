import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateConfig, ProjectConfig } from '../../types';
import { Logger } from '../../utils/logger';

export interface ProjectPreview {
    id: string;
    template: TemplateConfig;
    customizations: Customization[];
    fileTree: FileTreeNode[];
    codeSnippets: CodeSnippet[];
    estimatedSize: number;
    dependencies: Dependency[];
    setupTime: number;
}

export interface FileTreeNode {
    name: string;
    type: 'file' | 'directory';
    path: string;
    size?: number;
    children?: FileTreeNode[];
    language?: string;
    icon?: string;
}

export interface CodeSnippet {
    file: string;
    language: string;
    content: string;
    description: string;
    highlights: CodeHighlight[];
}

export interface CodeHighlight {
    line: number;
    column: number;
    length: number;
    message: string;
    type: 'info' | 'warning' | 'error';
}

export interface Customization {
    field: string;
    value: any;
    description: string;
    impact: 'low' | 'medium' | 'high';
}

export interface Dependency {
    name: string;
    version: string;
    type: 'production' | 'development' | 'peer';
    description: string;
    size: number;
}

export class ProjectPreviewManager {
    private static instance: ProjectPreviewManager;
    private logger = Logger.getInstance();
    private previewCache: Map<string, ProjectPreview> = new Map();

    private constructor() {}

    public static getInstance(): ProjectPreviewManager {
        if (!ProjectPreviewManager.instance) {
            ProjectPreviewManager.instance = new ProjectPreviewManager();
        }
        return ProjectPreviewManager.instance;
    }

    public async generatePreview(
        template: TemplateConfig, 
        customizations: Customization[] = []
    ): Promise<ProjectPreview> {
        this.logger.info(`Generating preview for template: ${template.name}`);

        const previewId = this.generatePreviewId(template, customizations);
        
        // Check cache first
        const cached = this.previewCache.get(previewId);
        if (cached) {
            this.logger.debug('Returning cached preview');
            return cached;
        }

        // Generate new preview
        const preview: ProjectPreview = {
            id: previewId,
            template,
            customizations,
            fileTree: await this.generateFileTree(template, customizations),
            codeSnippets: await this.generateCodeSnippets(template, customizations),
            estimatedSize: this.calculateEstimatedSize(template, customizations),
            dependencies: this.generateDependencies(template, customizations),
            setupTime: this.calculateSetupTime(template, customizations)
        };

        // Cache the preview
        this.previewCache.set(previewId, preview);

        this.logger.info(`Preview generated successfully: ${preview.fileTree.length} files, ${preview.dependencies.length} dependencies`);
        return preview;
    }

    public async showFileTree(preview: ProjectPreview): Promise<void> {
        this.logger.info('Showing file tree preview');

        const treeDataProvider = new FileTreeDataProvider(preview.fileTree);
        const treeView = vscode.window.createTreeView('edino-preview-tree', {
            treeDataProvider,
            showCollapseAll: true
        });

        // Show the tree view
        await vscode.commands.executeCommand('edino-preview-tree.focus');
    }

    public async showCodeSnippets(preview: ProjectPreview): Promise<void> {
        this.logger.info('Showing code snippets preview');

        const snippets = preview.codeSnippets.slice(0, 5); // Show first 5 snippets
        
        for (const snippet of snippets) {
            const document = await vscode.workspace.openTextDocument({
                content: snippet.content,
                language: snippet.language
            });

            const editor = await vscode.window.showTextDocument(document, {
                preview: true,
                viewColumn: vscode.ViewColumn.Beside
            });

            // Add highlights if any
            if (snippet.highlights.length > 0) {
                const decorations = snippet.highlights.map(highlight => {
                    const range = new vscode.Range(
                        highlight.line - 1, 
                        highlight.column - 1, 
                        highlight.line - 1, 
                        highlight.column - 1 + highlight.length
                    );
                    return range;
                });

                const decorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor: new vscode.ThemeColor('editorInfo.foreground'),
                    border: '1px solid',
                    borderColor: new vscode.ThemeColor('editorInfo.border')
                });

                editor.setDecorations(decorationType, decorations);
            }
        }
    }

    public async validateCustomizations(customizations: Customization[]): Promise<ValidationResult> {
        this.logger.info('Validating customizations');

        const errors: string[] = [];
        const warnings: string[] = [];

        for (const customization of customizations) {
            // Validate field names
            if (!customization.field || customization.field.trim() === '') {
                errors.push('Customization field name is required');
            }

            // Validate values based on field type
            const validation = this.validateCustomizationValue(customization);
            if (!validation.isValid) {
                errors.push(...validation.errors);
            }
            warnings.push(...validation.warnings);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    public async comparePreviews(preview1: ProjectPreview, preview2: ProjectPreview): Promise<ComparisonResult> {
        this.logger.info('Comparing project previews');

        const differences: Difference[] = [];

        // Compare file trees
        const fileTreeDiff = this.compareFileTrees(preview1.fileTree, preview2.fileTree);
        differences.push(...fileTreeDiff);

        // Compare dependencies
        const dependencyDiff = this.compareDependencies(preview1.dependencies, preview2.dependencies);
        differences.push(...dependencyDiff);

        // Compare estimated sizes
        const sizeDiff = Math.abs(preview1.estimatedSize - preview2.estimatedSize);
        if (sizeDiff > 1024 * 1024) { // 1MB threshold
            differences.push({
                type: 'size',
                field: 'estimatedSize',
                oldValue: preview1.estimatedSize,
                newValue: preview2.estimatedSize,
                impact: 'medium'
            });
        }

        return {
            differences,
            summary: this.generateComparisonSummary(differences)
        };
    }

    private generatePreviewId(template: TemplateConfig, customizations: Customization[]): string {
        const customizationHash = customizations
            .map(c => `${c.field}:${JSON.stringify(c.value)}`)
            .join('|');
        
        return `${template.name}-${Buffer.from(customizationHash).toString('base64').slice(0, 8)}`;
    }

    private async generateFileTree(template: TemplateConfig, customizations: Customization[]): Promise<FileTreeNode[]> {
        const fileTree: FileTreeNode[] = [];

        // Generate based on template type
        switch (template.type) {
            case 'frontend':
                fileTree.push(...this.generateFrontendFileTree(template, customizations));
                break;
            case 'backend':
                fileTree.push(...this.generateBackendFileTree(template, customizations));
                break;
            case 'fullstack':
                fileTree.push(...this.generateFullStackFileTree(template, customizations));
                break;
            default:
                fileTree.push(...this.generateGenericFileTree(template, customizations));
        }

        return fileTree;
    }

    private generateFrontendFileTree(template: TemplateConfig, customizations: Customization[]): FileTreeNode[] {
        const tree: FileTreeNode[] = [
            {
                name: 'src',
                type: 'directory',
                path: 'src',
                children: [
                    { name: 'components', type: 'directory', path: 'src/components' },
                    { name: 'pages', type: 'directory', path: 'src/pages' },
                    { name: 'assets', type: 'directory', path: 'src/assets' },
                    { name: 'utils', type: 'directory', path: 'src/utils' },
                    { name: 'hooks', type: 'directory', path: 'src/hooks' },
                    { name: 'context', type: 'directory', path: 'src/context' }
                ]
            },
            {
                name: 'public',
                type: 'directory',
                path: 'public',
                children: [
                    { name: 'index.html', type: 'file', path: 'public/index.html', language: 'html' },
                    { name: 'favicon.ico', type: 'file', path: 'public/favicon.ico' }
                ]
            },
            { name: 'package.json', type: 'file', path: 'package.json', language: 'json' },
            { name: 'README.md', type: 'file', path: 'README.md', language: 'markdown' },
            { name: '.gitignore', type: 'file', path: '.gitignore' }
        ];

        // Add testing directory if testing is enabled
        const testingEnabled = customizations.find(c => c.field === 'testing')?.value;
        if (testingEnabled) {
            tree.push({
                name: 'tests',
                type: 'directory',
                path: 'tests',
                children: [
                    { name: 'components', type: 'directory', path: 'tests/components' },
                    { name: 'utils', type: 'directory', path: 'tests/utils' }
                ]
            });
        }

        return tree;
    }

    private generateBackendFileTree(template: TemplateConfig, customizations: Customization[]): FileTreeNode[] {
        const tree: FileTreeNode[] = [
            {
                name: 'src',
                type: 'directory',
                path: 'src',
                children: [
                    { name: 'controllers', type: 'directory', path: 'src/controllers' },
                    { name: 'models', type: 'directory', path: 'src/models' },
                    { name: 'routes', type: 'directory', path: 'src/routes' },
                    { name: 'middleware', type: 'directory', path: 'src/middleware' },
                    { name: 'config', type: 'directory', path: 'src/config' },
                    { name: 'utils', type: 'directory', path: 'src/utils' },
                    { name: 'services', type: 'directory', path: 'src/services' }
                ]
            },
            { name: 'package.json', type: 'file', path: 'package.json', language: 'json' },
            { name: 'README.md', type: 'file', path: 'README.md', language: 'markdown' },
            { name: '.env.example', type: 'file', path: '.env.example' },
            { name: '.gitignore', type: 'file', path: '.gitignore' }
        ];

        // Add database directory if database is configured
        const database = customizations.find(c => c.field === 'database')?.value;
        if (database) {
            tree.push({
                name: 'database',
                type: 'directory',
                path: 'database',
                children: [
                    { name: 'migrations', type: 'directory', path: 'database/migrations' },
                    { name: 'seeds', type: 'directory', path: 'database/seeds' }
                ]
            });
        }

        return tree;
    }

    private generateFullStackFileTree(template: TemplateConfig, customizations: Customization[]): FileTreeNode[] {
        return [
            {
                name: 'client',
                type: 'directory',
                path: 'client',
                children: this.generateFrontendFileTree(template, customizations)
            },
            {
                name: 'server',
                type: 'directory',
                path: 'server',
                children: this.generateBackendFileTree(template, customizations)
            },
            { name: 'package.json', type: 'file', path: 'package.json', language: 'json' },
            { name: 'README.md', type: 'file', path: 'README.md', language: 'markdown' },
            { name: '.gitignore', type: 'file', path: '.gitignore' }
        ];
    }

    private generateGenericFileTree(template: TemplateConfig, customizations: Customization[]): FileTreeNode[] {
        return [
            { name: 'src', type: 'directory', path: 'src' },
            { name: 'package.json', type: 'file', path: 'package.json', language: 'json' },
            { name: 'README.md', type: 'file', path: 'README.md', language: 'markdown' },
            { name: '.gitignore', type: 'file', path: '.gitignore' }
        ];
    }

    private async generateCodeSnippets(template: TemplateConfig, customizations: Customization[]): Promise<CodeSnippet[]> {
        const snippets: CodeSnippet[] = [];

        // Generate package.json snippet
        snippets.push({
            file: 'package.json',
            language: 'json',
            content: this.generatePackageJsonContent(template, customizations),
            description: 'Project configuration and dependencies',
            highlights: []
        });

        // Generate main entry point snippet
        const mainFile = this.getMainFileForLanguage(template.language);
        if (mainFile) {
            snippets.push({
                file: mainFile,
                language: this.getLanguageExtension(template.language),
                content: this.generateMainFileContent(template, customizations),
                description: 'Main application entry point',
                highlights: []
            });
        }

        // Generate README snippet
        snippets.push({
            file: 'README.md',
            language: 'markdown',
            content: this.generateReadmeContent(template, customizations),
            description: 'Project documentation',
            highlights: []
        });

        return snippets;
    }

    private generatePackageJsonContent(template: TemplateConfig, customizations: Customization[]): string {
        const dependencies = this.generateDependencies(template, customizations);
        
        return JSON.stringify({
            name: 'my-project',
            version: '1.0.0',
            description: template.description,
            main: this.getMainFileForLanguage(template.language),
            scripts: this.generateScripts(template),
            dependencies: dependencies
                .filter(d => d.type === 'production')
                .reduce((acc, d) => ({ ...acc, [d.name]: d.version }), {}),
            devDependencies: dependencies
                .filter(d => d.type === 'development')
                .reduce((acc, d) => ({ ...acc, [d.name]: d.version }), {}),
            keywords: template.tags,
            author: 'Developer',
            license: 'MIT'
        }, null, 2);
    }

    private generateMainFileContent(template: TemplateConfig, customizations: Customization[]): string {
        switch (template.language) {
            case 'javascript':
                return `console.log('Hello from ${template.name}!');`;
            case 'typescript':
                return `console.log('Hello from ${template.name}!');`;
            case 'python':
                return `print('Hello from ${template.name}!')`;
            default:
                return `// ${template.name} main file`;
        }
    }

    private generateReadmeContent(template: TemplateConfig, customizations: Customization[]): string {
        return `# ${template.name}

${template.description}

## Features

${template.features.map(f => `- ${f}`).join('\n')}

## Getting Started

1. Install dependencies
2. Start development server
3. Build for production

## Tech Stack

- Language: ${template.language}
- Framework: ${template.framework || 'None'}
- Database: ${template.database || 'None'}
- Testing: ${template.testing || 'None'}

## License

MIT
`;
    }

    private calculateEstimatedSize(template: TemplateConfig, customizations: Customization[]): number {
        let baseSize = 1024 * 1024; // 1MB base

        // Add size based on template complexity
        switch (template.complexity) {
            case 'simple':
                baseSize += 512 * 1024; // 512KB
                break;
            case 'medium':
                baseSize += 1024 * 1024; // 1MB
                break;
            case 'complex':
                baseSize += 2048 * 1024; // 2MB
                break;
        }

        // Add size for dependencies
        const dependencies = this.generateDependencies(template, customizations);
        baseSize += dependencies.reduce((sum, d) => sum + d.size, 0);

        return baseSize;
    }

    private generateDependencies(template: TemplateConfig, customizations: Customization[]): Dependency[] {
        const dependencies: Dependency[] = [];

        // Add framework dependencies
        if (template.framework) {
            dependencies.push({
                name: this.getFrameworkPackageName(template.framework),
                version: this.getFrameworkVersion(template.framework),
                type: 'production',
                description: `${template.framework} framework`,
                size: 1024 * 1024 // 1MB estimate
            });
        }

        // Add testing dependencies if enabled
        const testingEnabled = customizations.find(c => c.field === 'testing')?.value;
        if (testingEnabled && template.testing) {
            dependencies.push({
                name: this.getTestingPackageName(template.testing),
                version: 'latest',
                type: 'development',
                description: `${template.testing} testing framework`,
                size: 512 * 1024 // 512KB estimate
            });
        }

        return dependencies;
    }

    private calculateSetupTime(template: TemplateConfig, customizations: Customization[]): number {
        let baseTime = 30; // 30 seconds base

        // Add time based on complexity
        switch (template.complexity) {
            case 'simple':
                baseTime += 15;
                break;
            case 'medium':
                baseTime += 30;
                break;
            case 'complex':
                baseTime += 60;
                break;
        }

        // Add time for dependencies
        const dependencies = this.generateDependencies(template, customizations);
        baseTime += dependencies.length * 5; // 5 seconds per dependency

        return baseTime;
    }

    private validateCustomizationValue(customization: Customization): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Add validation logic based on field type
        switch (customization.field) {
            case 'projectName':
                if (typeof customization.value !== 'string' || customization.value.length < 1) {
                    errors.push('Project name must be a non-empty string');
                }
                if (!/^[a-zA-Z0-9-_]+$/.test(customization.value)) {
                    errors.push('Project name can only contain letters, numbers, hyphens, and underscores');
                }
                break;
            case 'testing':
                if (typeof customization.value !== 'boolean') {
                    errors.push('Testing must be a boolean value');
                }
                break;
            default:
                warnings.push(`Unknown customization field: ${customization.field}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private compareFileTrees(tree1: FileTreeNode[], tree2: FileTreeNode[]): Difference[] {
        const differences: Difference[] = [];
        // Implement file tree comparison logic
        return differences;
    }

    private compareDependencies(deps1: Dependency[], deps2: Dependency[]): Difference[] {
        const differences: Difference[] = [];
        // Implement dependency comparison logic
        return differences;
    }

    private generateComparisonSummary(differences: Difference[]): string {
        const added = differences.filter(d => d.type === 'added').length;
        const removed = differences.filter(d => d.type === 'removed').length;
        const modified = differences.filter(d => d.type === 'modified').length;

        return `${added} added, ${removed} removed, ${modified} modified`;
    }

    // Helper methods
    private getMainFileForLanguage(language: string): string {
        const mainFiles = {
            javascript: 'index.js',
            typescript: 'index.ts',
            python: 'main.py',
            java: 'Main.java'
        };
        return mainFiles[language as keyof typeof mainFiles] || 'index.js';
    }

    private getLanguageExtension(language: string): string {
        const extensions = {
            javascript: 'javascript',
            typescript: 'typescript',
            python: 'python',
            java: 'java'
        };
        return extensions[language as keyof typeof extensions] || 'javascript';
    }

    private generateScripts(template: TemplateConfig): Record<string, string> {
        const scripts: Record<string, string> = {
            start: 'node index.js',
            test: 'echo "No tests specified"'
        };

        if (template.buildTool) {
            scripts.build = `${template.buildTool} build`;
        }

        return scripts;
    }

    private getFrameworkPackageName(framework: string): string {
        const packages = {
            react: 'react',
            vue: 'vue',
            angular: '@angular/core',
            express: 'express'
        };
        return packages[framework as keyof typeof packages] || framework;
    }

    private getFrameworkVersion(framework: string): string {
        return 'latest';
    }

    private getTestingPackageName(testing: string): string {
        const packages = {
            jest: 'jest',
            vitest: 'vitest',
            pytest: 'pytest'
        };
        return packages[testing as keyof typeof packages] || testing;
    }
}

// Tree data provider for file tree view
class FileTreeDataProvider implements vscode.TreeDataProvider<FileTreeNode> {
    constructor(private fileTree: FileTreeNode[]) {}

    getTreeItem(element: FileTreeNode): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.name);
        
        if (element.type === 'directory') {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            treeItem.iconPath = new vscode.ThemeIcon('folder');
        } else {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.iconPath = new vscode.ThemeIcon('file');
        }

        return treeItem;
    }

    getChildren(element?: FileTreeNode): FileTreeNode[] {
        if (!element) {
            return this.fileTree;
        }
        return element.children || [];
    }
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ComparisonResult {
    differences: Difference[];
    summary: string;
}

export interface Difference {
    type: 'added' | 'removed' | 'modified' | 'size';
    field: string;
    oldValue?: any;
    newValue?: any;
    impact: 'low' | 'medium' | 'high';
}
