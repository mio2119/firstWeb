import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'docs', 'workbench', 'minimal-demo-config.json');
const manifestPath = path.join(root, 'docs', 'workbench', 'minimal-demo-style-baseline.json');
const watchedRoots = ['src/pages', 'src/components'];

const toPosix = (value) => value.replace(/\\/g, '/');

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const walk = async (relativeDir) => {
  const fullDir = path.join(root, relativeDir);
  if (!(await exists(fullDir))) return [];

  const entries = await fs.readdir(fullDir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) return walk(relativePath);
    return relativePath;
  }));

  return nested.flat();
};

const hashFile = async (relativePath) => {
  const raw = await fs.readFile(path.join(root, relativePath));
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const createMinimalDemoManifest = async () => {
  const configRaw = await fs.readFile(configPath, 'utf8');
  const config = JSON.parse(configRaw);
  const files = (await Promise.all(watchedRoots.map(walk)))
    .flat()
    .filter((file) => /\.(tsx?|jsx?)$/.test(file))
    .map(toPosix)
    .sort((a, b) => a.localeCompare(b));

  const entries = {};
  for (const file of files) {
    entries[file] = await hashFile(file);
  }

  return {
    generatedAt: new Date().toISOString(),
    purpose: 'Baseline before the minimal proposal demo changes. Intro must remain unchanged.',
    watchedRoots,
    config,
    entries
  };
};

if (process.argv.includes('--write')) {
  const manifest = await createMinimalDemoManifest();
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${toPosix(path.relative(root, manifestPath))}`);
}
