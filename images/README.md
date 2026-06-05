# Screenshots

These images are referenced by the root `README.md` (and therefore by the
Marketplace listing) via absolute `raw.githubusercontent.com` URLs, so they
render on the Marketplace **without** being shipped inside the `.vsix`.

A theme listing with no screenshots is the single biggest "this is unfinished"
signal on the Marketplace. Capture these before publishing.

## What to capture

For a consistent, professional gallery, use the **same source file** for every
shot — ideally a real file with good variety (a TS/React file with imports,
types, functions, JSX, strings, numbers, and comments works well).

| File | Variant to select | Notes |
| --- | --- | --- |
| `midnight-aqua.png` | Construct Midnight Aqua | The hero image. Also used at the top of the README. |
| `midnight-orchid.png` | Construct Midnight Orchid | Shows the accent-wash difference vs. Aqua. |
| `twilight-acid.png` | Construct Twilight Acid | The low-contrast / alternate-accent showcase. |
| `daybreak-aqua.png` | Construct Daybreak Aqua | Proves the light variant is first-class. |

## How to capture cleanly

1. Select the variant: `Ctrl/Cmd+K Ctrl/Cmd+T`.
2. Hide chrome for a clean frame: `View: Toggle Zen Mode` (or hide the Activity
   Bar / Status Bar), set a comfortable font size, open ~30–40 lines.
3. Screenshot the editor region at 2× / Retina if possible, then downscale to
   ~1640px wide so it stays crisp on the Marketplace.
4. Save here with the exact filenames above (lowercase, `.png`).

Keep each image under ~500 KB; compress with `pngquant`/`oxipng` if needed.
