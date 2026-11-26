// Get started's words (site/pages/get-started.astro), in one place, with its Markdown twin
// (getStartedMarkdown, at /get-started.md).
// Plain data and plain functions: a Node script can import this too. scripts/check-install.ts
// does: it carries out every block below that says what it does (`does`), in the page's order,
// in an empty folder, and builds the apps from nothing else. A block the check must carry out to
// get a working app has a `does`; one that only shows a shape (a line of JSON with a placeholder)
// has none.

export const route = "/get-started";
export const title = "Get started";
export const description =
  "Add the tokens once, then any component, with the shadcn CLI. It lands in your project as code you own.";

export const install = "pnpm dlx shadcn@4.23.0 add @damsko/button";

/**
 * The registry's address in a code block: the page puts its own origin in its place
 * (get-started.astro), so what is copied works wherever the site is served. The Markdown twin
 * keeps the words.
 */
export const siteAddress = "https://<this site's address>";

/** What carrying a block out means. Paths are from the folder its section starts in. */
export type Does =
  /** A shell script, run in a folder. */
  | { kind: "run"; in: string }
  /** The whole of a file. */
  | { kind: "write"; file: string }
  /** Members of a JSON file's object at a path (`["compilerOptions"]`); `//` lines are notes. */
  | { kind: "set"; file: string; at: string[] }
  /** HTML placed first in a page's head. */
  | { kind: "head"; file: string };

export interface Block {
  code: string;
  lang: string;
  does?: Does;
}

export interface Step {
  slug: string;
  name: string;
  note: string;
  blocks: Block[];
}

/**
 * One part of the page: a heading, a sentence and its steps, numbered from one. `starts` says
 * where its paths are from: an empty folder of its own (`empty`), the folder the section named
 * goes on in, each app's own folder (`each app`: app/ and apps/web/), or the folder components.json
 * is in (`the registry's`: app/ and packages/ui/).
 */
export interface Section {
  slug: string;
  title: string;
  lead: string;
  starts: "empty" | "each app" | "the registry's" | { after: string };
  steps: Step[];
}

/** Why light-dark() is kept, as the Vite configs say it. */
const keepLightDark = [
  "// The tokens give a colour's light and dark values in one light-dark(), which follows the",
  "// color-scheme of the element that uses it. Keep it as written: rewritten for older browsers it",
  "// leans on variables only a color-scheme rule in the same stylesheet sets, and without one",
  "// every colour is invalid.",
  "const keepLightDark = { exclude: Features.LightDark };",
];

/** The StyleX options the Vite configs share, with their reasons. */
const stylexShared = [
  "      // No useCSSLayers: StyleX's rules stay outside any cascade layer, where they win over the",
  "      // base's layer, and over Tailwind's, whichever stylesheet the page loads first. In layers",
  "      // of its own it loses to them whenever its sheet comes first, as after an edit in dev.",
  "      lightningcssOptions: {",
  "        ...keepLightDark,",
  "        // A cold dev start can ask for the CSS before the tokens file is compiled: drop what",
  "        // cannot be read yet; the full CSS follows a moment later, with no overlay.",
  "        errorRecovery: true,",
  "      },",
];

/** The Vite config of an app that holds the components in its own src/. */
export const appViteConfig = [
  'import { fileURLToPath } from "node:url";',
  "",
  'import stylex from "@stylexjs/unplugin";',
  'import react from "@vitejs/plugin-react";',
  'import { Features } from "lightningcss";',
  'import { defineConfig } from "vite";',
  "",
  'const root = fileURLToPath(new URL(".", import.meta.url));',
  ...keepLightDark,
  "",
  "export default defineConfig({",
  "  plugins: [",
  "    stylex.vite({",
  "      // The components live in this app's src/: StyleX resolves the token imports itself, so it",
  "      // gets the @grasp-os/ui alias too.",
  '      unstable_moduleResolution: { type: "commonJS", rootDir: root },',
  '      aliases: { "@grasp-os/ui/*": [`${root}src/*`] },',
  ...stylexShared,
  "    }),",
  "    react(),",
  "  ],",
  "  css: { lightningcss: keepLightDark },",
  '  resolve: { alias: { "@grasp-os/ui": `${root}src` } },',
  "});",
].join("\n");

/** The Vite config of an app that imports the components from a workspace package. */
const workspaceConfig = (tailwind: boolean) =>
  [
    'import stylex from "@stylexjs/unplugin";',
    ...(tailwind ? ['import tailwindcss from "@tailwindcss/vite";'] : []),
    'import react from "@vitejs/plugin-react";',
    'import { Features } from "lightningcss";',
    'import { defineConfig } from "vite";',
    "",
    ...keepLightDark,
    "",
    "export default defineConfig({",
    "  plugins: [",
    "    stylex.vite({",
    "      // No aliases and no unstable_moduleResolution: StyleX names a variable by its file's",
    "      // package and path, so the app and the package agree across the boundary.",
    ...stylexShared,
    "    }),",
    "    react(),",
    ...(tailwind ? ["    tailwindcss(),"] : []),
    "  ],",
    "  css: { lightningcss: keepLightDark },",
    "});",
  ].join("\n");

