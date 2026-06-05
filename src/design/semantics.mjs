/**
 * @file The semantic layer — the single source of truth.
 *
 * `resolve(depth, accent)` composes the two matrix axes into one fully-realised
 * `Palette`: every neutral, every chrome accent, and the complete code-token
 * spectrum, each expressed as an `Hsl` so later stages can still tint and blend.
 *
 * This is the *only* place that decides "what colour means what". The workbench
 * and syntax builders consume these named roles and never invent colours of
 * their own — so a palette change here propagates everywhere, consistently.
 *
 * ── Code-colour philosophy (cognitive load reduction) ───────────────────────
 * Conventional themes assign a distinct, saturated hue to every token class,
 * producing a "rainbow" the eye must constantly re-parse. We instead encode
 * structure on two low-effort channels:
 *
 *   1. Hue carries *category*, using a small, harmonically-related set:
 *        magenta → keywords/structure   cyan → callables
 *        violet  → types                 mint → strings
 *        amber   → literals/constants    neutral → identifiers & plumbing
 *   2. The bulk of code — variables, properties, punctuation — stays near the
 *      neutral foreground. Only the load-bearing tokens carry chroma, so the
 *      eye locks onto structure instead of swimming in colour.
 *
 * All token hues are emitted at the depth's calibrated lightness/saturation
 * budget, so "muted" is enforced by construction rather than by discipline.
 */

import { hsl, lighten, saturate, desaturate, mix } from '../color/hsl.mjs';

/**
 * Resolve a neutral role to its concrete colour on a given depth.
 * @param {import('./depths.mjs').Depth} depth
 * @param {import('./depths.mjs').NeutralRole} role
 * @returns {import('../color/hsl.mjs').Hsl}
 */
const neutral = (depth, role) => hsl(depth.hue, depth.sat, depth.ramp[role]);

/**
 * Build a code-token colour at the depth's syntax budget, with per-hue offsets.
 * Offsets exist because equal HSL numbers are not equally *legible*: blue reads
 * dark, amber reads light. The offsets equalise perceived weight across hues.
 * @param {import('./depths.mjs').Depth} depth
 * @param {number} hue
 * @param {{ dl?: number, ds?: number }} [tune]
 * @returns {import('../color/hsl.mjs').Hsl}
 */
const token = (depth, hue, { dl = 0, ds = 0 } = {}) =>
  hsl(hue, depth.syntax.s + ds, depth.syntax.l + dl);

/**
 * The fully-resolved palette consumed by every builder.
 * @typedef {ReturnType<typeof resolve>} Palette
 */

/**
 * Compose a depth (canvas mood) and an accent (chrome signature) into a
 * complete, named colour palette.
 * @param {import('./depths.mjs').Depth} depth
 * @param {import('./accents.mjs').Accent} accent
 */
