// A component's guidance, read from its own page (docs/components/<name>.mdx): its title and
// sentence from the front matter, and what always holds and what never to do from the page's
// <Intent always never /> block. The page's Do / Don't block (site/blocks/Intent.astro), the
// Choosing comparisons (site/blocks/Choose.astro), the Markdown twins (site/markdown.ts) and
// llms/intent.txt all read it here, so none of them says something the page does not.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { findRoot } from "./lib/root.ts";
import { splitFrontmatter } from "./system/content.ts";
import { downlevelComponents } from "./system/markdown-twin.ts";
import type { Value } from "./system/markdown-twin.ts";

const root = findRoot();

export interface Guidance {
  /** The component, as the registry names it. */
  name: string;
  title: string;
  href: string;
  description: string;
  always: string[];
  never: string[];
}

const strings = (value: Value): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const cache = new Map<string, Guidance | null>();

/** A component's guidance, by its name; null when it has no page. */
export const guidanceOf = (name: string): Guidance | null => {
  const known = cache.get(name);
  if (known !== undefined) {
    return known;
  }
  const page = existsSync(join(root, "docs/components", `${name}.mdx`))
    ? name
    : undefined;
  let guidance: Guidance | null = null;
  if (page !== undefined) {
    const source = readFileSync(
      join(root, "docs/components", `${page}.mdx`),
      "utf-8"
    );
    const { data } = splitFrontmatter(source);
    let props: Record<string, Value> = {};
    downlevelComponents(source, {
      Intent: (tag) => {
        ({ props } = tag);
        return null;
      },
    });
    guidance = {
      name,
      title: typeof data.title === "string" ? data.title : name,
      href: `/components/${page}`,
      description: typeof data.description === "string" ? data.description : "",
      always: strings(props.always),
      never: strings(props.never),
    };
  }
  cache.set(name, guidance);
  return guidance;
};

/** The words of a line that say something, for telling a repeat: lower case, no small words. */
const small = new Set([
  "a",
  "an",
  "the",
  "it",
  "its",
  "of",
  "to",
  "in",
  "on",
  "or",
  "and",
  "for",
  "with",
  "is",
  "as",
  "at",
  "by",
  "be",
  "not",
  "no",
  "use",
  "one",
  "that",
  "this",
  "what",
]);
const wordsOf = (line: string) =>
  new Set(
    line
      .toLowerCase()
      .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
      .split(/[^a-z0-9]+/u)
      .filter((word) => word.length > 2 && !small.has(word))
  );
const repeats = (line: string, kept: string[]) => {
  const own = wordsOf(line);
  return kept.some((other) => {
    const theirs = wordsOf(other);
    const shared = [...own].filter((word) => theirs.has(word)).length;
    return shared > 0 && shared >= 0.6 * Math.min(own.size, theirs.size);
  });
};

/** One column of a page's Do / Don't block: at most four lines, a line that repeats one kept left out. */
export const guidanceColumn = (lines: string[], most = 4): string[] => {
  const kept: string[] = [];
  for (const line of lines) {
    if (kept.length < most && !repeats(line, kept)) {
      kept.push(line);
    }
  }
  return kept;
};

/** For a comparison: each component as a link to its page, with its page's sentence. */
// `current`: the component whose page this is, its row marked "this page" and not a link to itself.
export const chooseRows = (
  names: string[],
  current?: string
): { title: string; lines: string[]; current?: boolean }[] =>
  names.flatMap((name) => {
    const guidance = guidanceOf(name);
    if (guidance === null) {
      return [];
    }
    const lines = [guidance.description];
    return name === current
      ? [{ title: `${guidance.title}, this page`, lines, current: true }]
      : [{ title: `[${guidance.title}](${guidance.href})`, lines }];
  });

/** The same as a Markdown table: Component, What it is. */
export const chooseMarkdown = (
  names: string[],
  current?: string
): string | null => {
  const rows = names.flatMap((name) => {
    const guidance = guidanceOf(name);
    if (guidance === null) {
      return [];
    }
    const cell =
      name === current
        ? `${guidance.title} (this page)`
        : `[${guidance.title}](${guidance.href})`;
    return [`| ${cell} | ${guidance.description.replaceAll("|", "\\|")} |`];
  });
  return rows.length === 0
    ? null
    : ["| Component | What it is |", "| --- | --- |", ...rows].join("\n");
};
