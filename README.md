# Edino - Project Generator Extension

A Visual Studio Code extension that enables users to quickly start new coding projects by generating pre-configured folder structures for Full Stack, Frontend, or Backend development.

## 🚀 Features

- **Interactive Project Selection**: Choose from Full Stack, Frontend, or Backend project types
- **Pre-configured Structures**: Generate industry-standard folder structures with relevant files
- **Multiple Tech Stacks**: Support for React, Node.js, Express, MongoDB, and more
- **Customizable**: Option to customize folder names and exclude optional sections
- **User-Friendly**: Clear instructions and intuitive UI
- **Well-Documented**: Comprehensive documentation and placeholder files

## 📋 Requirements

- Visual Studio Code 1.74.0 or higher
- Node.js 14+ (for running the generated projects)

## 🛠️ Installation

### From VSIX Package
1. Download the `.vsix` file from the releases
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Choose the downloaded file

### From Source
1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to launch the extension in a new Extension Development Host window

## 🎯 Usage

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

### Project Creation Process
1. **Select Project Type**:
   - 🚀 Full Stack: Complete frontend + backend structure
   - 🎨 Frontend: React-based frontend application
   - ⚙️ Backend: Node.js/Express API server

2. **Enter Project Details**:
   - Project name (alphanumeric, hyphens, underscores only)
   - Target directory (relative to workspace)

3. **Automatic Generation**:
   - Creates folder structure
   - Generates starter files
   - Includes documentation
   - Sets up package.json files

## 📁 Generated Project Structures

### Frontend Projects
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── assets/        # Static assets (images, styles)
├── utils/         # Utility functions
├── hooks/         # Custom React hooks
└── context/       # React context providers
public/            # Public assets
docs/             # Documentation
```

**Tech Stack**: React, React Router, CSS/SCSS, Axios

### Backend Projects
```
src/
├── controllers/   # Request handlers
├── models/        # Data models
├── routes/        # Route definitions
├── middleware/    # Custom middleware
├── config/        # Configuration files
├── utils/         # Utility functions
└── services/      # Business logic
tests/            # Unit and integration tests
docs/             # API documentation
logs/             # Application logs
```

**Tech Stack**: Node.js, Express.js, MongoDB/Mongoose, JWT, Winston

### Full Stack Projects
```
client/           # React frontend application
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── utils/
│   ├── hooks/
│   └── context/
└── public/
server/           # Node.js backend API
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── utils/
└── tests/
shared/           # Shared code between client and server
├── types/        # TypeScript types/interfaces
└── constants/    # Shared constants
docs/            # Project documentation
```

**Tech Stack**: React + Node.js + MongoDB + Docker support

## 📝 Generated Files

Each project type includes:

- **README.md**: Comprehensive project documentation
- **package.json**: Dependencies and scripts
- **.gitignore**: Appropriate ignore patterns
- **Starter Code**: Basic components, routes, and utilities
- **Documentation**: API docs, deployment guides
- **Configuration**: Environment examples, Docker setup

## 🔧 Customization

### Adding New Project Types
1. Create a new template class in `src/templates/`
2. Implement the `ProjectStructure` interface
3. Add the new type to the `ProjectType` enum
4. Update the extension command to include the new option

### Modifying Existing Templates
1. Edit the template classes in `src/templates/`
2. Update the folder structure and file contents
3. Recompile the extension

## 🧪 Development

### Building the Extension
```bash
npm install
npm run compile
```

### Running Tests
```bash
npm test
```

### Packaging for Distribution
```bash
npm run package
```

### Development Workflow
1. Make changes to TypeScript files in `src/`
2. Run `npm run compile` to build
3. Press F5 to test in Extension Development Host
4. Use `npm run watch` for automatic compilation

## 📚 Documentation

- [Extension API Reference](https://code.visualstudio.com/api)
- [VS Code Extension Development](https://code.visualstudio.com/api/get-started/your-first-extension)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow the existing code style
- Ensure all generated projects are functional

## 🐛 Troubleshooting

### Common Issues

**Extension not appearing in command palette**
- Ensure the extension is properly installed
- Check VS Code version compatibility
- Restart VS Code

**Project generation fails**
- Verify workspace folder is open
- Check file permissions
- Ensure target directory is writable

**Generated project doesn't run**
- Install dependencies: `npm install`
- Check Node.js version compatibility
- Review generated README for setup instructions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- VS Code Extension API
- React and Node.js communities
- Contributors and users

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/edino-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/edino-extension/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/edino-extension/wiki)

---

**Made with ❤️ for the developer community**
