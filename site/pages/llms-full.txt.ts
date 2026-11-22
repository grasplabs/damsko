// /llms-full.txt: every page's Markdown in one file (../system/llms.ts).
import { llmsFull } from "../system/llms";

export const GET = () =>
  new Response(llmsFull(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
