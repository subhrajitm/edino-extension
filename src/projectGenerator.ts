import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectType, ProjectStructure } from './types';
import { FrontendTemplates } from './templates/frontendTemplates';
import { BackendTemplates } from './templates/backendTemplates';
import { FullStackTemplates } from './templates/fullStackTemplates';

export class ProjectGenerator {
    private frontendTemplates: FrontendTemplates;
    private backendTemplates: BackendTemplates;
    private fullStackTemplates: FullStackTemplates;

    constructor() {
        this.frontendTemplates = new FrontendTemplates();
        this.backendTemplates = new BackendTemplates();
        this.fullStackTemplates = new FullStackTemplates();
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
}
