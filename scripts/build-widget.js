import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

try {
  // Compile TypeScript widget to JavaScript
  execSync(
    `npx tsc widget/widget.ts --outDir public --target ES2020 --module ES2020 --moduleResolution node --lib ES2020,DOM --skipLibCheck --declaration false`,
    { cwd: rootDir, stdio: 'inherit' }
  );

  // Read the compiled file
  const compiledPath = join(rootDir, 'public', 'widget.js');
  let content = readFileSync(compiledPath, 'utf-8');

  // Remove any TypeScript-specific code if needed
  // The compiled JS should be ready to use

  console.log('✓ Widget compiled successfully');
  console.log(`✓ Output: ${compiledPath}`);
  
  // Check file size
  const sizeInBytes = Buffer.byteLength(content, 'utf8');
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  console.log(`✓ File size: ${sizeInKB} KB`);
  
  if (sizeInBytes > 20 * 1024) {
    console.warn('⚠ Warning: Widget size exceeds 20KB limit!');
  }
} catch (error) {
  console.error('Error building widget:', error);
  process.exit(1);
}
