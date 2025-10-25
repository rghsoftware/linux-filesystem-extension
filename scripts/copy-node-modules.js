#!/usr/bin/env node

/**
 * Copy all production node_modules to build directory for .mcpb packaging
 * This ensures all transitive dependencies are included
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const buildDir = join(projectRoot, 'build');
const nodeModulesSource = join(projectRoot, 'node_modules');
const nodeModulesTarget = join(buildDir, 'node_modules');

// Ensure build directory exists
if (!existsSync(buildDir)) {
  mkdirSync(buildDir, { recursive: true });
}

console.log('Copying all production node_modules to build directory...');

// Remove existing node_modules in build if present
if (existsSync(nodeModulesTarget)) {
  console.log('Removing existing node_modules from build...');
  rmSync(nodeModulesTarget, { recursive: true, force: true });
}

// Copy entire node_modules directory
// This includes all transitive dependencies needed at runtime
if (existsSync(nodeModulesSource)) {
  console.log('Copying node_modules...');
  cpSync(nodeModulesSource, nodeModulesTarget, {
    recursive: true,
    // Skip dev-only files
    filter: (src) => {
      // Skip test files, documentation, and other non-essential files
      const skipPatterns = [
        /\/test\//,
        /\/tests\//,
        /\/__tests__\//,
        /\.test\./,
        /\.spec\./,
        /\/docs?\//,
        /\/examples?\//,
        /\.md$/,
        /LICENSE/,
        /CHANGELOG/,
        /\.map$/,
      ];

      return !skipPatterns.some(pattern => pattern.test(src));
    }
  });
  console.log('Done copying node_modules');
} else {
  console.error('Error: node_modules directory not found. Run npm install first.');
  process.exit(1);
}
