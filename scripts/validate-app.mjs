#!/usr/bin/env node
/** Validates Signal 9 is a thin platform consumer with mission navigation shell */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(appRoot, 'src');
const failures = [];

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) entries.push(...walk(full));
    else entries.push(full);
  }
  return entries;
}

function exists(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

const srcFiles = walk(srcRoot);
const usesPlatformMount = srcFiles.some((file) =>
  readFileSync(file, 'utf8').includes('mountInstrumentApp'),
);

if (!usesPlatformMount) {
  failures.push('src must call mountInstrumentApp() (persistent instrument layer in AppShell)');
}

if (!readFileSync(path.join(srcRoot, 'platform', 'mp3SoundEngineAdapter.ts'), 'utf8').includes('signal-9-mp3-transmission')) {
  failures.push('Signal 9 must use MP3 sound adapter (mp3SoundEngineAdapter.ts)');
}

const appShellTs = readFileSync(path.join(srcRoot, 'navigation', 'AppShell.ts'), 'utf8');
if (!appShellTs.includes('s9-instrument-layer')) {
  failures.push('AppShell must mount the platform in a persistent s9-instrument-layer');
}

const presetBundlesTs = readFileSync(path.join(srcRoot, 'content', 'presetBundles.ts'), 'utf8');
for (const presetId of ['broadcast', 'interference', 'jammer', 'uplink', 'blackout']) {
  if (!presetBundlesTs.includes(`id: '${presetId}'`)) {
    failures.push(`presetBundles.ts must define Signal 9 preset: ${presetId}`);
  }
}

const videoSourcesTs = readFileSync(path.join(srcRoot, 'config', 'videoSources.ts'), 'utf8');
if (!videoSourcesTs.includes('SIGNAL_9_VIDEO_SOURCES')) {
  failures.push('config/videoSources.ts must define SIGNAL_9_VIDEO_SOURCES');
}

if (!exists(path.join(appRoot, 'public', 'assets', 'video', 'README.md'))) {
  failures.push('missing public/assets/video/README.md');
}

if (!exists(path.join(srcRoot, 'platform', 'videoAsciiSession.ts'))) {
  failures.push('missing platform/videoAsciiSession.ts');
}

if (!exists(path.join(srcRoot, 'ui', 'VideoTransmissionControls.ts'))) {
  failures.push('missing ui/VideoTransmissionControls.ts');
}

const tracksTs = readFileSync(path.join(srcRoot, 'audio', 'transmissionTracks.ts'), 'utf8');
for (const track of ['atmo-beats4', 'dead-wave-prime1', 'ghost-sonic-shadow', 'dust-data-loops']) {
  if (!tracksTs.includes(track)) {
    failures.push(`transmissionTracks.ts must map preset to track: ${track}`);
  }
}

for (const audioFile of [
  'atmo-beats4.mp3',
  'dead-wave-prime1.mp3',
  'ghost-sonic-shadow.mp3',
  'dust-data-loops.mp3',
]) {
  if (!exists(path.join(appRoot, 'public', 'assets', 'audio', audioFile))) {
    failures.push(`missing audio asset: public/assets/audio/${audioFile}`);
  }
}

const themeCss = readFileSync(path.join(srcRoot, 'styles', 'signal9-theme.css'), 'utf8');
if (themeCss.includes('box-shadow: inset var(--s9-shadow-glow)') && themeCss.match(/ps-region--stage[\s\S]*inset/)) {
  failures.push('signal9-theme.css must not apply fake stage backgrounds over the Visual Engine canvas');
}
if (!themeCss.includes('--s9-bg')) {
  failures.push('signal9-theme.css must define --s9-* semantic tokens (--s9-bg)');
}

const stylesIndex = readFileSync(path.join(srcRoot, 'styles/index.scss'), 'utf8');
if (!stylesIndex.includes('creative-workspace.scss')) {
  failures.push('styles/index.scss must import plantasonic-design-system/scss/creative-workspace.scss');
}
if (!stylesIndex.includes('signal9-theme.css')) {
  failures.push('styles/index.scss must import ./signal9-theme.css');
}
if (!stylesIndex.includes('startup.css')) {
  failures.push('styles/index.scss must import ./startup.css');
}

if (!exists(path.join(srcRoot, 'startup', 'StartupController.ts'))) {
  failures.push('missing startup/StartupController.ts');
}

const mainTs = readFileSync(path.join(srcRoot, 'main.ts'), 'utf8');
if (!mainTs.includes('StartupController')) {
  failures.push('main.ts must bootstrap via StartupController');
}
if (!mainTs.includes('s9-themed')) {
  failures.push('main.ts must apply s9-themed class to document root');
}

const packageJson = JSON.parse(readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
if (!packageJson.dependencies?.['plantasonic-design-system']) {
  failures.push('missing dependency: plantasonic-design-system');
}

for (const file of srcFiles) {
  const rel = path.relative(appRoot, file);
  if (/variables\.css$/.test(rel) || /bootstrap-theme\.scss$/.test(rel)) {
    failures.push(`${rel}: do not duplicate Design System assets locally`);
  }
}

const requiredScreens = ['startRun.ts', 'missionBriefing.ts', 'beatRunner.ts', 'missionDebrief.ts'];
for (const screen of requiredScreens) {
  if (!exists(path.join(srcRoot, 'navigation', 'screens', screen))) {
    failures.push(`missing navigation screen: ${screen}`);
  }
}

if (failures.length) {
  console.error('Validation failed:\n');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log('App validation passed');