/**
 * The exports of the package that holds the components (packages/ui/package.json), so
 * `@grasp-os/ui/components/button` and the rest resolve: the three folder components by their
 * index and nothing else of theirs, a component's `.stylex.ts` beside its `.tsx`, a block as a
 * folder, and the `.tsx` files of lib/ by name. scripts/check-registry.ts fails when src/ gains a
 * file this map does not reach, and when README.md's copy differs.
 */
export const packageExports: Record<string, string | null> = {
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
  "./styles/*": "./src/styles/*",
};

/**
 * The versions an app here is built with: what Vite's template brings, what the configs below
 * name, and every package a component imports. They are Damsko's own (the catalog in its
 * pnpm-workspace.yaml; scripts/check-registry.ts holds the two together), written once, here: the
 * page shows them as the app's catalog and every command below takes its version from it, so the
 * install check builds with these and no release upstream changes what it builds.
 */
export const versions: Record<string, string> = {
  // The app: Vite's template and the two the Vite config names.
  vite: "8.3.8",
  "@vitejs/plugin-react": "6.3.0",
  typescript: "7.0.2",
  "@types/node": "26.6.2",
  "@stylexjs/unplugin": "0.19.2",
  lightningcss: "1.33.0",
  // Beside Tailwind.
  tailwindcss: "4.3.5",
  "@tailwindcss/vite": "4.3.5",
  // A Geist of the app's own, where the page shows one.
  "@fontsource-variable/geist": "5.3.0",
  // What the components import: the CLI adds each by name, and pnpm gives it this version.
  "@hugeicons/core-free-icons": "4.4.0",
  "@hugeicons/react": "1.1.10",
  "@pierre/highlights": "0.6.0",
  "@stylexjs/stylex": "0.19.2",
  "@tanstack/react-table": "9.3.1",
  "@types/react": "19.3.0",
  "@types/react-dom": "19.3.0",
  "@ui-sdk/core": "0.1.0-beta.13",
  "@ui-sdk/react": "0.1.0-beta.13",
  katex: "0.18.10",
  "mdast-util-from-markdown": "2.0.3",
  "mdast-util-gfm": "3.1.0",
  "mdast-util-math": "3.0.0",
  mermaid: "12.2.0",
  "micromark-extension-gfm": "3.0.0",
  "micromark-extension-math": "3.1.0",
  react: "19.3.1",
  "react-dom": "19.3.1",
  "react-is": "19.3.1",
  recharts: "3.10.1",
  remend: "1.5.0",
};

/** The versions as a pnpm catalog, the lines of a pnpm-workspace.yaml. */
const catalogYaml = [
  "# The versions Damsko is built and tested with.",
  "catalog:",
  ...Object.entries(versions).map(
    ([name, version]) =>
      `  ${name.startsWith("@") ? `"${name}"` : name}: ${version}`
  ),
].join("\n");

/** The template's own packages and the two the Vite config names, each at the catalog's version. */
const addAtCatalog =
  "pnpm add react@catalog: react-dom@catalog:\npnpm add -D vite@catalog: @vitejs/plugin-react@catalog: typescript@catalog: @types/node@catalog: @types/react@catalog: @types/react-dom@catalog: @stylexjs/unplugin@catalog: lightningcss@catalog:";

/** The stylesheets a new app imports, once, at its root: the tokens first. */
const appStyles = (from: string) =>
  ["tokens", "themes", "base", "fonts"]
    .map((name) => `@import "${from}/${name}.css";`)
    .join("\n");

/** components.json, with the registry's address. */
const componentsJson = (address: string) =>
  [
    "{",
    '  "$schema": "https://ui.shadcn.com/schema.json",',
    '  "style": "new-york",',
    '  "rsc": false,',
    '  "tsx": true,',
    '  "tailwind": { "config": "", "css": "", "baseColor": "", "cssVariables": true },',
    '  "aliases": {',
    '    "components": "@grasp-os/ui/components",',
    '    "ui": "@grasp-os/ui/components",',
    '    "lib": "@grasp-os/ui/lib",',
    '    "hooks": "@grasp-os/ui/hooks",',
    '    "utils": "@grasp-os/ui/lib/utils"',
    "  },",
    `  "registries": { "@damsko": "${address}" }`,
    "}",
  ].join("\n");

const registryAddress = `${siteAddress}/r/{name}.json`;

/** The components the first app uses, added in one command. */
const addComponents =
  "pnpm dlx shadcn@4.23.0 add @damsko/button @damsko/code-block";

/**
 * The first page of every app here: a button, with an icon the house set does not hold, from
 * Hugeicons (the package lib/icons draws from) through Damsko's Icon, and a line of code coloured
 * by CodeBlock's lexers.
 */
