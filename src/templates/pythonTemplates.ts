import { ProjectConfig, BackendFramework, Database, TestingFramework } from '../types';
import * as fs from 'fs-extra';
import * as path from 'path';

export class PythonTemplates {
    static async generateFastAPI(config: ProjectConfig, projectPath: string): Promise<void> {
        // Create directories
        const dirs = [
            'app',
            'app/api',
            'app/api/v1',
            'app/core',
            'app/models',
            'app/schemas',
            'app/services',
            'app/utils',
            'tests',
            'alembic',
            'docs'
        ];

        for (const dir of dirs) {
            await fs.ensureDir(path.join(projectPath, dir));
        }

        // Create files
        const files = [
            {
                path: 'requirements.txt',
                content: `fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
`
            },
            {
                path: 'main.py',
                content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="${config.name}",
    version="${config.version || '1.0.0'}",
    description="FastAPI application with modern Python tooling"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to ${config.name}!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`
            },
            {
                path: 'README.md',
                content: `# ${config.name}

A modern FastAPI application with PostgreSQL, SQLAlchemy, and comprehensive tooling.

## Features

- FastAPI framework
- PostgreSQL database with SQLAlchemy ORM
- Alembic for database migrations
- Pydantic for data validation
- JWT authentication
- Comprehensive testing with pytest
- Docker support
- API documentation with Swagger UI

## Quick Start

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. Start the application:
   \`\`\`bash
   uvicorn main:app --reload
   \`\`\`

3. Visit http://localhost:8000/docs for API documentation
`
            }
        ];

        for (const file of files) {
            const filePath = path.join(projectPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content, 'utf8');
        }
    }

    static async generateDjango(config: ProjectConfig, projectPath: string): Promise<void> {
        // Create directories
        const dirs = [
            'manage.py',
            'requirements.txt',
            'README.md'
        ];

        // Create files
        const files = [
            {
                path: 'requirements.txt',
                content: `Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pytest==7.4.3
pytest-django==4.7.0
`
            },
            {
                path: 'README.md',
                content: `# ${config.name}

A modern Django application with REST framework and PostgreSQL.

## Features

- Django 4.2
- Django REST Framework
- PostgreSQL database
- CORS support
- Comprehensive testing
- Docker support

## Quick Start

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. Run migrations:
   \`\`\`bash
   python manage.py migrate
   \`\`\`

3. Run development server:
   \`\`\`bash
   python manage.py runserver
   \`\`\`
`
            }
        ];

        for (const file of files) {
            const filePath = path.join(projectPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content, 'utf8');
        }
    }

    static async generateFlask(config: ProjectConfig, projectPath: string): Promise<void> {
        // Create directories
        const dirs = [
            'app',
            'tests',
            'migrations'
        ];

        for (const dir of dirs) {
            await fs.ensureDir(path.join(projectPath, dir));
        }

        // Create files
        const files = [
            {
                path: 'requirements.txt',
                content: `Flask==3.0.0
Flask-SQLAlchemy==3.1.1
Flask-Migrate==4.0.5
Flask-CORS==4.0.0
python-dotenv==1.0.0
pytest==7.4.3
`
            },
            {
                path: 'README.md',
                content: `# ${config.name}

A modern Flask application with SQLAlchemy and comprehensive tooling.

## Features

- Flask framework
- SQLAlchemy ORM
- Database migrations
- CORS support
- Testing with pytest
- Docker support

## Quick Start

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

2. Start the application:
   \`\`\`bash
   flask run
   \`\`\`

## Testing

\`\`\`bash
pytest
\`\`\`
`
            }
        ];

        for (const file of files) {
            const filePath = path.join(projectPath, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content, 'utf8');
        }
    }
}
