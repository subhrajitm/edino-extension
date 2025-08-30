import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectType, ProjectStructure, ProjectConfig, Language, FrontendFramework, BackendFramework } from './types';
import { FrontendTemplates } from './templates/frontendTemplates';
import { BackendTemplates } from './templates/backendTemplates';
import { FullStackTemplates } from './templates/fullStackTemplates';
import { TemplateManager } from './templateManager';

export class ProjectGenerator {
    private frontendTemplates: FrontendTemplates;
    private backendTemplates: BackendTemplates;
    private fullStackTemplates: FullStackTemplates;
    private templateManager: TemplateManager;

    constructor() {
        this.frontendTemplates = new FrontendTemplates();
        this.backendTemplates = new BackendTemplates();
        this.fullStackTemplates = new FullStackTemplates();
        this.templateManager = TemplateManager.getInstance();
    }

    async generateProject(projectType: ProjectType, targetPath: string, projectName: string): Promise<void> {
        // Create the base directory
        await fs.ensureDir(targetPath);

        let structure: ProjectStructure;

        switch (projectType) {
            case ProjectType.FRONTEND:
                structure = this.frontendTemplates.getStructure(projectName);
                break;
            case ProjectType.BACKEND:
                structure = this.backendTemplates.getStructure(projectName);
                break;
            case ProjectType.FULL_STACK:
                structure = this.fullStackTemplates.getStructure(projectName);
                break;
            case ProjectType.MOBILE:
                structure = this.getMobileStructure(projectName);
                break;
            case ProjectType.DESKTOP:
                structure = this.getDesktopStructure(projectName);
                break;
            case ProjectType.LIBRARY:
                structure = this.getLibraryStructure(projectName);
                break;
            case ProjectType.CLI:
                structure = this.getCliStructure(projectName);
                break;
            case ProjectType.AI_ML:
                structure = this.getAiMlStructure(projectName);
                break;
            default:
                throw new Error(`Unknown project type: ${projectType}`);
        }

        // Create folders
        for (const folder of structure.folders) {
            const folderPath = path.join(targetPath, folder);
            await fs.ensureDir(folderPath);
        }

        // Create files
        for (const file of structure.files) {
            const filePath = path.join(targetPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content, 'utf8');
        }
    }

    async generateAdvancedProject(config: ProjectConfig, targetPath: string): Promise<void> {
        await this.templateManager.generateProject(config, targetPath);
    }

    getAvailableTemplates() {
        return this.templateManager.getTemplates();
    }

    getTemplatesByType(type: ProjectType) {
        return this.templateManager.getTemplatesByType(type);
    }

    getTemplatesByLanguage(language: Language) {
        return this.templateManager.getTemplatesByLanguage(language);
    }

    getAllLanguages() {
        return this.templateManager.getAllLanguages();
    }

