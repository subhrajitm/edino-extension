# Contributing to Edino Project Generator

Thank you for your interest in contributing to Edino! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- VS Code 1.74.0+
- Git

### Development Setup
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Compile the extension: `npm run compile`
4. Press F5 to launch the extension in a new Extension Development Host window

## 🏗️ Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── types.ts             # TypeScript type definitions
├── projectGenerator.ts  # Core project generation logic
├── templateManager.ts   # Template management system
├── welcomePanel.ts      # Welcome panel UI
├── templates/           # Template definitions
│   ├── frontendTemplates.ts
│   ├── backendTemplates.ts
│   ├── fullStackTemplates.ts
│   ├── pythonTemplates.ts
│   └── javaTemplates.ts
├── utils/               # Utility functions
│   └── logger.ts        # Logging utility
└── test/                # Test files
    └── extension.test.ts
```

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Writing Tests
- Add tests in `src/test/`
- Use descriptive test names
- Test both success and error scenarios
- Clean up test files after each test

### Test Coverage
- Aim for >80% test coverage
- Test all public methods
- Test error handling
- Test edge cases

## 📝 Code Style

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use enums for constants
- Add JSDoc comments for public methods

### Naming Conventions
- Use PascalCase for classes and interfaces
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names

### Error Handling
- Use try-catch blocks for async operations
- Log errors with context
- Provide user-friendly error messages
- Use the Logger utility for consistent logging

## 🔧 Adding New Templates

### Template Structure
```typescript
{
    name: 'Template Name',
    description: 'Template description',
    type: ProjectType.FRONTEND,
    language: Language.JAVASCRIPT,
    framework: FrontendFramework.REACT,
    database: Database.MONGODB,
    testing: TestingFramework.JEST,
    buildTool: BuildTool.VITE,
    features: ['feature1', 'feature2'],
    complexity: 'medium',
    tags: ['react', 'typescript', 'vite']
}
```

### Template File
1. Create a new file in `src/templates/`
2. Export template generation functions
3. Add templates to `TemplateManager`
4. Update type definitions if needed
5. Add tests for new templates

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Try the latest version
3. Reproduce the issue
4. Check the logs

### Bug Report Template
```markdown
**Description**
Brief description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- VS Code: [e.g., 1.74.0]
- Extension Version: [e.g., 0.1.0]

**Logs**
Relevant log output
```

## ✨ Feature Requests

### Before Requesting
1. Check if the feature already exists
2. Consider if it fits the project scope
3. Think about implementation complexity

### Feature Request Template
```markdown
**Description**
Brief description of the feature

**Use Case**
Why this feature would be useful

**Proposed Implementation**
How you think it could be implemented

**Alternatives Considered**
Other approaches you considered
```

## 📦 Release Process

### Version Bumping
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `package.json`
- Update CHANGELOG.md

### Pre-release Checklist
- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Documentation is updated
- [ ] CHANGELOG is updated
- [ ] Version is bumped

### Publishing
1. Create a release on GitHub
2. Upload the VSIX file
3. Update marketplace listing

## 🤝 Code Review Process

### Pull Request Guidelines
1. Create a descriptive title
2. Add a detailed description
3. Include tests for new features
4. Update documentation if needed
5. Ensure all checks pass

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)
- [ ] Error handling is appropriate

## 📞 Getting Help

- Create an issue for bugs or feature requests
- Join our discussions for general questions
- Check the documentation for usage examples

## 📄 License

By contributing to Edino, you agree that your contributions will be licensed under the MIT License.
