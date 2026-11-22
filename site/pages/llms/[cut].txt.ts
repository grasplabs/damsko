// /llms/<cut>.txt: a smaller cut of llms-full.txt for one part of the system: "intent" (what each
// component is and its rules), "docs" (everything that is not a component), and one for each family of
// components (../../system/llms.ts).
import type { APIRoute } from "astro";

import { llmsCut, llmsCuts } from "../../system/llms";
import { subset } from "../../system/subset";

export const getStaticPaths = () =>
  subset ? [] : llmsCuts().map((cut) => ({ params: { cut: cut.id } }));

export const GET: APIRoute = ({ params }) => {
  const text = llmsCut(params.cut ?? "");
  return text === null
    ? new Response("No such cut.", { status: 404 })
    : new Response(text, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
};
