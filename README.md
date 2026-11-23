# Damsko

Grasp's design system: React components, a few ready-made blocks, design tokens and icons built on StyleX and UI SDK, published as a shadcn registry. A product installs a component with the stock shadcn CLI and owns the source it gets.

Docs, every component and its examples: https://damsko.joingrasp.com

Damsko is proprietary: its source is public to read, and only Grasp, its affiliates and its contractors working for Grasp may use it ([LICENSE](LICENSE); third-party material: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).

## Install a component

Add the `@damsko` registry to your project's `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "",
    "baseColor": "",
    "cssVariables": true
  },
  "aliases": {
    "components": "@grasp-os/ui/components",
    "ui": "@grasp-os/ui/components",
    "lib": "@grasp-os/ui/lib",
    "hooks": "@grasp-os/ui/hooks",
    "utils": "@grasp-os/ui/lib/utils"
  },
  "registries": { "@damsko": "https://damsko.joingrasp.com/r/{name}.json" }
}
```

The components are StyleX, not Tailwind: the `tailwind` block must be there, empty (with a `baseColor` the CLI fetches from shadcn's own site). In a workspace, `components.json` sits in the package that holds the components (`packages/ui`) and the commands run there. Then add the tokens and the fonts once, and any component:

```sh
pnpm dlx shadcn@4.23.0 add @damsko/tokens
pnpm dlx shadcn@4.23.0 add @damsko/fonts
pnpm dlx shadcn@4.23.0 add @damsko/button
```

Every file lands at the path it has here, under the project's `src/` (`src/components/button.tsx`, `src/lib/`, `src/hooks/`, `src/styles/tokens.css`), byte for byte; imports between them are relative. The project needs React 19 and StyleX's bundler plugin. [Get started](https://damsko.joingrasp.com/get-started) goes from an empty folder to a built app four times: a plain Vite app, a workspace package, that workspace beside Tailwind, and that workspace with a Geist of its own. Damsko's install check (`scripts/check-install.ts`) carries out that page's own blocks, and nothing else, on every change, so follow the page rather than this summary. What a product sets up, in short:

- **Styles, once, at the app's root**: `styles/tokens.css` (the variables), `styles/themes.css` (the modes and themes) and `styles/fonts.css` (the three font families; one sheet per family is beside it, in `styles/fonts/`). `styles/base.css` is an optional reset for a new app that has none of its own. Never import it beside Tailwind: preflight is that app's reset, and Damsko's would restyle the product's own interface. No component leans on it (`tests/base.spec.ts`), and the install check holds a part of the app that is not Damsko's to the same pixels before and after.
- **Fonts**: `@damsko/fonts` brings Geist, Geist Mono and Geist Serif under the names the tokens use, as six subset files which the product's own origin serves, with their licence (`src/styles/fonts/OFL.txt`). The CLI carries a file as text, so the fonts arrive as `<name>.woff2.base64` beside `src/styles/fonts/unpack.mjs`, which turns them into the files. Run it once after every install or update and commit the six files: no build runs it, so the fonts are there however the app is built (a `predev` or `prebuild` script does not run when a runner calls the bundler itself). `node src/styles/fonts/unpack.mjs --check` in the product's checks is what holds them there: it fails while a font is packed or missing.
- **One Geist, never two**: the tokens name one family each (`"Geist"`, `"Geist Serif"`, `"Geist Mono"`), and each family is a sheet of its own (`styles/fonts/geist.css`, `geist-serif.css`, `geist-mono.css`; `styles/fonts.css` is the three). A product that already serves a family leaves that sheet out and sets the family's token to its own name, after `tokens.css`: `:root { --damsko-font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif; }` for Fontsource's Geist (`--damsko-font-serif` and `--damsko-font-mono` likewise).
- **StyleX's plugin**: `useCSSLayers` left off, so a component's style wins over the reset's layer and over Tailwind's whichever stylesheet loads first (in layers of its own it lost to Tailwind's preflight after every edit in development); `lightningcssOptions: { exclude: Features.LightDark }` on the plugin and `css: { lightningcss: { exclude: Features.LightDark } }` in Vite, so the tokens' `light-dark()` is kept as written. In a workspace package no `aliases` and no `unstable_moduleResolution`: StyleX names a variable by its file's package and path. In a plain app the `@grasp-os/ui` alias goes in `tsconfig.json` too, where the shadcn CLI reads it.
- **Light and dark**: `themes.css` reads `data-mode` (`light`, `dark` or `system`) on the root element or any other; with none, the system decides, so a product that is light only writes `data-mode="light"` on its root. Damsko has no theme provider: whatever holds a person's choice in the product writes the attribute, before the first paint and when it changes.
- **Words**: the few words the components say themselves come from one `I18nProvider` per React root, with its `locale`, fed from a constant or from a translation library while rendering ([Writing](https://damsko.joingrasp.com/guidelines/writing#words-from-a-translation-library)).

A product imports the files by its package's paths: `@grasp-os/ui/components/button`, `@grasp-os/ui/components/button.stylex`, `@grasp-os/ui/blocks/<name>/<name>`, `@grasp-os/ui/lib/<file>`, `@grasp-os/ui/hooks/<file>`, `@grasp-os/ui/styles/<file>.css`. These are the `exports` that make them resolve, in `packages/ui/package.json`, beside React and its types, which the components import (a plain map misses the two `.tsx` files of `lib/`, a component's `.stylex.ts` and the three folder components; Damsko's gates fail when `src/` gains a file this map does not reach):

```json
  "exports": {
    "./components/data-grid": "./src/components/data-grid/index.ts",
    "./components/data-grid/*": null,
    "./components/data-table": "./src/components/data-table/index.ts",
    "./components/data-table/*": null,
    "./components/markdown": "./src/components/markdown/index.ts",
    "./components/markdown/*": null,
    "./components/*.stylex": "./src/components/*.stylex.ts",
    "./components/*": "./src/components/*.tsx",
    "./blocks/*": "./src/blocks/*.tsx",
    "./lib/i18n": "./src/lib/i18n.tsx",
    "./lib/menu": "./src/lib/menu.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./styles/*": "./src/styles/*"
  }
