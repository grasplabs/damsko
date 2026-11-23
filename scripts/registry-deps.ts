// The registry's items (registry.json) with each file's content, as a project installs it, and the
// items an install of some items brings with it: each item's registryDependencies, followed
// transitively. A product that installs Sheet installs Drawer too, so a check of Sheet "as
// installed" checks Drawer with it. And what a file imports, read by a full parse
// (scripts/check-registry.ts and scripts/check-install.ts hold the items' packages to it).
import { readFileSync } from "node:fs";
import nodePath from "node:path";

import { registrySchema } from "shadcn/schema";
import type { RegistryItem } from "shadcn/schema";
import ts from "typescript6";

const root = new URL("..", import.meta.url).pathname;

/** Every registry item, each file with its content: a registry:file installs byte for byte. */
export const registryItems = (): RegistryItem[] =>
  registrySchema
    .parse(
      JSON.parse(readFileSync(nodePath.join(root, "registry.json"), "utf-8"))
    )
    .items.map((item) => ({
      ...item,
      files: (item.files ?? []).map((file) => ({
        ...file,
        content: readFileSync(nodePath.join(root, file.path), "utf-8"),
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

/**
 * Every module a file reaches, and every declaration it references, read from a full parse: its
 * own reader, not the generator's quick scan, so a file the scan misreads still fails here. CSS
 * gives its @import and url() targets.
 */
export const modulesOf = (path: string, text: string): string[] => {
  if (path.endsWith(".css")) {
    return [
      ...text.matchAll(
        /@import\s+(?:url\()?\s*["'](?<imported>[^"']+)["']|url\(\s*["']?(?<url>[^"')]+)["']?\s*\)/gu
      ),
    ]
      .map((match) => match.groups?.imported ?? match.groups?.url ?? "")
      .filter(
        (target) => target !== "" && !/^(?:data:|https?:|#)/u.test(target)
      );
  }
  if (!/\.tsx?$/u.test(path)) {
    return [];
  }
  const found: string[] = [];
  const kind = path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      found.push(node.argument.literal.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [argument] = node.arguments;
      if (
        argument &&
        (ts.isStringLiteral(argument) ||
          ts.isNoSubstitutionTemplateLiteral(argument))
      ) {
        found.push(argument.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  const file = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  visit(file);
  // A declaration a file references (`/// <reference path>`) must be installed with it too.
  return [
    ...found,
    ...file.referencedFiles.map((reference) => reference.fileName),
  ];
};
