import type { APIRoute } from "astro";

import { listPages } from "../system/content";
import { pageTwin } from "../system/llms";
// Every page as Markdown, at its address with `.md` added (/components/button.md; the home page is
// /index.md): the page's MDX with each block in its Markdown form (../system/markdown-twin.ts).
import { wanted } from "../system/subset";

export const getStaticPaths = () =>
  listPages()
    .filter((page) => wanted(page.route))
    .map((page) => ({
      params: { slug: page.route === "/" ? "index" : page.route.slice(1) },
    }));

export const GET: APIRoute = ({ params }) => {
  const route = params.slug === "index" ? "/" : `/${params.slug}`;
  const twin = pageTwin(route);
  return twin === null
    ? new Response("Not found\n", { status: 404 })
    : new Response(twin, {
        headers: { "content-type": "text/markdown; charset=utf-8" },
      });
};
