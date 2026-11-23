// A visible label is a control's children or a label part (`<Button>Save</Button>`,
// `<ProgressLabel>`, `<FieldLabel>`), a control with no visible text takes `aria-label`, and a
// control never takes a `label` prop. So no public type of a component, a block or a hook has a
// prop named `label` or `labels`, or one ending in `Label` or `Labels`, unless it is listed in
// scripts/labels-allowed.json with why:
//   - "data": a field of an item in a list the caller gives (`items`, `columns`, `options`,
//     `levels`, a chart's series);
//   - "typeahead": the words typing finds an item by, UI SDK's own prop on an item;
//   - "names": the hidden names of parts a caller cannot reach to give an `aria-label` (a
//     range's thumbs, a sparkline's points, a date picker's calendar button);
//   - "words": an instance's replacements for its own words in the I18nProvider's catalogue;
//   - "item": a prop of a component whose props are also its group's item, given whole;
//   - "result": what a hook returns, not what it takes.
// Words a component shows or says itself and lets a caller replace end in `Text` (`loadingText`,
// `errorText`, `emptyText`), never `Label`.
//
// A public type is one a file under src/components, src/blocks or src/hooks exports, the props of
// a function it exports, and every type of that file they are built from. A prop is keyed by its
// path from there: `Type.prop`, `Type.items[].label`, `function.prop`. Fails on a prop that is not
// listed, and on a listed one that is gone. Reads files only.
//
//   node scripts/check-labels.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

import { isRecord, readJson } from "./json.ts";

const root = nodePath.join(import.meta.dirname, "..");
const folders = ["src/components", "src/blocks", "src/hooks"];
const reasons = new Set([
  "data",
  "typeahead",
  "names",
  "words",
  "item",
  "result",
]);
// `showLabels` and the like say whether a list's labels show: a switch, not words.
const labelName = /^labels?$|^(?!show|hide).*Labels?$/u;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = nodePath.join(dir, entry);
    if (statSync(path).isDirectory()) {
      return walk(path);
    }
    return /\.tsx?$/u.test(entry) ? [path] : [];
  });

type Declared = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
const isDeclared = (node: ts.Node): node is Declared =>
  ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
const isExported = (node: ts.Node) =>
  ts.canHaveModifiers(node) &&
  (ts
    .getModifiers(node)
    ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
    false);

const propName = (node: ts.PropertySignature): string | undefined =>
  ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
    ? node.name.text
    : undefined;

const isList = (node: ts.Node): boolean =>
  ts.isArrayTypeNode(node) ||
  (ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    ["Array", "ReadonlyArray"].includes(node.typeName.text));

/** A prop's path inside its owner: the props it sits in, `[]` for each list between. */
const pathOf = (node: ts.PropertySignature, top: ts.Node): string => {
  const parts: string[] = [];
  let list = false;
  for (
    let at: ts.Node | undefined = node.parent;
    at !== undefined && at !== top;
    at = at.parent
  ) {
    if (isList(at)) {
      list = true;
    } else if (ts.isPropertySignature(at)) {
      parts.unshift(`${propName(at) ?? "?"}${list ? "[]" : ""}`);
      list = false;
    }
  }
  return [...parts, propName(node) ?? "?"].join(".");
};

/** The name a function the file exports goes by, for the props written inline in it. */
const exportedName = (statement: ts.Statement): string | undefined => {
  if (ts.isFunctionDeclaration(statement)) {
    return statement.name?.text;
  }
  if (ts.isVariableStatement(statement)) {
    const [first] = statement.declarationList.declarations;
    return first !== undefined && ts.isIdentifier(first.name)
      ? first.name.text
      : undefined;
  }
  return undefined;
};

/** Every `label`-like prop of a file's public types, as `<file>#<Owner>.<path>`. */
export const labelsIn = (file: string, text: string): string[] => {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const declared = new Map<string, Declared>();
  for (const statement of source.statements) {
    if (isDeclared(statement)) {
      declared.set(statement.name.text, statement);
    }
  }
  const named = new Set<string>();
  const queue: { node: ts.Node; owner: string }[] = [];
  for (const statement of source.statements) {
    if (!isExported(statement)) {
      continue;
    }
    if (isDeclared(statement)) {
      named.add(statement.name.text);
      queue.push({ node: statement, owner: statement.name.text });
    } else {
      const name = exportedName(statement);
      if (name !== undefined) {
        queue.push({ node: statement, owner: name });
      }
    }
  }
  const found: string[] = [];
  const read = (node: ts.Node, owner: string, top: ts.Node) => {
    if (ts.isBlock(node)) {
      // A function's body is how it works, never what it takes.
      return;
    }
    if (ts.isPropertySignature(node)) {
      const name = propName(node);
      if (name !== undefined && labelName.test(name)) {
        found.push(`${file}#${owner}.${pathOf(node, top)}`);
      }
    }
    if (
      (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) ||
      (ts.isExpressionWithTypeArguments(node) &&
        ts.isIdentifier(node.expression))
    ) {
      const name = ts.isTypeReferenceNode(node)
        ? node.typeName.getText(source)
        : node.expression.getText(source);
      const next = declared.get(name);
      if (next !== undefined && !named.has(name)) {
        named.add(name);
        read(next, name, next);
      }
    }
    ts.forEachChild(node, (child) => {
      read(child, owner, top);
    });
  };
  for (const { node, owner } of queue) {
    read(node, owner, node);
  }
  return found;
};

/** What is wrong with the label-like props found, against the list of those allowed. */
export const problems = (
  found: ReadonlySet<string>,
  allowed: ReadonlyMap<string, string>
): string[] => {
  const failures: string[] = [];
  for (const prop of found) {
    if (!allowed.has(prop)) {
      failures.push(
        `${prop}: a visible label is children or a label part, a control with no visible text takes \`aria-label\`, a component's own words end in \`Text\`; anything else is listed in scripts/labels-allowed.json with why`
      );
    }
  }
  for (const [prop, why] of allowed) {
    if (!found.has(prop)) {
      failures.push(`${prop}: listed in scripts/labels-allowed.json, but gone`);
    } else if (!reasons.has(why)) {
      failures.push(
        `${prop}: "${why}" is no reason; one of ${[...reasons].join(", ")}`
      );
    }
  }
  return failures;
};

/** Every label-like prop in the tree's public types. */
export const labelsInTree = (): Set<string> =>
  new Set(
    folders
      .flatMap((folder) => walk(nodePath.join(root, folder)))
      .map((path) => nodePath.relative(root, path).split("\\").join("/"))
      .toSorted()
      .flatMap((file) =>
        labelsIn(file, readFileSync(nodePath.join(root, file), "utf-8"))
      )
  );

if (import.meta.main) {
  const listed = readJson(nodePath.join(root, "scripts/labels-allowed.json"));
  const allowed = new Map<string, string>(
    isRecord(listed)
      ? Object.entries(listed).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      : []
  );
  const found = labelsInTree();
  const failures = problems(found, allowed);
  for (const failure of failures) {
    console.log(`FAIL  ${failure}`);
  }
  console.log(
    failures.length === 0
      ? `labels: ${found.size} listed label fields in ${folders.join(", ")}, no label prop on a control`
      : `labels: ${failures.length} problem(s)`
  );
  process.exit(failures.length === 0 ? 0 : 1);
}
