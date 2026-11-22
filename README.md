# Damsko

Grasp's design system: React components, design tokens and icons built on StyleX and UI SDK, published as a shadcn registry. A product installs a component with the stock shadcn CLI and owns the source it gets, as with shadcn.

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

The components are StyleX, not Tailwind: the `tailwind` block must be there, empty (with a `baseColor` the CLI fetches from shadcn's own site). Then add the tokens once, and any component:

```sh
pnpm dlx shadcn@4.23.0 add @damsko/tokens
pnpm dlx shadcn@4.23.0 add @damsko/button
```

Every file lands at the path it has here, under the project's `src/` (`src/components/button.tsx`, `src/lib/`, `src/hooks/`, `src/styles/tokens.css`), byte for byte; imports between them are relative. The project imports them by the package's paths: `@grasp-os/ui/components/button`, `@grasp-os/ui/blocks/<name>/<name>`, `@grasp-os/ui/lib/<file>`, `@grasp-os/ui/hooks/<file>`. The project needs React 19 and StyleX's bundler plugin. [Get started](https://damsko.joingrasp.com/get-started) walks through a new Vite app, step by step.

Update by installing again with `--overwrite`, all installed items at once, and review the diff. Never use `shadcn add --all`: it installs from shadcn's own registry, not `@damsko`.

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
