# Contributing to The Construct

The Construct is a **generated** theme family. The cardinal rule:

> **Never edit `themes/*.json` or `package.json → contributes.themes` by hand.**
> They are build artifacts. Edit the design system and run `npm run build`.

## The mental model

Two axes compose into every theme:

- **Depth** (`src/design/depths.mjs`) — the canvas substrate: a neutral ramp and
  a chroma budget (how much lightness/saturation accents may spend on this
  background).
- **Accent** (`src/design/accents.mjs`) — the interactive chrome signature: one
  primary hue plus a harmonic support hue.

`src/design/semantics.mjs` resolves a `(depth, accent)` pair into a fully-named
palette. It is the single source of truth for what every colour *means*. The
builders in `src/theme/` translate that palette into VS Code's JSON shapes.

## Common tasks

| I want to… | Edit | Then |
| --- | --- | --- |
| add/remove a shipped theme | `src/variants.mjs` | `npm run build` |
| create a new accent | `src/design/accents.mjs` | add to a variant, build |
| create a new canvas depth | `src/design/depths.mjs` | add to a variant, build |
| change what a token colour means | `src/design/semantics.mjs` | `npm run build` |
| re-map a UI element | `src/theme/workbench.mjs` | `npm run build` |

## The ergonomic contract

`npm run build` runs `src/audit.mjs`, which enforces:

- a **readability floor** — body text and load-bearing tokens must clear a
  minimum WCAG contrast against the canvas, and
- an **anti-glare ceiling** — nothing may exceed a maximum contrast, because
  "nothing on screen is harsh" is the defining trait of this family.

If your change fails the audit, that is the system working. Re-tune the chroma
budget or the offending hue rather than relaxing the thresholds.

## Before opening a PR

```bash
npm run build     # regenerate artifacts (must leave a clean diff besides intent)
npm run check     # confirm nothing is stale
npm run preview   # eyeball the result
```

Commit the regenerated `themes/` and `package.json` alongside your source edit.

## Releasing

Releases are **tag-driven**: pushing a `v*.*.*` tag triggers
`.github/workflows/release.yml`, which packages the extension and publishes it
to the VS Marketplace + Open VSX and cuts a GitHub Release. The workflow refuses
to publish if the tag and `package.json` version disagree.

**One-time setup** (credentials live only as GitHub Actions secrets, never in the repo):

- **Marketplace** — create an Azure DevOps org, then publisher `abimael10` at
  <https://marketplace.visualstudio.com/manage>. Generate a PAT with
  **Organization: All accessible organizations** and scope **Marketplace → Manage**.
  Save it as the `VSCE_PAT` repo secret.
- **Open VSX** — sign in at <https://open-vsx.org>, accept the agreement, run
  `npx ovsx create-namespace abimael10 --pat <token>`, then save a token as the
  `OVSX_PAT` repo secret.

**Cutting a release:**

```bash
npm version 1.0.1 --no-git-tag-version   # bump; update CHANGELOG.md to match
git commit -am "release: v1.0.1"
git tag -a v1.0.1 -m "v1.0.1"
git push origin main --follow-tags       # CI/release workflow takes it from here
```

Before the first release, add the gallery screenshots (see
[`images/README.md`](./images/README.md)) — a listing without them looks unfinished.
