/**
 * @file Terminal palette preview.
 *
 * Renders each variant's core palette as truecolor swatches in the terminal, so
 * a maintainer can eyeball a colour change without launching VS Code. Pure
 * inspection aid — it writes nothing.
 *
 * Usage:  node src/preview.mjs            (all variants)
 *         node src/preview.mjs midnight   (filter by depth or accent id)
 */

import { hex, luminance } from './color/hsl.mjs';
import { resolve } from './design/semantics.mjs';
import { variants } from './variants.mjs';

const filter = process.argv[2];

/** True-colour background swatch with auto-picked legible label text. */
const swatch = (label, color) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex(color).slice(i, i + 2), 16));
  const ink = luminance(color) > 0.4 ? '0;0;0' : '235;235;235';
  return `\x1b[48;2;${r};${g};${b}m\x1b[38;2;${ink}m ${label} \x1b[0m`;
};

const shown = variants.filter(
  (v) => !filter || v.depth.id === filter || v.accent.id === filter,
);

for (const v of shown) {
  const p = resolve(v.depth, v.accent);
  process.stdout.write(`\n  ${v.name}\n  `);
  process.stdout.write(
    [
      swatch('canvas', p.n.canvas),
      swatch('surface', p.n.surface),
      swatch('text', p.n.text),
      swatch('accent', p.a.base),
    ].join(' ') + '\n  ',
  );
  process.stdout.write(
    [
      swatch('key', p.syn.keyword),
      swatch('fn', p.syn.callable),
      swatch('type', p.syn.type),
      swatch('str', p.syn.string),
      swatch('num', p.syn.number),
      swatch('cmt', p.syn.comment),
    ].join(' ') + '\n  ',
  );
  // The accent-washed "connective tissue" — where variant identity lives.
  process.stdout.write(
    [
      swatch('var', p.syn.variable),
      swatch('prop', p.syn.property),
      swatch('param', p.syn.parameter),
      swatch('op', p.syn.operator),
      swatch('punc', p.syn.punctuation),
    ].join(' ') + '\n',
  );
}
process.stdout.write('\n');
