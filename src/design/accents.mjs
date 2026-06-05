/**
 * @file Accent identities — the "chrome signature".
 *
 * The second axis of the variant matrix. An accent identity is intentionally
 * narrow in scope: it tints *interactive chrome* (cursor, focus rings,
 * selection, buttons, links, badges, active indicators) — the surfaces your
 * eye tracks while navigating — and nothing else.
 *
 * Crucially, it does **not** repaint syntax. Code colour is a shared, calibrated
 * system (see `semantics.mjs`); letting each accent rewrite it would multiply
 * the matrix into dozens of unvetted, often garish combinations. By separating
 * "how the editor feels to drive" from "how code reads", every depth × accent
 * pairing is guaranteed legible. That separation is the core ergonomic bet.
 *
 * Each identity carries a single primary hue plus a `support` hue used for the
 * second-order accent (e.g. progress vs. badge, or a subtle dual-tone focus).
 */

/**
 * @typedef {Object} Accent
 * @property {string} id       Stable slug used in theme/file identifiers.
 * @property {string} label    Human-facing accent name.
 * @property {number} hue      Primary chrome hue in degrees.
 * @property {number} support  Secondary chrome hue (harmonic partner).
 * @property {number} [satBias] Per-identity saturation nudge; some hues read as
 *                              "louder" at equal saturation and want pulling back.
 */

/**
 * AQUA — the canonical signal cyan. Calm, cool, the default face of The
 * Construct. Reads as "system online" without the migraine of pure neon.
 * @type {Accent}
 */
export const aqua = {
  id: 'aqua',
  label: 'Aqua',
  hue: 187,
  support: 205,
  satBias: 0,
};

/**
 * ORCHID — muted magenta. The classic cyberpunk pink, deliberately drained of
 * saturation so it whispers the genre instead of shouting it.
 * @type {Accent}
 */
export const orchid = {
  id: 'orchid',
  label: 'Orchid',
  hue: 322,
  support: 285,
  satBias: -6,
};

/**
 * SYNTH — electric violet. Sits between Aqua and Orchid; the most "synthwave"
 * of the set while remaining low-fatigue.
 * @type {Accent}
 */
export const synth = {
  id: 'synth',
  label: 'Synth',
  hue: 258,
  support: 300,
  satBias: -2,
};

/**
 * ACID — desaturated mint-green. The contrarian accent: a cool, organic counter
 * to the usual neon orange, easy on the eye and unusual in the field.
 * @type {Accent}
 */
export const acid = {
  id: 'acid',
  label: 'Acid',
  hue: 156,
  support: 178,
  satBias: -4,
};

/** All accent identities, keyed by id, for the declarative variant matrix. */
export const accents = { aqua, orchid, synth, acid };
