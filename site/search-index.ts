// The search index: every page cut into its sections, so a search finds the words of a page and
// lands on the section that holds them (route#slug), not at the top of the page. Read from the
// pages' own MDX at build time and served to the header's search as a lazily loaded module
// (`virtual:damsko-search`, see site/system/vite.ts), so it costs nothing until search is opened.
//
// Only the words a reader sees are kept: Markdown marks, JSX tags and code are dropped, the
// sentences a block is given (a rule, a row's sentence) are kept, and a token list adds its tokens'
// names. Never the install command, an import, a path or a fenced example: a snippet is a sentence
// of the page's prose.
//
// Each entry has a kind, so the search can group them: a page (its one-sentence description), a
// section (a heading of the page and its prose), or an API part (an h3 under "## API": its name
// only).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import GithubSlugger from "github-slugger";

import * as docsOverview from "./start/docs-overview.ts";
import * as getStarted from "./start/get-started.ts";
import * as start from "./start/page.ts";
import { listPages } from "./system/content.ts";
import { tokenSets } from "./system/token-file.ts";

export interface SearchSection {
  /** A page, a section of one, or a part of its API. */
  kind: "page" | "section" | "api";
  /** The page's address. */
  route: string;
  /** The page's title. */
  page: string;
  /** The section's heading, or the page title for the words above the first heading. */
  heading: string;
  /** The section's anchor, empty for the top of the page. */
  slug: string;
  /** The section's words, plain. */
  text: string;
}

const walk = (folder: string): string[] =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory()
      ? walk(path)
      : path.endsWith(".mdx")
        ? [path]
        : [];
  });

const tokenWords = (set: string) =>
  tokenSets
    .find((candidate) => candidate.id === set)
    ?.tokens.map((token) => `${token.cssVar} ${token.stylex} ${token.use}`)
    .join(" ") ?? "";

/** A block's string reads as a sentence: a capital, words with spaces, no code, no path, no package. */
const sentence = (value: string) =>
  /^[A-Z]/u.test(value) &&
  /\s/u.test(value) &&
  !/[@{}<>=;]|\/\w|^\s*(?:bunx|npm|import)\b/u.test(value);

/** The words of a stretch of MDX, without its marks and without code. */
const plain = (mdx: string) =>
  mdx
    // A token list stands for its tokens.
    .replaceAll(
      /<(?:Swatches|Tokens)\s+set="([^"]+)"[^>]*\/>/gu,
      (_match, set: string) => tokenWords(set)
    )
    // A fenced example is code, not prose: left out.
    .replaceAll(/```[\s\S]*?```/gu, " ")
    // A block's attributes: keep its sentences, drop the rest of the tag.
    .replaceAll(/<[A-Z][\s\S]*?\/>/gu, (tag) =>
      [...tag.matchAll(/(?:(\w+)=)?"([^"]{2,})"/gu)]
        // A stage's label repeats its heading; the rest are the block's own sentences.
        .filter((match) => match[1] !== "label")
        .map((match) => match[2] ?? "")
        .filter(sentence)
        .map((value) => (/[.!?]$/u.test(value) ? value : `${value}.`))
        .join(" ")
    )
    .replaceAll(/<\/?[A-Za-z][^>]*>/gu, " ")
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replaceAll(/[`*_#>|]/gu, " ")
    .replaceAll(/\s+/gu, " ")
    .trim();

const frontmatter = (source: string) => {
  const match = /^---\n([\s\S]*?)\n---\n/u.exec(source);
  const fields: Record<string, string> = {};
  for (const line of match?.[1]?.split("\n") ?? []) {
    const field = /^(\w+):\s*(.*)$/u.exec(line);
    if (field?.[1]) {
      fields[field[1]] = (field[2] ?? "").replaceAll(/^["']|["']$/gu, "");
    }
  }
  return { body: match ? source.slice(match[0].length) : source, fields };
};

export const buildSearchIndex = (root: string): SearchSection[] => {
  const docs = join(root, "docs");
  // Every page in docs/, then the home page and Get started, whose Markdown is in site/start/.
  const sources = [
    ...walk(docs).map((file) => {
      const path = relative(docs, file).replace(/\.mdx$/u, "");
      return {
        route: path === "index" ? "/" : `/${path.replace(/\/index$/u, "")}`,
        source: readFileSync(file, "utf-8"),
      };
    }),
    { route: start.route, source: start.startMarkdown() },
    { route: getStarted.route, source: getStarted.getStartedMarkdown() },
    {
      route: docsOverview.route,
      source: docsOverview.docsOverviewMarkdown(listPages()),
    },
  ];
  return sources.flatMap(({ route, source }) => {
    const { body, fields } = frontmatter(source);
    if (fields.search === "false") {
      return [];
    }
    const page = fields.title ?? route;
    const slugger = new GithubSlugger();
    // The title is slugged first, as the page's own heading ids are.
    slugger.slug(page);
    // The page: its description is its snippet. The words above its first heading (the opening
    // block's install line and import) are not kept.
    const sections: SearchSection[] = [
      {
        heading: page,
        kind: "page",
        page,
        route,
        slug: "",
        text: fields.description ?? "",
      },
    ];
    let inFence = false;
    let inApi = false;
    let current: SearchSection | null = null;
    for (const line of body.split("\n")) {
      if (line.startsWith("```")) {
        inFence = !inFence;
      }
      const heading = inFence ? null : /^(#{2,3})\s+(.+)$/u.exec(line);
      if (heading?.[1] && heading[2]) {
        const text = plain(heading[2]);
        if (heading[1] === "##") {
          inApi = text === "API";
        }
        const kind = inApi && heading[1] === "###" ? "api" : "section";
        current = {
          heading: text,
          kind,
          page,
          route,
          slug: slugger.slug(text),
          text: "",
        };
        sections.push(current);
        continue;
      }
      if (current && current.kind === "section") {
        current.text += `\n${line}`;
      }
    }
    return sections.map((section) =>
      section.kind === "section"
        ? { ...section, text: plain(section.text) }
        : section
    );
  });
};
