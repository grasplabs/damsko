// The home page's words (site/pages/index.astro, the showcase), in one place, with its Markdown
// twin (startMarkdown, at /index.md, in llms.txt, llms-full.txt and the search). The showcase shows
// and does not explain: on the page the only words are the name and the components' own. The
// description is for the page's head and for agents reading the twin.
// Plain data and plain functions: a Node script imports this too.
import { libraryName } from "../system/name";

export const route = "/";
export const title = "Home";
/** The library's name, for now: site words only (site/system/name.ts). */
export const name = libraryName;
export const description =
  "The tokens, components and rules Grasp's screens are built from, written once for the people and the agents who build them.";

/** The page's headings, for the rail: the showcase has none but the name. */
export const headings: { depth: number; slug: string; text: string }[] = [];

/**
 * The page as Markdown, front matter first, as a docs page's `.md` twin is: what an agent reads in
 * place of what a person sees. Installing is on Get started (site/start/get-started.ts).
 */
export const startMarkdown = (): string =>
  [
    "---",
    `title: ${title}`,
    `description: ${description}`,
    "---",
    "",
    `# ${name}`,
    "",
    description,
    "",
    "On the page, the library's components at work across the window as it is scrolled: buttons pressed, settings turned, steps done, screens put together by App building's cursors, on a living dither.",
    "",
    "- [Get started](/get-started): install the tokens and a component.",
    "- [Components](/components): every part, with its states, rules and props.",
    "",
  ].join("\n");
