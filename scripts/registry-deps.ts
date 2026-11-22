// The registry's items (registry.json) with each file's content, as a project installs it, and the
// items an install of some items brings with it: each item's registryDependencies, followed
// transitively. A product that installs Sheet installs Drawer too, so a check of Sheet "as
// installed" checks Drawer with it.
import { readFileSync } from "node:fs";
import path from "node:path";

import { registrySchema } from "shadcn/schema";
import type { RegistryItem } from "shadcn/schema";

const root = new URL("..", import.meta.url).pathname;

/** Every registry item, each file with its content: a registry:file installs byte for byte. */
export const registryItems = (): RegistryItem[] =>
  registrySchema
    .parse(JSON.parse(readFileSync(path.join(root, "registry.json"), "utf-8")))
    .items.map((item) => ({
      ...item,
      files: (item.files ?? []).map((file) => ({
        ...file,
        content: readFileSync(path.join(root, file.path), "utf-8"),
      })),
    }));

/** The names given, and every item of ours they depend on, however deep. */
export const withDependencies = (names: string[]): string[] => {
  const needs = new Map(
    registryItems().map((item) => [
      item.name,
      (item.registryDependencies ?? []).flatMap((dependency) => {
        // `@damsko/drawer`: ours, by name; anything else is not ours to check.
        const own = /^@damsko\/(?<own>[\w-]+)$/u.exec(dependency)?.groups?.own;
        return own === undefined ? [] : [own];
      }),
    ])
  );
  const seen = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    for (const need of needs.get(name) ?? []) {
      visit(need);
    }
  };
  for (const name of names) {
    visit(name);
  }
  return [...seen].toSorted();
};