const firstApp = [
  'import { Button } from "@grasp-os/ui/components/button";',
  'import { CodeBlock, CodeBlockContent } from "@grasp-os/ui/components/code-block";',
  'import { Icon } from "@grasp-os/ui/lib/icons";',
  'import { FloppyDiskIcon } from "@hugeicons/core-free-icons";',
  "",
  "export default function App() {",
  "  return (",
  "    <>",
  '      <Button variant="default">',
  "        <Icon icon={FloppyDiskIcon} />",
  "        Save changes",
  "      </Button>",
  '      <CodeBlock language="ts" aria-label="A sum">',
  "        <CodeBlockContent>export const total = 1 + 2;</CodeBlockContent>",
  "      </CodeBlock>",
  "    </>",
  "  );",
  "}",
].join("\n");

/** The first page beside Tailwind: the button placed by an element of the page's own. */
const placedApp =
  'import { Button } from "@grasp-os/ui/components/button";\n\nexport default function App() {\n  return (\n    <div className="flex justify-end p-4">\n      <Button variant="default">Save changes</Button>\n    </div>\n  );\n}';

/**
 * shadcn's colour variables, each with the token that means the same (`--damsko-` and the name):
 * a fill and its words (`primary`, `primary-foreground`), and the words of a card, a popover, a
 * secondary or an accent, which Damsko gives no token of their own. scripts/check-registry.ts
 * fails on a token tokens.css does not define, and on a fill and its words that the token
 * generator does not measure as text (tokens/tokens.ts, contrastPairs).
 */
export const shadcnColours: Record<string, string> = {
  background: "background",
  foreground: "foreground",
  card: "card",
  "card-foreground": "foreground",
  popover: "popover",
  "popover-foreground": "foreground",
  primary: "primary",
  "primary-foreground": "primary-foreground",
  secondary: "secondary",
  "secondary-foreground": "foreground",
  muted: "muted",
  "muted-foreground": "muted-foreground",
  accent: "accent",
  "accent-foreground": "foreground",
  destructive: "destructive",
  border: "border",
  input: "input",
  ring: "ring",
  "chart-1": "chart-1",
  "chart-2": "chart-2",
  "chart-3": "chart-3",
  "chart-4": "chart-4",
  "chart-5": "chart-5",
  sidebar: "sidebar",
  "sidebar-foreground": "sidebar-foreground",
  "sidebar-primary": "primary",
  "sidebar-primary-foreground": "primary-foreground",
  "sidebar-accent": "sidebar-accent",
  "sidebar-accent-foreground": "sidebar-foreground",
  "sidebar-border": "sidebar-border",
  "sidebar-ring": "ring",
};

const shadcnBridge = [
  "/* After tokens.css, in place of the kit's light and dark values. */",
  ":root,",
  ".dark {",
  ...Object.entries(shadcnColours).map(
    ([name, token]) => `  --${name}: var(--damsko-${token});`
  ),
  "}",
].join("\n");

/** The fonts are unpacked once, where they were installed, and committed. */
const unpack = "node src/styles/fonts/unpack.mjs";

/**
 * The version the page pins, as an example: Damsko's own now (scripts/check-registry.ts holds it
 * to package.json), so the install check can install from it.
 */
export const pinned = "v0.1.0";

/** Every item, in one command: @damsko/all is every other item. */
const everyItemAgain =
  "pnpm dlx shadcn@4.23.0 add @damsko/all --overwrite --yes";

/** The same for a product that has some of the items: each by name, still in one command. */
const someItemsAgain =
  "pnpm dlx shadcn@4.23.0 add @damsko/tokens @damsko/fonts @damsko/lib @damsko/hooks @damsko/button --overwrite --yes";

/**
 * Whether the page provides the family the sans token names first, as a function a browser test
 * evaluates in the page. The install check evaluates it in every app it builds.
 */
export const sansProvided = [
  "() => {",
  "  const root = getComputedStyle(document.documentElement);",
  '  const [first = ""] = root.getPropertyValue("--damsko-font-sans").split(",");',
  '  const family = first.trim().replaceAll(\'"\', "");',
  "  return [...document.fonts].some(",
  '    (face) => face.family.replaceAll(\'"\', "") === family',
  "  );",
  "}",
].join("\n");

const nodeResolution = '"module": "esnext",\n"moduleResolution": "bundler"';

