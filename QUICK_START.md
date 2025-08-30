# 🚀 Quick Start Guide - Edino Project Generator

## Installation

### Option 1: Install from VSIX Package (Recommended)

1. **Download the Extension**
   - The extension package is ready: `edino-extension-0.1.0.vsix`

2. **Install in VS Code**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Click the "..." menu (three dots) in the Extensions panel
   - Select "Install from VSIX..."
   - Choose the `edino-extension-0.1.0.vsix` file
   - Click "Install"

3. **Restart VS Code**
   - Restart VS Code to activate the extension

### Option 2: Development Mode

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd edino-extension
   npm install
   npm run compile
   ```

2. **Launch Extension**
   - Press F5 in VS Code
   - This opens a new Extension Development Host window
   - The extension will be active in this window

## 🎯 Using the Extension

### Method 1: Command Palette
1. Open VS Code
2. Open a workspace folder
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Create New Project"
5. Select "Edino: Create New Project"
6. Follow the prompts

### Method 2: Context Menu
1. Right-click on a folder in the Explorer panel
2. Select "Create New Project"
3. Follow the prompts

## 📋 Project Creation Process

1. **Select Project Type**:
   - 🚀 **Full Stack**: Complete frontend + backend structure
   - 🎨 **Frontend**: React-based frontend application
   - ⚙️ **Backend**: Node.js/Express API server

2. **Enter Project Details**:
   - Project name (alphanumeric, hyphens, underscores only)
   - Target directory (relative to workspace)

3. **Automatic Generation**:
   - Creates complete folder structure
   - Generates starter files and documentation
   - Sets up package.json with dependencies
   - Includes README with setup instructions

## 📁 Generated Project Examples

### Frontend Project Structure
```
my-frontend-app/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── assets/        # Images, styles
│   ├── utils/         # Utility functions
│   ├── hooks/         # Custom React hooks
│   └── context/       # React context
├── public/            # Public assets
├── docs/             # Documentation
├── package.json      # Dependencies
└── README.md         # Setup guide
```

### Backend Project Structure
```
my-backend-api/
├── src/
│   ├── controllers/   # API controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── config/        # Configuration
│   └── utils/         # Utilities
├── tests/            # Unit tests
├── docs/             # API documentation
├── package.json      # Dependencies
└── README.md         # Setup guide
```

### Full Stack Project Structure
```
my-fullstack-app/
├── client/           # React frontend
├── server/           # Node.js backend
├── shared/           # Shared code
├── docs/            # Documentation
├── docker-compose.yml # Docker setup
└── README.md        # Complete guide
```

## 🚀 Next Steps After Generation

1. **Navigate to Project**
   ```bash
   cd your-project-name
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm start  # or npm run dev
   ```

4. **Follow README**
   - Each generated project includes detailed setup instructions
   - Check the README.md file for specific commands

## 🛠️ Customization

### Adding New Project Types
1. Edit `src/templates/` files
2. Add new template classes
3. Update `src/types.ts` with new project types
4. Recompile: `npm run compile`
5. Repackage: `vsce package`

### Modifying Existing Templates
1. Edit template files in `src/templates/`
2. Update folder structures and file contents
3. Recompile and repackage

## 🐛 Troubleshooting

### Extension Not Appearing
- Ensure workspace folder is open
- Check VS Code version (1.74.0+)
- Restart VS Code after installation

### Project Generation Fails
- Check file permissions
- Ensure target directory is writable
- Verify Node.js version (14+)

### Generated Project Issues
- Install dependencies: `npm install`
- Check Node.js compatibility
- Review generated README for setup

## 📞 Support

- **Issues**: Create GitHub issue
- **Documentation**: Check README.md
- **Demo**: Run `node demo.js` to test functionality

---

**🎉 You're ready to start generating projects!**
