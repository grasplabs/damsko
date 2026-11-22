// The target API check on small trees written for each test.
//   pnpm test scripts/check-target-api.test.ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import nodePath from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { checkTargetApi } from "./check-target-api.ts";
import type { Target } from "./check-target-api.ts";

const roots: string[] = [];
const tree = (files: Record<string, string>): string => {
  const root = mkdtempSync(nodePath.join(tmpdir(), "target-api-"));
  roots.push(root);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(nodePath.dirname(nodePath.join(root, path)), { recursive: true });
    writeFileSync(nodePath.join(root, path), text);
  }
  return root;
};

const kbd = (): Record<string, Target> => ({
  kbd: { "src/components/kbd.tsx": ["Kbd", "KbdProps"] },
});
const kbdSource =
  "export interface KbdProps { keys: string }\nexport const Kbd = (props: KbdProps) => props.keys;\n";

describe("the target API check", () => {
  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { recursive: true });
    }
  });

  test("passes a component that is its target", () => {
    const root = tree({ "src/components/kbd.tsx": kbdSource });
    expect(checkTargetApi(root, kbd())).toStrictEqual([]);
  });

  test("names a file no entry lists", () => {
    const root = tree({
      "src/components/kbd.tsx": kbdSource,
      "src/components/key.tsx": "export const Key = 1;\n",
    });
    expect(checkTargetApi(root, kbd())).toStrictEqual([
      "src/components/key.tsx: in no entry of scripts/target-api.json",
    ]);
  });

  test("names a missing and an extra export", () => {
    const root = tree({
      "src/components/kbd.tsx":
        "export const Kbd = () => null;\nexport type KbdLayoutStyle = {};\nexport { Kbd as Key };\nexport default Kbd;\n",
    });
    expect(checkTargetApi(root, kbd())).toStrictEqual([
      "src/components/kbd.tsx: does not export KbdProps",
      "src/components/kbd.tsx: exports KbdLayoutStyle, which is not in its target API",
      "src/components/kbd.tsx: exports Key, which is not in its target API",
      "src/components/kbd.tsx: exports default, which is not in its target API",
    ]);
  });

  test("names a missing file", () => {
    expect(checkTargetApi(tree({}), kbd())).toStrictEqual([
      "src/components/kbd.tsx: missing",
    ]);
  });

  test("allows no folder beside a one-file component, nor @deprecated", () => {
    const root = tree({
      "src/components/kbd.tsx": `/** @deprecated */\n${kbdSource}`,
      "src/components/kbd/words.ts": "export const words = {};\n",
    });
    expect(checkTargetApi(root, kbd())).toStrictEqual([
      "src/components/kbd/: a folder left beside a one-file component (one file per primitive, plus its .stylex.ts)",
      "src/components/kbd.tsx: @deprecated (no deprecated aliases)",
    ]);
  });

  test("keeps a folder component to its listed files, its inner files open", () => {
    const root = tree({
      "src/components/markdown/index.ts":
        'export { Markdown } from "./markdown.tsx";\n',
      "src/components/markdown/markdown.tsx":
        "export const Markdown = () => null;\nexport const helper = 1;\n",
      "src/components/markdown/notes.ts": "export const notes = '';\n",
    });
    const targets: Record<string, Target> = {
      markdown: {
        "src/components/markdown/index.ts": ["Markdown"],
        "src/components/markdown/markdown.tsx": null,
      },
    };
    expect(checkTargetApi(root, targets)).toStrictEqual([
      "src/components/markdown/notes.ts: not one of markdown's files",
    ]);
  });

  test("lets a component import another's public files, not its internals", () => {
    const root = tree({
      "src/components/kbd.tsx": `import "./markdown/index.ts";\nimport "./markdown/markdown.tsx";\nimport "./dialog.stylex";\nimport "../lib/utils";\n${kbdSource}`,
      "src/components/markdown/index.ts": "export const Markdown = 1;\n",
      "src/components/markdown/markdown.tsx": "export const inner = 1;\n",
      "src/components/dialog.stylex.ts": "export const dialogVars = 1;\n",
      "src/lib/utils.ts": "export const utils = 1;\n",
    });
    const targets: Record<string, Target> = {
      ...kbd(),
      markdown: {
        "src/components/markdown/index.ts": ["Markdown"],
        "src/components/markdown/markdown.tsx": null,
      },
      dialog: { "src/components/dialog.stylex.ts": null },
    };
    expect(checkTargetApi(root, targets)).toStrictEqual([
      "src/components/kbd.tsx: imports src/components/markdown/markdown.tsx, another component's internals; import its entry file",
    ]);
  });

  test("allows nothing under lib/ or hooks/ to import a component", () => {
    const root = tree({
      "src/lib/utils.ts": 'import { Kbd } from "../components/kbd.tsx";\n',
      "src/hooks/use-copy.ts": 'import "../lib/utils.ts";\n',
      "src/components/kbd.tsx": kbdSource,
    });
    expect(checkTargetApi(root, kbd())).toStrictEqual([
      "src/lib/utils.ts: imports ../components/kbd.tsx; lib/ and hooks/ never import a component",
    ]);
  });
});
