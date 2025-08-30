import { ProjectStructure } from '../types';

export class FullStackTemplates {
    getStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'client',
                'client/src',
                'client/src/components',
                'client/src/pages',
                'client/src/assets',
                'client/src/assets/images',
                'client/src/assets/styles',
                'client/src/utils',
                'client/src/hooks',
                'client/src/context',
                'client/public',
                'client/docs',
                'server',
                'server/src',
                'server/src/controllers',
                'server/src/models',
                'server/src/routes',
                'server/src/middleware',
                'server/src/config',
                'server/src/utils',
                'server/src/services',
                'server/tests',
                'server/tests/unit',
                'server/tests/integration',
                'server/docs',
                'server/logs',
                'shared',
                'shared/types',
                'shared/constants',
                'docs'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getReadmeContent(projectName)
                },
                {
                    path: 'package.json',
                    content: this.getRootPackageJsonContent(projectName)
                },
                {
                    path: '.gitignore',
                    content: this.getGitignoreContent()
                },
                {
                    path: 'docker-compose.yml',
                    content: this.getDockerComposeContent()
                },
                {
                    path: 'client/package.json',
                    content: this.getClientPackageJsonContent(projectName)
                },
                {
                    path: 'server/package.json',
                    content: this.getServerPackageJsonContent(projectName)
                },
                {
                    path: 'docs/README.md',
                    content: this.getDocsReadmeContent()
                }
            ]
        };
    }

    private getReadmeContent(projectName: string): string {
        return `# ${projectName}

A full-stack web application with React frontend and Node.js backend.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for database)

### Quick Start

#### Option 1: Using Docker (Recommended)
\`\`\`bash
# Start all services
docker-compose up

# The application will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
\`\`\`

#### Option 2: Manual Setup

1. **Install dependencies**
   \`\`\`bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   \`\`\`

2. **Environment Setup**
   \`\`\`bash
   # Copy environment files
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   \`\`\`

3. **Start Development Servers**
   \`\`\`bash
   # Terminal 1: Start backend
   cd server && npm run dev
   
   # Terminal 2: Start frontend
   cd client && npm start
   \`\`\`

## 📁 Project Structure

\`\`\`
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── assets/      # Static assets
│   │   ├── utils/       # Utility functions
│   │   ├── hooks/       # Custom React hooks
│   │   └── context/     # React context providers
│   └── public/          # Public assets
├── server/           # Node.js backend API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Data models
│   │   ├── routes/      # Route definitions
│   │   ├── middleware/  # Custom middleware
│   │   ├── config/      # Configuration files
│   │   └── utils/       # Utility functions
│   └── tests/          # Backend tests
├── shared/           # Shared code between client and server
│   ├── types/        # TypeScript types/interfaces
│   └── constants/    # Shared constants
└── docs/            # Project documentation
\`\`\`

## 🛠️ Tech Stack

### Frontend
- React
- React Router
- CSS/SCSS
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MongoDB/Mongoose
- JWT Authentication
- Winston (Logging)

### Development
- Docker & Docker Compose
- Jest (Testing)
- ESLint (Linting)

## 📝 License

This project is licensed under the MIT License.
`;
    }

    private getRootPackageJsonContent(projectName: string): string {
        return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "Full-stack web application",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm start",
    "dev:server": "cd server && npm run dev",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build",
    "test": "npm run test:client && npm run test:server",
    "test:client": "cd client && npm test",
    "test:server": "cd server && npm test",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  },
  "workspaces": [
    "client",
    "server",
    "shared"
  ]
}`;
    }

    private getGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
client/build/
server/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
*.lcov

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Temporary folders
tmp/
temp/`;
    }

    private getDockerComposeContent(): string {
        return `version: '3.8'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api/v1
    depends_on:
      - server
    volumes:
      - ./client:/app
      - /app/node_modules
    networks:
      - app-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/fullstack_app
      - JWT_SECRET=your_jwt_secret_here
      - CORS_ORIGIN=http://localhost:3000
    depends_on:
      - mongo
    volumes:
      - ./server:/app
      - /app/node_modules
    networks:
      - app-network

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network

volumes:
  mongo_data:

networks:
  app-network:
    driver: bridge`;
    }

    private getClientPackageJsonContent(projectName: string): string {
        return `{
  "name": "${projectName}-client",
  "version": "1.0.0",
  "description": "Frontend application",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
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

    private getServerPackageJsonContent(projectName: string): string {
        return `{
  "name": "${projectName}-server",
  "version": "1.0.0",
  "description": "Backend API server",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-validator": "^7.0.1",
    "winston": "^3.8.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=14.0.0"
  }
}`;
    }

    private getDocsReadmeContent(): string {
        return `# Documentation

This folder contains comprehensive documentation for the full-stack application.

## Structure

- \`README.md\` - This file
- \`DEPLOYMENT.md\` - Deployment guide
- \`API.md\` - API documentation
- \`FRONTEND.md\` - Frontend development guide
- \`BACKEND.md\` - Backend development guide

## Getting Started

1. Read the main README.md in the project root
2. Check the deployment guide for production setup
3. Review the API documentation for backend endpoints
4. Follow the frontend/backend guides for development

## Architecture Overview

This is a full-stack application with the following architecture:

- **Frontend**: React application with modern hooks and context
- **Backend**: Node.js/Express API with MongoDB database
- **Shared**: Common types and constants used by both client and server
- **Docker**: Containerized deployment with Docker Compose

## Development Workflow

1. **Local Development**: Use \`npm run dev\` to start both client and server
2. **Testing**: Run tests with \`npm test\`
3. **Building**: Build for production with \`npm run build\`
4. **Deployment**: Follow the deployment guide for production setup

## Contributing

When adding new features:
1. Update the relevant documentation files
2. Add tests for new functionality
3. Update the API documentation if adding new endpoints
4. Follow the established code patterns and conventions
`;
    }
}
