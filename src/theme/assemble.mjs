/**
 * @file Theme assembler — composes one publishable VS Code theme document.
 *
 * Given a resolved palette, it stitches the workbench, TextMate, and semantic
 * layers into the exact JSON shape VS Code expects from a colour theme file.
 * This is the seam between "design system" and "artifact".
 */

import { resolve } from '../design/semantics.mjs';
import { buildWorkbench } from './workbench.mjs';
import { buildSyntax } from './syntax.mjs';
import { buildSemanticTokens } from './semanticTokens.mjs';

/**
 * @typedef {Object} Variant
 * @property {import('../design/depths.mjs').Depth} depth
 * @property {import('../design/accents.mjs').Accent} accent
 * @property {string} name      Display name shown in the theme picker.
 * @property {string} slug      File-safe identifier (`construct-<depth>-<accent>`).
 */

/**
 * Assemble a complete theme document for a variant.
 * @param {Variant} variant
 * @returns {{ palette: import('../design/semantics.mjs').Palette, theme: object }}
 */
export const assemble = (variant) => {
  const palette = resolve(variant.depth, variant.accent);
  const theme = {
    $schema: 'vscode://schemas/color-theme',
    name: variant.name,
    type: variant.depth.mode,
    semanticHighlighting: true,
    colors: buildWorkbench(palette),
    semanticTokenColors: buildSemanticTokens(palette),
    tokenColors: buildSyntax(palette),
  };
  return { palette, theme };
};
