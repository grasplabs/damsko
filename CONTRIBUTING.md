# Contributing to Damsko

Damsko is maintained by Grasp. We don't accept outside pull requests.

## How the repository fits together

Four layers, each built on the one before:

| Path | What it is |
| --- | --- |
| `tokens/` | The token source (`tokens.ts`, `themes.ts`) and its generator. Never shipped. `pnpm generate` writes `src/lib/tokens.stylex.ts`, `src/lib/tokens.values.ts`, `src/styles/tokens.css` and `src/styles/themes.css` from it, and fails on a colour off the brand list or a contrast pair below its floor. |
| `src/` | What ships, at the paths it lands at in a product: `components/<name>.tsx` (with `<name>.stylex.ts` and `<name>-<what>.ts` helpers), the three folder components (`data-table/`, `data-grid/`, `markdown/`), `blocks/<name>/`, and `lib/`, `hooks/` and `styles/`, which every component builds on. |
| `examples/` | One folder per component: each file is one example, the code a product writes. The docs pages show them live. |
| `docs/` | The docs pages, one MDX file per component, foundation, guideline and pattern. |
| `site/` | The Astro site that renders `docs/` and `examples/` (`astro.config.ts`), with its own layout, search and Markdown twins for agents. |
| `scripts/` | Repository tooling, run by Node directly: the registry generator (`build-registry.ts`), the static gates (`gates.ts`), the tree guard (`guard.ts`), the hooks' checks, the specs' server (`serve.ts`) and the unit tests (`*.test.ts`). |
| `tests/` | The browser specs, Playwright Test against the built site: one per component, and one per rule that holds across the library. |
| `registry.json` | The shadcn registry's source, written by `scripts/build-registry.ts` and checked by `scripts/check-registry.ts`; `pnpm build` runs `scripts/registry-dist.ts`, which builds it into `dist/r/`, with each item's version, commit and licence in its `meta`; with `--release` it packs the same files as the archive a tag's release carries, and with `--versions`, as `pnpm build` runs it, it writes every released version into `dist/r/<tag>/` from those archives. |

The site and the registry deploy together as static files to https://damsko.joingrasp.com (`wrangler.jsonc`).

## Add a component

Say the component is `<name>`, in lower case with dashes.

1. `src/components/<name>.tsx`: the component, plus `<name>.stylex.ts` when it defines markers or variables and `<name>-<what>.ts` for a pure helper. Imports are relative.
2. `examples/<name>/`: one file per section of its page, each with a default export.
3. `docs/components/<name>.mdx`: its page, with a props table for every exported `…Props` type, and its Intent block (what always holds, what never to do).
4. `site/overview/sketches/<name>.ts`: its sketch on the components overview.
5. `site/system/kinds.ts`: add it to a kind; without one the page goes under "More".
6. `scripts/target-api.json`: its files and the names each exports.
7. Run `pnpm generate` and commit what it changes (`registry.json`).
8. `tests/<name>.spec.ts`: its spec (below).
9. Run `pnpm check`, `pnpm test`, `pnpm build` and its spec, and look at the page in `pnpm dev`, light and dark, at phone width.

## Rules every component passes

The product installs a component's source and builds it with its own toolchain, so every component passes the product's rules. CI checks the ones a machine can.

- **The product's toolchain.** Formatted, linted and type-checked with the same Vite+, Oxfmt, Oxlint and Ultracite settings and TypeScript's strict flags (`vp check`).
- **The React Compiler.** Every file compiles under `babel-plugin-react-compiler` at `panicThreshold: "all_errors"`, as the product builds it (`scripts/check-react-compiler.ts`). No hand-written `useMemo`, `useCallback` or `memo` (`scripts/check-no-memo.ts`).
- **StyleX as the product compiles it.** No style picked by an index into a literal list or object, which StyleX's compiler drops (`scripts/stylex-picks.ts`, run by the compiler check).
- **Every visible word is a prop**, with an English default the product replaces (`scripts/check-words.ts`).
- **A label is children.** A visible label is children or a label part, a control with no visible text takes `aria-label`, words a component shows or says itself and lets a caller replace end in `Text`, and a hidden name for a part a caller cannot reach ends in `Label`; a control never takes a `label` or `…Label` prop outside `scripts/labels-allowed.json` (`scripts/check-labels.ts`).
- **Tokens only.** Every colour, space, corner, edge, shadow, time and curve is a token. A colour that is not in the brand book is not in Damsko.
- **One corner shape.** Every rounded radius has `cornerShape: radius.shape` beside it, the squircle; a pill or a circle (`radius.full`, `radius.circle`) stays round, and a corner taken from the parent takes its shape too (`cornerShape: "inherit"`) (`scripts/check-corners.ts`).
- **Motion.** Every answer of the interface is over within 300 ms; with reduced motion, movement goes and the change of state stays. Anything a trigger opens grows from that trigger, never from its own centre.
- **Scrolling.** Scrollers hide their bar and keep the wheel inside them while they can scroll.
- **One height per size.** Controls of the same size line up, whatever they hold.
- **Untrusted content.** What a model or another user wrote is data: a link goes through `safeHref`, a picture, sound or video through `safeMediaSrc` (remote only with `allowRemote`), a key from content through `ownValue` (all in `lib/utils.ts`), and nothing is written as HTML.
- **Accessibility.** Keyboard and screen reader first: every part is reachable, named and announced, and keyboard focus always shows.
- **Dependencies** are pinned exactly in the catalog in `pnpm-workspace.yaml`; a component lists every npm package it imports (`scripts/check-registry.ts`).
- **Docs with the code.** A changed component's example and page change in the same pull request; every public props type has a table on a page (`scripts/check-api.ts`, `scripts/check-props.ts`).

