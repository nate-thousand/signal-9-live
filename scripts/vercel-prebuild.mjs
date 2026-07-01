#!/usr/bin/env node
/**
 * Vercel has only the signal-9-live repo. Local dev uses sibling checkouts for
 * plantasonic-platform and plantasonic-design-system. Clone them to the expected
 * paths and build the packages TypeScript/Vite need before `npm install`.
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const parent = path.resolve(repoRoot, '..');

const platformRoot = path.join(parent, 'plantasonic-platform');
const designSystemRoot = path.join(parent, 'plantasonic-xyz', 'plantasonic-design-system');

function log(message) {
  console.log(`[vercel-prebuild] ${message}`);
}

function run(command, cwd) {
  log(`${command}  (cwd: ${cwd})`);
  execSync(command, { cwd, stdio: 'inherit', env: process.env });
}

function cloneIfMissing(url, destination) {
  if (existsSync(path.join(destination, 'package.json'))) {
    log(`skip clone — already present: ${destination}`);
    return;
  }
  mkdirSync(path.dirname(destination), { recursive: true });
  run(`git clone --depth 1 --branch main "${url}" "${destination}"`, parent);
}

function pnpm(command, cwd) {
  run(`npx --yes pnpm@9.15.4 ${command}`, cwd);
}

cloneIfMissing('https://github.com/nate-thousand/plantasonic-platform.git', platformRoot);
cloneIfMissing('https://github.com/nate-thousand/plantasonic-design-system.git', designSystemRoot);

pnpm('install --ignore-scripts', platformRoot);

const platformPackages = [
  'packages/shared-types',
  'packages/visual-engine',
  'packages/sound-engine',
  'packages/sdk',
];

for (const pkg of platformPackages) {
  const pkgRoot = path.join(platformRoot, pkg);
  if (pkg.endsWith('visual-engine')) {
    run('npm run build', pkgRoot);
  } else if (pkg.endsWith('sound-engine')) {
    run('node scripts/sync-presets.mjs', pkgRoot);
    run('npx tsc -p tsconfig.json', pkgRoot);
    run('mkdir -p dist/presets && cp -r src/presets/bundled dist/presets/bundled', pkgRoot);
  } else {
    run('npx tsc -p tsconfig.json', pkgRoot);
  }
}

if (existsSync(path.join(designSystemRoot, 'package.json'))) {
  run('npm install --ignore-scripts', designSystemRoot);
}

log('sibling dependencies ready');
