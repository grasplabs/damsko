// Every icon of the system, read from src/lib/icons.ts: its exported name, the Hugeicons drawing
// it is, and the first sentence of its comment as its use. The page and its Markdown twin both
// read this, so an icon added to the set shows up on the Icons page by itself.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findRoot } from "../lib/root.ts";

export interface IconSource {
  name: string;
  source: string;
  use: string;
}

/**
 * `/** What it means. Drawing01Icon: a note. *\/ export const NameIcon: IconData = Drawing01Icon;`,
 * the drawing perhaps wrapped (`pointing(Drawing01Icon)`, after a pure mark).
 */
const pattern =
  /\/\*\*((?:(?!\*\/)[\s\S])*?)\*\/\s*export const (\w+): IconData =\s*(?:\/\* @__PURE__ \*\/\s*)?(?:\w+\()?(\w+)\)?;/gu;

export const readIcons = (): IconSource[] => {
  const text = readFileSync(join(findRoot(), "src/lib/icons.ts"), "utf-8");
  const found: IconSource[] = [];
  for (const match of text.matchAll(pattern)) {
    const comment = (match[1] ?? "").replaceAll(/\s*\n\s*\*\s?/gu, " ").trim();
    // A drawing imported under another name (HugeAppWindowIcon) is named by its own in the comment.
    const source = (match[3] ?? "").replace(/^Huge/u, "");
    // The comment ends with the drawing's name, sometimes with a note after it: keep what it means.
    const use =
      comment.split(new RegExp(`\\s*${source}\\b`, "u"))[0]?.trim() ?? comment;
    found.push({ name: match[2] ?? "", source, use });
  }
  return found;
};
