// /llms.txt: every page in one line, for an agent's first look (../system/llms.ts).
import { llmsIndex } from "../system/llms";

export const GET = () =>
  new Response(llmsIndex(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
