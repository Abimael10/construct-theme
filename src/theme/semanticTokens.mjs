/**
 * @file Semantic-token builder — palette → `semanticTokenColors`.
 *
 * The Language Server semantic-token layer refines the TextMate grammar with
 * resolver-grade knowledge (e.g. "this identifier is actually a readonly
 * parameter"). We keep these in lock-step with the TextMate rules so enabling
 * `editor.semanticHighlighting` sharpens the picture without shifting the
 * overall colour identity — continuity over novelty, which is what keeps the
 * field calm.
 */

import { hex } from '../color/hsl.mjs';

/**
 * @param {import('../design/semantics.mjs').Palette} p
 * @returns {Record<string, string | { foreground?: string, fontStyle?: string }>}
 */
export const buildSemanticTokens = (p) => {
  const { syn } = p;
  const fg = hex;
  return {
    'enabled': true,

    // Identifiers
    variable: fg(syn.variable),
    'variable.readonly': fg(syn.constant),
    'variable.defaultLibrary': { foreground: fg(syn.constant) },
    parameter: { foreground: fg(syn.parameter), fontStyle: 'italic' },
    property: fg(syn.property),
    'property.readonly': fg(syn.constant),
    'variable.declaration': fg(syn.variable),

    // Callables
    function: fg(syn.callable),
    'function.defaultLibrary': fg(syn.callable),
    method: fg(syn.callable),
    'method.defaultLibrary': fg(syn.callable),
    macro: fg(syn.decorator),
    decorator: { foreground: fg(syn.decorator), fontStyle: 'italic' },

    // Types
    type: fg(syn.type),
    'type.defaultLibrary': fg(syn.type),
    class: fg(syn.type),
    'class.defaultLibrary': fg(syn.type),
    interface: fg(syn.type),
    enum: fg(syn.type),
    enumMember: fg(syn.constant),
    struct: fg(syn.type),
    typeParameter: { foreground: fg(syn.type), fontStyle: 'italic' },
    namespace: fg(syn.type),

    // Keywords & literals
    keyword: fg(syn.keyword),
    modifier: fg(syn.storage),
    string: fg(syn.string),
    number: fg(syn.number),
    regexp: fg(syn.regexp),
    operator: fg(syn.operator),

    // Markup
    'variable.label': fg(syn.constant),
    selfKeyword: { foreground: fg(syn.keyword), fontStyle: 'italic' },
    builtinConstant: fg(syn.constant),

    // Mutability / deprecation cues are conveyed by style, not new colours.
    '*.deprecated': { fontStyle: 'strikethrough' },
  };
};
