import * as vscode from 'vscode';
import { TemplateConfig, ProjectConfig } from '../../types';

export interface EdinoPlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    templates: TemplateConfig[];
    commands: PluginCommand[];
    dependencies?: string[];
    activate(context: vscode.ExtensionContext): Promise<void>;
    deactivate(): Promise<void>;
    getTemplates(): TemplateConfig[];
    validateTemplate(template: TemplateConfig): Promise<ValidationResult>;
}

export interface PluginCommand {
    id: string;
    title: string;
    category: string;
    handler: (...args: any[]) => Promise<void>;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    dependencies?: string[];
    entryPoint: string;
    templates: TemplateConfig[];
}

export abstract class BasePlugin implements EdinoPlugin {
    public abstract readonly id: string;
    public abstract readonly name: string;
    public abstract readonly version: string;
    public abstract readonly description: string;
    public abstract readonly author: string;
    public abstract readonly templates: TemplateConfig[];
    public abstract readonly commands: PluginCommand[];
    public abstract readonly dependencies?: string[];

    protected context?: vscode.ExtensionContext;
    protected logger = console;

    async activate(context: vscode.ExtensionContext): Promise<void> {
        this.context = context;
        this.logger.log(`Plugin ${this.name} v${this.version} activated`);
        
        // Register commands
        for (const command of this.commands) {
            const disposable = vscode.commands.registerCommand(
                `edino.plugin.${this.id}.${command.id}`,
                command.handler
            );
            context.subscriptions.push(disposable);
        }
    }

    async deactivate(): Promise<void> {
        this.logger.log(`Plugin ${this.name} v${this.version} deactivated`);
    }

    getTemplates(): TemplateConfig[] {
        return this.templates;
    }

    async validateTemplate(template: TemplateConfig): Promise<ValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic validation
        if (!template.name) {
            errors.push('Template name is required');
        }
        if (!template.type) {
            errors.push('Template type is required');
        }
        if (!template.language) {
            errors.push('Template language is required');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}
