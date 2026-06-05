/**
 * @file Pure, dependency-free colour mathematics.
 *
 * The entire theme is authored in HSL because it is the only common colour
 * space where "make this one shade lighter / less saturated" maps to a single
 * scalar nudge. Every concrete `#rrggbb(aa)` string in the shipped themes is
 * derived here — never hand-typed — which is what lets a whole family of
 * variants stay perceptually consistent.
 *
 * Nothing in this module knows what a "theme" is; it is reusable colour algebra.
 */

/**
 * An HSL colour with an optional alpha channel.
 * @typedef {Object} Hsl
 * @property {number} h Hue in degrees, normalised to [0, 360).
 * @property {number} s Saturation as a percentage [0, 100].
 * @property {number} l Lightness as a percentage [0, 100].
 * @property {number} [a] Alpha in [0, 1]. Defaults to 1 (opaque).
 */

/** @param {number} value @param {number} min @param {number} max */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Normalise an arbitrary degree value into the [0, 360) range. */
const wrapHue = (deg) => ((deg % 360) + 360) % 360;

/**
 * Construct a normalised HSL colour. This is the canonical colour constructor
 * used across the design system.
 * @param {number} h @param {number} s @param {number} l @param {number} [a]
 * @returns {Hsl}
 */
export const hsl = (h, s, l, a = 1) => ({
  h: wrapHue(h),
  s: clamp(s, 0, 100),
  l: clamp(l, 0, 100),
  a: clamp(a, 0, 1),
});

/** Two decimal places of precision is plenty and keeps diffs stable. */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Return a copy of `color` with the given channels overridden. Relative tweaks
 * are expressed as separate helpers (`lighten`, `saturate`, …) on top of this.
 * @param {Hsl} color @param {Partial<Hsl>} patch @returns {Hsl}
 */
export const adjust = (color, patch) =>
  hsl(
    patch.h ?? color.h,
    patch.s ?? color.s,
    patch.l ?? color.l,
    patch.a ?? color.a ?? 1,
  );

/** @param {Hsl} c @param {number} delta Percentage points of lightness. */
export const lighten = (c, delta) => adjust(c, { l: c.l + delta });
/** @param {Hsl} c @param {number} delta Percentage points of lightness. */
export const darken = (c, delta) => adjust(c, { l: c.l - delta });
/** @param {Hsl} c @param {number} delta Percentage points of saturation. */
export const saturate = (c, delta) => adjust(c, { s: c.s + delta });
/** @param {Hsl} c @param {number} delta Percentage points of saturation. */
export const desaturate = (c, delta) => adjust(c, { s: c.s - delta });
/** @param {Hsl} c @param {number} deg Hue rotation in degrees. */
export const rotate = (c, deg) => adjust(c, { h: c.h + deg });

/**
 * Return `color` at a fixed opacity. Used for every translucent overlay
 * (selections, hovers, drop targets) so they tint rather than paint over.
 * @param {Hsl} color @param {number} a Alpha in [0, 1].
 * @returns {Hsl}
 */
export const alpha = (color, a) => adjust(color, { a });

/**
 * Perceptually blend two HSL colours by ratio `t` along the shortest hue arc.
 * @param {Hsl} a @param {Hsl} b @param {number} t 0 → a, 1 → b.
 * @returns {Hsl}
 */
export const mix = (a, b, t) => {
  const k = clamp(t, 0, 1);
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return hsl(
    a.h + dh * k,
    a.s + (b.s - a.s) * k,
    a.l + (b.l - a.l) * k,
    (a.a ?? 1) + ((b.a ?? 1) - (a.a ?? 1)) * k,
  );
};

/**
 * Convert HSL → linear RGB channels in [0, 1].
 * @param {Hsl} c @returns {[number, number, number]}
 */
const toRgb = ({ h, s, l }) => {
  const sat = s / 100;
  const lum = l / 100;
  const chroma = (1 - Math.abs(2 * lum - 1)) * sat;
  const hp = h / 60;
  const x = chroma * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [chroma, x, 0] :
    hp < 2 ? [x, chroma, 0] :
    hp < 3 ? [0, chroma, x] :
    hp < 4 ? [0, x, chroma] :
    hp < 5 ? [x, 0, chroma] :
             [chroma, 0, x];
  const m = lum - chroma / 2;
  return [r1 + m, g1 + m, b1 + m];
};

const channel = (v) => clamp(Math.round(v * 255), 0, 255).toString(16).padStart(2, '0');

/**
 * Render an HSL colour to a VS Code colour string: `#rrggbb`, or `#rrggbbaa`
 * when the colour carries a non-opaque alpha.
 * @param {Hsl} color @returns {string}
 */
export const hex = (color) => {
  const [r, g, b] = toRgb(color);
  const base = `#${channel(r)}${channel(g)}${channel(b)}`;
  const a = color.a ?? 1;
  return a >= 1 ? base : `${base}${channel(a)}`;
};

/**
 * Relative luminance (WCAG) of an HSL colour, used by the contrast audit to
 * keep the "low-contrast" promise honest rather than aspirational.
 * @param {Hsl} color @returns {number} Luminance in [0, 1].
 */
export const luminance = (color) => {
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = toRgb(color);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/**
 * WCAG contrast ratio between two opaque HSL colours. Range [1, 21].
 * @param {Hsl} a @param {Hsl} b @returns {number}
 */
export const contrastRatio = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return round2((hi + 0.05) / (lo + 0.05));
};
