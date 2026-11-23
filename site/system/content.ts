// The pages: one scan of docs/**/*.mdx, read by everything that needs to know what pages exist.
// The routes, the sidebar, Previous and Next, the search index, the Markdown twins, llms.txt and the
// checks all ask this file, so a page added on any branch shows up everywhere without a list to edit.
//
//   site/pages/index.astro       → "/"            the home page, first in the group "Start" (its
//                                                 words and Markdown: site/start/page.ts)
//   site/pages/get-started.astro → "/get-started" Get started, next in "Start" (its words and
//                                                 Markdown: site/start/get-started.ts)
//   docs/foundations/type.mdx    → "/foundations/type"
//   docs/components/button.mdx   → "/components/button"
//
// The groups stand in the order below, and the pages in a group in the order named for it; a page
// not named follows the named ones, by file name.
//
// The disk is read on every call, and a file is parsed again only when its change time moves, so a
// new or edited page is seen by a dev server without a restart. Plain Node: no import.meta.env and
// no virtual modules, so a Node script can import it too.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { parse as parseYaml } from "yaml";

import { frameWords } from "../brand/content.ts";
import type { SidebarNode } from "../chrome/nav.ts";
import * as docsOverview from "../start/docs-overview.ts";
import * as getStarted from "../start/get-started.ts";
import * as start from "../start/page.ts";
import { byKind, kindOf, kinds, otherKind } from "./kinds.ts";

/**
 * The repository's root: the folder with astro.config.ts. Two folders above this file when it runs
 * from the source; in a build this file is bundled elsewhere, so then it is found from the folder
 * the build runs in.
 */
const findRoot = () => {
  const here = fileURLToPath(new URL("../..", import.meta.url));
  if (existsSync(join(here, "astro.config.ts"))) {
    return here;
  }
  let folder = process.cwd();
  while (!existsSync(join(folder, "astro.config.ts"))) {
    const parent = dirname(folder);
    if (parent === folder) {
      throw new Error(
        "site/system/content.ts: no astro.config.ts above the working folder."
      );
    }
    folder = parent;
  }
  return `${folder}/`;
};
export const root = findRoot();
export const docsDir = join(root, "docs");

export interface Page {
  /** The address: "/" or "/components/button". */
  route: string;
  /** The MDX file, from the root: "docs/components/button.mdx" (Get started: site/start/page.ts). */
  file: string;
  /** The file's absolute path. */
  path: string;
  title: string;
  description: string;
  /** The sidebar's group: "Start", "Foundations", "Components", "Patterns" or "Guidelines". */
  group: string;
  /** The page's front matter, as parsed. */
  frontmatter: Record<string, unknown>;
  /** The header's section the page is in: "components" for /components and below, else "docs". */
  section: Section;
}

/** The site's two sections, as the header names them: Docs and Components. */
export type Section = "docs" | "components";

/** The section an address belongs to. */
export const sectionOf = (route: string): Section =>
  route === "/components" || route.startsWith("/components/")
    ? "components"
    : "docs";

interface Group {
  label: string;
  /** The folder under docs/, or "" for the pages at its top. */
  folder: string;
  /** Pages named here come first, in this order; the rest follow by name. */
  order: string[];
  /** Sorts the pages instead of `order` (Components: by kind, site/system/kinds.ts). */
  sort?: (a: string, b: string) => number;
}

export const groups: Group[] = [
  // The home page and Get started: Astro pages (site/pages/index.astro, get-started.astro), not
  // files in docs/.
  { label: "Start", folder: "", order: [] },
  {
    label: "Foundations",
    folder: "foundations",
    order: [
      "colour",
      "themes",
      "type",
      "space",
      "controls",
      "corners",
      "elevation",
      "motion",
      "icons",
    ],
  },
  {
    label: "Components",
    folder: "components",
    order: [],
    sort: byKind,
  },
  {
    label: "Patterns",
    folder: "patterns",
    order: [
      "chat-page",
      "chat-thread",
      "citations",
      "forms",
      "settings",
      "members",
      "tables",
      "loading",
      "confirmations",
      "navigation",
      "sidebar-rows",
      "theme-choice",
    ],
  },
  {
    label: "Guidelines",
    folder: "guidelines",
    order: ["choosing", "writing", "accessibility"],
  },
];

/** The front matter between the first two `---` lines, and the body after it. */
export const splitFrontmatter = (
  source: string
): { data: Record<string, unknown>; body: string } => {
  const match = /^﻿?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(source);
  if (!match) {
    return { data: {}, body: source };
  }
  const data = parseYaml(match[1] ?? "") as unknown;
  return {
    data:
      data && typeof data === "object" ? (data as Record<string, unknown>) : {},
    body: source.slice(match[0].length),
  };
};

const cache = new Map<string, { mtime: number; page: Page }>();

const readPage = (path: string, group: string): Page => {
  const mtime = statSync(path).mtimeMs;
  const hit = cache.get(path);
  if (hit?.mtime === mtime) {
    return hit.page;
  }
  const file = relative(root, path);
  const name = relative(docsDir, path).replace(/\.mdx$/u, "");
  const route = name === "index" ? "/" : `/${name.replace(/\/index$/u, "")}`;
  let frontmatter: Record<string, unknown> = {};
  try {
    frontmatter = splitFrontmatter(readFileSync(path, "utf-8")).data;
  } catch {
    // Front matter that does not parse: the page still has a route, and rendering it shows the
    // error (site/pages/[...slug].astro). Its title falls back to its address.
  }
  const page: Page = {
    route,
    file,
    path,
    title: typeof frontmatter.title === "string" ? frontmatter.title : route,
    description:
      typeof frontmatter.description === "string"
        ? frontmatter.description
        : "",
    group,
    frontmatter,
    section: sectionOf(route),
  };
  cache.set(path, { mtime, page });
  return page;
};

