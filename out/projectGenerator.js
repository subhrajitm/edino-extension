"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGenerator = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const types_1 = require("./types");
const frontendTemplates_1 = require("./templates/frontendTemplates");
const backendTemplates_1 = require("./templates/backendTemplates");
const fullStackTemplates_1 = require("./templates/fullStackTemplates");
class ProjectGenerator {
    constructor() {
        this.frontendTemplates = new frontendTemplates_1.FrontendTemplates();
        this.backendTemplates = new backendTemplates_1.BackendTemplates();
        this.fullStackTemplates = new fullStackTemplates_1.FullStackTemplates();
    }
    async generateProject(projectType, targetPath, projectName) {
        // Create the base directory
        await fs.ensureDir(targetPath);
        let structure;
        switch (projectType) {
            case types_1.ProjectType.FRONTEND:
                structure = this.frontendTemplates.getStructure(projectName);
                break;
            case types_1.ProjectType.BACKEND:
                structure = this.backendTemplates.getStructure(projectName);
                break;
            case types_1.ProjectType.FULL_STACK:
                structure = this.fullStackTemplates.getStructure(projectName);
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
}
exports.ProjectGenerator = ProjectGenerator;
//# sourceMappingURL=projectGenerator.js.map