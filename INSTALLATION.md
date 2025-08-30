# Installation Guide

## Quick Start

### Prerequisites
- Visual Studio Code 1.74.0 or higher
- Node.js 14+ (for running generated projects)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/edino-extension.git
   cd edino-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile the Extension**
   ```bash
   npm run compile
   ```

4. **Test the Extension**
   ```bash
   # Run the demo script to test project generation
   node demo.js
   ```

5. **Launch in VS Code**
   - Press `F5` in VS Code to launch the extension in Extension Development Host
   - Or use the "Run Extension" configuration from the debug panel

## Using the Extension

### Method 1: Command Palette
1. Open VS Code
2. Open a workspace folder
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "Create New Project" and select the command
5. Follow the interactive prompts

### Method 2: Context Menu
1. Right-click on a folder in the Explorer
2. Select "Create New Project"
3. Follow the interactive prompts

## Project Types

### Frontend Projects
- React-based application
- Includes routing, components, and styling
- Ready-to-use development setup

### Backend Projects
- Node.js/Express API server
- MongoDB integration with Mongoose
- JWT authentication and logging
- Comprehensive testing setup

### Full Stack Projects
- Complete frontend + backend structure
- Docker support for easy deployment
- Shared types and constants
- Production-ready configuration

## Development

### Building
```bash
npm run compile
```

### Watching for Changes
```bash
npm run watch
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Common Issues

**Extension not appearing**
- Ensure workspace folder is open
- Check VS Code version compatibility
- Restart VS Code

**Compilation errors**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript version compatibility
- Verify all type definitions are installed

**Project generation fails**
- Check file permissions
- Ensure target directory is writable
- Verify Node.js version compatibility

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation in the README.md
- Review the generated project documentation

## License

This project is licensed under the MIT License.
