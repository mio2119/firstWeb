import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createManifest } from './workbench-manifest.mjs';

const root = process.cwd();
const reportPath = path.join(root, 'docs', 'workbench', 'latest-report.json');
const manifestPath = path.join(root, 'docs', 'workbench', 'frontend-style-manifest.json');

const checks = [];

const toPosix = (value) => value.replace(/\\/g, '/');

const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};

const run = (command, args, options = {}) => new Promise((resolve) => {
  const child = spawn(command, args, {
    cwd: root,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });

  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  child.on('close', (code) => {
    resolve({ code, stdout, stderr });
  });
  child.on('error', (error) => {
    resolve({ code: 1, stdout, stderr: error.message });
  });
});

const addCheck = (name, ok, detail = '') => {
  checks.push({ name, ok, detail });
  const marker = ok ? 'PASS' : 'FAIL';
  console.log(`[${marker}] ${name}${detail ? ` - ${detail}` : ''}`);
};

const verifyRequiredFiles = async () => {
  const required = [
    'docs/fullstack-workbench.md',
    'docs/workbench/README.md',
    'docs/workbench/check-loop.md',
    '.agents/README.md',
    '.codex/workbench-memory.md',
    '.env.example',
    'backend/README.md',
    'backend/requirements.txt',
    'backend/node_server.mjs',
    'backend/app/main.py',
    'src/services/apiClient.ts',
    'src/data/profile/chinaLocations.ts',
    'scripts/workbench-manifest.mjs',
    'scripts/workbench-verify.mjs',
    'scripts/workbench-loop.mjs',
    'scripts/run-vite-build.mjs',
    'run_backend.bat',
    'run_fastapi_backend.bat',
  ];

  for (const file of required) {
    addCheck(`required file: ${file}`, await exists(file));
  }
};

const verifyStyleManifest = async () => {
  if (!(await exists('docs/workbench/frontend-style-manifest.json'))) {
    addCheck('frontend style manifest', false, 'missing, run npm run workbench:manifest');
    return;
  }

  const baseline = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const current = await createManifest();
  const changed = [];

  const allFiles = new Set([...Object.keys(baseline.entries || {}), ...Object.keys(current.entries || {})]);
  for (const file of allFiles) {
    if (baseline.entries?.[file] !== current.entries?.[file]) changed.push(file);
  }

  addCheck('frontend style manifest unchanged', changed.length === 0, changed.length ? changed.join(', ') : '');
};

const verifyViteProxy = async () => {
  const vite = await fs.readFile(path.join(root, 'vite.config.ts'), 'utf8');
  addCheck('vite /api proxy configured', vite.includes("'/api'") && vite.includes('127.0.0.1:8000'));
};

