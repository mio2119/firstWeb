import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createMinimalDemoManifest } from './minimal-demo-manifest.mjs';

const root = process.cwd();
const reportPath = path.join(root, 'docs', 'workbench', 'minimal-demo-latest-report.json');
const baselinePath = path.join(root, 'docs', 'workbench', 'minimal-demo-style-baseline.json');
const changeLogPath = path.join(root, 'docs', 'workbench', 'minimal-demo-change-log.md');
const checks = [];

const toPosix = (value) => value.replace(/\\/g, '/');

const run = (command, args) => new Promise((resolve) => {
  const child = spawn(command, args, {
    cwd: root,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('close', (code) => resolve({ code, stdout, stderr }));
  child.on('error', (error) => resolve({ code: 1, stdout, stderr: error.message }));
});

const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};

const addCheck = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
};

const loadJson = async (relativePath) => {
  const raw = await fs.readFile(path.join(root, relativePath), 'utf8');
  return JSON.parse(raw);
};

const normalizeSet = (items = []) => new Set(items.map(toPosix));

const isAllowedNewVisualFile = (file, prefixes = []) =>
  prefixes.some((prefix) => file.startsWith(toPosix(prefix)));

const verifyRequiredWorkbenchFiles = async () => {
  const required = [
    'docs/workbench/minimal-demo-config.json',
    'docs/workbench/minimal-demo-workbench.md',
    'docs/workbench/minimal-demo-check-loop.md',
    'docs/workbench/minimal-demo-claude-code.md',
    'docs/workbench/minimal-demo-change-log.md',
    'docs/workbench/minimal-demo-style-baseline.json',
    '.agents/minimal-demo-agents.md',
    '.codex/minimal-demo-memory.md',
    'scripts/minimal-demo-manifest.mjs',
    'scripts/minimal-demo-verify.mjs',
    'scripts/minimal-demo-loop.mjs'
  ];

  for (const file of required) {
    addCheck(`minimal demo workbench file: ${file}`, await exists(file));
  }
};

const verifyStyleGuard = async () => {
  if (!(await exists('docs/workbench/minimal-demo-style-baseline.json'))) {
    addCheck('minimal demo style baseline', false, 'missing, run npm run demo:manifest');
    return;
  }

  const baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
  const config = await loadJson('docs/workbench/minimal-demo-config.json');
  const current = await createMinimalDemoManifest();

  const allowedChanges = normalizeSet(config.allowedVisualChangeFiles);
  const protectedFiles = normalizeSet(config.protectedVisualFiles);
  const allFiles = new Set([
    ...Object.keys(baseline.entries || {}),
    ...Object.keys(current.entries || {})
  ]);

  const changed = [];
  const blocked = [];
  const protectedChanged = [];
  const allowedNewPrefixes = config.allowedVisualNewFilePrefixes || [];

  for (const file of allFiles) {
    const before = baseline.entries?.[file];
    const after = current.entries?.[file];
    if (before === after) continue;
    changed.push(file);

    const isNew = before === undefined && after !== undefined;
    const allowed =
      allowedChanges.has(file) ||
      (isNew && isAllowedNewVisualFile(file, allowedNewPrefixes));

    if (protectedFiles.has(file)) protectedChanged.push(file);
    if (!allowed) blocked.push(file);
  }

  addCheck('Intro page unchanged', protectedChanged.length === 0, protectedChanged.join(', '));
  addCheck('visual changes limited to minimal demo allowlist', blocked.length === 0, blocked.join(', '));

  if (changed.length > 0) {
    const changeLogExists = await exists('docs/workbench/minimal-demo-change-log.md');
    let missing = changed;
    if (changeLogExists) {
      const log = await fs.readFile(changeLogPath, 'utf8');
      missing = changed.filter((file) => !log.includes(file));
    }
    addCheck('visual change log mentions changed files', missing.length === 0, missing.join(', '));
  } else {
    addCheck('visual change log mentions changed files', true, 'no visual changes yet');
  }
};

const verifyRequiredDemoSignals = async () => {
  const config = await loadJson('docs/workbench/minimal-demo-config.json');
  const files = [
    'src/data/types/admissions.ts',
    'public/data/provinces/gd/universities.json',
    'public/data/qa/templates.json',
    'public/data/qa/intents.json',
    'docs/workbench/minimal-demo-workbench.md'
  ];

  let corpus = '';
  for (const file of files) {
    if (await exists(file)) {
      corpus += `\n${await fs.readFile(path.join(root, file), 'utf8')}`;
    }
  }

  const missing = (config.requiredDemoSignals || []).filter((signal) => !corpus.includes(signal));
  addCheck(
    'minimal demo narrative signals present',
    missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : ''
  );
};

const verifyScriptsSyntax = async () => {
  for (const file of [
    'scripts/minimal-demo-manifest.mjs',
    'scripts/minimal-demo-verify.mjs',
    'scripts/minimal-demo-loop.mjs'
  ]) {
    const result = await run('node', ['--check', file]);
    addCheck(`node syntax: ${file}`, result.code === 0, (result.stderr || result.stdout).trim());
  }
};

const verifyData = async () => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32' ? ['/c', 'npm', 'run', 'check:data'] : ['run', 'check:data'];
  const result = await run(command, args);
  addCheck('data validation', result.code === 0, (result.stderr || result.stdout).trim().slice(-600));
};

const verifyTypes = async () => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32' ? ['/c', 'npm', 'run', 'check:types'] : ['run', 'check:types'];
  const result = await run(command, args);
  addCheck('typescript type check', result.code === 0, (result.stderr || result.stdout).trim().slice(-600));
};

const verifyBuild = async () => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32' ? ['/c', 'npm', 'run', 'build'] : ['run', 'build'];
  const result = await run(command, args);
  addCheck('frontend build', result.code === 0, (result.stderr || result.stdout).trim().slice(-600));
};

await verifyRequiredWorkbenchFiles();
await verifyStyleGuard();
await verifyRequiredDemoSignals();
await verifyScriptsSyntax();
await verifyData();
await verifyTypes();
await verifyBuild();

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((check) => check.ok),
  checks,
  nextAction: checks.every((check) => check.ok)
    ? 'Minimal demo checks passed.'
    : 'Open docs/workbench/minimal-demo-latest-report.json, fix only failed scopes, then rerun npm run demo:loop.'
};

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (!report.ok) {
  console.error(`Minimal demo verification failed. See ${toPosix(path.relative(root, reportPath))}`);
  process.exit(1);
}

console.log(`Minimal demo verification passed. Report: ${toPosix(path.relative(root, reportPath))}`);
