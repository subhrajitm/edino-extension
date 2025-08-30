import * as fs from 'fs-extra';
import * as path from 'path';
import { 
    ProjectType, 
    Language, 
    FrontendFramework, 
    BackendFramework, 
    Database, 
    TestingFramework, 
    BuildTool,
    ProjectConfig,
    TemplateConfig,
    LanguageConfig
} from './types';

export class TemplateManager {
    private static instance: TemplateManager;
    private templates: Map<string, TemplateConfig> = new Map();
    private languageConfigs: Map<Language, LanguageConfig> = new Map();

    private constructor() {
        this.initializeLanguageConfigs();
        this.initializeTemplates();
    }

    public static getInstance(): TemplateManager {
        if (!TemplateManager.instance) {
            TemplateManager.instance = new TemplateManager();
        }
        return TemplateManager.instance;
    }

    private initializeLanguageConfigs(): void {
        // JavaScript/TypeScript
        this.languageConfigs.set(Language.JAVASCRIPT, {
            name: 'JavaScript',
            extensions: ['.js', '.jsx', '.mjs'],
            packageManager: 'npm',
            defaultBuildTool: BuildTool.WEBPACK,
            defaultTestingFramework: TestingFramework.JEST,
            frameworks: [
                { name: 'React', type: FrontendFramework.REACT, description: 'UI library for building user interfaces' },
                { name: 'Vue.js', type: FrontendFramework.VUE, description: 'Progressive JavaScript framework' },
                { name: 'Express', type: BackendFramework.EXPRESS, description: 'Fast, unopinionated web framework' },
                { name: 'Fastify', type: BackendFramework.FASTIFY, description: 'Fast and low overhead web framework' }
            ]
        });

        this.languageConfigs.set(Language.TYPESCRIPT, {
            name: 'TypeScript',
            extensions: ['.ts', '.tsx'],
            packageManager: 'npm',
            defaultBuildTool: BuildTool.VITE,
            defaultTestingFramework: TestingFramework.VITEST,
            frameworks: [
                { name: 'React', type: FrontendFramework.REACT, description: 'UI library with TypeScript support' },
                { name: 'Vue.js', type: FrontendFramework.VUE, description: 'Progressive framework with TypeScript' },
                { name: 'Angular', type: FrontendFramework.ANGULAR, description: 'Platform for building mobile and desktop web applications' },
                { name: 'NestJS', type: BackendFramework.NEST_JS, description: 'Progressive Node.js framework' }
            ]
        });

        // Python
        this.languageConfigs.set(Language.PYTHON, {
            name: 'Python',
            extensions: ['.py', '.pyc', '.pyo'],
            packageManager: 'pip',
            defaultBuildTool: BuildTool.NPM, // Using npm for build tools like webpack
            defaultTestingFramework: TestingFramework.PYTEST,
            frameworks: [
                { name: 'Flask', type: BackendFramework.FLASK, description: 'Lightweight WSGI web application framework' },
                { name: 'Django', type: BackendFramework.DJANGO, description: 'High-level Python web framework' },
                { name: 'FastAPI', type: BackendFramework.FASTAPI, description: 'Modern, fast web framework for building APIs' }
            ]
        });

        // Java
        this.languageConfigs.set(Language.JAVA, {
            name: 'Java',
            extensions: ['.java', '.class', '.jar'],
            packageManager: 'maven',
            defaultBuildTool: BuildTool.MAVEN,
            defaultTestingFramework: TestingFramework.JUNIT,
            frameworks: [
                { name: 'Spring Boot', type: BackendFramework.SPRING, description: 'Java-based framework for building microservices' },
                { name: 'Swing', type: BackendFramework.SWING, description: 'GUI toolkit for Java' },
                { name: 'JavaFX', type: BackendFramework.JAVAFX, description: 'Modern UI toolkit for Java' }
            ]
        });

        // C#
        this.languageConfigs.set(Language.C_SHARP, {
            name: 'C#',
            extensions: ['.cs', '.csproj', '.sln'],
            packageManager: 'nuget',
            defaultBuildTool: BuildTool.DOTNET,
            defaultTestingFramework: TestingFramework.NUNIT,
            frameworks: [
                { name: 'ASP.NET Core', type: BackendFramework.ASP_NET, description: 'Cross-platform framework for building web apps' },
                { name: 'Windows Forms', type: BackendFramework.WINDOWS_FORMS, description: 'Desktop application framework' },
                { name: 'WPF', type: BackendFramework.WPF, description: 'Windows Presentation Foundation' }
            ]
        });

        // Go
        this.languageConfigs.set(Language.GO, {
            name: 'Go',
            extensions: ['.go', '.mod', '.sum'],
            packageManager: 'go',
            defaultBuildTool: BuildTool.CGO,
            defaultTestingFramework: TestingFramework.GO_TEST,
            frameworks: [
                { name: 'Gin', type: BackendFramework.GIN, description: 'HTTP web framework written in Go' },
                { name: 'Echo', type: BackendFramework.ECHO, description: 'High performance, extensible, minimalist Go web framework' }
            ]
        });

        // Rust
        this.languageConfigs.set(Language.RUST, {
            name: 'Rust',
            extensions: ['.rs', '.toml'],
            packageManager: 'cargo',
            defaultBuildTool: BuildTool.CARGO,
            defaultTestingFramework: TestingFramework.RUST_TEST,
            frameworks: [
                { name: 'Actix', type: BackendFramework.ACTIX, description: 'Powerful, pragmatic, and extremely fast web framework' },
                { name: 'Rocket', type: BackendFramework.ROCKET, description: 'Web framework for Rust that makes it simple to write fast, secure web applications' }
            ]
        });

        // PHP
        this.languageConfigs.set(Language.PHP, {
            name: 'PHP',
            extensions: ['.php', '.phtml'],
            packageManager: 'composer',
            defaultBuildTool: BuildTool.COMPOSER,
            defaultTestingFramework: TestingFramework.PHPUNIT,
            frameworks: [
                { name: 'Laravel', type: BackendFramework.LARAVEL, description: 'PHP web application framework' }
            ]
        });

        // Ruby
        this.languageConfigs.set(Language.RUBY, {
            name: 'Ruby',
            extensions: ['.rb', '.erb'],
            packageManager: 'bundler',
            defaultBuildTool: BuildTool.BUNDLER,
            defaultTestingFramework: TestingFramework.RSPEC,
            frameworks: [
                { name: 'Ruby on Rails', type: BackendFramework.RAILS, description: 'Web application framework' }
            ]
        });

        // Dart
        this.languageConfigs.set(Language.DART, {
            name: 'Dart',
            extensions: ['.dart'],
            packageManager: 'pub',
            defaultBuildTool: BuildTool.NPM, // Using npm for Flutter
            defaultTestingFramework: TestingFramework.JEST,
            frameworks: [
                { name: 'Flutter', type: FrontendFramework.FLUTTER, description: 'UI toolkit for building natively compiled applications' }
            ]
        });
    }

