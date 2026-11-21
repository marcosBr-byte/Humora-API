import { execFile } from 'node:child_process';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, '../../../../target/generated-resources/frontend/css');
const manifestUrl = import.meta.resolve('@tailwindcss/cli/package.json');
const manifest = JSON.parse(await readFile(new URL(manifestUrl), 'utf8'));
const cli = fileURLToPath(new URL(manifest.bin.tailwindcss, manifestUrl));
const pages = ['index', 'login', 'cadastroAluno', 'aluno', 'professor', 'fect'];

await mkdir(output, { recursive: true });
await Promise.all(pages.map(async page => {
  try {
    await run(process.execPath, [cli, '--input', `styles/pages/${page}.css`,
      '--output', resolve(output, `${page}.css`), '--minify'], { cwd: root });
    console.log(`Tailwind: ${page}.css`);
  } catch (error) {
    throw new Error(`Falha ao compilar ${page}.css\n${error.stderr || error.message}`, { cause: error });
  }
}));

const vendor = resolve(output, '../vendor');
await mkdir(vendor, { recursive: true });
await copyFile(resolve(root, 'node_modules/chart.js/dist/chart.umd.min.js'), resolve(vendor, 'chart.js'));
