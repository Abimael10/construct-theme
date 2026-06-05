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

Everything runs **locally** — no CI, no GitHub Actions, no paid features. The
local gates (`check`, `audit`) are the same verification a CI pipeline would do.

**One-time token setup** (used locally; nothing is stored in the repo):

- **Marketplace** — create an Azure DevOps org, then publisher `abimael10` at
  <https://marketplace.visualstudio.com/manage>. Generate a PAT with
  **Organization: All accessible organizations** and scope **Marketplace → Manage**.
  Authenticate once with `npx @vscode/vsce login abimael10`.
- **Open VSX** (optional, for VSCodium/Cursor) — sign in at <https://open-vsx.org>,
  accept the agreement, run `npx ovsx create-namespace abimael10 --pat <token>`.

**Cutting a release:**

```bash
# 1. Bump version (then update CHANGELOG.md to match)
npm version 1.0.1 --no-git-tag-version

# 2. Verify locally — the gates that matter
npm run check          # generated themes/manifest are in sync
npm run audit          # palette stays within the comfort envelope

# 3. Publish (vscode:prepublish rebuilds themes + icon first)
npx @vscode/vsce publish
npx ovsx publish --pat <token>          # optional: Open VSX

# 4. Record the release in git (and, optionally, on GitHub — both free)
git commit -am "release: v1.0.1"
git tag -a v1.0.1 -m "v1.0.1"
git push origin master --follow-tags
npx @vscode/vsce package                # produces the .vsix
gh release create v1.0.1 *.vsix --generate-notes   # optional, needs gh CLI only
```

Before the first release, add the gallery screenshots (see
[`images/README.md`](./images/README.md)) — a listing without them looks unfinished.
