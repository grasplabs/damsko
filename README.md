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

Every file lands at the path it has here, under the project's `src/` (`src/components/button.tsx`, `src/lib/`, `src/hooks/`, `src/styles/tokens.css`), byte for byte; imports between them are relative. The project needs React 19 and StyleX's bundler plugin. [Get started](https://damsko.joingrasp.com/get-started) walks through a new Vite app and a workspace package step by step; Damsko's install check (`scripts/check-install.ts`) builds both from that page's own code blocks, in a browser, on every change. What a product sets up, in short:

- **Styles, once, at the app's root**: `styles/tokens.css` (the variables), `styles/themes.css` (the modes and themes), `styles/base.css` (the base the components assume: one box model, no browser look on a control, the page's text; all in the cascade layer `base`, and the file says what each rule is for) and `styles/fonts.css`. Beside Tailwind, its preflight stands in for `base.css`.
- **Fonts**: `@damsko/fonts` brings Geist, Geist Mono and Geist Serif under the names the tokens use, as six subset files beside `fonts.css`, which the product's own origin serves, with their licence (`src/styles/fonts/OFL.txt`). The CLI carries a file as text, so the fonts arrive as `<name>.woff2.base64`; one command from Get started turns them into the files. A product that loads Geist another way skips the item: the tokens name `"Geist Variable"` and `"Geist Mono Variable"` too (the families Fontsource's variable packages register), after `"Geist"` and `"Geist Mono"`, so either source works and both may be loaded at once.
- **StyleX's plugin**: `useCSSLayers` left off, so a component's style wins over the base's layer and over Tailwind's whichever stylesheet loads first (in layers of its own it lost to Tailwind's preflight after every edit in development); `lightningcssOptions: { exclude: Features.LightDark }` on the plugin and `css: { lightningcss: { exclude: Features.LightDark } }` in Vite, so the tokens' `light-dark()` is kept as written. In a workspace package no `aliases` and no `unstable_moduleResolution`: StyleX names a variable by its file's package and path.
- **Light and dark**: `themes.css` reads `data-mode` (`light`, `dark` or `system`) on the root element or any other; with none, the system decides. Damsko has no theme provider: whatever holds a person's choice in the product writes the attribute, before the first paint and when it changes.
- **Words**: the few words the components say themselves come from one `I18nProvider` per React root, fed from a constant or from a translation library while rendering ([Writing](https://damsko.joingrasp.com/guidelines/writing#words-from-a-translation-library)).

A product imports the files by its package's paths: `@grasp-os/ui/components/button`, `@grasp-os/ui/components/button.stylex`, `@grasp-os/ui/blocks/<name>/<name>`, `@grasp-os/ui/lib/<file>`, `@grasp-os/ui/hooks/<file>`, `@grasp-os/ui/styles/<file>.css`. These are the `exports` that make them resolve, in `packages/ui/package.json` (a plain map misses the two `.tsx` files of `lib/`, a component's `.stylex.ts` and the three folder components; Damsko's gates fail when `src/` gains a file this map does not reach):

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

`https://damsko.joingrasp.com/r/{name}.json` is Damsko's `main` as last deployed. Every deploy serves the same files under its commit too, at `https://damsko.joingrasp.com/r/<commit>/{name}.json`: that address never serves another commit's files, so every merge to `main` is installable exactly. A product names it in `components.json`:

```json
"registries": { "@damsko": "https://damsko.joingrasp.com/r/<commit>/{name}.json" }
```

- **Which commit**: `https://damsko.joingrasp.com/version.json` gives the commit and the version the site serves (`{ "sha": "…", "version": "0.1.0" }`). Every item says the same in its `meta` (`version`, `commit`, `license`), so an install can be traced to a commit without comparing bytes. A release is a tag on `main` (`v0.1.0`, …) with its entry in [CHANGELOG.md](CHANGELOG.md).
- **Update**: once `main` has moved on, the pinned address answers 404. Put the new commit in `components.json`, install every item the product has again with `--overwrite`, all at once, unpack the fonts and review the diff. Never one item alone (the items share `lib/` and the tokens), and never `shadcn add --all`, which installs from shadcn's own registry.
- **Drift**: the pin is behind when `version.json`'s `sha` is not the commit in `components.json`. The product's copy is still the pin's when the same install again changes nothing (`git diff --exit-code`), while that commit is served; for any commit, when its files equal Damsko's `src/` at that commit on GitHub. Installed files are never edited in the product: a change is a pull request here, then an update.
- **An older commit** the site no longer serves is built from a checkout of it: `pnpm install`, `node scripts/registry-dist.ts <folder>`, `node scripts/serve.ts --dir <folder>`, and the address it prints in `components.json` for that run.

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
