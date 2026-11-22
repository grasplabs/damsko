// Get started's words (site/pages/get-started.astro), in one place, with its Markdown twin
// (getStartedMarkdown, at /get-started.md).
// Plain data and plain functions: a Node script can import this too. scripts/check-install.ts
// does: it builds the two apps this page describes from the blocks below, so what is copied from
// here is what was run.

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

export interface Step {
  slug: string;
  name: string;
  note: string;
  code: string;
  lang: string;
  then?: { code: string; lang: string };
}

/** One part of the page: a heading, a sentence and its steps, numbered from one. */
export interface Section {
  slug: string;
  title: string;
  lead: string;
  steps: Step[];
}

/**
 * Turns the fonts the CLI wrote as base64 text into the files, and removes the text: the CLI
 * carries a file's content as text, which a font is not. Run where components.json is.
 */
export const unpackFonts = [
  "node -e '",
  'const fs = require("node:fs"), dir = "src/styles/fonts/";',
  "for (const name of fs.readdirSync(dir)) {",
  '  if (!name.endsWith(".base64")) continue;',
  '  fs.writeFileSync(dir + name.slice(0, -7), Buffer.from(fs.readFileSync(dir + name, "utf8"), "base64"));',
  "  fs.rmSync(dir + name);",
  "}'",
].join("\n");

/** Why light-dark() is kept, as both Vite configs say it. */
const keepLightDark = [
  "// The tokens give a colour's light and dark values in one light-dark(), which follows the",
  "// color-scheme of the element that uses it. Keep it as written: rewritten for older browsers it",
  "// leans on variables only a color-scheme rule in the same stylesheet sets, and without one",
  "// every colour is invalid.",
  "const keepLightDark = { exclude: Features.LightDark };",
];