```

## Pin a version and update

What a product installs is one version of Damsko. The record of which is the product's own: the tag its install command names, and its sync commit. The CLI writes files only, so nothing in an installed file says where it came from; each item's `meta` (`version`, `commit`, `license`) is in the registry's JSON, not in the product.

A version is a tag on `main` (`v0.2.0`, … with its entry in [CHANGELOG.md](CHANGELOG.md)), and every tag's release on GitHub carries the registry built from it: `registry-<tag>.tgz` (the `r/` folder) and `registry-<tag>.tgz.sha256`, attached by `.github/workflows/release.yml`. A product downloads that, with none of Damsko's toolchain. `v0.1.0` was tagged before the workflow was there and has no archive. The CLI takes an address, never a folder, so [Get started](https://damsko.joingrasp.com/get-started#pin-and-update) gives a small script, `damsko-registry.mjs` (Node and `tar` only): it downloads the tag's archive once, checks it against its checksum and serves it from the product's own machine while a command runs. `components.json` names the address it gives:

```json
"registries": { "@damsko": "${DAMSKO_REGISTRY}/r/{name}.json" }
```

```sh
node damsko-registry.mjs <tag> pnpm dlx shadcn@4.23.0 add @damsko/tokens @damsko/fonts @damsko/button --overwrite --yes
```

Damsko's install check installs every item this way, from the archive as the workflow packs it. A commit with no tag is built from a checkout, with its dependencies installed: `node scripts/registry-dist.ts out --release` writes `out/r/` and the same archive.

The site is for a first look, not for a pin: `https://damsko.joingrasp.com/r/{name}.json` is `main` as last deployed, whichever commit that is; `https://damsko.joingrasp.com/version.json` names it (`{ "sha": "…", "version": "0.1.0" }`).

- **Update**: change the tag, install every item the product has again with `--overwrite`, all at once, run `node src/styles/fonts/unpack.mjs`, review the diff and commit it, the fonts with it. Never one item alone (the items share `lib/` and the tokens), and never `shadcn add --all`, which installs from shadcn's own registry.
- **Drift**: in the product's own checks, `node src/styles/fonts/unpack.mjs --check` (fails while a font is packed or missing), and after the same install again `git status --porcelain` prints nothing (`git diff` alone misses a file git does not track yet); or compare the files with Damsko's `src/` at the pinned commit, a font's `<name>.woff2.base64` target counting as `<name>.woff2`. Installed files are never edited in the product: a change is a pull request here, then an update.

## Licence of installed files

Installed files stay under Damsko's [LICENSE](LICENSE) wherever they land, whatever the licence of the repository around them: only Grasp, its affiliates and its contractors working for Grasp may use them. Every registry item says so in its `meta.license`, as shadcn registries carry a licence; no file gets a header for it. The fonts are the exception: they are under the SIL Open Font License 1.1, and `OFL.txt` is installed beside them. Third-party material: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Develop

Node 24 and pnpm (the version in `package.json`). Vite+ (`vp`) is the toolchain.

```sh
pnpm install     # also installs the git hooks
pnpm dev         # the docs site at http://localhost:4517
pnpm check       # format, lint, types, the tree guard and the static gates
pnpm test:browser  # the browser specs, against the build
pnpm test        # unit tests
pnpm build       # the static site and registry into dist/
pnpm generate    # tokens, themes and registry.json, after changing them
```

How the repository fits together, how to add a component and the rules each one passes: [CONTRIBUTING.md](CONTRIBUTING.md). Rules for agents: [AGENTS.md](AGENTS.md).