## Component specs

Every component has one spec, `tests/<component>.spec.ts`, named for the component as it ships (`tests/snippet.spec.ts`, `tests/data-table.spec.ts` for a folder component). The specs sit in `tests/`, not beside the component, as the unit tests sit apart in `scripts/`: `src/` holds only what a product installs. A spec is Playwright Test, run against the built site: each test opens one example alone, as the site serves it at `/examples/<component>/<example>`, with `openExample(page, component, example, { theme, time })` from `tests/example.ts`, and drives it as a person does. A rule that holds across the library (focus, forced colours, touch targets, typed text on a phone, the product's CSP, scrolling, a first visit's weight) has a spec of its own that walks every component example or every page.

- Select by role, label and text (`getByRole`, `getByLabel`, `getByText`), never by `data-slot`, class or DOM shape.
- Test what a person can do and perceive: names, states, keyboard, focus and where it goes back to. Use Playwright's web-first assertions; no fixed waits.
- `theme: "dark"` opens it dark; `time: fixedTime` holds the page's clock, for an example that shows a time. `hasFocusRing(locator)` says whether the keyboard's ring shows.
- Reduced motion is on; Chromium runs by default, Firefox and WebKit nightly in CI, on Linux. WebKit on a Mac behaves as Safari does there: Tab skips buttons (Option+Tab reaches them) and a click does not focus a button, so a spec that tabs fails there and holds in CI.
- No page objects or shared fixtures beyond `tests/example.ts`: a spec reads top to bottom.

Build once, then run:

```sh
pnpm build                                     # dist/, which the specs serve
pnpm test:browser                              # every spec, Chromium
pnpm test:browser tests/button.spec.ts         # one component
pnpm exec playwright test --project=firefox --project=webkit
```

`SITE_DIR=<folder>` runs the specs on another build, `BASE_URL=<url>` on a site already served.

## Definition of done for a component

A component's pull request holds all of this:

- [ ] **API pinned.** `scripts/target-api.json` lists its files and exactly what each exports; change it only where the API changes on purpose, and say why in the pull request. `node scripts/check-target-api.ts` and `node scripts/check-product-knowledge.ts` pass: its shape (one file, its `.stylex.ts` and helpers, or a folder component's listed files; no barrel, no `@deprecated`, no import of another component's internals) and no product knowledge.
- [ ] **Spec.** `tests/<name>.spec.ts` covers what a person can do with it, and the cross-cutting specs pass on its examples: `pnpm build && pnpm test:browser`.
- [ ] **Example and docs page updated**: `examples/<name>/` and `docs/components/<name>.mdx`, changed with the component.
- [ ] **Registry current**: `pnpm generate` run and `registry.json` committed.
- [ ] **Green**: `pnpm exec vp check`, `node scripts/gates.ts`, `node scripts/guard.ts` and `pnpm exec vp test` (`pnpm check` runs the first three).

## Commits and pull requests

Trunk-based, as in the product repository: branch from `main` as `<type>/<kebab-description>`, open a draft pull request, have it reviewed by someone (or an agent) that didn't write it, and add it to the merge queue, which squash-merges it. The pull request's title is the commit on `main`: a Conventional Commit scoped to the component or area, such as `feat(button): add the icon-sm size` or `ci: cache the store`. Screenshots go in the pull request, never in the repository. The hooks and CI check the message, the branch name and that nothing credits an AI tool.

## Release

The site and the registry are built from `main`; no CI job deploys them. The site serves `main` as last deployed at `/r/{name}.json` (`version.json` names the commit and the version), and every released version at `/r/<tag>/{name}.json`, which is what a product pins (README, "Pin a version and update"). The build (`pnpm build`) writes the second from GitHub, with no token and nothing of its API: the version tags by `git ls-remote --tags`, then each tag's archive and checksum from its release's download address. A tag with no archive is passed over and said; a checksum that does not match, or GitHub not answering, stops the build. So the build needs `git` and to reach `github.com`, and a new version is served from the first deploy after its release is there.

A release is a tag (`v0.1.0`, …) on `main`, with its entry in [CHANGELOG.md](CHANGELOG.md) moved from Unreleased to the version and `version` in `package.json` raised with it (`pnpm generate` writes it into every registry item); the tag is `v` and that version. Pushing the tag runs `.github/workflows/release.yml`: it fails when the tag is not `package.json`'s version, builds the registry from the tagged commit (`node scripts/registry-dist.ts out --release`), makes the tag's release when there is none, and attaches `registry-<tag>.tgz` and `registry-<tag>.tgz.sha256`. A tag is a pin: the archive is the same bytes whenever the same commit is packed, so a tag pushed again uploads what is there; an archive that differs from the release's is refused, unless the workflow is run by hand for that tag with `replace` ticked. It uses the job's own token with `contents: write` and no secret. Then deploy the site, which serves the version from then on.
