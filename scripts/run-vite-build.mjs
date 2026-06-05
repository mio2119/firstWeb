import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const bundledNode = path.join(
  os.homedir(),
  '.cache',
  'codex-runtimes',
  'codex-primary-runtime',
  'dependencies',
  'node',
  'bin',
  process.platform === 'win32' ? 'node.exe' : 'node'
);

const nodeBin = fs.existsSync(bundledNode) ? bundledNode : process.execPath;

const child = spawn(nodeBin, [viteCli, 'build', '--configLoader', 'native'], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

