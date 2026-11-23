# Changelog

Every change a product sees, newest first. Versions follow [Semantic Versioning](https://semver.org); before 1.0 a minor version may break.

## 0.1.0 (unreleased)

The first release.

- 105 components, one file each: `src/components/<name>.tsx`, with `<name>.stylex.ts` where it defines markers or variables; data-table, data-grid and markdown are folders. The primitives run from accordion to tooltip, with markdown, snippet and data-grid among them.
- Four blocks: app-shell-01, connect-api-key-01, inspector-01, share-dialog-01. What the components and blocks share is in `lib/`, `hooks/` and `styles/`.
- The AI components and patterns, each installable on its own. The components: message, bubble, message-scroller, marker, attachment, questionnaire, trace and code-block. The patterns, built on them: chain-of-thought, chat, confirmation, context, inline-citation, model-selector, prompt-input, reasoning, sources, stack-trace, suggestion, terminal, test-results and tool.
- A visible label is children or a label part, a control with no visible text takes `aria-label` and never a `label` prop, and the words a component shows or says itself and lets you replace end in `Text`. A hidden name for a part you cannot reach ends in `Label` (`thumbLabels`, `triggerLabel`). What changed:

  | Component | Was | Now |
  | --- | --- | --- |
  | Progress | `label`, `showLabel` | `<ProgressLabel>` and `<ProgressValue>` children (`ProgressValue` takes `(formatted, value) => …` as children), or `aria-label` |
  | ProgressCircle | `label`, `showLabel` | `aria-label`, `showValue` |
  | Slider | `label` | `<SliderLabel>` child |
  | Slider `variant="levels"` | `label`, `showLabel`, `emptyLabel` | `<SliderLabel>` child or `aria-label`, `emptyText` |
  | PromptInputQueue | `label` | `<PromptInputQueueTrigger>` and `<PromptInputQueueContent>` children |
  | PromptInputActionAddAttachments | `label` | children |
  | PromptInputMentionContent | `emptyLabel`, `errorLabel` | a `<PromptInputMentionEmpty>` child, `errorText` |
  | SidePanelSection | `emptyLabel`, `onAdd` | a `<SidePanelSectionAdd onClick>` child |
  | MessageAction, ModelSelectorMaker, ModelSelectorLogo | `label` | `aria-label` |
  | ThemeToggle | `label` | `aria-label`; the picker: `heading` |
  | BrandIcon, BrandIconGroup items | `label` | `name` |
  | ModelSelectorEffort | `label` | `heading` |
  | Button, HoldButton, `useAction` | `loadingLabel`, `successLabel`, `errorLabel` | `loadingText`, `successText`, `errorText` (the options' type `ActionLabels` is `ActionText`) |
  | DropdownMenuItem, ContextMenuItem, MenubarItem | `loadingLabel`, `errorLabel` | `loadingText`, `errorText` |
  | Command, its items' data, ConfirmationAction, AudioPlayer, Switch | `errorLabel` | `errorText` |
  | StepperNav | `finishLabel` | `finishText` |
  | CodeBlock | `languageLabel` | `languageName` |
  | inspector-01 sections | `emptyLabel` | `emptyText` |

- Tokens are `--damsko-*` CSS variables and StyleX constants by category (`colors`, `space`, `radius`, `shadow`, `font`, `duration`, `size`, `media`), from `@damsko/tokens` and `@damsko/lib`. Icons are one house set of Hugeicons drawings, named by shape, in `lib/icons.ts`.
- A shadcn registry at `https://damsko.joingrasp.com/r/{name}.json`: add it to `components.json` as `@damsko` and install with the stock CLI (`pnpm dlx shadcn@4.23.0 add @damsko/button`). Every file lands byte for byte at its own path under `src/` (`registry:file`, `~/src/…` targets, packages by name only), so `components.json` needs `baseColor: ""` and no other setting changes.
- The primitives' few built-in words come from `I18nProvider`. Its catalogue may be built while rendering, from a translation library: the provider keeps the words it has until `locale`, now required, or a string changes. The action hook's words are the part `action` (was `useAction`, which the React Compiler read as a hook).
- `@damsko/fonts`: Geist, Geist Mono and Geist Serif under the tokens' names, as six subset files and their licence, one sheet per family (`styles/fonts/geist.css`, `geist-serif.css`, `geist-mono.css`) and `styles/fonts.css` for the three. The files arrive as base64 text and `fonts/unpack.mjs` unpacks them, once, after an install: the product commits them, and `--check` fails while one is packed, missing or altered. Each font token names one family; a product that serves Geist itself leaves that sheet out and sets `--damsko-font-sans` to its own family, so one Geist loads.
- `@damsko/tokens` brings `styles/base.css`, an optional reset for a new app, in the cascade layer `base`; it is not for an app beside Tailwind, and no component leans on it.
- Every registry item says its version, commit and licence in `meta`, and every release is served at `/r/<tag>/{name}.json`, the address a product pins, from the archive its tag's release carries (`registry-<tag>.tgz` and its checksum).
- The toolchain is the product repository's: pnpm, Vite+ with Oxfmt, Oxlint and Ultracite, TypeScript 7 with the product's strict flags, Vitest.
