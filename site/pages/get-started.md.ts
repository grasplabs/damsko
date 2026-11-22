// Get started as Markdown, at /get-started.md: the page's words (site/start/get-started.ts).
import type { APIRoute } from "astro";

import { getStartedMarkdown } from "../start/get-started";

export const GET: APIRoute = () =>
  new Response(getStartedMarkdown(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
