import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, 'docs', 'workbench', 'minimal-demo-latest-report.json');

const runVerify = () => new Promise((resolve) => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'demo:verify']
    : ['run', 'demo:verify'];

  const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
  child.on('close', (code) => resolve(code || 0));
  child.on('error', () => resolve(1));
});

const code = await runVerify();

if (code === 0) {
  console.log('Minimal demo auto-check loop status: all checks passed.');
  process.exit(0);
}

let report = null;
try {
  report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
} catch {
  report = null;
}

console.log('');
console.log('Minimal demo auto-check loop status: checks failed.');
console.log('Next loop action for Claude Code / agent:');
console.log('1. Open docs/workbench/minimal-demo-latest-report.json.');
console.log('2. Fix only the failed check scope.');
console.log('3. Keep src/pages/Intro.tsx unchanged.');
console.log('4. If a visual file changed, document it in docs/workbench/minimal-demo-change-log.md.');
console.log('5. Rerun npm run demo:loop.');

if (report?.checks) {
  const failed = report.checks.filter((check) => !check.ok);
  console.log('');
  console.log('Failed checks:');
  failed.forEach((check) => {
    console.log(`- ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
  });
}

process.exit(code);