    // Mobile project structure
    private getMobileStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/components',
                'src/screens',
                'src/navigation',
                'src/services',
                'src/utils',
                'src/assets',
                'src/assets/images',
                'src/assets/icons',
                'android',
                'ios',
                'docs'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getMobileReadmeContent(projectName)
                },
                {
                    path: 'package.json',
                    content: this.getMobilePackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getMobileGitignoreContent()
                },
                {
                    path: 'src/App.tsx',
                    content: this.getMobileAppContent()
                },
                {
                    path: 'src/navigation/AppNavigator.tsx',
                    content: this.getMobileNavigationContent()
                },
                {
                    path: 'src/screens/HomeScreen.tsx',
                    content: this.getMobileHomeScreenContent()
                },
                {
                    path: 'docs/README.md',
                    content: this.getMobileDocsContent()
                }
            ]
        };
    }

    // Desktop project structure
    private getDesktopStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/main',
                'src/renderer',
                'src/renderer/components',
                'src/renderer/pages',
                'src/renderer/assets',
                'src/renderer/styles',
                'src/preload',
                'build',
                'docs'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getDesktopReadmeContent(projectName)
                },
                {
                    path: 'package.json',
                    content: this.getDesktopPackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getDesktopGitignoreContent()
                },
                {
                    path: 'src/main/index.ts',
                    content: this.getDesktopMainContent()
                },
                {
                    path: 'src/renderer/index.html',
                    content: this.getDesktopRendererHtmlContent()
                },
                {
                    path: 'src/renderer/index.tsx',
                    content: this.getDesktopRendererContent()
                },
                {
                    path: 'docs/README.md',
                    content: this.getDesktopDocsContent()
                }
            ]
        };
    }

    // Library project structure
    private getLibraryStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/index',
                'src/utils',
                'src/types',
                'tests',
                'tests/unit',
                'tests/integration',
                'docs',
                'examples'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getLibraryReadmeContent(projectName)
                },
                {
                    path: 'package.json',
                    content: this.getLibraryPackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getLibraryGitignoreContent()
                },
                {
                    path: 'src/index.ts',
                    content: this.getLibraryIndexContent()
                },
                {
                    path: 'rollup.config.js',
                    content: this.getLibraryRollupConfigContent()
                },
                {
                    path: 'tsconfig.json',
                    content: this.getLibraryTsConfigContent()
                },
                {
                    path: 'docs/README.md',
                    content: this.getLibraryDocsContent()
                }
            ]
        };
    }

    // CLI project structure
    private getCliStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/commands',
                'src/utils',
                'src/types',
                'tests',
                'tests/unit',
                'tests/integration',
                'docs',
                'bin'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getCliReadmeContent(projectName)
                },
                {
                    path: 'package.json',
                    content: this.getCliPackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getCliGitignoreContent()
                },
                {
                    path: 'src/index.ts',
                    content: this.getCliIndexContent()
                },
                {
                    path: 'src/commands/hello.ts',
                    content: this.getCliHelloCommandContent()
                },
                {
                    path: 'bin/cli.js',
                    content: this.getCliBinContent(projectName)
                },
                {
                    path: 'docs/README.md',
                    content: this.getCliDocsContent()
                }
            ]
        };
    }

    // AI/ML project structure
    private getAiMlStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/models',
                'src/data',
                'src/preprocessing',
                'src/evaluation',
                'src/utils',
                'notebooks',
                'data',
                'models',
                'docs',
                'tests'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getAiMlReadmeContent(projectName)
                },
                {
                    path: 'requirements.txt',
                    content: this.getAiMlRequirementsContent()
                },
                {
                    path: '.gitignore',
                    content: this.getAiMlGitignoreContent()
                },
                {
                    path: 'src/main.py',
                    content: this.getAiMlMainContent()
                },
                {
                    path: 'src/models/model.py',
                    content: this.getAiMlModelContent()
                },
                {
                    path: 'notebooks/exploration.ipynb',
                    content: this.getAiMlNotebookContent()
                },
                {
                    path: 'docs/README.md',
                    content: this.getAiMlDocsContent()
                }
            ]
        };
    }

    // Content generation methods for Mobile
    private getMobileReadmeContent(projectName: string): string {
        return `# ${projectName}

A modern mobile application built with React Native.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- React Native CLI
- Android Studio / Xcode

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API services
├── utils/          # Utility functions
└── assets/         # Static assets
\`\`\`
`;
    }

    private getMobilePackageJsonContent(projectName: string): string {
        return JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: 'A modern mobile application',
            main: 'index.js',
            scripts: {
                android: 'react-native run-android',
                ios: 'react-native run-ios',
                start: 'react-native start',
                test: 'jest',
                lint: 'eslint .'
            },
            dependencies: {
                'react': '18.2.0',
                'react-native': '0.72.0',
                '@react-navigation/native': '^6.1.0',
                '@react-navigation/stack': '^6.3.0'
            },
            devDependencies: {
                '@types/react': '^18.2.0',
                '@types/react-native': '^0.72.0',
                'typescript': '^5.0.0',
                'jest': '^29.0.0',
                '@babel/core': '^7.20.0'
            }
        }, null, 2);
    }

    private getMobileGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# React Native
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo
`;
    }

    private getMobileAppContent(): string {
        return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
`;
    }

    private getMobileNavigationContent(): string {
        return `import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
`;
    }

    private getMobileHomeScreenContent(): string {
        return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to React Native!</Text>
      <Text style={styles.subtitle}>Start building your mobile app</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
`;
    }

    private getMobileDocsContent(): string {
        return `# Mobile Development Guide

## Navigation
- Use React Navigation for screen navigation
- Implement stack, tab, and drawer navigators as needed

## Components
- Create reusable components in src/components
- Follow React Native best practices

## State Management
- Consider using Redux or Context API for state management
- Implement proper data flow patterns

## Testing
- Write unit tests for components and utilities
- Use React Native Testing Library
`;
    }

    // Content generation methods for Desktop
    private getDesktopReadmeContent(projectName: string): string {
        return `# ${projectName}

A modern desktop application built with Electron and React.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── main/           # Main process (Electron)
├── renderer/       # Renderer process (React)
├── preload/        # Preload scripts
└── build/          # Build configuration
\`\`\`
`;
    }

    private getDesktopPackageJsonContent(projectName: string): string {
        return JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: 'A modern desktop application',
            main: 'dist/main/index.js',
            scripts: {
                dev: 'electron-vite dev',
                build: 'electron-vite build',
                preview: 'electron-vite preview',
                'build:win': 'npm run build && electron-builder --win',
                'build:mac': 'npm run build && electron-builder --mac',
                'build:linux': 'npm run build && electron-builder --linux'
            },
            dependencies: {
                'react': '^18.2.0',
                'react-dom': '^18.2.0',
                'electron': '^25.0.0'
            },
            devDependencies: {
                '@types/react': '^18.2.0',
                '@types/react-dom': '^18.2.0',
                'typescript': '^5.0.0',
                'electron-vite': '^1.0.0',
                'electron-builder': '^24.0.0'
            }
        }, null, 2);
    }

    private getDesktopGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
