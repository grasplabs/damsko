// The Docs overview as Markdown, at /docs.md: every docs page with its sentence and its Markdown
// twin, in the sidebar's order (../start/docs-overview.ts).
import type { APIRoute } from "astro";

import { docsOverviewMarkdown } from "../start/docs-overview";
import { listPages } from "../system/content";

export const GET: APIRoute = () =>
  new Response(docsOverviewMarkdown(listPages()), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
