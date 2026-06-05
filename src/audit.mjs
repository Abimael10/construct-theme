/**
 * @file Ergonomic contrast audit.
 *
 * "Low-contrast and easy on the eyes" is a measurable claim, so we measure it.
 * For every variant this checks that:
 *
 *   • body text clears the readability floor against the editor canvas, yet
 *   • the *brightest* element stays under a comfort ceiling — the defining
 *     trait of The Construct is that nothing on screen is harsh, so we fail
 *     loud if a colour creeps past the glare threshold.
 *
 * It is run as part of `build` (and standalone via `npm run audit`) so a careless
 * palette edit cannot silently betray the ergonomic contract.
 */

import { contrastRatio } from './color/hsl.mjs';
import { resolve } from './design/semantics.mjs';
import { variants } from './variants.mjs';

/** Body text must stay at or above this ratio to remain comfortably legible. */
const READABILITY_FLOOR = 4.0;
/** No foreground may exceed this ratio against the canvas — the anti-glare cap. */
const COMFORT_CEILING = 15.5;

/**
 * Audit a single resolved palette.
 * @param {import('./design/semantics.mjs').Palette} p
 * @returns {{ checks: Array<{label:string, ratio:number, pass:boolean, note:string}>, ok: boolean }}
 */
const auditPalette = (p) => {
  const canvas = p.n.canvas;
  /** @type {Array<{label:string, ratio:number, pass:boolean, note:string}>} */
  const checks = [];

  const floor = (label, color) => {
    const ratio = contrastRatio(color, canvas);
    checks.push({ label, ratio, pass: ratio >= READABILITY_FLOOR, note: `≥ ${READABILITY_FLOOR}` });
  };
  const ceiling = (label, color) => {
    const ratio = contrastRatio(color, canvas);
    checks.push({ label, ratio, pass: ratio <= COMFORT_CEILING, note: `≤ ${COMFORT_CEILING}` });
  };

  // Readability floor for the load-bearing reading surfaces.
  floor('body text', p.n.text);
  floor('keywords', p.syn.keyword);
  floor('strings', p.syn.string);
  floor('functions', p.syn.callable);
  floor('types', p.syn.type);
  floor('numbers', p.syn.number);

  // Anti-glare ceiling for the brightest things we paint.
  ceiling('emphasised text', p.n.textHi);
  ceiling('cursor / bright accent', p.a.bright);

  return { checks, ok: checks.every((c) => c.pass) };
};

/**
 * Audit every shipped variant.
 * @returns {{ ok: boolean, report: string }}
 */
export const auditAll = () => {
  let ok = true;
  const lines = [];
  for (const v of variants) {
    const palette = resolve(v.depth, v.accent);
    const { checks, ok: variantOk } = auditPalette(palette);
    ok = ok && variantOk;
    lines.push(`\n  ${variantOk ? '✓' : '✗'} ${v.name}`);
    for (const c of checks) {
      if (!c.pass) lines.push(`      ✗ ${c.label}: ${c.ratio} (want ${c.note})`);
    }
  }
  return { ok, report: lines.join('\n') };
};

// Allow `node src/audit.mjs` as a standalone check.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { ok, report } = auditAll();
  process.stdout.write(`Construct ergonomic audit:${report}\n`);
  process.stdout.write(ok ? '\nAll variants within comfort envelope.\n' : '\nAudit failed.\n');
  process.exit(ok ? 0 : 1);
}
