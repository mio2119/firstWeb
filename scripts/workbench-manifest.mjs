import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'docs', 'workbench', 'frontend-style-manifest.json');
const watchedRoots = ['src/pages', 'src/components'];

const toPosix = (value) => value.replace(/\\/g, '/');

const walk = async (dir) => {
  const fullDir = path.join(root, dir);
  const entries = await fs.readdir(fullDir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(rel);
    return rel;
  }));
  return files.flat();
};

const hashFile = async (relativePath) => {
  const raw = await fs.readFile(path.join(root, relativePath));
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const createManifest = async () => {
  const files = (await Promise.all(watchedRoots.map(walk)))
    .flat()
    .filter((file) => /\.(tsx?|jsx?)$/.test(file))
    .sort((a, b) => a.localeCompare(b));

  const entries = {};
  for (const file of files) {
    entries[toPosix(file)] = await hashFile(file);
  }

  return {
    generatedAt: new Date().toISOString(),
    purpose: 'Protect existing frontend visual style while backend workbench evolves.',
    watchedRoots,
    entries,
  };
};

if (process.argv.includes('--write')) {
  const manifest = await createManifest();
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${toPosix(path.relative(root, manifestPath))}`);
}

