// The files an agent reads first: llms.txt (every page, one line each, in the sidebar's order) and
// llms-full.txt (every page's Markdown in one file, by address). Built from the page list
// (./content.ts) and the Markdown forms of the blocks (../markdown.ts), on each request in dev and
// once in a build. The format is the previous docs system's, so what reads them now keeps working.
import { guidanceOf } from "../guidance.ts";
import { markdownComponents } from "../markdown.ts";
import { groups, listPages, pageSource } from "./content.ts";
import { kindOf, kinds, otherKind } from "./kinds.ts";
import { markdownBody, markdownTwin } from "./markdown-twin.ts";
import type { ComponentMarkdown } from "./markdown-twin.ts";
import { libraryName } from "./name.ts";

const title = libraryName;
const description =
  "Grasp's product design system: tokens, components and rules for teams and agents.";
const forms = markdownComponents;
const oneLine = (text: string) => text.replaceAll(/\s+/gu, " ").trim();

/** A page's `.md` twin, by its address ("/" is the home page). */
export const pageTwin = (route: string): string | null => {
  const page = listPages().find((candidate) => candidate.route === route);
  return page ? markdownTwin(pageSource(page), forms) : null;
};

export const llmsIndex = () => {
  const pages = listPages();
  const blocks = groups.flatMap((group) => {
    const lines = pages
      .filter((page) => page.group === group.label)
      .map(
        (page) =>
          `- [${page.title}](${page.route}): ${oneLine(page.description)}`
      );
    // The top of the docs is listed as "Docs", as the previous docs system listed it.
    return lines.length
      ? [`## ${group.folder === "" ? "Docs" : group.label}`, lines.join("\n")]
      : [];
  });
  blocks.push(
    "## Agent resources",
    [
      "- [llms/intent.txt](/llms/intent.txt): Start here to choose a component: what each is, what always holds and what never to do.",
      ...llmsCuts()
        .filter((cut) => cut.id !== "intent")
        .map(
          (cut) => `- [llms/${cut.id}.txt](/llms/${cut.id}.txt): ${cut.says}`
        ),
      "- [llms-full.txt](/llms-full.txt): The full Markdown of every page in one file. Large: read a cut above first.",
      "- [Page Markdown](/index.md): Append `.md` to any page URL to fetch that page as raw Markdown.",
    ].join("\n")
  );
  return `${[`# ${title}\n\n> ${description}`, ...blocks].join("\n\n")}\n`;
};

export const llmsFull = () => {
  const sections = listPages()
    .toSorted((a, b) => a.route.localeCompare(b.route))
    .map((page) =>
      [
        `# ${page.title}`,
        `Source: ${page.route}`,
        "",
        markdownBody(pageSource(page), forms),
      ].join("\n")
    );
  return `# ${title}\n\n> ${description}\n\n${sections.join("\n\n---\n\n")}\n`;
};

// ---- Smaller cuts of the full file ------------------------------------------------------------------
// llms-full.txt is every page: too much for one read. A cut is the same Markdown for one part of the
// system: the pages that are not components, each family of components (./kinds.ts), and "intent",
// which is only each component's sentence and its page's rules.

export interface LlmsCut {
  /** Its file: /llms/<id>.txt. */
  id: string;
  /** One line for llms.txt. */
  says: string;
}

const nameOf = (route: string) => route.replace(/^\/components\//u, "");
const family = (id: string) =>
  listPages().filter(
    (page) =>
      page.group === "Components" && kindOf(nameOf(page.route)).id === id
  );

export const llmsCuts = (): LlmsCut[] => [
  {
    id: "intent",
    says: "What each component is, what always holds and what never to do.",
  },
  {
    id: "docs",
    says: "Get started, the foundations, the patterns and the guidelines, in full.",
  },
  ...[...kinds, otherKind]
    .filter((kind) => family(kind.id).length > 0)
    .map((kind) => ({
      id: kind.id,
      says: `${kind.label}: ${family(kind.id)
        .map((page) => page.title)
        .join(", ")}, each page in full.`,
    })),
];

const pagesFile = (heading: string, pages: ReturnType<typeof listPages>) =>
  `# ${title}: ${heading}\n\n> ${description}\n\n${pages
    .map((page) =>
      [
        `# ${page.title}`,
        `Source: ${page.route}`,
        "",
        markdownBody(pageSource(page), forms),
      ].join("\n")
    )
    .join("\n\n---\n\n")}\n`;

/** One cut's text, or null when there is no such cut. */
export const llmsCut = (id: string): string | null => {
  if (id === "intent") {
    const parts = listPages()
      .filter((page) => page.group === "Components")
      .flatMap((page) => {
        const guidance = guidanceOf(nameOf(page.route));
        if (guidance === null) {
          return [];
        }
        const list = (heading: string, lines: string[]) =>
          lines.length === 0
            ? ""
            : `**${heading}**\n\n${lines.map((line) => `- ${line}`).join("\n")}`;
        return [
          [
            `## ${guidance.title} (\`${guidance.name}\`)`,
            `Source: ${guidance.href}`,
            guidance.description,
            list("Always", guidance.always),
            list("Never", guidance.never),
          ]
            .filter(Boolean)
            .join("\n\n"),
        ];
      });
    return `# ${title}: choosing a component\n\n${parts.join("\n\n---\n\n")}\n`;
  }
  if (id === "docs") {
    return pagesFile(
      "the docs",
      listPages().filter((page) => page.group !== "Components")
    );
  }
  const kind = [...kinds, otherKind].find((each) => each.id === id);
  const pages = kind ? family(kind.id) : [];
  return kind && pages.length > 0 ? pagesFile(kind.label, pages) : null;
};