out/

# Electron
app/
release/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
`;
    }

    private getDesktopMainContent(): string {
        return `import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`;
    }

    private getDesktopRendererHtmlContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electron App</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
</body>
</html>`;
    }

    private getDesktopRendererContent(): string {
        return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    }

    private getDesktopDocsContent(): string {
        return `# Desktop Development Guide

## Architecture
- Main process: Handles app lifecycle and native APIs
- Renderer process: React application for UI
- Preload scripts: Secure bridge between processes

## Development
- Use electron-vite for fast development
- Hot reload works for both main and renderer processes

## Building
- Use electron-builder for creating distributables
- Configure build targets in package.json

## Security
- Always use contextIsolation: true
- Never enable nodeIntegration in renderer
- Use preload scripts for secure IPC
`;
    }

    // Content generation methods for Library
    private getLibraryReadmeContent(projectName: string): string {
        return `# ${projectName}

A modern TypeScript library with comprehensive tooling.

## 🚀 Getting Started

### Installation
\`\`\`bash
npm install ${projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

### Usage
\`\`\`typescript
import { someFunction } from '${projectName.toLowerCase().replace(/\s+/g, '-')}';

const result = someFunction();
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── index.ts        # Main entry point
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
\`\`\`

## 🛠️ Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
\`\`\`
`;
    }

    private getLibraryPackageJsonContent(projectName: string): string {
        return JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: 'A modern TypeScript library',
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
            files: ['dist'],
            scripts: {
                build: 'rollup -c',
                test: 'vitest',
                lint: 'eslint src --ext .ts',
                'type-check': 'tsc --noEmit'
            },
            dependencies: {},
            devDependencies: {
                typescript: '^5.0.0',
                rollup: '^3.0.0',
                '@rollup/plugin-typescript': '^11.0.0',
                '@rollup/plugin-commonjs': '^25.0.0',
                '@rollup/plugin-node-resolve': '^15.0.0',
                vitest: '^0.34.0',
                '@types/node': '^20.0.0'
            }
        }, null, 2);
    }

    private getLibraryGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Coverage
coverage/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
`;
    }

    private getLibraryIndexContent(): string {
        return `// Main library entry point