/** The StyleX options both Vite configs share, with their reasons. */
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
export const workspaceViteConfig = [
  'import stylex from "@stylexjs/unplugin";',
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

/** The stylesheets, once, at the app's root, by the path they have from there: the tokens first. */
export const rootStyles = (from: string) =>
  ["tokens", "themes", "base", "fonts"]
    .map((name) => `@import "${from}/${name}.css";`)
    .join("\n");

/** components.json, with the registry's address. */
export const componentsJson = (address: string) =>
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

/** The mode a person chose, set before the first paint; with none kept, the system decides. */
export const modeScript = [
  "<script>",
  "  try {",
  '    const mode = localStorage.getItem("mode");',
  '    if (mode === "light" || mode === "dark") document.documentElement.dataset.mode = mode;',
  "  } catch {}",
  "</script>",
].join("\n");

/** Every item a product has, installed again at once, then the fonts unpacked. */
const installAgain = [
  "pnpm dlx shadcn@4.23.0 add @damsko/tokens @damsko/fonts @damsko/lib @damsko/hooks @damsko/button --overwrite --yes",
  unpackFonts,
].join("\n");

export const sections: Section[] = [
  {
    slug: "install",
    title: "Install",
    lead: "From an empty folder to a working button: a React app on Vite, StyleX, then the tokens, the fonts and a component from the shadcn CLI. Damsko's install check builds this app from these blocks on every change.",
    steps: [
      {
        slug: "start-a-react-app",
        name: "Start a React app",
        note: "Vite's React and TypeScript template, with pnpm, StyleX's plugin (the components are StyleX) and lightningcss, which the config below names.",
        code: "pnpm create vite@latest app --template react-ts\ncd app\npnpm install\npnpm add -D @stylexjs/unplugin@0.19.2 lightningcss@1.33.0",
        lang: "bash",
      },
      {
        slug: "stylex-in-vite",
        name: "Add StyleX to Vite",
        note: "In vite.config.ts. Each setting that is not StyleX's or Vite's default has its reason beside it.",
        code: appViteConfig,
        lang: "ts",
      },
      {
        slug: "typescript",
        name: "Tell TypeScript",
        note: "The same alias in tsconfig.app.json's compilerOptions. In tsconfig.node.json, bundler resolution in place of nodenext, or vite.config.ts cannot read StyleX's types.",
        code: '// tsconfig.app.json, in compilerOptions\n"paths": { "@grasp-os/ui/*": ["./src/*"] }',
        lang: "jsonc",
        then: {
          code: '// tsconfig.node.json, in compilerOptions, in place of "module": "nodenext"\n"module": "esnext",\n"moduleResolution": "bundler"',
          lang: "jsonc",
        },
      },
      {
        slug: "components-json",
        name: "Name the registry",
        note: "components.json at the project's root, written by hand: shadcn's init asks for Tailwind, which the components do not use. The tailwind block must be there, empty: with a base colour the CLI fetches from shadcn's own site. Every file has its own target, so the aliases place nothing, but they must be there.",
        code: componentsJson(`${siteAddress}/r/{name}.json`),
        lang: "json",
      },
      {
        slug: "add-the-tokens",
        name: "Add the tokens",
        note: "Once: the CSS variables (tokens.css), the modes and themes (themes.css) and the base the components assume (base.css: one box model, no browser look on a control, the page's text, all in the cascade layer base, under every component's own style). The file says what each rule is for.",
        code: "pnpm dlx shadcn@4.23.0 add @damsko/tokens",
        lang: "bash",
      },
      {
        slug: "add-the-fonts",
        name: "Add the fonts",
        note: 'Geist, Geist Mono and Geist Serif under the names the tokens use, as files your own origin serves, with their licence (SIL Open Font License 1.1, fonts/OFL.txt). The CLI carries a file as text, so the six fonts arrive as base64: the second command turns them into the files. A product that loads Geist another way skips this item: the tokens name "Geist Variable" and "Geist Mono Variable" too, the families Fontsource\'s variable packages register, after "Geist" and "Geist Mono", so either source draws the components in Geist and both may be loaded at once.',
        code: "pnpm dlx shadcn@4.23.0 add @damsko/fonts",
        lang: "bash",
        then: { code: unpackFonts, lang: "bash" },
      },
      {
        slug: "import-the-styles",
        name: "Import the styles",
        note: "In src/index.css, in place of what Vite's template put there: the tokens first.",
        code: rootStyles("./styles"),
        lang: "css",
      },
      {
        slug: "add-a-component",
        name: "Add a component",
        note: "It brings the parts it needs: the focus style, its icons, the components it uses, its npm packages.",
        code: install,
        lang: "bash",
      },
      {
        slug: "use-it",
        name: "Use it",
        note: "Every file lands at the path it has in Damsko: src/components/button.tsx, the parts it builds on in src/lib/ and src/hooks/. Import it by the path a product's packages/ui exports, in src/App.tsx, then pnpm dev.",
        code: 'import { Button } from "@grasp-os/ui/components/button";\n\nexport default function App() {\n  return <Button variant="default">Save changes</Button>;\n}',
        lang: "tsx",
      },
    ],
  },
  {
    slug: "in-a-workspace-package",
    title: "In a workspace package",
    lead: "A product keeps the components in a package of its workspace (packages/ui, named @grasp-os/ui) and its apps import them from there. components.json and the CLI's commands are the same, in the package; these three steps differ. The install check builds this layout too.",
    steps: [
      {
        slug: "the-packages-exports",
        name: "The package's exports",
        note: "In packages/ui/package.json. Source is exported as it is: the app's bundler compiles it. A plain map misses the two .tsx files of lib/, a component's .stylex.ts and the three folder components, so copy this one.",
        code: JSON.stringify(
          {
            name: "@grasp-os/ui",
            private: true,
            type: "module",
            exports: packageExports,
          },
          null,
          2
        ),
        lang: "json",
      },
      {
        slug: "the-apps-vite-config",
        name: "The app's Vite config",
        note: 'In the app that depends on the package ("@grasp-os/ui": "workspace:*"), with @stylexjs/unplugin and lightningcss as its dev dependencies. No alias anywhere: the package\'s exports resolve the imports, for Vite and for TypeScript.',
        code: workspaceViteConfig,
        lang: "ts",
      },
      {
        slug: "the-apps-styles",
        name: "The app's styles",
        note: "In the app's root stylesheet, through the package. fonts.css names its files by their path beside it, so the app's build finds and serves them.",
        code: rootStyles("@grasp-os/ui/styles"),
        lang: "css",
      },
    ],
  },
  {
    slug: "beside-tailwind",
    title: "Beside Tailwind",
    lead: "A product that still loads Tailwind keeps the same StyleX settings. With no layers of its own (useCSSLayers left off) a component's style wins over Tailwind's base layer, whose preflight makes a button's fill transparent, in a build and after every edit in dev alike.",
    steps: [
      {
        slug: "the-styles-beside-tailwinds",
        name: "The styles beside Tailwind's",
        note: "Tailwind's preflight is the same box model as base.css, in a layer of the same name, so base.css is not needed while Tailwind is there. Importing it as well sets the page's text, and two rules for everything on the page, the product's own parts included: nothing refuses to shrink below its content, and a pointer on what can be pressed. Import it when Tailwind leaves.",
        code: '@import "tailwindcss";\n@import "@grasp-os/ui/styles/tokens.css";\n@import "@grasp-os/ui/styles/themes.css";\n@import "@grasp-os/ui/styles/fonts.css";',
        lang: "css",
      },
    ],
  },
  {
    slug: "light-and-dark",
    title: "Light and dark",
    lead: "themes.css reads one attribute, data-mode (light, dark or system), on the root element or on any other; with none, the system's setting decides. Damsko has no theme provider: whatever holds a person's choice in the product writes the attribute.",
    steps: [
      {
        slug: "before-the-first-paint",
        name: "Before the first paint",
        note: "In index.html's head, so the page opens in the person's choice. Under a content security policy with no inline scripts, do the same at the top of the entry file.",
        code: modeScript,
        lang: "html",
      },
      {
        slug: "when-it-changes",
        name: "When it changes",
        note: "Where the choice is made: Theme toggle is controlled and writes nothing itself. A product whose own provider sets a dark class for Tailwind writes data-mode beside it, with the same value.",
        code: 'const choose = (mode: ThemeMode) => {\n  document.documentElement.dataset.mode = mode;\n  localStorage.setItem("mode", mode);\n  setMode(mode);\n};\n\n<ThemeToggle mode={mode} onModeChange={choose} />',
        lang: "tsx",
      },
    ],
  },
  {
    slug: "pin-and-update",
    title: "Pin and update",
    lead: "The registry at /r/ is Damsko's main as last deployed. Every deploy serves the same files under its commit too, an address that never serves another commit's files, and every item says its version and its commit in its meta. A product pins that address: an install is then exactly one commit of Damsko, or it fails.",
    steps: [
      {
        slug: "pin-a-commit",
        name: "Pin a commit",
        note: "In components.json, the registry's address with the commit the site serves, which version.json names.",
        code: `curl -s ${siteAddress}/version.json`,
        lang: "bash",
        then: {
          code: `"registries": { "@damsko": "${siteAddress}/r/<commit>/{name}.json" }`,
          lang: "jsonc",
        },
      },
      {
        slug: "update",
        name: "Update",
        note: "Once main has moved on the pinned address answers 404. Put the new commit in components.json, install every item the product has again, all at once, and review the diff. Never one item alone (the items share lib/ and the tokens), and never shadcn add --all, which installs from shadcn's own registry.",
        code: `${installAgain}\ngit diff`,
        lang: "bash",
      },
      {
        slug: "check-for-drift",
        name: "Check for drift",
        note: "Two questions. Is the pin behind: version.json's sha is not the commit in components.json. Is the product's copy still the pin's: the same install again changes nothing, while that commit is served; for any commit, the files equal Damsko's src/ at that commit on GitHub. The files are never edited in the product: a change is a pull request in Damsko, then an update.",
        code: `${installAgain}\ngit diff --exit-code`,
        lang: "bash",
      },
    ],
  },
];

/** What the page says about the licence of what was installed. */
export const licence = {
  slug: "licence",
  title: "Licence",
  text: "Installed files stay under Damsko's licence wherever they land, whatever the licence of the repository around them: only Grasp, its affiliates and its contractors working for Grasp may use them. Every registry item says so in its meta.license; no file carries a header for it. The fonts are under their own licence, the SIL Open Font License 1.1: OFL.txt is installed beside them.",
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
        fence(step.code, step.lang),
        "",
        ...(step.then ? [fence(step.then.code, step.then.lang), ""] : []),
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