export const sections: Section[] = [
  {
    slug: "install",
    title: "Install",
    lead: "From an empty folder to a working button and a line of coloured code: a React app on Vite, StyleX, then the tokens, the fonts and two components from the shadcn CLI. Damsko's install check carries out these blocks, in this order, in an empty folder, on every change. The address in components.json here is this site's, which serves main as last deployed: a product pins a version instead (Pin and update, below).",
    starts: "empty",
    steps: [
      {
        slug: "start-a-react-app",
        name: "Start a React app",
        note: "Vite's React and TypeScript template, with pnpm.",
        blocks: [
          {
            code: "pnpm create vite@9.3.4 app --template react-ts\ncd app",
            lang: "bash",
            does: { kind: "run", in: "." },
          },
        ],
      },
      {
        slug: "pin-the-versions",
        name: "Pin the versions",
        note: "The whole of pnpm-workspace.yaml, beside package.json: a catalog of the versions Damsko is built and tested with. The template names its packages by a range and the CLI adds a component's by name alone, so without it each install takes whatever was released last. Then the template's packages, StyleX's plugin (the components are StyleX) and lightningcss, which the config below names, each at the catalog's version. A product with a catalog of its own keeps its own.",
        blocks: [
          {
            code: catalogYaml,
            lang: "yaml",
            does: { kind: "write", file: "app/pnpm-workspace.yaml" },
          },
          {
            code: addAtCatalog,
            lang: "bash",
            does: { kind: "run", in: "app" },
          },
        ],
      },
      {
        slug: "stylex-in-vite",
        name: "Add StyleX to Vite",
        note: "The whole of vite.config.ts. Each setting that is not StyleX's or Vite's default has its reason beside it.",
        blocks: [
          {
            code: appViteConfig,
            lang: "ts",
            does: { kind: "write", file: "app/vite.config.ts" },
          },
        ],
      },
      {
        slug: "a-document-the-framework-draws",
        name: "When the framework draws the document",
        note: "Skip this in an app with an index.html, as this one has. In development StyleX's plugin adds its stylesheet and its runtime to the page through index.html; a framework that renders the document itself (TanStack Start, React Router's framework mode) has none, so there every component has its classes and no rules until the two are in the document's head, in development only. A build needs neither: the CSS is in the app's stylesheet.",
        blocks: [
          {
            code: '<link rel="stylesheet" href="/virtual:stylex.css" />\n<script type="module" src="/@id/virtual:stylex:runtime"></script>',
            lang: "html",
          },
        ],
      },
      {
        slug: "typescript",
        name: "Tell TypeScript",
        note: "The alias, twice: the shadcn CLI reads it from tsconfig.json (without it there it stops at \"Could not resolve the following aliases\"), TypeScript's build from tsconfig.app.json. In tsconfig.node.json, bundler resolution in place of nodenext, or vite.config.ts cannot read StyleX's types.",
        blocks: [
          {
            code: '// tsconfig.json, in compilerOptions\n"paths": { "@grasp-os/ui/*": ["./src/*"] }',
            lang: "jsonc",
            does: {
              kind: "set",
              file: "app/tsconfig.json",
              at: ["compilerOptions"],
            },
          },
          {
            code: '// tsconfig.app.json, in compilerOptions\n"paths": { "@grasp-os/ui/*": ["./src/*"] }',
            lang: "jsonc",
            does: {
              kind: "set",
              file: "app/tsconfig.app.json",
              at: ["compilerOptions"],
            },
          },
          {
            code: `// tsconfig.node.json, in compilerOptions, in place of "module": "nodenext"\n${nodeResolution}`,
            lang: "jsonc",
            does: {
              kind: "set",
              file: "app/tsconfig.node.json",
              at: ["compilerOptions"],
            },
          },
        ],
      },
      {
        slug: "components-json",
        name: "Name the registry",
        note: "components.json at the project's root, written by hand: shadcn's init asks for Tailwind, which the components do not use. The tailwind block must be there, empty: with a base colour the CLI fetches from shadcn's own site. Every file has its own target, so the aliases place nothing, but they must be there and resolve.",
        blocks: [
          {
            code: componentsJson(registryAddress),
            lang: "json",
            does: { kind: "write", file: "app/components.json" },
          },
        ],
      },
      {
        slug: "add-the-tokens",
        name: "Add the tokens",
        note: "Once: the CSS variables (tokens.css), the modes and themes (themes.css), and base.css, a reset for an app that has none of its own.",
        blocks: [
          {
            code: "pnpm dlx shadcn@4.23.0 add @damsko/tokens",
            lang: "bash",
            does: { kind: "run", in: "app" },
          },
        ],
      },
      {
        slug: "add-the-fonts",
        name: "Add the fonts",
        note: "Geist, Geist Mono and Geist Serif under the names the tokens use, as files your own origin serves, with their licence (SIL Open Font License 1.1, fonts/OFL.txt). The CLI carries a file as text, so the six fonts arrive as base64 beside a script that turns them into the files (fonts/unpack.mjs). Run it once, here, and commit the six files: no build runs it, so the fonts are there however the app is built, by its own script or by a runner that calls the bundler from another folder. It is safe to run again, and fails when a font a sheet names is missing; with --check, in the product's checks, it changes nothing and fails while one is packed (Check for drift, below).",
        blocks: [
          {
            code: `pnpm dlx shadcn@4.23.0 add @damsko/fonts\n${unpack}`,
            lang: "bash",
            does: { kind: "run", in: "app" },
          },
        ],
      },
      {
        slug: "import-the-styles",
        name: "Import the styles",
        note: "The whole of src/index.css, in place of what Vite's template put there: the tokens first. base.css is for this app because it is new and has no reset; beside Tailwind it is left out (below). fonts.css is the three families; an app that serves one of them itself imports the others' sheets in its place (With a Geist of its own, below).",
        blocks: [
          {
            code: appStyles("./styles"),
            lang: "css",
            does: { kind: "write", file: "app/src/index.css" },
          },
        ],
      },
      {
        slug: "add-a-component",
        name: "Add components",
        note: "A Button and a CodeBlock. Each brings the parts it needs: the focus style, its icons, the components it uses, its npm packages, and for CodeBlock the lexers its code is coloured by.",
        blocks: [
          {
            code: addComponents,
            lang: "bash",
            does: { kind: "run", in: "app" },
          },
        ],
      },
      {
        slug: "use-it",
        name: "Use it",
        note: "Every file lands at the path it has in Damsko: src/components/button.tsx, the parts it builds on in src/lib/ and src/hooks/. Import it by the path a product's packages/ui exports, as the whole of src/App.tsx, then build it, or pnpm dev to look at it. lib/icons holds the icons Damsko's parts draw; any other Hugeicons drawing comes from @hugeicons/core-free-icons, which the CLI added with lib, and draws through the same Icon, at its holder's size and stroke. Only the drawings imported reach the bundle.",
        blocks: [
          {
            code: firstApp,
            lang: "tsx",
            does: { kind: "write", file: "app/src/App.tsx" },
          },
          {
            code: "pnpm build",
            lang: "bash",
            does: { kind: "run", in: "app" },
          },
        ],
      },
      {
        slug: "allow-webassembly",
        name: "Allow CodeBlock's WebAssembly",
        note: "CodeBlock colours its code with lexers compiled to WebAssembly, in scripts of their own that the build writes beside the app's other scripts: a core the page loads when it first draws a block, and one for each language, loaded when a block in it is first drawn. Each module is inside its script: nothing else is fetched, and no worker is started. A Content Security Policy that names script-src, or a default-src it falls back to, adds 'wasm-unsafe-eval', which lets the page compile WebAssembly and nothing else (no eval, no new Function); worker-src needs nothing. Without it, the code stays plain, whole and readable, with no colours, and nothing is said.",
        blocks: [
          {
            code: "Content-Security-Policy: script-src https://app.example.com/assets/ 'wasm-unsafe-eval'",
            lang: "text",
          },
        ],
      },
    ],
  },
  {
    slug: "in-a-workspace-package",
    title: "In a workspace package",
    lead: "A product keeps the components in a package of its workspace (packages/ui, named @grasp-os/ui) and its apps import them from there. From an empty folder again; the install check carries these blocks out too.",
    starts: "empty",
    steps: [
      {
        slug: "the-workspace",
        name: "The workspace and its app",
        note: "pnpm-workspace.yaml, with the catalog as above, and package.json at the root, then an app from Vite's template.",
        blocks: [
          {
            code: `packages:\n  - apps/*\n  - packages/*\n\n${catalogYaml}`,
            lang: "yaml",
            does: { kind: "write", file: "pnpm-workspace.yaml" },
          },
          {
            code: '{\n  "name": "product",\n  "private": true\n}',
            lang: "json",
            does: { kind: "write", file: "package.json" },
          },
          {
            code: "pnpm create vite@9.3.4 apps/web --template react-ts",
            lang: "bash",
            does: { kind: "run", in: "." },
          },
        ],
      },
      {
        slug: "the-package",
        name: "The package",
        note: "The whole of packages/ui/package.json and packages/ui/tsconfig.json. Source is exported as it is: the app's bundler compiles it. A plain exports map misses the two .tsx files of lib/, a component's .stylex.ts and the three folder components, so copy this one. React and its types are the package's own, at the catalog's versions: the components import them, and the CLI adds the rest.",
        blocks: [
          {
            code: JSON.stringify(
              {
                name: "@grasp-os/ui",
                private: true,
                type: "module",
                exports: packageExports,
                peerDependencies: { react: "^19.2.0", "react-dom": "^19.2.0" },
                devDependencies: {
                  "@types/react": "catalog:",
                  "@types/react-dom": "catalog:",
                  react: "catalog:",
                  "react-dom": "catalog:",
                },
              },
              null,
              2
            ),
            lang: "json",
            does: { kind: "write", file: "packages/ui/package.json" },
          },
          {
            code: JSON.stringify(
              {
                compilerOptions: {
                  target: "es2023",
                  lib: ["es2023", "dom", "dom.iterable"],
                  module: "preserve",
                  moduleResolution: "bundler",
                  jsx: "react-jsx",
                  strict: true,
                  noEmit: true,
                  skipLibCheck: true,
                },
                include: ["src"],
              },
              null,
              2
            ),
            lang: "json",
            does: { kind: "write", file: "packages/ui/tsconfig.json" },
          },
        ],
      },
      {
        slug: "the-packages-registry",
        name: "Name the registry",
        note: "The whole of packages/ui/components.json. The aliases resolve through the package's own name, so tsconfig.json needs no paths.",
        blocks: [
          {
            code: componentsJson(registryAddress),
            lang: "json",
            does: { kind: "write", file: "packages/ui/components.json" },
          },
        ],
      },
      {
        slug: "the-app-depends-on-it",
        name: "The app depends on it",
        note: "The package, and Hugeicons at the catalog's version for the icons the app draws itself (the package's own components bring theirs), then the template's packages, StyleX's plugin and lightningcss at the catalog's versions; this installs the workspace too.",
        blocks: [
          {
            code: `cd apps/web\npnpm add "@grasp-os/ui@workspace:*" @hugeicons/core-free-icons@catalog:\n${addAtCatalog}`,
            lang: "bash",
            does: { kind: "run", in: "." },
          },
        ],
      },
      {
        slug: "the-apps-vite-config",
        name: "The app's Vite config",
        note: "The whole of apps/web/vite.config.ts. No alias anywhere: the package's exports resolve the imports, for Vite and for TypeScript. In tsconfig.node.json, bundler resolution, as above.",
        blocks: [
          {
            code: workspaceConfig(false),
            lang: "ts",
            does: { kind: "write", file: "apps/web/vite.config.ts" },
          },
          {
            code: `// apps/web/tsconfig.node.json, in compilerOptions, in place of "module": "nodenext"\n${nodeResolution}`,
            lang: "jsonc",
            does: {
              kind: "set",
              file: "apps/web/tsconfig.node.json",
              at: ["compilerOptions"],
            },
          },
        ],
      },
      {
        slug: "add-to-the-package",
        name: "Add the tokens, the fonts and the components",
        note: "In packages/ui, where components.json is; the fonts are unpacked there, once, and committed.",
        blocks: [
          {
            code: `pnpm dlx shadcn@4.23.0 add @damsko/tokens @damsko/fonts @damsko/button @damsko/code-block\n${unpack}`,
            lang: "bash",
            does: { kind: "run", in: "packages/ui" },
          },
        ],
      },
      {
        slug: "the-apps-styles",
        name: "The app's styles",
        note: "The whole of apps/web/src/index.css, through the package. The fonts' sheets name their files by their path beside them, so the app's build finds and serves them.",
        blocks: [
          {
            code: appStyles("@grasp-os/ui/styles"),
            lang: "css",
            does: { kind: "write", file: "apps/web/src/index.css" },
          },
        ],
      },
      {
        slug: "use-it-in-the-app",
        name: "Use it",
        note: "The whole of apps/web/src/App.tsx, then build it.",
        blocks: [
          {
            code: firstApp,
            lang: "tsx",
            does: { kind: "write", file: "apps/web/src/App.tsx" },
          },
          {
            code: "pnpm build",
            lang: "bash",
            does: { kind: "run", in: "apps/web" },
          },
        ],
      },
    ],
  },
  {
    slug: "beside-tailwind",
    title: "Beside Tailwind",
    lead: "A product that still loads Tailwind keeps the same StyleX settings: with no layers of its own (useCSSLayers left off) a component's style wins over Tailwind's base layer, whose preflight makes a button's fill transparent, in a build and after every edit in dev alike. It does not import base.css: Tailwind's preflight is the reset, and Damsko's would restyle the product's own interface. The install check goes on from the workspace above, and holds a part of the app that is not Damsko's to the same pixels before and after.",
    starts: { after: "in-a-workspace-package" },
    steps: [
      {
        slug: "add-tailwind",
        name: "Tailwind, as a product has it",
        note: "Skip this in a product that has Tailwind already.",
        blocks: [
          {
            code: "pnpm add -D tailwindcss@catalog: @tailwindcss/vite@catalog:",
            lang: "bash",
            does: { kind: "run", in: "apps/web" },
          },
          {
            code: workspaceConfig(true),
            lang: "ts",
            does: { kind: "write", file: "apps/web/vite.config.ts" },
          },
        ],
      },
      {
        slug: "the-styles-beside-tailwinds",
        name: "The styles beside Tailwind's",
        note: "The whole of apps/web/src/index.css: the tokens, the themes and the fonts, and no base.css. The components need nothing from it here: none leans on its own rules, and each sets the text it needs or inherits the page's. themes.css lets the root follow the system's light or dark unless data-mode is set: a product that is light only writes data-mode=\"light\" on its root element.",
        blocks: [
          {
            code: '@import "tailwindcss";\n@import "@grasp-os/ui/styles/tokens.css";\n@import "@grasp-os/ui/styles/themes.css";\n@import "@grasp-os/ui/styles/fonts.css";',
            lang: "css",
            does: { kind: "write", file: "apps/web/src/index.css" },
          },
        ],
      },
      {
        slug: "place-it-with-a-class",
        name: "Place it with a class",
        note: "A Damsko component takes no class: its style prop takes a StyleX style (stylex.create's), so className on one is a type error. On a page still on Tailwind, an element of the page's own around the component places it and sizes it: the row below puts the button at its end, and a Skeleton, a line as wide as what holds it, takes its width from a div with w-40 round it. A page that moves to StyleX adds @stylexjs/stylex to its app and passes its own styles to style instead; a lint rule that reads every style attribute as an inline style object (shadcn's no-inline-styles) refuses that StyleX style, so a product that keeps the rule turns it off for the folders on Damsko. The whole of apps/web/src/App.tsx, then build it.",
        blocks: [
          {
            code: placedApp,
            lang: "tsx",
            does: { kind: "write", file: "apps/web/src/App.tsx" },
          },
          {
            code: "pnpm build",
            lang: "bash",
            does: { kind: "run", in: "apps/web" },
          },
        ],
      },
      {
        slug: "shadcns-variables",
        name: "shadcn's variables, from the tokens",
        note: "For a kit on shadcn's theme beside the components, while it stays: each of its colour variables read from the token that means the same, after tokens.css, so its pages stand on the ground, ink and hairlines Damsko's components do. One rule for light and dark: the tokens follow data-mode themselves. A fill and its words go as a pair: --primary-foreground is --damsko-primary-foreground, which turns dark where --damsko-primary turns light; --damsko-primary-foreground-on-color stays near white, for a fill that stays dark in both modes, and pairs with none of these. shadcn's --destructive is words and marks; a fill that deletes is --damsko-destructive-fill, with --damsko-destructive-fill-foreground on it. A card, a popover, a secondary and an accent have no words of their own: theirs are --damsko-foreground. Damsko's token check measures every pair here, light and dark, in every theme, and fails one below 4.5 to 1.",
        blocks: [{ code: shadcnBridge, lang: "css" }],
      },
    ],
  },
  {
    slug: "with-a-geist-of-its-own",
    title: "With a Geist of its own",
    lead: 'A product that already serves Geist loads it once, never beside Damsko\'s. The tokens name one family each ("Geist", "Geist Serif", "Geist Mono"), each family is a sheet of its own beside its files, and fonts.css is the three together. So the product leaves out the sheet of the family it has, imports the ones it lacks, and sets that family\'s token to the name its own has. The install check goes on from the app beside Tailwind, with Fontsource\'s Geist as an older kit loads it, and fails when two Geists load or when Geist Serif or Geist Mono does not arrive.',
    starts: { after: "beside-tailwind" },
    steps: [
      {
        slug: "the-apps-own-geist",
        name: "The app's own Geist",
        note: 'Skip this in a product that has it already. Fontsource\'s variable package registers the family as "Geist Variable".',
        blocks: [
          {
            code: "pnpm add @fontsource-variable/geist@catalog:",
            lang: "bash",
            does: { kind: "run", in: "apps/web" },
          },
        ],
      },
      {
        slug: "the-styles-without-damskos-geist",
        name: "The styles, without Damsko's Geist",
        note: "The whole of apps/web/src/index.css: the app's own Geist, the tokens and themes, then the two families it lacks in place of fonts.css, and the sans token set to its own family after tokens.css. --damsko-font-serif and --damsko-font-mono are set the same way by a product that brings those. Leaving a sheet out is all it takes to load nothing of that family: Damsko's Geist is 20 KB for the common characters and 28 KB more on a page with an accented one.",
        blocks: [
          {
            code: '@import "tailwindcss";\n@import "@fontsource-variable/geist";\n@import "@grasp-os/ui/styles/tokens.css";\n@import "@grasp-os/ui/styles/themes.css";\n@import "@grasp-os/ui/styles/fonts/geist-serif.css";\n@import "@grasp-os/ui/styles/fonts/geist-mono.css";\n\n:root {\n  --damsko-font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;\n}',
            lang: "css",
            does: { kind: "write", file: "apps/web/src/index.css" },
          },
          {
            code: "pnpm build",
            lang: "bash",
            does: { kind: "run", in: "apps/web" },
          },
        ],
      },
      {
        slug: "check-the-family",
        name: "Check the family",
        note: "A sheet left out with its token not set fails without a word: the text falls back to the system's font. So the product's browser test asks the page, once, whether it provides the family the sans token names first. The install check evaluates this function in every app it builds, and in this one again with the token left unset, where it must say no.",
        blocks: [
          {
            code: `const sansProvided = ${sansProvided};\n\nexpect(await page.evaluate(sansProvided)).toBe(true);`,
            lang: "ts",
          },
        ],
      },
    ],
  },
  {
    slug: "light-and-dark",
    title: "Light and dark",
    lead: "themes.css reads one attribute, data-mode (light, dark or system), on the root element or on any other; with none, the system's setting decides. Damsko has no theme provider: whatever holds a person's choice in the product writes the attribute.",
    starts: "each app",
    steps: [
      {
        slug: "before-the-first-paint",
        name: "Before the first paint",
        note: "First in the head of the app's index.html, so the page opens in the person's choice. Under a content security policy with no inline scripts, do the same at the top of the entry file.",
        blocks: [
          {
            code: [
              "<script>",
              "  try {",
              '    const mode = localStorage.getItem("mode");',
              '    if (mode === "light" || mode === "dark") document.documentElement.dataset.mode = mode;',
              "  } catch {}",
              "</script>",
            ].join("\n"),
            lang: "html",
            does: { kind: "head", file: "index.html" },
          },
        ],
      },
      {
        slug: "when-it-changes",
        name: "When it changes",
        note: "Where the choice is made: Theme toggle is controlled and writes nothing itself. A product whose own provider sets a dark class for Tailwind writes data-mode beside it, with the same value.",
        blocks: [
          {
            code: 'const choose = (mode: ThemeMode) => {\n  document.documentElement.dataset.mode = mode;\n  localStorage.setItem("mode", mode);\n  setMode(mode);\n};\n\n<ThemeToggle mode={mode} onModeChange={choose} />',
            lang: "tsx",
          },
        ],
      },
    ],
  },
  {
    slug: "pin-and-update",
    title: "Pin and update",
    lead: "What a product installs is one version of Damsko, and the record of which is the product's own: the address in its components.json. The CLI writes files only, so nothing in an installed file says where it came from; each item's meta, in the registry, says its version and commit. This site serves two things. /r/{name}.json is main as last deployed, whichever commit that is (version.json names it): right for a first look, never for a pin. /r/<tag>/{name}.json is a released version, and never changes: every release of Damsko is served there, from the archive its tag's release on GitHub carries.",
    starts: "the registry's",
    steps: [
      {
        slug: "pin-a-version",
        name: "Pin a version",
        note: "One line of components.json: the tag in the registry's address. An item names what it builds on by the same registry, so everything a component brings comes from that version too. The second form reads the tag from the environment, for a product that keeps it elsewhere; the CLI stops and names the variable when it is not set.",
        blocks: [
          {
            code: `// components.json\n"registries": { "@damsko": "${siteAddress}/r/${pinned}/{name}.json" }`,
            lang: "jsonc",
            does: { kind: "set", file: "components.json", at: [] },
          },
          {
            code: `"registries": { "@damsko": "${siteAddress}/r/\${DAMSKO_VERSION}/{name}.json" }`,
            lang: "jsonc",
          },
        ],
      },
      {
        slug: "install-and-update",
        name: "Install and update",
        note: "Every item the product has, all at once: never one item alone (the items share lib/ and the tokens). @damsko/all is every item of the registry, so one name installs them all and, with --overwrite, updates them all; never shadcn add --all, which installs from shadcn's own registry. A product that has only some names each of them in one command (the second block), in place of @damsko/all here and in the drift check below; what they build on comes with them. Then unpack the fonts, review the diff and commit it, the six font files with it. To update, change the tag in components.json and run it again.",
        blocks: [
          {
            code: `${everyItemAgain}\n${unpack}`,
            lang: "bash",
            does: { kind: "run", in: "." },
          },
          { code: someItemsAgain, lang: "bash" },
        ],
      },
      {
        slug: "check-for-drift",
        name: "Check for drift",
        note: "In the product's own checks, with its work committed: the same install again, the fonts unpacked, then two questions. The fonts' own check fails while a font is packed, missing or not the file that was installed; it is what keeps the fonts in place, whatever builds the app. The last line fails when the product's copy is not the pin's, new and changed files alike (git diff alone misses a file git does not track yet). The files are never edited in the product: a change is a pull request in Damsko, then an update.",
        blocks: [
          {
            code: `${everyItemAgain}\n${unpack}\n${unpack} --check\ntest -z "$(git status --porcelain)"`,
            lang: "bash",
            does: { kind: "run", in: "." },
          },
        ],
      },
    ],
  },
];

