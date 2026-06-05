/**
 * @file Syntax builder — semantic palette → TextMate `tokenColors`.
 *
 * Emits the grammar-driven highlighting rules. The colour assignments enact the
 * "two-channel" philosophy from `semantics.mjs`: a small harmonic hue set marks
 * structural categories while the mass of code rests near the foreground.
 *
 * Font styles are used sparingly and meaningfully — italics for "this is not
 * program logic" (comments, params, types-as-annotation), never for decoration.
 */

import { hex } from '../color/hsl.mjs';

/**
 * @typedef {Object} TokenRule
 * @property {string} [name]
 * @property {string|string[]} scope
 * @property {{ foreground?: string, fontStyle?: string }} settings
 */

/**
 * @param {import('../design/semantics.mjs').Palette} p
 * @returns {TokenRule[]}
 */
export const buildSyntax = (p) => {
  const { syn } = p;
  const fg = hex;
  /** @type {(name: string, scope: string|string[], color: import('../color/hsl.mjs').Hsl, fontStyle?: string) => TokenRule} */
  const rule = (name, scope, color, fontStyle) => ({
    name,
    scope,
    settings: fontStyle
      ? { foreground: fg(color), fontStyle }
      : { foreground: fg(color) },
  });

  return [
    // ── Comments — recessive, italic, the quietest thing on screen ────────
    rule('Comment', ['comment', 'punctuation.definition.comment', 'string.comment'], syn.comment, 'italic'),
    rule('Comment: doc keyword', ['storage.type.class.jsdoc', 'punctuation.definition.block.tag.jsdoc'], syn.comment, 'italic'),
    rule('Comment: doc type', ['comment.block.documentation entity.name.type', 'comment.block.documentation entity.name'], syn.type, 'italic'),

    // ── Identifiers & plumbing — held near the foreground (low noise) ─────
    rule('Variable', ['variable', 'meta.definition.variable.name', 'support.variable', 'entity.name.variable'], syn.variable),
    rule('Variable: language (this/self/super)', ['variable.language', 'variable.language.this'], syn.keyword, 'italic'),
    rule('Property / member', ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key', 'support.type.property-name'], syn.property),
    rule('Parameter', ['variable.parameter', 'meta.function.parameters', 'meta.parameter'], syn.parameter, 'italic'),
    rule('Punctuation', ['punctuation', 'meta.brace', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition'], syn.punctuation),
    rule('Operator', ['keyword.operator', 'storage.type.function.arrow', 'keyword.operator.assignment', 'keyword.operator.arithmetic'], syn.operator),
    rule('Punctuation: accessor / delimiter', ['punctuation.accessor', 'meta.delimiter', 'punctuation.separator.key-value'], syn.operator),

    // ── Keywords & structure — the cyberpunk magenta signature ────────────
    rule('Keyword', ['keyword', 'keyword.control', 'punctuation.definition.keyword'], syn.keyword, 'italic'),
    rule('Keyword: control flow', ['keyword.control.flow', 'keyword.control.return', 'keyword.control.conditional', 'keyword.control.loop'], syn.keyword, 'italic'),
    rule('Storage', ['storage', 'storage.type', 'storage.modifier'], syn.storage),
    rule('Keyword: operator (word)', ['keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical', 'keyword.control.new'], syn.keyword),
    rule('Modifier', ['storage.modifier', 'keyword.other.important'], syn.storage),

    // ── Callables — cyan, the "active verbs" of the code ──────────────────
    rule('Function: declaration', ['entity.name.function', 'meta.function-call.generic', 'support.function', 'meta.definition.method entity.name.function'], syn.callable),
    rule('Function: call', ['meta.function-call', 'variable.function', 'entity.name.function.call'], syn.callable),
    rule('Support function (built-in)', ['support.function', 'support.macro'], syn.callable),
    rule('Decorator / annotation', ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator', 'storage.type.annotation', 'meta.annotation'], syn.decorator, 'italic'),

    // ── Types — violet, structural nouns ──────────────────────────────────
    rule('Type', ['entity.name.type', 'support.type', 'entity.name.type.class', 'meta.type.annotation', 'support.class'], syn.type),
    rule('Class', ['entity.name.class', 'entity.other.inherited-class', 'support.class.builtin'], syn.type),
    rule('Interface / enum / struct', ['entity.name.type.interface', 'entity.name.type.enum', 'entity.name.type.struct'], syn.type),
    rule('Namespace / module', ['entity.name.namespace', 'entity.name.module', 'storage.modifier.namespace'], syn.type),
    rule('Type: primitive / builtin', ['support.type.primitive', 'support.type.builtin', 'keyword.type'], syn.type),
    rule('Generic / type parameter', ['entity.name.type.parameter', 'meta.type.parameters'], syn.type),

    // ── Literals — amber, the data payload ────────────────────────────────
    rule('String', ['string', 'string.quoted', 'punctuation.definition.string'], syn.string),
    rule('String: template / interpolated', ['string.template', 'string.interpolated'], syn.stringAlt),
    rule('String: template expression delimiters', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], syn.keyword),
    rule('String: escape', ['constant.character.escape', 'constant.other.placeholder'], syn.escape),
    rule('Regular expression', ['string.regexp', 'punctuation.definition.string.regexp'], syn.regexp),
    rule('Regexp: character class / group', ['keyword.control.anchor.regexp', 'punctuation.definition.group.regexp', 'keyword.operator.quantifier.regexp'], syn.escape),
    rule('Number', ['constant.numeric', 'constant.numeric.integer', 'constant.numeric.float'], syn.number),
    rule('Boolean / null', ['constant.language.boolean', 'constant.language.null', 'constant.language.undefined', 'constant.language.nan'], syn.constant),
    rule('Constant', ['constant.language', 'constant.other', 'support.constant', 'variable.other.constant'], syn.constant),
    rule('Character', ['constant.character', 'string.quoted.single constant.character'], syn.constant),

    // ── Markup: HTML / JSX / XML ──────────────────────────────────────────
    rule('Tag', ['entity.name.tag', 'punctuation.definition.tag'], syn.tag),
    rule('Tag: component (Capitalised)', ['support.class.component', 'entity.name.tag.jsx.component', 'entity.name.tag.namespace'], syn.type),
    rule('Attribute name', ['entity.other.attribute-name', 'meta.attribute'], syn.attribute, 'italic'),
    rule('Attribute: id / class selectors', ['entity.other.attribute-name.id', 'entity.other.attribute-name.class.css'], syn.constant),

    // ── CSS / SCSS / LESS ─────────────────────────────────────────────────
    rule('CSS: property', ['support.type.property-name.css', 'support.type.property-name.scss'], syn.property),
    rule('CSS: value / unit', ['support.constant.property-value', 'keyword.other.unit'], syn.constant),
    rule('CSS: selector', ['entity.name.tag.css', 'meta.selector'], syn.keyword),
    rule('CSS: pseudo-class', ['entity.other.attribute-name.pseudo-class', 'entity.other.attribute-name.pseudo-element'], syn.callable),
    rule('CSS: at-rule / function', ['keyword.control.at-rule', 'support.function.misc.css'], syn.keyword),
    rule('CSS: colour / hex', ['constant.other.color', 'constant.other.color.rgb-value'], syn.number),

    // ── Markdown / prose ──────────────────────────────────────────────────
    rule('Markup: heading', ['markup.heading', 'entity.name.section.markdown', 'punctuation.definition.heading.markdown'], syn.callable, 'bold'),
    rule('Markup: bold', ['markup.bold', 'punctuation.definition.bold'], syn.number, 'bold'),
    rule('Markup: italic', ['markup.italic', 'punctuation.definition.italic'], syn.type, 'italic'),
    rule('Markup: quote', ['markup.quote', 'punctuation.definition.quote.begin.markdown'], syn.comment, 'italic'),
    rule('Markup: inline code', ['markup.inline.raw', 'markup.fenced_code', 'text.html.markdown markup.raw'], syn.string),
    rule('Markup: link text', ['markup.underline.link', 'string.other.link', 'constant.other.reference.link.markdown'], syn.link, 'underline'),
    rule('Markup: list punctuation', ['punctuation.definition.list.begin.markdown', 'markup.list'], syn.keyword),
    rule('Markup: separator / rule', ['meta.separator.markdown', 'punctuation.definition.thematic-break'], syn.punctuation),
    rule('Markup: inserted', ['markup.inserted', 'punctuation.definition.inserted'], p.vcs.added),
    rule('Markup: deleted', ['markup.deleted', 'punctuation.definition.deleted'], p.vcs.deleted),
    rule('Markup: changed', ['markup.changed', 'punctuation.definition.changed'], p.vcs.modified),

    // ── Data formats: JSON / YAML / TOML ──────────────────────────────────
    rule('JSON / YAML key', ['support.type.property-name.json', 'support.type.property-name.toml', 'entity.name.tag.yaml'], syn.property),
    rule('YAML: anchor / alias', ['variable.other.alias.yaml', 'punctuation.definition.anchor.yaml', 'entity.name.type.anchor.yaml'], syn.type),

    // ── Diagnostics in source ─────────────────────────────────────────────
    rule('Invalid / deprecated', ['invalid', 'invalid.illegal'], syn.invalid),
    rule('Invalid: deprecated', ['invalid.deprecated'], syn.comment, 'strikethrough'),

    // ── Language-specific touches ─────────────────────────────────────────
    rule('Python: self/cls', ['variable.parameter.function.language.special.self.python', 'variable.language.special.self.python'], syn.keyword, 'italic'),
    rule('Python: decorator', ['entity.name.function.decorator.python', 'meta.function.decorator.python'], syn.decorator, 'italic'),
    rule('Rust: lifetime', ['storage.modifier.lifetime.rust', 'entity.name.lifetime.rust'], syn.constant, 'italic'),
    rule('Go: package', ['entity.name.package.go', 'keyword.package.go'], syn.type),
    rule('Shell: variable', ['variable.other.normal.shell', 'punctuation.definition.variable.shell'], syn.property),
    rule('GraphQL: field', ['meta.selectionset.graphql variable.graphql', 'entity.name.fragment.graphql'], syn.property),
    rule('Embedded punctuation', ['punctuation.section.embedded.begin', 'punctuation.section.embedded.end'], syn.operator),
  ];
};
