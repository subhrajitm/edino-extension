export enum ProjectType {
    FRONTEND = 'frontend',
    BACKEND = 'backend',
    FULL_STACK = 'fullstack'
}

export interface ProjectStructure {
    folders: string[];
    files: Array<{
        path: string;
        content: string;
    }>;
}

export interface ProjectConfig {
    name: string;
    type: ProjectType;
    targetPath: string;
}