export * from './utils';
export * from './types';

// Example function
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Example class
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}
`;
    }

    private getLibraryRollupConfigContent(): string {
        return `import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist'
    })
  ],
  external: []
};`;
    }

    private getLibraryTsConfigContent(): string {
        return JSON.stringify({
            compilerOptions: {
                target: 'ES2020',
                module: 'ESNext',
                lib: ['ES2020'],
                declaration: true,
                outDir: './dist',
                rootDir: './src',
                strict: true,
                esModuleInterop: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                moduleResolution: 'node',
                resolveJsonModule: true,
                isolatedModules: true,
                noEmit: false
            },
            include: ['src/**/*'],
            exclude: ['node_modules', 'dist', 'tests']
        }, null, 2);
    }

    private getLibraryDocsContent(): string {
        return `# Library Development Guide

## Structure
- src/index.ts: Main entry point
- src/utils/: Utility functions
- src/types/: TypeScript type definitions

## Building
- Use Rollup for bundling
- Generates both CommonJS and ESM outputs
- Includes TypeScript declarations

## Testing
- Use Vitest for fast testing
- Write unit tests for all functions
- Maintain good test coverage

## Publishing
- Build before publishing
- Update version in package.json
- Use semantic versioning
`;
    }

    // Content generation methods for CLI
    private getCliReadmeContent(projectName: string): string {
        return `# ${projectName}

A modern command-line interface built with TypeScript and Commander.js.

## 🚀 Getting Started

### Installation
\`\`\`bash
npm install -g ${projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

### Usage
\`\`\`bash
${projectName.toLowerCase().replace(/\s+/g, '-')} hello
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── index.ts        # Main entry point
├── commands/       # Command implementations
├── utils/          # Utility functions
└── types/          # TypeScript type definitions
\`\`\`

## 🛠️ Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Run locally
npm run dev
\`\`\`
`;
    }

    private getCliPackageJsonContent(projectName: string): string {
        return JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: 'A modern command-line interface',
            main: 'dist/index.js',
            bin: {
                [projectName.toLowerCase().replace(/\s+/g, '-')]: './bin/cli.js'
            },
            scripts: {
                build: 'tsc',
                dev: 'ts-node src/index.ts',
                test: 'jest',
                lint: 'eslint src --ext .ts'
            },
            dependencies: {
                commander: '^11.0.0',
                chalk: '^5.0.0'
            },
            devDependencies: {
                typescript: '^5.0.0',
                '@types/node': '^20.0.0',
                'ts-node': '^10.9.0',
                jest: '^29.0.0',
                '@types/jest': '^29.0.0'
            }
        }, null, 2);
    }

    private getCliGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Coverage
coverage/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
`;
    }

    private getCliIndexContent(): string {
        return `#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { helloCommand } from './commands/hello';

const program = new Command();

program
  .name('cli-app')
  .description('A modern CLI application')
  .version('1.0.0');

// Add commands
helloCommand(program);

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
`;
    }

    private getCliHelloCommandContent(): string {
        return `import { Command } from 'commander';
import chalk from 'chalk';

