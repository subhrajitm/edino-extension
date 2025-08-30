import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { ProjectGenerator } from '../projectGenerator';
import { TemplateManager } from '../templateManager';
import { ProjectType, Language } from '../types';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Project Generator should create basic project structure', async () => {
        const generator = new ProjectGenerator();
        const testPath = path.join(__dirname, '../../test-output/basic-project');
        
        // Clean up before test
        await fs.remove(testPath);
        
        // Create project
        await generator.generateProject(ProjectType.FRONTEND, testPath, 'test-project');
        
        // Verify structure
        assert.ok(await fs.pathExists(testPath));
        assert.ok(await fs.pathExists(path.join(testPath, 'src')));
        assert.ok(await fs.pathExists(path.join(testPath, 'README.md')));
        
        // Clean up after test
        await fs.remove(testPath);
    });

    test('Template Manager should return available templates', () => {
        const templateManager = TemplateManager.getInstance();
        const templates = templateManager.getTemplates();
        
        assert.ok(templates.length > 0, 'Should have at least one template');
        assert.ok(templates.some(t => t.type === ProjectType.FRONTEND), 'Should have frontend templates');
        assert.ok(templates.some(t => t.type === ProjectType.BACKEND), 'Should have backend templates');
    });

    test('Template Manager should filter templates by type', () => {
        const templateManager = TemplateManager.getInstance();
        const frontendTemplates = templateManager.getTemplatesByType(ProjectType.FRONTEND);
        
        assert.ok(frontendTemplates.length > 0, 'Should have frontend templates');
        frontendTemplates.forEach(template => {
            assert.strictEqual(template.type, ProjectType.FRONTEND);
        });
    });

    test('Template Manager should filter templates by language', () => {
        const templateManager = TemplateManager.getInstance();
        const jsTemplates = templateManager.getTemplatesByLanguage(Language.JAVASCRIPT);
        
        assert.ok(jsTemplates.length > 0, 'Should have JavaScript templates');
        jsTemplates.forEach(template => {
            assert.strictEqual(template.language, Language.JAVASCRIPT);
        });
    });

    test('Project name validation should work correctly', () => {
        const validNames = ['my-project', 'project123', 'my_project'];
        const invalidNames = ['my project', 'project@123', 'project#123'];
        
        const nameRegex = /^[a-zA-Z0-9-_]+$/;
        
        validNames.forEach(name => {
            assert.ok(nameRegex.test(name), `Valid name "${name}" should pass validation`);
        });
        
        invalidNames.forEach(name => {
            assert.ok(!nameRegex.test(name), `Invalid name "${name}" should fail validation`);
        });
    });
});
