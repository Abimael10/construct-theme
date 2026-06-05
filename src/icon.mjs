/**
 * @file Marketplace icon generator.
 *
 * The gallery icon is *derived from the same palette as the themes*, so it can
 * never drift from the brand and there is no opaque binary in version control.
 * It renders a glyph — a bracket pair framing a cursor, in the signature
 * cyan/magenta — using signed-distance fields for analytic anti-aliasing, then
 * encodes a PNG with Node's built-in `zlib` (zero dependencies).
 *
 * Usage:  node src/icon.mjs            → icon.png (256×256)
 */

import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hex } from './color/hsl.mjs';
import { resolve } from './design/semantics.mjs';
import { midnight } from './design/depths.mjs';
import { aqua } from './design/accents.mjs';

const SIZE = 256;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Parse a `#rrggbb` string into an [r,g,b] byte triple. */
const rgb = (hexStr) => [1, 3, 5].map((i) => parseInt(hexStr.slice(i, i + 2), 16));

/** Signed distance from point p to segment a→b, minus radius r (a "capsule"). */
const sdCapsule = (px, py, ax, ay, bx, by, r) => {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.hypot(dx, dy) - r;
};

/** Signed distance to an axis-aligned rounded rectangle centred at (cx,cy). */
const sdRoundRect = (px, py, cx, cy, halfW, halfH, r) => {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};

/** Coverage [0,1] from a signed distance, with ~1px analytic anti-aliasing. */
const coverage = (sd) => Math.max(0, Math.min(1, 0.5 - sd));

/** Straight-alpha source-over compositing of `src` (rgba) onto `dst` (rgba). */
const over = (dst, src) => {
  const sa = src[3];
  const da = dst[3] * (1 - sa);
  const oa = sa + da;
  if (oa === 0) return [0, 0, 0, 0];
  const blend = (i) => (src[i] * sa + dst[i] * da) / oa;
  return [blend(0), blend(1), blend(2), oa];
};

/** Render the icon to a flat RGBA byte buffer. */
const render = () => {
  const p = resolve(midnight, aqua);
  const cTop = rgb(hex(p.n.canvasDeep));
  const cBot = rgb(hex(p.n.canvas));
  const bracket = rgb(hex(p.a.bright));
  const cursor = rgb(hex(p.syn.keyword));

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const out = Buffer.alloc(SIZE * SIZE * 4);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const px = x + 0.5;
      const py = y + 0.5;

      // Rounded-rect tile with a subtle vertical gradient; transparent outside.
      const tile = coverage(sdRoundRect(px, py, cx, cy, 116, 116, 56));
      const t = y / SIZE;
      let col = [
        cTop[0] + (cBot[0] - cTop[0]) * t,
        cTop[1] + (cBot[1] - cTop[1]) * t,
        cTop[2] + (cBot[2] - cTop[2]) * t,
        tile,
      ];

      // Distance to the bracket pair (left + right, each a stem with two arms).
      const left = Math.min(
        sdCapsule(px, py, 64, 70, 64, 186, 13),
        sdCapsule(px, py, 64, 70, 96, 70, 13),
        sdCapsule(px, py, 64, 186, 96, 186, 13),
      );
      const right = Math.min(
        sdCapsule(px, py, 192, 70, 192, 186, 13),
        sdCapsule(px, py, 192, 70, 160, 70, 13),
        sdCapsule(px, py, 192, 186, 160, 186, 13),
      );
      const brk = Math.min(left, right);
      const cur = sdCapsule(px, py, 128, 86, 128, 170, 8);

      // Neon halo first (soft, additive feel via low alpha), then crisp strokes.
      col = over(col, [...bracket, coverage(brk + 9) * 0.22 * tile]);
      col = over(col, [...cursor, coverage(cur + 9) * 0.22 * tile]);
      col = over(col, [...bracket, coverage(brk) * tile]);
      col = over(col, [...cursor, coverage(cur) * tile]);

      const o = (y * SIZE + x) * 4;
      out[o] = Math.round(col[0]);
      out[o + 1] = Math.round(col[1]);
      out[o + 2] = Math.round(col[2]);
      out[o + 3] = Math.round(col[3] * 255);
    }
  }
  return out;
};

// ── Minimal PNG encoder (RGBA, 8-bit) ───────────────────────────────────────

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (~c) >>> 0;
};

/** Wrap chunk data in a PNG length/type/crc envelope. */
const chunk = (type, data) => {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
};

const encodePng = (rgba, size) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // 10,11,12 = compression/filter/interlace = 0

  // Prefix each scanline with filter byte 0 (None).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const png = encodePng(render(), SIZE);
await writeFile(join(ROOT, 'icon.png'), png);
process.stdout.write(`Wrote icon.png (${SIZE}×${SIZE}, ${png.length} bytes) from the live palette.\n`);
