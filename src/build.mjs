/**
 * @file Build runner — the compiler entry point.
 *
 * Turns the declarative variant matrix into shippable artifacts:
 *   1. writes one `themes/<slug>.json` per variant, and
 *   2. rewrites `package.json` → `contributes.themes` to match, so the manifest
 *      can never drift from the matrix.
 *
 * It then runs the ergonomic audit and refuses to "succeed" if any variant
 * leaves the comfort envelope. Zero runtime dependencies: just Node + the design
 * system in `src/`.
 *
 * Usage:  node src/build.mjs        (build + audit)
 *         node src/build.mjs --check (verify generated files are up to date)
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { variants } from './variants.mjs';
import { assemble } from './theme/assemble.mjs';
import { auditAll } from './audit.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEMES_DIR = join(ROOT, 'themes');
const PKG_PATH = join(ROOT, 'package.json');

const isCheck = process.argv.includes('--check');

/** Serialise a theme document with stable, human-diffable formatting. */
const serialize = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

/**
 * Build the `contributes.themes` array from the variant matrix.
 * @returns {Array<{label:string, uiTheme:string, path:string}>}
 */
const buildContributions = () =>
  variants.map((v) => ({
    label: v.name,
    uiTheme: v.depth.mode === 'light' ? 'vs' : 'vs-dark',
    path: `./themes/${v.slug}.json`,
  }));

async function main() {
  const writes = [];
  const generated = new Map();

  // 1. Assemble every variant.
  for (const v of variants) {
    const { theme } = assemble(v);
    generated.set(join(THEMES_DIR, `${v.slug}.json`), serialize(theme));
  }

  // 2. Sync the manifest's theme contributions to the matrix.
  const pkg = JSON.parse(await readFile(PKG_PATH, 'utf8'));
  pkg.contributes = pkg.contributes ?? {};
  pkg.contributes.themes = buildContributions();
  const pkgOut = serialize(pkg);

  if (isCheck) {
    // Verify mode: confirm on-disk artifacts match what we'd generate.
    let drift = false;
    for (const [path, content] of generated) {
      const current = await readFile(path, 'utf8').catch(() => null);
      if (current !== content) {
        drift = true;
        process.stderr.write(`  ✗ stale: ${path.replace(ROOT, '.')}\n`);
      }
    }
    const currentPkg = await readFile(PKG_PATH, 'utf8');
    if (currentPkg !== pkgOut) {
      drift = true;
      process.stderr.write('  ✗ stale: ./package.json (contributes.themes)\n');
    }
    if (drift) {
      process.stderr.write('\nGenerated files are out of date. Run `npm run build`.\n');
      process.exit(1);
    }
    process.stdout.write('All generated artifacts are up to date.\n');
    return;
  }

  // 3. Write everything.
  await mkdir(THEMES_DIR, { recursive: true });
  for (const [path, content] of generated) {
    writes.push(writeFile(path, content));
  }
  writes.push(writeFile(PKG_PATH, pkgOut));
  await Promise.all(writes);

  process.stdout.write(`Built ${generated.size} theme${generated.size === 1 ? '' : 's'} → ./themes/\n`);
  for (const v of variants) process.stdout.write(`  • ${v.name}\n`);

  // 4. Enforce the ergonomic contract.
  const { ok, report } = auditAll();
  if (!ok) {
    process.stderr.write(`\nErgonomic audit FAILED:${report}\n`);
    process.exit(1);
  }
  process.stdout.write('\nErgonomic audit passed — all variants within the comfort envelope.\n');
}

main().catch((err) => {
  process.stderr.write(`Build failed: ${err.stack ?? err}\n`);
  process.exit(1);
});
