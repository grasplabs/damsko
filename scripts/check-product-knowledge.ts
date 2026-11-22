// Nothing in Damsko knows the product (AGENTS.md): no import of Lingui, a
// router or the product's packages, no package that is not one of
// package.json's dependencies, no relative import out of the repository, and
// none of the product words in scripts/product-knowledge.json (each a
// regular expression, matched in string literals and JSX text, or in the
// whole file). Add to that list as product words turn up.
//
// It holds every file in src/.
//
//   node scripts/check-product-knowledge.ts
import { existsSync, readFileSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

import { filesUnder, importsOf } from "./check-target-api.ts";
import { isRecord, readJson, stringsAt } from "./json.ts";

export interface Rules {
  /** A pattern an import may not match, to why. */
  imports: Record<string, string>;
  words: { match: string; in: "strings" | "text"; why: string }[];
}

/** scripts/product-knowledge.json, checked as it is read. */
export const readRules = (file: string): Rules => {
  const data = readJson(file);
  const imports = stringsAt(data, "imports");
  const words = isRecord(data) ? data.words : undefined;
  if (!Array.isArray(words)) {
    throw new TypeError(`${file}: "words" must be a list`);
  }
  return {
    imports,
    words: words.map((word: unknown) => {
      if (
        !isRecord(word) ||
        typeof word.match !== "string" ||
        (word.in !== "strings" && word.in !== "text") ||
        typeof word.why !== "string"
      ) {
        throw new TypeError(
          `${file}: each word needs "match", "in" ("strings" or "text") and "why"`
        );
      }
      return { match: word.match, in: word.in, why: word.why };
    }),
  };
};

/** The words a file shows: its string literals, template parts and JSX text. */
const stringsOf = (path: string, text: string): string[] => {
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node)
    ) {
      found.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true));
  return found;
};

const packageOf = (specifier: string): string =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

/** What a file at `path` (from `root`) knows of the product. */
export const productKnowledge = (
  root: string,
  path: string,
  text: string,
  rules: Rules,
  dependencies: string[]
): string[] => {
  const found: string[] = [];
  for (const specifier of importsOf(path, text)) {
    const banned = Object.entries(rules.imports).find(([pattern]) =>
      new RegExp(pattern, "u").test(specifier)
    );
    if (banned !== undefined) {
      found.push(`${path}: imports ${specifier}: ${banned[1]}`);
    } else if (specifier.startsWith(".")) {
      const into = nodePath.relative(
        root,
        nodePath.resolve(root, nodePath.dirname(path), specifier)
      );
      if (into.startsWith("..")) {
        found.push(`${path}: imports ${specifier}, outside the repository`);
      }
    } else if (!dependencies.includes(packageOf(specifier))) {
      found.push(
        `${path}: imports ${specifier}, not one of package.json's dependencies (imports inside src/ are relative)`
      );
    }
  }
  const shown = stringsOf(path, text).join("\n");
  for (const word of rules.words) {
    const hits = (word.in === "strings" ? shown : text).match(
      new RegExp(word.match, "gu")
    );
    if (hits !== null) {
      found.push(`${path}: "${hits[0]}" ×${hits.length}: ${word.why}`);
    }
  }
  return found;
};

if (import.meta.main) {
  const root = nodePath.join(import.meta.dirname, "..");
  const rules = readRules(
    nodePath.join(root, "scripts/product-knowledge.json")
  );
  const dependencies = Object.keys(
    stringsAt(readJson(nodePath.join(root, "package.json")), "dependencies")
  );
  const held = filesUnder(root, "src");
  const found = held
    .filter(
      (path) => /\.tsx?$/u.test(path) && existsSync(nodePath.join(root, path))
    )
    .flatMap((path) =>
      productKnowledge(
        root,
        path,
        readFileSync(nodePath.join(root, path), "utf-8"),
        rules,
        dependencies
      )
    );
  for (const line of found) {
    console.log(`FAIL  ${line}`);
  }
  console.log(
    found.length === 0
      ? `product-knowledge: none of the ${held.length} files held knows the product`
      : `product-knowledge: ${found.length} problem(s)`
  );
  process.exit(found.length === 0 ? 0 : 1);
}
