export enum ProjectType {
    FRONTEND = 'frontend',
    BACKEND = 'backend',
    FULL_STACK = 'fullstack',
    MOBILE = 'mobile',
    DESKTOP = 'desktop',
    LIBRARY = 'library',
    CLI = 'cli',
    GAME = 'game',
    AI_ML = 'ai-ml',
    BLOCKCHAIN = 'blockchain'
}

export enum Language {
    JAVASCRIPT = 'javascript',
    TYPESCRIPT = 'typescript',
    PYTHON = 'python',
    JAVA = 'java',
    C_SHARP = 'csharp',
    CPP = 'cpp',
    GO = 'go',
    RUST = 'rust',
    PHP = 'php',
    RUBY = 'ruby',
    SWIFT = 'swift',
    KOTLIN = 'kotlin',
    DART = 'dart',
    SCALA = 'scala',
    ELIXIR = 'elixir',
    HASKELL = 'haskell',
    R = 'r',
    MATLAB = 'matlab'
}

export enum FrontendFramework {
    REACT = 'react',
    VUE = 'vue',
    ANGULAR = 'angular',
    SVELTE = 'svelte',
    NEXT_JS = 'nextjs',
    NUXT_JS = 'nuxtjs',
    GATSBY = 'gatsby',
    VITE = 'vite',
    WEBPACK = 'webpack',
    VANILLA = 'vanilla',
    ALPINE_JS = 'alpinejs',
    LIT = 'lit',
    STENCIL = 'stencil',
    PREACT = 'preact',
    SOLID = 'solid',
    QWIK = 'qwik',
    REACT_NATIVE = 'react-native',
    FLUTTER = 'flutter',
    ELECTRON = 'electron'
}

export enum BackendFramework {
    EXPRESS = 'express',
    FASTIFY = 'fastify',
    NEST_JS = 'nestjs',
    KOA = 'koa',
    HAPI = 'hapi',
    FLASK = 'flask',
    DJANGO = 'django',
    FASTAPI = 'fastapi',
    SPRING = 'spring',
    ASP_NET = 'aspnet',
    LARAVEL = 'laravel',
    RAILS = 'rails',
    GIN = 'gin',
    ECHO = 'echo',
    ACTIX = 'actix',
    ROCKET = 'rocket',
    PHOENIX = 'phoenix',
    PLUG = 'plug',
    SWING = 'swing',
    JAVAFX = 'javafx',
    WINDOWS_FORMS = 'windows-forms',
    WPF = 'wpf'
}

export enum Database {
    MONGODB = 'mongodb',
    POSTGRESQL = 'postgresql',
    MYSQL = 'mysql',
    SQLITE = 'sqlite',
    REDIS = 'redis',
    ELASTICSEARCH = 'elasticsearch',
    COUCHDB = 'couchdb',
    NEO4J = 'neo4j',
    INFLUXDB = 'influxdb',
    CASSANDRA = 'cassandra',
    DYNAMODB = 'dynamodb',
    FIREBASE = 'firebase',
    SUPABASE = 'supabase'
}

export enum MobileFramework {
    REACT_NATIVE = 'react-native',
    FLUTTER = 'flutter',
    IONIC = 'ionic',
    XAMARIN = 'xamarin',
    NATIVE_ANDROID = 'native-android',
    NATIVE_IOS = 'native-ios',
    CORDOVA = 'cordova',
    CAPACITOR = 'capacitor',
    EXPO = 'expo',
    MAUI = 'maui'
}

export enum DesktopFramework {
    ELECTRON = 'electron',
    TAURI = 'tauri',
    FLUTTER_DESKTOP = 'flutter-desktop',
    QT = 'qt',
    GTK = 'gtk',
    WINDOWS_FORMS = 'windows-forms',
    WPF = 'wpf',
    AVALONIA = 'avalonia',
    SWING = 'swing',
    JAVAFX = 'javafx'
}

export enum TestingFramework {
    JEST = 'jest',
    VITEST = 'vitest',
    CYPRESS = 'cypress',
    PLAYWRIGHT = 'playwright',
    SELENIUM = 'selenium',
    PYTEST = 'pytest',
    UNITTEST = 'unittest',
    JUNIT = 'junit',
    NUNIT = 'nunit',
    XUNIT = 'xunit',
    GO_TEST = 'go-test',
    RUST_TEST = 'rust-test',
    PHPUNIT = 'phpunit',
    RSPEC = 'rspec',
    XCTEST = 'xctest',
    ESPRESSO = 'espresso'
}

export enum BuildTool {
    WEBPACK = 'webpack',
    VITE = 'vite',
    ROLLUP = 'rollup',
    PARCEL = 'parcel',
    ESBUILD = 'esbuild',
    SWC = 'swc',
    GRADLE = 'gradle',
    MAVEN = 'maven',
    DOTNET = 'dotnet',
    CGO = 'cgo',
    CARGO = 'cargo',
    COMPOSER = 'composer',
    BUNDLER = 'bundler',
    COCOAPODS = 'cocoapods',
    NPM = 'npm',
    YARN = 'yarn',
    PNPM = 'pnpm'
}

export interface ProjectConfig {
    name: string;
    type: ProjectType;
    language: Language;
    framework?: FrontendFramework | BackendFramework | MobileFramework | DesktopFramework;
    database?: Database;
    testing?: TestingFramework;
    buildTool?: BuildTool;
    features?: string[];
    description?: string;
    author?: string;
    version?: string;
    license?: string;
}

export interface ProjectStructure {
    folders: string[];
    files: Array<{
        path: string;
        content: string;
    }>;
}

export interface TemplateConfig {
    name: string;
    description: string;
    type: ProjectType;
    language: Language;
    framework?: FrontendFramework | BackendFramework | MobileFramework | DesktopFramework;
    database?: Database;
    testing?: TestingFramework;
    buildTool?: BuildTool;
    features: string[];
    complexity: 'simple' | 'medium' | 'complex';
    tags: string[];
}

export interface LanguageConfig {
    name: string;
    extensions: string[];
    packageManager: string;
    defaultBuildTool: BuildTool;
    defaultTestingFramework: TestingFramework;
    frameworks: Array<{
        name: string;
        type: FrontendFramework | BackendFramework | MobileFramework | DesktopFramework;
        description: string;
    }>;
}