    private initializeTemplates(): void {
        // Frontend Templates
        this.addTemplate({
            name: 'React App',
            description: 'Modern React application with TypeScript, Vite, and Tailwind CSS',
            type: ProjectType.FRONTEND,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.REACT,
            testing: TestingFramework.VITEST,
            buildTool: BuildTool.VITE,
            features: ['TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'Testing'],
            complexity: 'medium',
            tags: ['react', 'typescript', 'vite', 'frontend']
        });

        this.addTemplate({
            name: 'Vue.js App',
            description: 'Vue 3 application with Composition API and Vite',
            type: ProjectType.FRONTEND,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.VUE,
            testing: TestingFramework.VITEST,
            buildTool: BuildTool.VITE,
            features: ['Vue 3', 'TypeScript', 'Vite', 'Pinia', 'Vue Router'],
            complexity: 'medium',
            tags: ['vue', 'typescript', 'vite', 'frontend']
        });

        this.addTemplate({
            name: 'Angular App',
            description: 'Angular application with standalone components and modern tooling',
            type: ProjectType.FRONTEND,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.ANGULAR,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.WEBPACK,
            features: ['Angular 17+', 'Standalone Components', 'RxJS', 'Angular Material'],
            complexity: 'complex',
            tags: ['angular', 'typescript', 'frontend']
        });

        this.addTemplate({
            name: 'Svelte App',
            description: 'Svelte application with SvelteKit and modern tooling',
            type: ProjectType.FRONTEND,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.SVELTE,
            testing: TestingFramework.VITEST,
            buildTool: BuildTool.VITE,
            features: ['Svelte', 'SvelteKit', 'TypeScript', 'Tailwind CSS'],
            complexity: 'medium',
            tags: ['svelte', 'typescript', 'frontend']
        });

        // Backend Templates
        this.addTemplate({
            name: 'Node.js API',
            description: 'Express.js API with TypeScript, MongoDB, and JWT authentication',
            type: ProjectType.BACKEND,
            language: Language.TYPESCRIPT,
            framework: BackendFramework.EXPRESS,
            database: Database.MONGODB,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.NPM,
            features: ['Express.js', 'TypeScript', 'MongoDB', 'JWT', 'Validation', 'Logging'],
            complexity: 'medium',
            tags: ['nodejs', 'express', 'typescript', 'mongodb', 'backend']
        });

        this.addTemplate({
            name: 'NestJS API',
            description: 'NestJS application with TypeScript, PostgreSQL, and comprehensive tooling',
            type: ProjectType.BACKEND,
            language: Language.TYPESCRIPT,
            framework: BackendFramework.NEST_JS,
            database: Database.POSTGRESQL,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.NPM,
            features: ['NestJS', 'TypeScript', 'PostgreSQL', 'TypeORM', 'Swagger', 'JWT'],
            complexity: 'complex',
            tags: ['nestjs', 'typescript', 'postgresql', 'backend']
        });

        this.addTemplate({
            name: 'Python FastAPI',
            description: 'FastAPI application with SQLAlchemy, PostgreSQL, and modern Python tooling',
            type: ProjectType.BACKEND,
            language: Language.PYTHON,
            framework: BackendFramework.FASTAPI,
            database: Database.POSTGRESQL,
            testing: TestingFramework.PYTEST,
            buildTool: BuildTool.NPM,
            features: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Pydantic', 'Alembic', 'Docker'],
            complexity: 'medium',
            tags: ['python', 'fastapi', 'postgresql', 'backend']
        });

        this.addTemplate({
            name: 'Spring Boot API',
            description: 'Spring Boot application with Java, MySQL, and comprehensive enterprise features',
            type: ProjectType.BACKEND,
            language: Language.JAVA,
            framework: BackendFramework.SPRING,
            database: Database.MYSQL,
            testing: TestingFramework.JUNIT,
            buildTool: BuildTool.MAVEN,
            features: ['Spring Boot', 'Spring Security', 'MySQL', 'JPA', 'Swagger', 'Docker'],
            complexity: 'complex',
            tags: ['java', 'spring', 'mysql', 'backend']
        });

        // Full Stack Templates
        this.addTemplate({
            name: 'React + Node.js Full Stack',
            description: 'Full-stack application with React frontend and Node.js backend',
            type: ProjectType.FULL_STACK,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.REACT,
            database: Database.MONGODB,
            testing: TestingFramework.VITEST,
            buildTool: BuildTool.VITE,
            features: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'JWT', 'Shared Types'],
            complexity: 'complex',
            tags: ['react', 'nodejs', 'typescript', 'mongodb', 'fullstack']
        });

        // Mobile Templates
        this.addTemplate({
            name: 'React Native App',
            description: 'React Native application with TypeScript and modern mobile development tools',
            type: ProjectType.MOBILE,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.REACT_NATIVE,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.NPM,
            features: ['React Native', 'TypeScript', 'Navigation', 'State Management', 'Testing'],
            complexity: 'medium',
            tags: ['react-native', 'typescript', 'mobile']
        });

        this.addTemplate({
            name: 'Flutter App',
            description: 'Flutter application with Dart and modern mobile development patterns',
            type: ProjectType.MOBILE,
            language: Language.DART,
            framework: FrontendFramework.FLUTTER,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.NPM,
            features: ['Flutter', 'Dart', 'State Management', 'Navigation', 'Testing'],
            complexity: 'medium',
            tags: ['flutter', 'dart', 'mobile']
        });

        // Desktop Templates
        this.addTemplate({
            name: 'Electron App',
            description: 'Electron application with React and modern desktop development tools',
            type: ProjectType.DESKTOP,
            language: Language.TYPESCRIPT,
            framework: FrontendFramework.ELECTRON,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.WEBPACK,
            features: ['Electron', 'React', 'TypeScript', 'Auto-updater', 'Packaging'],
            complexity: 'complex',
            tags: ['electron', 'react', 'typescript', 'desktop']
        });

        // Library Templates
        this.addTemplate({
            name: 'TypeScript Library',
            description: 'TypeScript library with modern tooling and comprehensive testing',
            type: ProjectType.LIBRARY,
            language: Language.TYPESCRIPT,
            testing: TestingFramework.VITEST,
            buildTool: BuildTool.ROLLUP,
            features: ['TypeScript', 'Rollup', 'Testing', 'Documentation', 'CI/CD'],
            complexity: 'medium',
            tags: ['typescript', 'library', 'rollup']
        });

        // CLI Templates
        this.addTemplate({
            name: 'Node.js CLI',
            description: 'Command-line interface application with modern Node.js tooling',
            type: ProjectType.CLI,
            language: Language.TYPESCRIPT,
            testing: TestingFramework.JEST,
            buildTool: BuildTool.NPM,
            features: ['TypeScript', 'Commander.js', 'Testing', 'Packaging'],
            complexity: 'medium',
            tags: ['nodejs', 'cli', 'typescript']
        });

        // AI/ML Templates
        this.addTemplate({
            name: 'Python AI/ML',
            description: 'Python application with machine learning libraries and data science tools',
            type: ProjectType.AI_ML,
            language: Language.PYTHON,
            testing: TestingFramework.PYTEST,
            buildTool: BuildTool.NPM,
            features: ['NumPy', 'Pandas', 'Scikit-learn', 'Jupyter', 'Docker'],
            complexity: 'complex',
            tags: ['python', 'ai', 'ml', 'data-science']
        });
    }