const byOrder = (order: string[]) => (a: string, b: string) => {
  const [ia, ib] = [order.indexOf(a), order.indexOf(b)];
  return (
    (ia < 0 ? Number.MAX_SAFE_INTEGER : ia) -
      (ib < 0 ? Number.MAX_SAFE_INTEGER : ib) || a.localeCompare(b)
  );
};

/** The Start group's Astro pages, the home page ("/"), Get started, then the Docs overview, from their
 * words files. The overview is reached by the sidebar's "Docs", not a row (site/layouts/Docs.astro);
 * it stands here so previous and next, search and the lists all find it. */
const startPages = (group: string): Page[] =>
  [
    {
      route: start.route,
      file: "site/start/page.ts",
      title: start.title,
      description: start.description,
    },
    {
      route: getStarted.route,
      file: "site/start/get-started.ts",
      title: getStarted.title,
      description: getStarted.description,
    },
    {
      route: docsOverview.route,
      file: "site/start/docs-overview.ts",
      title: docsOverview.title,
      description: docsOverview.description,
    },
  ].map(({ route, file, title, description }) => {
    const frontmatter = { title, description };
    return {
      route,
      file,
      path: join(root, file),
      ...frontmatter,
      group,
      frontmatter,
      section: sectionOf(route),
    };
  });

/** A page's source as Markdown: its MDX file, or the home page's or Get started's own Markdown. */
export const pageSource = (page: Page): string =>
  page.route === start.route
    ? start.startMarkdown()
    : page.route === getStarted.route
      ? getStarted.getStartedMarkdown()
      : page.route === docsOverview.route
        ? docsOverview.docsOverviewMarkdown(listPages())
        : readFileSync(page.path, "utf-8");

/** Every page, in the sidebar's order. */
export const listPages = (): Page[] =>
  groups.flatMap((group) => {
    if (group.folder === "") {
      return startPages(group.label);
    }
    const folder = join(docsDir, group.folder);
    if (!existsSync(folder)) {
      return [];
    }
    return readdirSync(folder)
      .filter((name) => name.endsWith(".mdx"))
      .map((name) => name.slice(0, -4))
      .toSorted(group.sort ?? byOrder(group.order))
      .map((name) => readPage(join(folder, `${name}.mdx`), group.label));
  });

/** One page by its address, or undefined. */
export const findPage = (route: string): Page | undefined => {
  const wanted = route.replace(/\/$/u, "") || "/";
  return listPages().find((page) => page.route === wanted);
};

/** The pages before and after one, in the sidebar's order, never across into the other section. */
export const neighbours = (
  route: string
): { prev: Page | null; next: Page | null } => {
  const pages = listPages().filter((page) => page.section === sectionOf(route));
  const index = pages.findIndex((page) => page.route === route);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return { prev: pages[index - 1] ?? null, next: pages[index + 1] ?? null };
};

/** The brand book's row in the sidebar, under Get started. */
const brandBook: SidebarNode = {
  kind: "page",
  label: frameWords.book,
  route: "/brand/",
};

/** The components overview, which heads the Components section. */
export const overview = { route: "/components", title: "Overview" };

/**
 * The sidebar as the chrome reads it (site/chrome/nav.ts): pages at the top, then groups. With a
 * section, only that section: Docs holds Get started, Foundations, Patterns and Guidelines;
 * Components holds the overview, then the components grouped by kind (site/system/kinds.ts).
 * Without one, both, Docs first: the phone menu lists everything.
 */
export const sidebar = (section?: Section): SidebarNode[] => {
  const pages = listPages();
  const docs = (): SidebarNode[] =>
    groups
      .filter((group) => group.folder !== "components")
      .flatMap((group): SidebarNode[] => {
        const members = pages
          .filter((page) => page.group === group.label)
          .map((page) => ({
            kind: "page" as const,
            label: page.title,
            route: page.route,
          }));
        // The brand book (/brand, site/brand/) stands under Get started: a section of its own, not
        // a page of the docs, so only the sidebar lists it.
        if (group.folder === "") {
          const at =
            members.findIndex((page) => page.route === getStarted.route) + 1;
          return [...members.slice(0, at), brandBook, ...members.slice(at)];
        }
        return members.length
          ? [{ kind: "group" as const, label: group.label, children: members }]
          : [];
      });
  const components = (): SidebarNode[] => {
    const members = pages.filter((page) => page.group === "Components");
    const head: SidebarNode = {
      kind: "group",
      label: "Components",
      children: [
        { kind: "page", label: overview.title, route: overview.route },
      ],
    };
    return [
      head,
      ...[...kinds, otherKind].flatMap((kind): SidebarNode[] => {
        const children = members
          .filter(
            (page) => kindOf(page.route.split("/").pop() ?? "").id === kind.id
          )
          .map((page) => ({
            kind: "page" as const,
            label: page.title,
            route: page.route,
          }));
        return children.length
          ? [{ kind: "group" as const, label: kind.label, children }]
          : [];
      }),
    ];
  };
  if (section === "docs") {
    return docs();
  }
  if (section === "components") {
    return components();
  }
  return [...docs(), ...components()];
};
