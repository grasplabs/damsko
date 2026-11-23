// A visible label is a control's children or a label part
// (`<Button>Save</Button>`, `<ProgressLabel>`, `<FieldLabel>`), a control with no visible text
// takes `aria-label`, and a control never takes a `label` prop. So no public type of a component or a block has a prop named `label`,
// or one ending in `Label` or `Labels`, unless it is listed in scripts/labels-allowed.json with why:
//   - "data": a field of an item in a list the caller gives (`items`, `columns`, `options`,
//     `levels`, a chart's series), as a data shape names it;
//   - "typeahead": the words typing finds an item by, UI SDK's own prop on an item;
//   - "names": the names of parts a caller cannot reach to give an `aria-label`.
// Words a component says itself and lets a caller replace end in `Text` (`loadingText`,
// `errorText`, `emptyText`), never `Label`.
//
// A public type is one a file under src/components or src/blocks exports, and every type of that
// file it is built from. Fails on a prop that is not listed, and on a listed one that is gone.
// Reads files only.
//
//   node scripts/check-labels.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

import { isRecord, readJson } from "./json.ts";

const root = nodePath.join(import.meta.dirname, "..");
const reasons = new Set(["data", "typeahead", "names"]);
// `showLabels` and the like say whether a list's labels show: a switch, not words.
const labelName = /^label$|^(?!show|hide).*Labels?$/u;

const listed = readJson(nodePath.join(root, "scripts/labels-allowed.json"));
const allowed = new Map<string, string>(
  isRecord(listed)
    ? Object.entries(listed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string"
      )
    : []
);

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
const isExported = (node: {
  modifiers?: ts.NodeArray<ts.ModifierLike> | undefined;
}) =>
  node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
  ) ?? false;

/** Every `label`-like prop of a file's public types, as `<file>#<Type>.<prop>`. */
const labelsIn = (file: string): string[] => {
  const source = ts.createSourceFile(
    file,
    readFileSync(nodePath.join(root, file), "utf-8"),
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
  // What a function a file exports takes is public too, whatever its props type is called.
  const named = new Set<string>();
  const queue: ts.Node[] = [];
  for (const statement of source.statements) {
    if (isDeclared(statement)) {
      if (isExported(statement)) {
        named.add(statement.name.text);
        queue.push(statement);
      }
    } else if (
      (ts.isVariableStatement(statement) ||
        ts.isFunctionDeclaration(statement)) &&
      isExported(statement)
    ) {
      queue.push(statement);
    }
  }
  const found: string[] = [];
  const read = (node: ts.Node, owner: string | undefined) => {
    if (ts.isBlock(node)) {
      // A function's body is how it works, never what it takes.
      return;
    }
    if (
      owner !== undefined &&
      ts.isPropertySignature(node) &&
      (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
      labelName.test(node.name.text)
    ) {
      found.push(`${file}#${owner}.${node.name.text}`);
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
        read(next, name);
      }
    }
    ts.forEachChild(node, (child) => {
      read(child, owner);
    });
  };
  for (const node of queue) {
    read(node, isDeclared(node) ? node.name.text : undefined);
  }
  return found;
};

const files = ["src/components", "src/blocks"]
  .flatMap((folder) => walk(nodePath.join(root, folder)))
  .map((path) => nodePath.relative(root, path).split("\\").join("/"))
  .toSorted();
const found = new Set(files.flatMap(labelsIn));

const failures: string[] = [];
for (const prop of found) {
  if (!allowed.has(prop)) {
    failures.push(
      `${prop}: a label is children or a label part, a name is \`aria-label\`, a component's own words end in \`Text\`; a data shape's field is listed in scripts/labels-allowed.json with why`
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

for (const failure of failures) {
  console.log(`FAIL  ${failure}`);
}
console.log(
  failures.length === 0
    ? `labels: ${files.length} files, ${found.size} listed label fields, no label prop on a control`
    : `labels: ${failures.length} problem(s)`
);
process.exit(failures.length === 0 ? 0 : 1);