/** What the page says about the licence of what was installed. */
export const licence = {
  slug: "licence",
  title: "Licence",
  text: "Installed files stay under Damsko's licence wherever they land, whatever the licence of the repository around them: only Grasp, its affiliates, its contractors working for Grasp, and partners Grasp has authorised in writing may use them. Every registry item says so in its meta.license; no file carries a header for it. The fonts are under their own licence, the SIL Open Font License 1.1: OFL.txt is installed beside them.",
} as const;

export const nextSection = { slug: "where-next", title: "Where next" } as const;

export const headings = [
  ...sections.map((section) => ({
    depth: 2,
    slug: section.slug,
    text: section.title,
  })),
  { depth: 2, slug: licence.slug, text: licence.title },
  { depth: 2, slug: nextSection.slug, text: nextSection.title },
];

export const next = [
  {
    name: "Components",
    line: "Every part, with its states, rules and props.",
    href: "/components",
  },
  {
    name: "Colour",
    line: "Every colour as an oklch() token, light and dark, measured.",
    href: "/foundations/colour",
  },
  {
    name: "Patterns",
    line: "How the parts go together: forms, tables, loading.",
    href: "/patterns/forms",
  },
];

const fence = (code: string, lang: string) => `\`\`\`${lang}\n${code}\n\`\`\``;

/** The page as Markdown, front matter first, as a docs page's `.md` twin is. */
export const getStartedMarkdown = (): string =>
  [
    "---",
    `title: ${title}`,
    `description: ${description}`,
    "---",
    "",
    description,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      "",
      section.lead,
      "",
      ...section.steps.flatMap((step) => [
        `### ${step.name}`,
        "",
        step.note,
        "",
        ...step.blocks.flatMap((block) => [fence(block.code, block.lang), ""]),
      ]),
    ]),
    `## ${licence.title}`,
    "",
    licence.text,
    "",
    `## ${nextSection.title}`,
    "",
    ...next.map((item) => `- [${item.name}](${item.href}): ${item.line}`),
    "",
  ].join("\n");
