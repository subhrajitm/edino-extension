import * as assert from 'assert';
import * as vscode from 'vscode';
import { ProjectGenerator } from '../../projectGenerator';
import { ProjectType } from '../../types';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Project Generator should be instantiable', () => {
    const generator = new ProjectGenerator();
    assert.ok(generator, 'ProjectGenerator should be instantiable');
  });

  test('ProjectType enum should have correct values', () => {
    assert.strictEqual(ProjectType.FRONTEND, 'frontend');
    assert.strictEqual(ProjectType.BACKEND, 'backend');
    assert.strictEqual(ProjectType.FULL_STACK, 'fullstack');
  });

  test('Extension should be activated', async () => {
    const extension = vscode.extensions.getExtension('edino.edino-extension');
    if (extension) {
      await extension.activate();
      assert.ok(extension.isActive, 'Extension should be active');
    }
  });
});
