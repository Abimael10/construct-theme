/**
 * @file The variant matrix — the one file a maintainer edits.
 *
 * This is the declarative heart of the extension. A variant is nothing but a
 * (depth × accent) pairing; everything else — colours, the theme JSON, the
 * `package.json` contributions — is *derived* from this list by `build.mjs`.
 *
 * Want a new theme? Add one line. Want to retire one? Delete a line. There is
 * no second place to update, no manifest to hand-edit, no colours to copy. That
 * is the "frictionless modularity" guarantee, enforced structurally.
 */

import { depths } from './design/depths.mjs';
import { accents } from './design/accents.mjs';

const BRAND = 'Construct';

/**
 * Compose a single variant descriptor from a depth id and an accent id.
 * @param {keyof typeof depths} depthId
 * @param {keyof typeof accents} accentId
 * @returns {import('./theme/assemble.mjs').Variant}
 */
const variant = (depthId, accentId) => {
  const depth = depths[depthId];
  const accent = accents[accentId];
  return {
    depth,
    accent,
    name: `${BRAND} ${depth.label} ${accent.label}`,
    slug: `construct-${depth.id}-${accent.id}`,
  };
};

/**
 * The shipped matrix. Curated rather than exhaustive: every depth gets the
 * canonical Aqua signature, and each alternate accent is showcased on the
 * canvas that flatters it most. Uncomment the cross-product helper below to
 * generate the full depths × accents grid instead.
 *
 * @type {import('./theme/assemble.mjs').Variant[]}
 */
export const variants = [
  // Aqua — the reference face, offered on every canvas.
  variant('midnight', 'aqua'),
  variant('void', 'aqua'),
  variant('twilight', 'aqua'),
  variant('daybreak', 'aqua'),

  // Alternate signatures on their best-fit canvases.
  variant('midnight', 'orchid'),
  variant('void', 'synth'),
  variant('twilight', 'acid'),
  variant('daybreak', 'synth'),
];

/**
 * Escape hatch: the complete cross-product of every depth and accent. Swap this
 * in for `variants` above to ship all {@link depths}.length × {@link accents}.length
 * combinations with zero further code.
 * @returns {import('./theme/assemble.mjs').Variant[]}
 */
export const fullMatrix = () =>
  Object.keys(depths).flatMap((d) =>
    Object.keys(accents).map((acc) =>
      variant(/** @type {any} */ (d), /** @type {any} */ (acc)),
    ),
  );
