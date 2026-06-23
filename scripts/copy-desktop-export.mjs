import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const desktopOutDir = resolve(repoRoot, 'apps/desktop/out');
const webOutDir = resolve(repoRoot, 'apps/web/out');
const targetDir = resolve(webOutDir, 'desktop');

function assertDirectory(path, description) {
  if (!existsSync(path)) {
    throw new Error(`${description} not found: ${path}`);
  }
}

assertDirectory(desktopOutDir, 'Desktop export output');
assertDirectory(webOutDir, 'Web export output');

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(webOutDir, { recursive: true });
cpSync(desktopOutDir, targetDir, { recursive: true });

console.info('[copy-desktop-export] copied %s -> %s', desktopOutDir, targetDir);
