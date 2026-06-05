/**
 * @file Depth presets — the "canvas moods".
 *
 * A *depth* defines the neutral substrate a theme is painted on and the
 * lightness/saturation budget available to chromatic accents. It is the first
 * axis of the variant matrix (the second is the accent identity).
 *
 * The neutral ramp is declared as an ordered list of lightness stops, named so
 * downstream code reads as design intent ("surface", "border") rather than
 * magic indices. Every depth supplies the *same* set of names, which is the
 * contract the semantic layer relies on.
 *
 * Ergonomics note: none of these depths reach pure black (#000) or pure white
 * (#fff). True extremes maximise contrast against text and are the primary
 * driver of accommodative eye fatigue during long sessions. We keep both ends
 * pulled inward — the whole point of "The Construct".
 */

/**
 * Ordered neutral roles, dark-end → light-end. The semantic layer addresses
 * these by name; the order here is purely documentary.
 * @typedef {(
 *   | 'canvasDeep' | 'canvas' | 'surface' | 'surfaceHi' | 'overlay'
 *   | 'line' | 'border' | 'guide' | 'ui' | 'muted' | 'subtle'
 *   | 'text' | 'textHi'
 * )} NeutralRole
 */

/**
 * @typedef {Object} ChromaBudget
 * @property {number} l Baseline lightness for accent/syntax hues on this canvas.
 * @property {number} s Baseline saturation for accent/syntax hues.
 */

/**
 * @typedef {Object} Depth
 * @property {string} id            Stable slug used in theme/file identifiers.
 * @property {string} label         Human-facing depth name.
 * @property {'dark'|'light'} mode  Drives VS Code `type` + UI affordances.
 * @property {number} hue           Hue of the neutral substrate (the cold tint).
 * @property {number} sat           Saturation of the neutral substrate.
 * @property {Record<NeutralRole, number>} ramp Lightness per neutral role.
 * @property {ChromaBudget} accent  Budget for the primary UI accent.
 * @property {ChromaBudget} syntax  Budget for code (token) colours.
 */

/**
 * Helper: assemble a ramp object from the canonical ordered stop list so each
 * depth is declared as a flat, readable array of `[role, lightness]` pairs.
 * @param {Array<[NeutralRole, number]>} stops
 * @returns {Record<NeutralRole, number>}
 */
const ramp = (stops) => Object.fromEntries(stops);

/**
 * MIDNIGHT — the reference dark canvas. A cold blue-slate ("night city seen
 * through fog"), deliberately desaturated so accents read as signal, not noise.
 * @type {Depth}
 */
export const midnight = {
  id: 'midnight',
  label: 'Midnight',
  mode: 'dark',
  hue: 226,
  sat: 16,
  ramp: ramp([
    ['canvasDeep', 7.5],
    ['canvas', 10.5],
    ['surface', 12.5],
    ['surfaceHi', 15.5],
    ['overlay', 18.5],
    ['guide', 22],
    ['line', 24],
    ['border', 28],
    ['ui', 42],
    ['muted', 53],
    ['subtle', 66],
    ['text', 82],
    ['textHi', 92],
  ]),
  accent: { l: 68, s: 66 },
  syntax: { l: 70, s: 64 },
};

/**
 * VOID — Midnight pushed deeper for OLED panels and dim rooms. Same ergonomic
 * foreground; only the substrate sinks, so contrast stays gentle rather than
 * harsh-on-black.
 * @type {Depth}
 */
export const voidDepth = {
  id: 'void',
  label: 'Void',
  mode: 'dark',
  hue: 228,
  sat: 18,
  ramp: ramp([
    ['canvasDeep', 4],
    ['canvas', 6],
    ['surface', 8.5],
    ['surfaceHi', 11.5],
    ['overlay', 14.5],
    ['guide', 18],
    ['line', 20],
    ['border', 25],
    ['ui', 40],
    ['muted', 52],
    ['subtle', 65],
    ['text', 81],
    ['textHi', 91],
  ]),
  accent: { l: 66, s: 68 },
  syntax: { l: 69, s: 66 },
};

/**
 * TWILIGHT — the lowest-contrast dark variant: the substrate floats upward and
 * the foreground eases down, compressing the contrast range for the most
 * fatigue-averse setups (bright ambient light, sensitive eyes).
 * @type {Depth}
 */
export const twilight = {
  id: 'twilight',
  label: 'Twilight',
  mode: 'dark',
  hue: 224,
  sat: 14,
  ramp: ramp([
    ['canvasDeep', 13],
    ['canvas', 16],
    ['surface', 18.5],
    ['surfaceHi', 21.5],
    ['overlay', 24.5],
    ['guide', 28],
    ['line', 30],
    ['border', 34],
    ['ui', 46],
    ['muted', 56],
    ['subtle', 67],
    ['text', 80],
    ['textHi', 88],
  ]),
  accent: { l: 70, s: 58 },
  syntax: { l: 71, s: 58 },
};

/**
 * DAYBREAK — a genuine light canvas for daytime work. Not white: a warm-cool
 * paper tone. Accents drop in lightness and gain saturation so they keep equal
 * *perceived* weight against a bright background — chromatic engineering, not
 * a naive inversion.
 * @type {Depth}
 */
export const daybreak = {
  id: 'daybreak',
  label: 'Daybreak',
  mode: 'light',
  hue: 222,
  sat: 22,
  ramp: ramp([
    ['canvasDeep', 91],
    ['canvas', 96],
    ['surface', 93],
    ['surfaceHi', 89],
    ['overlay', 85],
    ['guide', 80],
    ['line', 78],
    ['border', 72],
    ['ui', 55],
    ['muted', 46],
    ['subtle', 38],
    ['text', 24],
    ['textHi', 14],
  ]),
  accent: { l: 42, s: 70 },
  syntax: { l: 33, s: 68 },
};

/** All depths, keyed by id, for declarative lookup in the variant matrix. */
export const depths = {
  midnight,
  void: voidDepth,
  twilight,
  daybreak,
};
