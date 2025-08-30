import { ProjectStructure } from '../types';

export class BackendTemplates {
    getStructure(projectName: string): ProjectStructure {
        return {
            folders: [
                'src',
                'src/controllers',
                'src/models',
                'src/routes',
                'src/middleware',
                'src/config',
                'src/utils',
                'src/services',
                'tests',
                'tests/unit',
                'tests/integration',
                'docs',
                'logs'
            ],
            files: [
                {
                    path: 'README.md',
                    content: this.getReadmeContent(projectName, 'Backend')
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
                    path: '.env.example',
                    content: this.getEnvExampleContent()
                },
                {
                    path: 'src/app.js',
                    content: this.getAppJsContent()
                },
                {
                    path: 'src/server.js',
                    content: this.getServerJsContent()
                },
                {
                    path: 'src/config/database.js',
                    content: this.getDatabaseConfigContent()
                },
                {
                    path: 'src/routes/index.js',
                    content: this.getRoutesIndexContent()
                },
                {
                    path: 'src/controllers/userController.js',
                    content: this.getUserControllerContent()
                },
                {
                    path: 'src/models/User.js',
                    content: this.getUserModelContent()
                },
                {
                    path: 'src/middleware/auth.js',
                    content: this.getAuthMiddlewareContent()
                },
                {
                    path: 'src/utils/logger.js',
                    content: this.getLoggerContent()
                },
                {
                    path: 'tests/unit/user.test.js',
                    content: this.getUserTestContent()
                },
                {
                    path: 'docs/API.md',
                    content: this.getApiDocsContent()
                }
            ]
        };
    }

    private getReadmeContent(projectName: string, projectType: string): string {
        return `# ${projectName}

A modern ${projectType.toLowerCase()} API built with Node.js and Express.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for database)

### Installation
\`\`\`bash
npm install
\`\`\`

### Environment Setup
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm start
\`\`\`

### Testing
\`\`\`bash
npm test
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── controllers/    # Request handlers
├── models/        # Data models
├── routes/        # Route definitions
├── middleware/    # Custom middleware
├── config/        # Configuration files
├── utils/         # Utility functions
└── services/      # Business logic
\`\`\`

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB/Mongoose
- JWT Authentication
- Jest (Testing)
- Winston (Logging)

## 📝 API Documentation

See \`docs/API.md\` for detailed API documentation.

## 📝 License

This project is licensed under the MIT License.
`;
    }

    private getPackageJsonContent(projectName: string): string {
        return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "A modern backend API",
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

    private getGitignoreContent(): string {
        return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

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

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary folders
tmp/
temp/`;
    }

    private getEnvExampleContent(): string {
        return `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database
MONGODB_URI_TEST=mongodb://localhost:27017/your_database_test

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# API Configuration
API_PREFIX=/api/v1`;
    }

    private getAppJsContent(): string {
        return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;`;
    }

    private getServerJsContent(): string {
        return `const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(\`Server is running on port \${PORT}\`);
  logger.info(\`Environment: \${process.env.NODE_ENV}\`);
});`;
    }

    private getDatabaseConfigContent(): string {
        return `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;`;
    }

    private getRoutesIndexContent(): string {
        return `const express = require('express');
const userRoutes = require('./userRoutes');

const router = express.Router();

// User routes
router.use('/users', userRoutes);

// Add more route modules here
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

module.exports = router;`;
    }

    private getUserControllerContent(): string {
        return `const User = require('../models/User');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create user
// @route   POST /api/v1/users
// @access  Public
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password
    });

    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser
};`;
    }

    private getUserModelContent(): string {
        return `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`;
    }

    private getAuthMiddlewareContent(): string {
        return `const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      logger.error('Token verification error:', error);
      res.status(401).json({ error: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'User role is not authorized' 
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};`;
    }

    private getLoggerContent(): string {
        return `const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error'
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log')
    })
  ]
});

module.exports = logger;`;
    }

    private getUserTestContent(): string {
        return `const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /api/v1/users', () => {
    it('should get all users', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      expect(res.body.name).toBe(userData.name);
      expect(res.body.email).toBe(userData.email);
      expect(res.body.password).toBeUndefined();
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(400);
    });
  });
});`;
    }

    private getApiDocsContent(): string {
        return `# API Documentation

## Base URL
\`http://localhost:3000/api/v1\`

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
\`Authorization: Bearer <your-token>\`

## Endpoints

### Users

#### GET /users
Get all users
- **Access**: Public
- **Response**: Array of user objects

#### GET /users/:id
Get user by ID
- **Access**: Public
- **Parameters**: id (string)
- **Response**: User object

#### POST /users
Create a new user
- **Access**: Public
- **Body**:
  \`\`\`json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  \`\`\`
- **Response**: Created user object

#### PUT /users/:id
Update user
- **Access**: Private (Owner or Admin)
- **Parameters**: id (string)
- **Body**: User fields to update
- **Response**: Updated user object

#### DELETE /users/:id
Delete user
- **Access**: Private (Owner or Admin)
- **Parameters**: id (string)
- **Response**: Success message

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Response Format

Success responses follow this format:
\`\`\`json
{
  "data": {...},
  "message": "string"
}
\`\`\`

Error responses follow this format:
\`\`\`json
{
  "error": "string",
  "details": {...}
}
\`\`\`
`;
    }
}
