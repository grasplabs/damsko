// The Docs overview (site/pages/docs.astro, /docs): what the docs hold, every page of Foundations,
// Patterns and Guidelines as a tile with its name and its page's sentence, as the components
// overview shows the components (the sidebar's "Docs" is its link). Its words and
// its Markdown twin live here. Plain data and plain functions: content.ts and a Node script import it,
// and it imports nothing of theirs (the pages are passed in), so nothing goes round in a circle.

export const route = "/docs";
export const title = "Docs";
export const description =
  "How the system looks, behaves and is written, in its foundations, patterns and guidelines.";

/** The three parts it shows, in the sidebar's order. */
export const parts = ["Foundations", "Patterns", "Guidelines"] as const;

/** What it needs of a page. */
export interface DocsPage {
  route: string;
  title: string;
  description: string;
  group: string;
}

/** Its groups: each part with its pages, in the order given. */
export const docsGroups = (pages: readonly DocsPage[]) =>
  parts
    .map((label) => ({
      id: label.toLowerCase(),
      label,
      pages: pages.filter((page) => page.group === label),
    }))
    .filter((group) => group.pages.length > 0);

/** The page as Markdown, front matter first and no heading of its own, as Get started's `.md` twin is:
 * llms-full.txt and llms/docs.txt put `# Docs` above it themselves. */
export const docsOverviewMarkdown = (pages: readonly DocsPage[]): string =>
  [
    "---",
    `title: ${title}`,
    `description: ${description}`,
    "---",
    "",
    description,
    "",
    ...docsGroups(pages).flatMap((group) => [
      `## ${group.label}`,
      "",
      ...group.pages.map(
        (page) =>
          `- [${page.title}](${page.route}.md)${page.description ? `: ${page.description}` : ""}`
      ),
      "",
    ]),
  ].join("\n");