const verifyProfileLocationData = async () => {
  const source = await fs.readFile(path.join(root, 'src/data/profile/chinaLocations.ts'), 'utf8');
  const provinceCount = (source.match(/province: '/g) || []).length;
  const requiredProvinces = ['北京', '上海', '广东', '浙江', '湖北', '四川', '江苏', '西藏', '香港', '澳门', '台湾'];
  const requiredCities = ['广州', '深圳', '杭州', '武汉', '成都', '南京', '拉萨', '香港', '澳门', '台北'];
  const missing = [...requiredProvinces, ...requiredCities].filter((name) => !source.includes(`'${name}'`));
  addCheck(
    'profile province/city options complete',
    provinceCount >= 34 && missing.length === 0,
    missing.length ? `missing: ${missing.join(', ')}` : `${provinceCount} province-level groups`
  );
};

const verifyBackendSyntax = async () => {
  const result = await run('python', ['-m', 'compileall', '-q', 'backend/app']);
  addCheck('backend python syntax', result.code === 0, result.stderr.trim() || result.stdout.trim());

  const nodeResult = await run('node', ['--check', 'backend/node_server.mjs']);
  addCheck('backend node syntax', nodeResult.code === 0, nodeResult.stderr.trim() || nodeResult.stdout.trim());
};

const verifyNodeBackendSmoke = async () => {
  const smokePort = '8099';
  const smokeStateFile = path.join(root, 'backend', 'runtime', 'workbench-smoke-state.json');
  await fs.rm(smokeStateFile, { force: true });

  const child = spawn('node', ['backend/node_server.mjs'], {
    cwd: root,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, BACKEND_PORT: smokePort, BACKEND_STATE_FILE: smokeStateFile },
  });

  const baseUrl = `http://127.0.0.1:${smokePort}`;
  const endpoints = [
    '/api/health',
    '/api/workbench',
    '/api/data/admissions/index_universities.json',
    '/api/universities',
    '/api/careers',
    '/api/quiz/questions',
  ];
  let detail = '';
  let ok = false;

  try {
    for (let attempt = 0; attempt < 25; attempt += 1) {
      try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 120));
      }
    }

    const results = [];
    for (const endpoint of endpoints) {
      const response = await fetch(`${baseUrl}${endpoint}`);
      results.push(`${endpoint}:${response.status}`);
    }

    const postResults = [];
    const quizResponse = await fetch(`${baseUrl}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { 1: 5, 2: 4, 3: 3 } }),
    });
    postResults.push(`/api/quiz/submit:${quizResponse.status}`);

    const chatResponse = await fetch(`${baseUrl}/api/qa/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '广东 620 分能报什么学校', context: {} }),
    });
    postResults.push(`/api/qa/chat:${chatResponse.status}`);
    const chatPayload = chatResponse.ok ? await chatResponse.json() : {};
    const chatMatchesAdmissions =
      chatPayload.intentId === 'admissions_plan' &&
      chatPayload.slots?.score === '620' &&
      chatPayload.slots?.province === '广东' &&
      Array.isArray(chatPayload.blocks) &&
      chatPayload.blocks.length > 0;
    postResults.push(`/api/qa/chat:intent:${chatMatchesAdmissions ? 200 : 500}`);

    const profileResponse = await fetch(`${baseUrl}/api/state/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Workbench',
        avatar: 'WB',
        province: '广东',
        score: 620,
        targetCity: '广州',
        interestTags: [],
        completeness: 100,
        intro_seen: true,
      }),
    });
    postResults.push(`/api/state/profile:${profileResponse.status}`);

    const replacePlanResponse = await fetch(`${baseUrl}/api/plans`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          id: 'smoke-plan',
          uniId: 'smoke-university',
          universityName: '工作台大学',
          logo_char: '工',
          strategyType: 'stable',
          addedDate: '2026-06-05',
        },
      ]),
    });
    postResults.push(`/api/plans:PUT:${replacePlanResponse.status}`);

    const deletePlanResponse = await fetch(`${baseUrl}/api/plans/smoke-university`, {
      method: 'DELETE',
    });
    postResults.push(`/api/plans/{id}:DELETE:${deletePlanResponse.status}`);

    results.push(...postResults);
    ok = results.every((item) => item.endsWith(':200'));
    detail = results.join(', ');
  } catch (error) {
    detail = error instanceof Error ? error.message : 'unknown smoke-test error';
  } finally {
    child.kill();
    await fs.rm(smokeStateFile, { force: true });
  }

  addCheck('backend node smoke', ok, detail);
};

const verifyData = async () => {
  const result = await run('node', ['scripts/validate-data.mjs']);
  addCheck('data validation script', result.code === 0, result.stderr.trim() || result.stdout.trim());
};

const verifyTypes = async () => {
  const command = process.platform === 'win32' ? 'cmd' : 'npx';
  const args = process.platform === 'win32' ? ['/c', 'npx', 'tsc', '--noEmit'] : ['tsc', '--noEmit'];
  const result = await run(command, args);
  addCheck('typescript type check', result.code === 0, (result.stderr || result.stdout).trim().slice(-600));
};

const verifyBuild = async () => {
  const command = process.platform === 'win32' ? 'cmd' : 'npm';
  const args = process.platform === 'win32' ? ['/c', 'npm', 'run', 'build'] : ['run', 'build'];
  const result = await run(command, args);
  addCheck('frontend production build', result.code === 0, (result.stderr || result.stdout).trim().slice(-600));
};

await verifyRequiredFiles();
await verifyStyleManifest();
await verifyViteProxy();
await verifyProfileLocationData();
await verifyBackendSyntax();
await verifyNodeBackendSmoke();
await verifyData();
await verifyTypes();
await verifyBuild();

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((check) => check.ok),
  checks,
  nextAction: checks.every((check) => check.ok)
    ? 'Workbench checks passed. Continue implementation in the next planned slice.'
    : 'Fix failing checks, then rerun npm run workbench:verify.',
};

await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (!report.ok) {
  console.error(`Workbench verification failed. See ${toPosix(path.relative(root, reportPath))}`);
  process.exit(1);
}

console.log(`Workbench verification passed. Report: ${toPosix(path.relative(root, reportPath))}`);
