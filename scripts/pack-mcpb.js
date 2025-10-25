#!/usr/bin/env node

/**
 * Package the extension as a .mcpb file
 */

import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const outputFile = join(distDir, 'linux-filesystem.mcpb');

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Create output stream
const output = createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  const size = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✓ Created ${outputFile}`);
  console.log(`  Size: ${size} MB`);
  console.log(`\nInstallation:`);
  console.log(`  1. Open Claude Desktop`);
  console.log(`  2. Go to Settings > Extensions`);
  console.log(`  3. Click "Install Extension..."`);
  console.log(`  4. Select ${outputFile}`);
});

output.on('error', (err) => {
  console.error('Error creating archive:', err);
  process.exit(1);
});

archive.on('error', (err) => {
  console.error('Error archiving:', err);
  process.exit(1);
});

archive.pipe(output);

// Add files to archive
console.log('Packaging extension...');

// Add manifest
archive.file(join(projectRoot, 'manifest.json'), { name: 'manifest.json' });
console.log('  + manifest.json');

// Add build directory
archive.directory(join(projectRoot, 'build'), 'build');
console.log('  + build/');

// Add package.json (needed for Node.js module resolution)
archive.file(join(projectRoot, 'package.json'), { name: 'package.json' });
console.log('  + package.json');

// Finalize archive
archive.finalize();
