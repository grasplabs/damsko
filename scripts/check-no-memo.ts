// No hand-written memoisation: the product's React Compiler memoises
// for us, so no useMemo, useCallback or memo( in any file a registry item installs. Comments do not
// count: each file is read as code, its comments taken out, before it is searched. Needs no server.
//
//   node scripts/check-no-memo.ts
//   node scripts/check-no-memo.ts -- --only date-picker            one item (a comma-separated list)
//   node scripts/check-no-memo.ts -- --only sheet --with-deps       and every item of ours it installs with it
import { parseArgs } from "node:util";

import ts from "typescript6";

import { registryItems, withDependencies } from "./registry-deps.ts";

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    "with-deps": { type: "boolean", default: false },
  },
});

const named = (values.only ?? "")
  .split(",")
  .map((word) => word.trim().toLowerCase())
  .filter(Boolean);
const only =
  values["with-deps"] && named.length > 0 ? withDependencies(named) : named;

const hook = /\b(?:useMemo|useCallback)\b|\bmemo\s*\(/u;
const transpile = (content: string) =>
  ts.transpileModule(content, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      removeComments: true,
      target: ts.ScriptTarget.ESNext,
    },
  }).outputText;

interface Found {
  item: string;
  file: string;
  line: number;
  text: string;
}
const found: Found[] = [];
let items = 0;
for (const item of registryItems()) {
  if (only.length > 0 && !only.includes(item.name)) {
    continue;
  }
  items += 1;
  for (const file of item.files ?? []) {
    if (file.content === undefined || !/\.(?:tsx?|jsx?)$/u.test(file.path)) {
      continue;
    }
    // Read as code: the transpiler drops comments, so only a real use is left to find.
    let code: string;
    try {
      code = transpile(file.content);
    } catch {
      code = file.content;
    }
    if (!hook.test(code)) {
      continue;
    }
    // Name the lines in the file as written; a line that is only a comment is not one of them.
    for (const [index, text] of file.content.split("\n").entries()) {
      const bare = text.replace(/\/\/.*$/u, "").replaceAll(/\/\*.*?\*\//gu, "");
      if (/^\s*\*/u.test(text) || !hook.test(bare)) {
        continue;
      }
      // An import is not a use, unless it renames a memo hook: `import { useMemo as m }` and then
      // m(...) was a use this check could not see (found by breaking it, PR #35).
      if (
        /^\s*import\b/u.test(text) &&
        !/\b(?:useMemo|useCallback|memo)\s+as\s+\w/u.test(bare)
      ) {
        continue;
      }
      found.push({
        item: item.name,
        file: file.path,
        line: index + 1,
        text: text.trim(),
      });
    }
  }
}

const byFile = Map.groupBy(found, (each) => each.file);
for (const [file, list] of [...byFile.entries()].toSorted(([a], [b]) =>
  a.localeCompare(b)
)) {
  console.log(`FAIL  ${file}`);
  for (const each of list) {
    console.log(`        :${each.line}  ${each.text}`);
  }
}
const counts = Map.groupBy(found, (each) => each.item);
if (counts.size > 0) {
  console.log("\nper item:");
  for (const [item, list] of [...counts.entries()].toSorted(([a], [b]) =>
    a.localeCompare(b)
  )) {
    console.log(`  ${item.padEnd(24)} ${String(list.length).padStart(4)}`);
  }
}
console.log(
  `\nno-memo: ${items - counts.size} of ${items} items passed (${found.length} uses of useMemo, useCallback or memo)`
);
process.exit(counts.size > 0 ? 1 : 0);
