# Changelog

Every change a product sees, newest first. Versions follow [Semantic Versioning](https://semver.org); before 1.0 a minor version may break.

## 0.1.0 (unreleased)

The first release.

- 112 components, one file each, named after shadcn: `src/components/<name>.tsx`, with `<name>.stylex.ts` where it defines markers or variables; data-table, data-grid and markdown are folders. shadcn/ui's primitives, from accordion to tooltip, with a few of Damsko's own beside them, such as markdown, snippet and data-grid.
- Four blocks: app-shell-01, connect-api-key-01, inspector-01, share-dialog-01. What the components and blocks share is in `lib/`, `hooks/` and `styles/`.
- The AI components and patterns after shadcn's AI Elements, each installable on its own. The components: message, bubble, message-scroller, marker, attachment, questionnaire, trace and code-block. The patterns, built on them as shadcn builds them: chain-of-thought, chat, confirmation, context, file-tree, inline-citation, model-selector, plan, prompt-input, queue, reasoning, sources, stack-trace, subagent, suggestion, task, terminal, test-results and tool.
- Tokens are `--damsko-*` CSS variables and StyleX constants by category (`colors`, `space`, `radius`, `shadow`, `font`, `duration`, `size`, `media`), from `@damsko/tokens` and `@damsko/lib`. Icons are one house set of Hugeicons drawings, named by shape, in `lib/icons.ts`.
- A shadcn registry at `https://damsko.joingrasp.com/r/{name}.json`: add it to `components.json` as `@damsko` and install with the stock CLI (`pnpm dlx shadcn@4.23.0 add @damsko/button`). Every file lands byte for byte at its own path under `src/` (`registry:file`, `~/src/…` targets, packages by name only), so `components.json` needs `baseColor: ""` and no other setting changes.
- The primitives' few built-in words come from `I18nProvider`.
- The toolchain is the product repository's: pnpm, Vite+ with Oxfmt, Oxlint and Ultracite, TypeScript 7 with the product's strict flags, Vitest.
