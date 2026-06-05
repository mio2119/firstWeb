import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportPath = path.join(root, 'docs', 'workbench', 'latest-report.json');

const runVerify = () => new Promise((resolve) => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32'
    ? ['/c', 'npm', 'run', 'workbench:verify']
    : ['run', 'workbench:verify'];

  const child = spawn(command, args, { cwd: root, stdio: 'inherit' });
  child.on('close', (code) => resolve(code || 0));
  child.on('error', () => resolve(1));
});

const code = await runVerify();

if (code === 0) {
  console.log('Auto-check loop status: all checks passed.');
  process.exit(0);
}

let report = null;
try {
  report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
} catch {
  report = null;
}

console.log('');
console.log('Auto-check loop status: checks failed.');
console.log('Next loop action for agent/human:');
console.log('1. Open docs/workbench/latest-report.json.');
console.log('2. Fix only the failed check scope.');
console.log('3. If src/pages or src/components changed, confirm the change preserves visual style.');
console.log('4. Rerun npm run workbench:loop.');

if (report?.checks) {
  const failed = report.checks.filter((check) => !check.ok);
  console.log('');
  console.log('Failed checks:');
  failed.forEach((check) => {
    console.log(`- ${check.name}${check.detail ? `: ${check.detail}` : ''}`);
  });
}

process.exit(code);