export const resolve = (depth, accent) => {
  const N = /** @param {import('./depths.mjs').NeutralRole} r */ (r) => neutral(depth, r);
  const isLight = depth.mode === 'light';

  // Direction of "more prominent": toward white on dark canvases, toward black
  // on light ones. Lets shade derivations stay mode-agnostic below.
  const toward = isLight ? -1 : 1;

  // ── Chrome accent (the interactive signature) ──────────────────────────────
  const accentBase = hsl(accent.hue, depth.accent.s + (accent.satBias ?? 0), depth.accent.l);
  const supportBase = hsl(accent.support, depth.accent.s + (accent.satBias ?? 0) - 4, depth.accent.l);

  const a = {
    base: accentBase,
    bright: lighten(saturate(accentBase, 6), 8 * toward),
    dim: lighten(desaturate(accentBase, 8), -16 * toward),
    support: supportBase,
    /** Translucent wash for selections/active rows — tints, never paints over. */
    wash: accentBase,
    /** A foreground that sits legibly on a filled accent button. */
    on: isLight ? N('canvas') : hsl(depth.hue, depth.sat + 6, 8),
  };

  /**
   * Pull a colour a fraction of the way toward the accent. This is the engine
   * of variant identity: the "connective tissue" of code (identifiers,
   * operators, punctuation) is washed toward the accent hue, so each accent
   * produces a visibly distinct editor *temperature* — Aqua reads cyan, Orchid
   * magenta — rather than four chrome-only reskins of the same grey page.
   * @param {import('../color/hsl.mjs').Hsl} color @param {number} t
   */
  const lean = (color, t) => mix(color, accentBase, t);

  // ── Code-token spectrum ────────────────────────────────────────────────────
  // Hue carries category (magenta→keywords, cyan→callables, violet→types,
  // green→strings, amber→literals). Unlike the first cut, *every* class now
  // carries real chroma — calm is achieved by harmonising and budgeting
  // saturation, not by draining it. The bulk tokens are accent-washed so the
  // page has a coherent temperature instead of reading as grey.
  const syn = {
    comment: lean(desaturate(N('muted'), depth.sat * 0.2), 0.05),
    keyword: token(depth, accent.hue === 322 ? 318 : 322, { dl: -1, ds: 8 }), // magenta
    storage: token(depth, 320, { dl: -1, ds: 4 }),
    callable: token(depth, 196, { dl: 2, ds: 6 }),                     // cyan
    type: token(depth, 264, { dl: 7, ds: 0 }),                         // violet
    string: token(depth, 150, { dl: -2, ds: 0 }),                      // green
    stringAlt: token(depth, 166, { dl: -3, ds: -4 }),
    number: token(depth, 32, { dl: -3, ds: 10 }),                      // amber
    constant: token(depth, 28, { dl: -1, ds: 8 }),
    /** Identifiers — kept light for low fatigue, but washed toward the accent. */
    variable: lean(lighten(N('text'), 1 * toward), 0.18),
    property: lean(token(depth, 200, { dl: 6, ds: -10 }), 0.1),        // blue, accent-leant
    parameter: token(depth, 22, { dl: 3, ds: -8 }),                    // peach, italic
    operator: lean(N('subtle'), 0.45),                                 // accent-tinted glue
    punctuation: lean(N('ui'), 0.4),                                   // accent-tinted glue
    tag: token(depth, 348, { dl: 0, ds: 6 }),                          // rose
    attribute: token(depth, 34, { dl: 4, ds: -4 }),                    // amber
    regexp: token(depth, 166, { dl: -2, ds: 6 }),
    escape: token(depth, 34, { dl: 3, ds: 12 }),
    decorator: lean(token(depth, 196, { dl: 2, ds: -2 }), 0.15),
    link: accentBase,
    invalid: token(depth, 6, { dl: 0, ds: 28 }),
  };

  // ── Diagnostics & VCS (carry a touch more chroma to read as status) ─────────
  const status = {
    error: hsl(6, depth.syntax.s + 24, depth.syntax.l + (isLight ? -2 : -2)),
    warning: hsl(40, depth.syntax.s + 22, depth.syntax.l - 4),
    info: hsl(205, depth.syntax.s + 14, depth.syntax.l + 2),
    hint: N('muted'),
    ok: hsl(150, depth.syntax.s + 16, depth.syntax.l - 2),
  };

  const vcs = {
    added: status.ok,
    modified: hsl(205, depth.syntax.s + 12, depth.syntax.l),
    deleted: status.error,
    untracked: status.ok,
    ignored: N('ui'),
    conflict: status.warning,
    renamed: status.info,
  };

  return {
    mode: depth.mode,
    isLight,
    depth,
    accent,
    /** Neutral substrate, addressable by role name. */
    n: /** @type {Record<import('./depths.mjs').NeutralRole, import('../color/hsl.mjs').Hsl>} */ (
      Object.fromEntries(Object.keys(depth.ramp).map((r) => [r, N(/** @type {any} */(r))]))
    ),
    a,
    syn,
    status,
    vcs,
    /** A neutral pulled toward the accent — for subtle tinted surfaces. */
    tinted: (role, amount = 0.12) => mix(N(role), accentBase, amount),
  };
};
