// What an example needs beyond its page's install line. The page's line (`<Head install>`) brings
// its items and, through registry.json's registryDependencies, everything they need, all the way
// down; an example may import another item too (a Select example's Field, a Page header example's
// Button). This finds those, from the example's own `@grasp-os/ui/components/<name>` imports, so its
// Code view can say "Also add" with the command, and the Markdown twin the same. One function, so
// the page and its twin cannot disagree.
import { existsSync, readFileSync } from "node:fs";

import { findRoot } from "./root.ts";

interface RegistryItem {
  name: string;
  registryDependencies?: string[];
}

const root = `${findRoot()}/`;
let items: Map<string, string[]> | null = null;
const registry = () => {
  if (items === null) {
    const file = JSON.parse(readFileSync(`${root}registry.json`, "utf-8")) as {
      items?: RegistryItem[];
    };
    items = new Map(
      (file.items ?? []).map((item) => [
        item.name,
        (item.registryDependencies ?? []).map((dep) =>
          dep.replace(/^@damsko\//u, "")
        ),
      ])
    );
  }
  return items;
};

/** The items a set of items brings, themselves included, following their dependencies down. */
const brought = (names: string[]) => {
  const all = registry();
  const seen = new Set<string>();
  const walk = (name: string) => {
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    for (const dep of all.get(name) ?? []) {
      walk(dep);
    }
  };
  for (const name of names) {
    walk(name);
  }
  return seen;
};

/** A component page's install line: its command's head ("pnpm dlx shadcn@4.23.0 add") and its items. */
export const pageInstall = (
  page: string
): { head: string; items: string[] } | null => {
  const file = `${root}docs/components/${page}.mdx`;
  if (!existsSync(file)) {
    return null;
  }
  const line = /install="([^"]+)"/u.exec(readFileSync(file, "utf-8"))?.[1];
  if (line === undefined) {
    return null;
  }
  const at = line.indexOf(" @damsko/");
  if (at === -1) {
    return null;
  }
  return {
    head: line.slice(0, at),
    items: line
      .slice(at + 1)
      .split(/\s+/u)
      .map((item) => item.replace(/^@damsko\//u, "")),
  };
};

/** The items an example imports that its page's install line does not bring, in import order. */
export const extraItems = (source: string, installed: string[]): string[] => {
  const all = registry();
  const have = brought(installed);
  const wanted = [
    ...source.matchAll(/from\s+["']@grasp-os\/ui\/components\/([a-z0-9-]+)/gu),
  ].map((match) => match[1] ?? "");
  return [...new Set(wanted)].filter(
    (name) => all.has(name) && !have.has(name)
  );
};

/** "Also add" for an example on a component page: the items and the command that adds them. */
export const alsoAdd = (
  page: string,
  source: string
): { items: string[]; command: string } | null => {
  const install = pageInstall(page);
  if (install === null) {
    return null;
  }
  const items = extraItems(source, install.items);
  if (items.length === 0) {
    return null;
  }
  return {
    items,
    command: `${install.head} ${items.map((item) => `@damsko/${item}`).join(" ")}`,
  };
};
