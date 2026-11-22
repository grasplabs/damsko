// The components overview as Markdown, at /components.md: what the page's "Copy as Markdown" and an
// agent read. Every component with its sentence and its page's own Markdown twin, in the overview's
// order (../overview/tiles.ts).
import type { APIRoute } from "astro";

import { tiles } from "../overview/tiles";
import { listPages } from "../system/content";
import { libraryName } from "../system/name";

export const GET: APIRoute = () => {
  const sentences = new Map(
    listPages().map((page) => [page.route, page.description])
  );
  const list = tiles();
  const lines = [
    "---",
    "title: Components",
    `description: Every part of ${libraryName}. Choose one to see how it works and how to use it.`,
    "---",
    "",
    "# Components",
    "",
    `Every part of ${libraryName}: ${list.length} components. Each links to its page; add \`.md\` to an address for its Markdown.`,
    "",
    ...list.map((tile) => {
      const sentence = sentences.get(tile.route);
      return `- [${tile.name}](${tile.route}.md)${sentence ? `: ${sentence}` : ""}`;
    }),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
