// Get started's words (site/pages/get-started.astro), in one place, with its Markdown twin
// (getStartedMarkdown, at /get-started.md).
// Plain data and plain functions: a Node script can import this too.

export const route = "/get-started";
export const title = "Get started";
export const description =
  "Add the tokens once, then any component, with the shadcn CLI. It lands in your project as code you own.";

export const sections = {
  install: {
    slug: "install",
    title: "Install",
    lead: "From an empty folder to a working button: a React app on Vite, StyleX, then the tokens and a component from the shadcn CLI. Each step was run as written, in that order.",
  },
  next: { slug: "where-next", title: "Where next" },
} as const;

export const headings = [
  { depth: 2, slug: sections.install.slug, text: sections.install.title },
  { depth: 2, slug: sections.next.slug, text: sections.next.title },
];

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

export const steps: Step[] = [
  {
    slug: "start-a-react-app",
    name: "Start a React app",
    note: "Vite's React and TypeScript template, with pnpm, and StyleX's plugin: the components are StyleX.",
    code: "pnpm create vite@latest app --template react-ts\ncd app\npnpm install\npnpm add -D @stylexjs/unplugin@0.19.2",
    lang: "bash",
  },
  {
    slug: "stylex-in-vite",
    name: "Add StyleX to Vite",
    note: "In vite.config.ts. StyleX resolves the token imports itself, so it gets the @grasp-os/ui alias too; errorRecovery keeps a cold start off the error overlay.",
    code: [
      'import { fileURLToPath } from "node:url";',
      "",
      'import stylex from "@stylexjs/unplugin";',
      'import react from "@vitejs/plugin-react";',
      'import { defineConfig } from "vite";',
      "",
      'const root = fileURLToPath(new URL(".", import.meta.url));',
      "",
      "export default defineConfig({",
      "  plugins: [",
      "    stylex.vite({",
      "      useCSSLayers: true,",
      '      unstable_moduleResolution: { type: "commonJS", rootDir: root },',
      '      aliases: { "@grasp-os/ui/*": [`${root}src/*`] },',
      "      // A cold dev start can ask for the CSS before the tokens file is compiled: drop what",
      "      // cannot be read yet; the full CSS follows a moment later, with no overlay.",
      "      lightningcssOptions: { errorRecovery: true },",
      "    }),",
      "    react(),",
      "  ],",
      '  resolve: { alias: { "@grasp-os/ui": `${root}src` } },',
      "});",
    ].join("\n"),
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
    note: "components.json at the project's root, written by hand: shadcn's init asks for Tailwind, which the components do not use. The tailwind block must be there, empty: with a base colour the CLI fetches from shadcn's own site.",
    code: [
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
      `  "registries": { "@damsko": "${siteAddress}/r/{name}.json" }`,
      "}",
    ].join("\n"),
    lang: "json",
  },
  {
    slug: "add-the-tokens",
    name: "Add the tokens",
    note: "Once. Then import them at the root, in place of what Vite's template put in src/index.css. Load Geist yourself: the registry carries no fonts.",
    code: "pnpm dlx shadcn@4.23.0 add @damsko/tokens",
    lang: "bash",
    then: {
      code: '@import "./styles/tokens.css";\n@import "./styles/themes.css";\n\n:root {\n  color-scheme: light dark;\n}',
      lang: "css",
    },
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
    `## ${sections.install.title}`,
    "",
    sections.install.lead,
    "",
    ...steps.flatMap((step) => [
      `### ${step.name}`,
      "",
      step.note,
      "",
      fence(step.code, step.lang),
      "",
      ...(step.then ? [fence(step.then.code, step.then.lang), ""] : []),
    ]),
    `## ${sections.next.title}`,
    "",
    ...next.map((item) => `- [${item.name}](${item.href}): ${item.line}`),
    "",
  ].join("\n");
