import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EdinoPlugin, PluginMetadata, ValidationResult } from './EdinoPlugin';
import { TemplateConfig } from '../../types';
import { Logger } from '../../utils/logger';

export class PluginManager {
    private static instance: PluginManager;
    private plugins: Map<string, EdinoPlugin> = new Map();
    private pluginMetadata: Map<string, PluginMetadata> = new Map();
    private logger = Logger.getInstance();
    private context?: vscode.ExtensionContext;

    private constructor() {}

    public static getInstance(): PluginManager {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }

    public async initialize(context: vscode.ExtensionContext): Promise<void> {
        this.context = context;
        this.logger.info('Initializing Plugin Manager');
        
        // Load built-in plugins
        await this.loadBuiltInPlugins();
        
        // Load external plugins
        await this.loadExternalPlugins();
        
        this.logger.info(`Plugin Manager initialized with ${this.plugins.size} plugins`);
    }

    private async loadBuiltInPlugins(): Promise<void> {
        try {
            // Load built-in plugins from the plugins directory
            const pluginsDir = path.join(__dirname, '../plugins');
            if (await fs.pathExists(pluginsDir)) {
                const pluginFiles = await fs.readdir(pluginsDir);
                
                for (const file of pluginFiles) {
                    if (file.endsWith('.js') || file.endsWith('.ts')) {
                        await this.loadPluginFromFile(path.join(pluginsDir, file));
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error loading built-in plugins', error as Error);
        }
    }

    private async loadExternalPlugins(): Promise<void> {
        try {
            // Load plugins from user's plugin directory
            const userPluginsDir = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', '.edino', 'plugins');
            if (await fs.pathExists(userPluginsDir)) {
                const pluginDirs = await fs.readdir(userPluginsDir);
                
                for (const dir of pluginDirs) {
                    const pluginPath = path.join(userPluginsDir, dir);
                    const stat = await fs.stat(pluginPath);
                    
                    if (stat.isDirectory()) {
                        await this.loadPluginFromDirectory(pluginPath);
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error loading external plugins', error as Error);
        }
    }

    private async loadPluginFromFile(filePath: string): Promise<void> {
        try {
            // Dynamic import of plugin module
            const pluginModule = await import(filePath);
            const PluginClass = pluginModule.default || pluginModule.Plugin;
            
            if (PluginClass) {
                const plugin = new PluginClass();
                await this.registerPlugin(plugin);
            }
        } catch (error) {
            this.logger.error(`Error loading plugin from file: ${filePath}`, error as Error);
        }
    }

    private async loadPluginFromDirectory(pluginDir: string): Promise<void> {
        try {
            const packageJsonPath = path.join(pluginDir, 'package.json');
            const indexPath = path.join(pluginDir, 'index.js');
            
            if (await fs.pathExists(packageJsonPath) && await fs.pathExists(indexPath)) {
                const packageJson = await fs.readJson(packageJsonPath);
                const pluginModule = await import(indexPath);
                const PluginClass = pluginModule.default || pluginModule.Plugin;
                
                if (PluginClass) {
                    const plugin = new PluginClass();
                    await this.registerPlugin(plugin);
                }
            }
        } catch (error) {
            this.logger.error(`Error loading plugin from directory: ${pluginDir}`, error as Error);
        }
    }

    public async registerPlugin(plugin: EdinoPlugin): Promise<void> {
        try {
            // Validate plugin
            const validation = await this.validatePlugin(plugin);
            if (!validation.isValid) {
                this.logger.warn(`Plugin ${plugin.name} validation failed:`, validation.errors);
                return;
            }

            // Check for conflicts
            if (this.plugins.has(plugin.id)) {
                this.logger.warn(`Plugin ${plugin.id} already registered, skipping`);
                return;
            }

            // Register plugin
            this.plugins.set(plugin.id, plugin);
            
            // Activate plugin
            if (this.context) {
                await plugin.activate(this.context);
            }

            this.logger.info(`Plugin ${plugin.name} v${plugin.version} registered successfully`);
        } catch (error) {
            this.logger.error(`Error registering plugin ${plugin.name}`, error as Error);
        }
    }

    public async unregisterPlugin(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
            await plugin.deactivate();
            this.plugins.delete(pluginId);
            this.pluginMetadata.delete(pluginId);
            this.logger.info(`Plugin ${pluginId} unregistered`);
        }
    }

    public getPlugin(pluginId: string): EdinoPlugin | undefined {
        return this.plugins.get(pluginId);
    }

    public getAllPlugins(): EdinoPlugin[] {
        return Array.from(this.plugins.values());
    }

    public getPluginTemplates(pluginId: string): TemplateConfig[] {
        const plugin = this.plugins.get(pluginId);
        return plugin ? plugin.getTemplates() : [];
    }

    public getAllTemplates(): TemplateConfig[] {
        const templates: TemplateConfig[] = [];
        for (const plugin of this.plugins.values()) {
            templates.push(...plugin.getTemplates());
        }
        return templates;
    }

    private async validatePlugin(plugin: EdinoPlugin): Promise<ValidationResult> {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required properties
        if (!plugin.id) errors.push('Plugin ID is required');
        if (!plugin.name) errors.push('Plugin name is required');
        if (!plugin.version) errors.push('Plugin version is required');
        if (!plugin.description) errors.push('Plugin description is required');
        if (!plugin.author) errors.push('Plugin author is required');

        // Check templates
        if (!plugin.templates || plugin.templates.length === 0) {
            warnings.push('Plugin has no templates');
        }

        // Validate each template
        for (const template of plugin.templates) {
            const templateValidation = await plugin.validateTemplate(template);
            if (!templateValidation.isValid) {
                errors.push(...templateValidation.errors.map(e => `Template ${template.name}: ${e}`));
            }
            warnings.push(...templateValidation.warnings.map(w => `Template ${template.name}: ${w}`));
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    public async reloadPlugins(): Promise<void> {
        this.logger.info('Reloading all plugins');
        
        // Deactivate all plugins
        for (const plugin of this.plugins.values()) {
            await plugin.deactivate();
        }
        
        // Clear plugin registry
        this.plugins.clear();
        this.pluginMetadata.clear();
        
        // Reload plugins
        if (this.context) {
            await this.initialize(this.context);
        }
    }

    public getPluginInfo(): Array<{ id: string; name: string; version: string; templateCount: number }> {
        return Array.from(this.plugins.values()).map(plugin => ({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            templateCount: plugin.templates.length
        }));
    }
}
