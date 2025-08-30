import { ProjectStructure } from '../types';

export class FrontendTemplates {
    getStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/components',
                'src/pages',
                'src/assets',
                'src/assets/images',
                'src/assets/styles',
                'src/utils',
                'src/hooks',
                'src/context',
                'public',
                'docs'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getReadmeContent(projectName, 'Frontend')
                },
                {
                    path: 'package.json',
                    content: this.getPackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getGitignoreContent()
                },
                {
                    path: 'src/index.js',
                    content: this.getIndexJsContent()
                },
                {
                    path: 'src/App.js',
                    content: this.getAppJsContent()
                },
                {
                    path: 'src/components/Header.js',
                    content: this.getHeaderComponentContent()
                },
                {
                    path: 'src/pages/Home.js',
                    content: this.getHomePageContent()
                },
                {
                    path: 'src/assets/styles/main.css',
                    content: this.getMainCssContent()
                },
                {
                    path: 'public/index.html',
                    content: this.getIndexHtmlContent(projectName)
                },
                {
                    path: 'docs/README.md',
                    content: this.getDocsReadmeContent()
                }
            ]
        };
    }

    private getReadmeContent(projectName: string, projectType: string): string {
        return `# ${projectName}

A modern ${projectType.toLowerCase()} project built with React.

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
npm start
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── assets/        # Static assets (images, styles)
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
└── context/       # React context providers
\`\`\`

## 🛠️ Tech Stack

- React
- JavaScript/TypeScript
- CSS/SCSS
- Webpack/Vite

## 📝 License

This project is licensed under the MIT License.
`;
    }

    private getPackageJsonContent(projectName: string): string {
        return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "A modern frontend project",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`;
    }

    private getGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
build/
dist/

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
*.log`;
    }

    private getIndexJsContent(): string {
        return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/main.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    }

    private getAppJsContent(): string {
        return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;`;
    }

    private getHeaderComponentContent(): string {
        return `import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <nav>
        <Link to="/" className="logo">
          My App
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;`;
    }

    private getHomePageContent(): string {
        return `import React from 'react';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Your App</h1>
      <p>This is your home page. Start building your amazing application!</p>
      <div className="features">
        <div className="feature">
          <h3>Feature 1</h3>
          <p>Description of your first feature.</p>
        </div>
        <div className="feature">
          <h3>Feature 2</h3>
          <p>Description of your second feature.</p>
        </div>
        <div className="feature">
          <h3>Feature 3</h3>
          <p>Description of your third feature.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;`;
    }

    private getMainCssContent(): string {
        return `/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  color: #333;
}

/* Header styles */
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.header nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #007bff;
}

/* Main content */
main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Home page styles */
.home {
  text-align: center;
}

.home h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.home p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature {
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature p {
  color: #666;
}

/* Responsive design */
@media (max-width: 768px) {
  .header nav {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .home h1 {
    font-size: 2rem;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}`;
    }

    private getIndexHtmlContent(projectName: string): string {
        return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="${projectName} - A modern web application"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>${projectName}</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
    }

    private getDocsReadmeContent(): string {
        return `# Documentation

This folder contains documentation for the project.

## Structure

- \`README.md\` - This file
- \`components.md\` - Component documentation
- \`api.md\` - API documentation
- \`deployment.md\` - Deployment guide

## Getting Started

1. Read the main README.md in the project root
2. Check the component documentation for UI components
3. Review the API documentation if applicable
4. Follow the deployment guide when ready to deploy

## Contributing

When adding new features or components, please update the relevant documentation files.
`;
    }
}
