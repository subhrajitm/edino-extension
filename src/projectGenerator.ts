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
}