export function helloCommand(program: Command) {
  program
    .command('hello')
    .description('Say hello')
    .argument('[name]', 'Name to greet', 'World')
    .action((name) => {
      console.log(chalk.green(\`Hello, \${name}!\`));
    });
}
`;
    }

    private getCliBinContent(projectName: string): string {
        return `#!/usr/bin/env node

require('../dist/index.js');
`;
    }

    private getCliDocsContent(): string {
        return `# CLI Development Guide

## Structure
- src/index.ts: Main entry point and command registration
- src/commands/: Individual command implementations
- src/utils/: Utility functions
- bin/cli.js: Executable entry point

## Commands
- Use Commander.js for command parsing
- Implement each command in separate files
- Use chalk for colored output

## Building
- TypeScript compilation to dist/
- Ensure bin/cli.js has proper shebang
- Test commands after building

## Testing
- Write unit tests for each command
- Test argument parsing and validation
- Mock console output for testing
`;
    }

    // Content generation methods for AI/ML
    private getAiMlReadmeContent(projectName: string): string {
        return `# ${projectName}

A Python AI/ML project with modern data science tooling.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip or conda

### Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Development
\`\`\`bash
# Run main script
python src/main.py

# Start Jupyter notebook
jupyter notebook notebooks/
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── models/         # ML model implementations
├── data/           # Data processing scripts
├── preprocessing/  # Data preprocessing utilities
├── evaluation/     # Model evaluation scripts
└── utils/          # Utility functions

notebooks/          # Jupyter notebooks
data/               # Data files
models/             # Trained models
\`\`\`
`;
    }

    private getAiMlRequirementsContent(): string {
        return `numpy>=1.21.0
pandas>=1.3.0
scikit-learn>=1.0.0
matplotlib>=3.5.0
seaborn>=0.11.0
jupyter>=1.0.0
notebook>=6.4.0
ipykernel>=6.0.0
pytest>=6.0.0
black>=22.0.0
flake8>=4.0.0`;
    }

    private getAiMlGitignoreContent(): string {
        return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Jupyter Notebook
.ipynb_checkpoints

# Environment
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Data
data/raw/
data/processed/
*.csv
*.json
*.parquet

# Models
models/*.pkl
models/*.joblib
models/*.h5

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
`;
    }

    private getAiMlMainContent(): string {
        return `#!/usr/bin/env python3
"""
Main entry point for the AI/ML application.
"""

import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def main():
    """Main function."""
    logger.info("Starting AI/ML application...")
    
    # Add your main logic here
    logger.info("Application completed successfully!")

if __name__ == "__main__":
    main()
`;
    }

    private getAiMlModelContent(): string {
        return `"""
Example ML model implementation.
"""

import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.utils.validation import check_X_y, check_array, check_is_fitted

class ExampleModel(BaseEstimator, ClassifierMixin):
    """
    Example custom ML model.
    """
    
    def __init__(self, random_state=None):
        self.random_state = random_state
        self.is_fitted_ = False
    
    def fit(self, X, y):
        """
        Fit the model.
        
        Parameters
        ----------
        X : array-like of shape (n_samples, n_features)
            Training data.
        y : array-like of shape (n_samples,)
            Target values.
            
        Returns
        -------
        self : object
            Returns self.
        """
        X, y = check_X_y(X, y)
        self.is_fitted_ = True
        return self
    
    def predict(self, X):
        """
        Predict class labels.
        
        Parameters
        ----------
        X : array-like of shape (n_samples, n_features)
            Samples.
            
        Returns
        -------
        y : array-like of shape (n_samples,)
            Predicted class labels.
        """
        check_is_fitted(self)
        X = check_array(X)
        # Add your prediction logic here
        return np.zeros(X.shape[0], dtype=int)
`;
    }

    private getAiMlNotebookContent(): string {
        return `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Data Exploration\\n",
    "\\n",
    "This notebook contains exploratory data analysis and model development."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import pandas as pd\\n",
    "import numpy as np\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "\\n",
    "# Set up plotting style\\n",
    "plt.style.use('seaborn-v0_8')\\n",
    "sns.set_palette(\"husl\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load your data here\\n",
    "# df = pd.read_csv('data/your_data.csv')\\n",
    "\\n",
    "# Display basic information\\n",
    "# print(df.info())\\n",
    "# print(df.head())"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}`;
    }

    private getAiMlDocsContent(): string {
        return `# AI/ML Development Guide

## Structure
- src/models/: ML model implementations
- src/data/: Data processing scripts
- src/preprocessing/: Data preprocessing utilities
- notebooks/: Jupyter notebooks for exploration

## Best Practices
- Use virtual environments
- Follow PEP 8 style guidelines
- Write comprehensive tests
- Document your models and data

## Data Management
- Store raw data in data/raw/
- Process data and save to data/processed/
- Use version control for code, not data

## Model Development
- Start with simple baselines
- Use cross-validation
- Track model performance
- Save models with versioning
`;
    }
}