    private addTemplate(template: TemplateConfig): void {
        const key = `${template.type}-${template.language}-${template.framework || 'vanilla'}`;
        this.templates.set(key, template);
    }

    public getTemplates(): TemplateConfig[] {
        return Array.from(this.templates.values());
    }

    public getTemplatesByType(type: ProjectType): TemplateConfig[] {
        return this.getTemplates().filter(template => template.type === type);
    }

    public getTemplatesByLanguage(language: Language): TemplateConfig[] {
        return this.getTemplates().filter(template => template.language === language);
    }

    public getTemplate(key: string): TemplateConfig | undefined {
        return this.templates.get(key);
    }

    public getLanguageConfig(language: Language): LanguageConfig | undefined {
        return this.languageConfigs.get(language);
    }

    public getAllLanguages(): Language[] {
        return Array.from(this.languageConfigs.keys());
    }

    public async generateProject(config: ProjectConfig, targetPath: string): Promise<void> {
        const template = this.findBestTemplate(config);
        if (!template) {
            throw new Error(`No suitable template found for ${config.type} ${config.language} project`);
        }

        const projectPath = path.join(targetPath, config.name);
        await fs.ensureDir(projectPath);

        // Generate project structure based on template
        await this.generateProjectStructure(template, config, projectPath);
    }

    private findBestTemplate(config: ProjectConfig): TemplateConfig | undefined {
        const templates = this.getTemplatesByType(config.type);
        return templates.find(template => 
            template.language === config.language &&
            (!config.framework || template.framework === config.framework)
        ) || templates.find(template => template.language === config.language);
    }

    private async generateProjectStructure(template: TemplateConfig, config: ProjectConfig, projectPath: string): Promise<void> {
        // This will be implemented with specific template generators
        // For now, we'll use the existing template system
        const generator = this.getTemplateGenerator(template);
        await generator.generate(config, projectPath);
    }

    private getTemplateGenerator(template: TemplateConfig): any {
        // This will return the appropriate template generator based on the template
        // For now, we'll use a placeholder
        return {
            generate: async (config: ProjectConfig, projectPath: string) => {
                // Placeholder implementation
                console.log(`Generating ${template.name} project at ${projectPath}`);
            }
        };
    }
}
