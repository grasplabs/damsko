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
- `@damsko/all` is every item by name, with no file of its own: one command installs or updates them all (`shadcn add @damsko/all --overwrite`). Each item's npm packages are exact and minimal, held to an install of that item alone.
- Every registry item says its version, commit and licence in `meta`, and every release is served at `/r/<tag>/{name}.json`, the address a product pins, from the archive its tag's release carries (`registry-<tag>.tgz` and its checksum).
- The toolchain is the product repository's: pnpm, Vite+ with Oxfmt, Oxlint and Ultracite, TypeScript 7 with the product's strict flags, Vitest.
- Looks and defaults brought to the original's: the sidebar's rows and group labels take a plain 6px corner (`sidebar-row-radius`, 10px for an `lg` row, `sidebar-row-radius-lg`) and its sheet on a narrow window the page card's 12px; a Button in a Dialog, AlertDialog, Sheet or Drawer footer that names no size is `sm`, as its Close; a `default` PromptInputBanner pads 8px at its sides, stands its words 8px after its mark, keeps no room for an action it does not have and is no live region; a model's name in the ModelSelector chip is in ink; a ToggleGroup's items that do not fit its box go on to another row. New: Button `variant="success"` (the yes that approves or confirms, ConfirmationAction's default), `TabsList fullWidth`, `TabsTrigger icon`, `PromptInputTools align="end"`, `ItemGroup stack`, `Tooltip toggleable`, `CodeBlockContent maxLines={false}` drawing every line, chart rows kept by their place, and sixteen icons from the original's set (`AppWindowIcon`, `CableIcon`, `CircleHelpIcon`, `ArrowLeftRightIcon`, `ContrastIcon`, `LaptopIcon`, `TabletIcon`, `SmartphoneIcon`, `ZapIcon`, `ScanIcon`, `ZoomInIcon`, `ZoomOutIcon`, `SplitIcon`, `ScaleIcon`, `FileInvoiceIcon`, `Minimize2Icon`).
- Markdown is read a block at a time by micromark and its unfinished end made whole by remend (a new dependency): a finished block is read and drawn once, an open fence is never parsed, a block being written is read again at most a fifth of the time, and each new word fades in while it streams (none with reduced motion, none in a link). A link of its own may lead to `tel:` and a path on this site, as `safeHref` now allows everywhere. `softBreaks` is on or off (`"auto"` is gone); a table draws and reads at most 1,000 rows, saying how many more; lists and quotes nested past 32 are drawn 32 deep; a paragraph past 1,000 lines goes on as another; `<details>` sections are read as one block, their body as blocks of their own.
