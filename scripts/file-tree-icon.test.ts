// File Tree's icon for a file (src/components/file-tree-icon.ts): a name comes from a model or a
// tool, so its extension is looked up among the table's own keys only, whatever its case.
//
//   pnpm exec vp test scripts/file-tree-icon.test.ts
import { describe, expect, test } from "vitest";

import { fileTreeIcon } from "../src/components/file-tree-icon.ts";
import {
  CodeIcon,
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  SheetIcon,
} from "../src/lib/icons.ts";

describe(fileTreeIcon, () => {
  test.each([
    ["report.pdf", FilePdfIcon],
    ["budget.XLSX", SheetIcon],
    ["cover.final.png", ImageIcon],
    ["page.tsx", CodeIcon],
  ])("%s wears the icon for its extension", (name, icon) => {
    expect(fileTreeIcon(name)).toBe(icon);
  });

  test.each([
    "a.__proto__",
    "a.constructor",
    "a.toString",
    "a.hasOwnProperty",
    "archive.bin",
    "Makefile",
    ".gitignore",
    "trailing.",
  ])("%s wears the plain file icon", (name) => {
    expect(fileTreeIcon(name)).toBe(FileIcon);
  });
});
