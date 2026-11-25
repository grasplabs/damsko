import stylex from "@stylexjs/unplugin/vite";
import ultracite from "ultracite/oxfmt";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import tanstack from "ultracite/oxlint/tanstack";
import vitest from "ultracite/oxlint/vitest";
import { defineConfig } from "vite-plus";

// Written by a generator, byte for byte; its --check compares them.
const generated = [
  "registry.json",
  "src/styles/**",
  "src/lib/tokens.stylex.ts",
  "src/lib/tokens.values.ts",
  "examples/streaming/streams/**",
];

// Test through real interfaces; mock only outside systems, at their
// boundary. (anti-slop/no-module-mocking only knows `vitest` imports.)
const noModuleMocks = ["mock", "doMock", "hoisted"].map((property) => ({
  object: "vi",
  property,
  message:
    "Don't mock modules. Pass the dependency through a real interface instead.",
}));

/** The unit tests that weigh time (see `test.projects`). */
const TIMED = [
  "scripts/markdown-cost-*.test.{ts,tsx}",
  "scripts/markdown.test.tsx",
  "scripts/markdown-parse.test.ts",
];

export default defineConfig({
  lint: {
    extends: [core, react, tanstack, vitest, shadcn],
    ignorePatterns: [...(core.ignorePatterns ?? []), ...generated],
    jsPlugins: [...(shadcn.jsPlugins ?? []), ...(antiSlop.jsPlugins ?? [])],
    options: {
      typeAware: true,
      typeCheck: true,
      // No warning tier: a rule is either an error or off.
      denyWarnings: true,
      // A disable comment that no longer suppresses anything must go.
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      // Picked from Ultracite's anti-slop preset: the rules that stop agents
      // from silencing the type checker. The rest of that preset forces
      // workarounds (no options objects, no `unknown`).
      "anti-slop/no-chained-type-assertions": "error",
      "anti-slop/no-widen-then-assert": "error",
      "anti-slop/require-safety-comment-for-type-assertion": "error",
      "no-restricted-properties": ["error", ...noModuleMocks],
      // The docs read two tags of their own from a props type: `@when`
      // (the case a part's props apply to) and `@by` (the prop that
      // chooses it).
      "jsdoc/check-tag-names": ["error", { definedTags: ["when", "by"] }],
    },
    settings: {
      shadcn: {
        ui: "@grasp-os/ui/components",
      },
    },
    overrides: [
      {
        // The product's settings for its installed copy of these files
        // (packages/ui/src/components there).
        files: ["src/components/**", "src/blocks/**"],
        rules: {
          "shadcn/no-arbitrary-values": "off",
          "shadcn/no-restyle": "off",
          "shadcn/require-static-classes": "off",
          // Components are added with the shadcn CLI; keep its code style.
          "func-style": "off",
          "react/function-component-definition": "off",
          // shadcn gives divs ARIA roles (group, list, link, status) for
          // their layout; a semantic tag would bring its own styles.
          "jsx-a11y/prefer-tag-over-role": "off",
        },
      },
      {
        // An example is a component's usage as a product writes it, in the
        // shadcn CLI's code style (`export default function`).
        files: ["examples/**"],
        rules: {
          "func-style": "off",
          "react/function-component-definition": "off",
        },
      },
      {
        // Markdown's switch over mdast's phrasing nodes ends in a default.
        // Here the site's MDX packages add their own node types to that
        // union, which the product's copy does not see.
        files: ["src/components/markdown/markdown.tsx"],
        rules: { "typescript/switch-exhaustiveness-check": "off" },
      },
      {
        // The component specs run on Playwright Test, not Vitest: their
        // `test` and `expect` come from @playwright/test, which has no
        // `test.each`, and Playwright names its files `.spec.ts`. These are
        // the Vitest rules that read any `*.spec.ts` as Vitest's; a
        // committed `.only` fails Playwright's own `forbidOnly` in CI.
        files: ["tests/**/*.spec.ts"],
        plugins: ["vitest"],
        rules: {
          "vitest/consistent-test-filename": "off",
          "vitest/prefer-each": "off",
          "vitest/prefer-importing-vitest-globals": "off",
        },
      },
      {
        // Rules the examples do not pass. Each comes back on once the
        // examples pass it; type-checking and every other rule hold here.
        files: ["examples/**"],
        rules: {
          "anti-slop/no-chained-type-assertions": "off",
          "anti-slop/require-safety-comment-for-type-assertion": "off",
          "eslint/complexity": "off",
          "eslint/no-await-in-loop": "off",
          "eslint/no-empty-function": "off",
          "eslint/no-nested-ternary": "off",
          "eslint/no-plusplus": "off",
          "eslint/no-promise-executor-return": "off",
          "eslint/no-redeclare": "off",
          "eslint/no-shadow": "off",
          "eslint/no-unused-expressions": "off",
          "eslint/no-unused-vars": "off",
          "eslint/no-use-before-define": "off",
          "eslint/no-void": "off",
          "eslint/prefer-destructuring": "off",
          "eslint/prefer-named-capture-group": "off",
          "eslint/require-await": "off",
          "import/first": "off",
          "jsx-a11y/anchor-has-content": "off",
          "jsx-a11y/aria-role": "off",
          "jsx-a11y/control-has-associated-label": "off",
          "jsx-a11y/label-has-associated-control": "off",
          "jsx-a11y/no-noninteractive-element-interactions": "off",
          "jsx-a11y/no-noninteractive-element-to-interactive-role": "off",
          "jsx-a11y/no-noninteractive-tabindex": "off",
          "jsx-a11y/no-static-element-interactions": "off",
          "jsx-a11y/prefer-tag-over-role": "off",
          "promise/avoid-new": "off",
          "promise/no-multiple-resolved": "off",
          "promise/param-names": "off",
          "promise/prefer-await-to-then": "off",
          "react-hooks/exhaustive-deps": "off",
          "react/exhaustive-effect-dependencies": "off",
          "react/hook-use-state": "off",
          "react/jsx-handler-names": "off",
          "react/jsx-no-useless-fragment": "off",
          "react/no-object-type-as-default-prop": "off",
          "react/no-unescaped-entities": "off",
          "react/no-unstable-nested-components": "off",
          "react/refs": "off",
          "react/set-state-in-effect": "off",
          "react/static-components": "off",
          "react/todo": "off",
          "react/use-memo": "off",
          "shadcn/no-inline-styles": "off",
          "typescript/consistent-return": "off",
          "typescript/method-signature-style": "off",
          "typescript/no-confusing-void-expression": "off",
          "typescript/no-deprecated": "off",
          "typescript/no-misused-promises": "off",
          "typescript/no-non-null-assertion": "off",
          "typescript/no-unnecessary-boolean-literal-compare": "off",
          "typescript/no-unnecessary-type-assertion": "off",
          "typescript/no-unnecessary-type-conversion": "off",
          "typescript/no-unsafe-type-assertion": "off",
          "typescript/prefer-nullish-coalescing": "off",
          "typescript/promise-function-async": "off",
          "typescript/strict-boolean-expressions": "off",
          "typescript/strict-void-return": "off",
          "unicorn/consistent-function-scoping": "off",
          "unicorn/error-message": "off",
          "unicorn/no-array-for-each": "off",
          "unicorn/no-array-sort": "off",
          "unicorn/no-object-as-default-parameter": "off",
          "unicorn/no-useless-undefined": "off",
          "unicorn/prefer-at": "off",
          "unicorn/prefer-dom-node-dataset": "off",
          "unicorn/prefer-export-from": "off",
          "unicorn/prefer-number-coercion": "off",
          "unicorn/prefer-query-selector": "off",
          "unicorn/prefer-spread": "off",
          "unicorn/prefer-ternary": "off",
        },
      },
      {
        // Rules the docs site does not pass. As above, each comes back on
        // once the site passes it; type-checking and every other rule hold.
        files: ["site/**"],
        rules: {
          "anti-slop/no-chained-type-assertions": "off",
          "anti-slop/require-safety-comment-for-type-assertion": "off",
          "eslint/complexity": "off",
          "eslint/curly": "off",
          "eslint/default-case": "off",
          "eslint/func-style": "off",
          "eslint/no-alert": "off",
          "eslint/no-await-in-loop": "off",
          "eslint/no-bitwise": "off",
          "eslint/no-empty": "off",
          "eslint/no-empty-function": "off",
          "eslint/no-inline-comments": "off",
          "eslint/no-loop-func": "off",
          "eslint/no-multi-assign": "off",
          "eslint/no-negated-condition": "off",
          "eslint/no-nested-ternary": "off",
          "eslint/no-new-func": "off",
          "eslint/no-plusplus": "off",
          "eslint/no-promise-executor-return": "off",
          "eslint/no-shadow": "off",
          "eslint/no-template-curly-in-string": "off",
          "eslint/no-unused-expressions": "off",
          "eslint/no-unused-vars": "off",
          "eslint/no-use-before-define": "off",
          "eslint/no-void": "off",
          "eslint/prefer-destructuring": "off",
          "eslint/prefer-named-capture-group": "off",
          "import/no-named-as-default-member": "off",
          "jsx-a11y/control-has-associated-label": "off",
          "jsx-a11y/no-noninteractive-tabindex": "off",
          "jsx-a11y/prefer-tag-over-role": "off",
          "node/callback-return": "off",
          "promise/avoid-new": "off",
          "promise/no-callback-in-promise": "off",
          "promise/param-names": "off",
          "promise/prefer-await-to-then": "off",
          "react-hooks/exhaustive-deps": "off",
          "react/exhaustive-effect-dependencies": "off",
          "react/function-component-definition": "off",
          "react/hooks": "off",
          "react/immutability": "off",
          "react/jsx-handler-names": "off",
          "react/no-danger": "off",
          "react/no-object-type-as-default-prop": "off",
          "react/rule-suppression": "off",
          "react/set-state-in-effect": "off",
          "react/todo": "off",
          "shadcn/no-inline-styles": "off",
          "shadcn/no-raw-colors": "off",
          "shadcn/no-unknown-classes": "off",
          "typescript/consistent-return": "off",
          "typescript/consistent-type-imports": "off",
          "typescript/method-signature-style": "off",
          "typescript/no-base-to-string": "off",
          "typescript/no-confusing-void-expression": "off",
          "typescript/no-deprecated": "off",
          "typescript/no-floating-promises": "off",
          "typescript/no-implied-eval": "off",
          "typescript/no-invalid-void-type": "off",
          "typescript/no-misused-promises": "off",
          "typescript/no-non-null-assertion": "off",
          "typescript/no-unsafe-assignment": "off",
          "typescript/no-unsafe-call": "off",
          "typescript/no-unsafe-member-access": "off",
          "typescript/no-unsafe-return": "off",
          "typescript/no-unsafe-type-assertion": "off",
          "typescript/no-useless-default-assignment": "off",
          "typescript/prefer-for-of": "off",
          "typescript/prefer-nullish-coalescing": "off",
          "typescript/promise-function-async": "off",
          "typescript/restrict-template-expressions": "off",
          "typescript/strict-boolean-expressions": "off",
          "typescript/strict-void-return": "off",
          "typescript/switch-exhaustiveness-check": "off",
          "unicorn/consistent-function-scoping": "off",
          "unicorn/filename-case": "off",
          "unicorn/import-style": "off",
          "unicorn/no-array-for-each": "off",
          "unicorn/no-array-reduce": "off",
          "unicorn/no-array-reverse": "off",
          "unicorn/no-array-sort": "off",
          "unicorn/no-await-expression-member": "off",
          "unicorn/no-immediate-mutation": "off",
          "unicorn/no-negated-condition": "off",
          "unicorn/no-new-array": "off",
          "unicorn/no-thenable": "off",
          "unicorn/no-useless-undefined": "off",
          "unicorn/prefer-add-event-listener": "off",
          "unicorn/prefer-dom-node-dataset": "off",
          "unicorn/prefer-math-trunc": "off",
          "unicorn/prefer-number-coercion": "off",
          "unicorn/prefer-query-selector": "off",
          "unicorn/text-encoding-identifier-case": "off",
        },
      },
    ],
  },
  fmt: {
    ...ultracite,
    ignorePatterns: [...(ultracite.ignorePatterns ?? []), ...generated],
  },
  // StyleX compiled for the unit tests that render a component.
  plugins: [stylex()],
  test: {
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["scripts/**/*.test.{ts,tsx}"],
          exclude: TIMED,
        },
      },
      // The files that weigh Markdown's time, after the rest and one at a time: time on the
      // processor grows with the size of what is read faster on a machine whose cores are busy with
      // other files (its caches are shared), so a measure of growth beside them is not one of the
      // code. On a slow CI runner beside the rest, families that grow four times at four times the
      // size measured 8 and 9 times.
      {
        extends: true,
        test: {
          name: "timed",
          include: TIMED,
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
  staged: {
    "*": ["secretlint", "vp check --fix"],
  },
});
