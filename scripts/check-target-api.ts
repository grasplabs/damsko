// Holds every component and block to its API and shape. scripts/target-api.json lists each one's
// files and the exact names each file exports. Change the list when the API changes on purpose,
// in the same pull request.
//
//   "button": {
//     "src/components/button.tsx": ["Button", "ButtonProps", …],
//     "src/components/button.stylex.ts": null
//   }
//
// A file's list is its exports, no more and no fewer; `null` leaves them open: a `.stylex.ts` file
// (StyleX lets it export only its define* calls, which any component may import) or a file
// internal to its component (a folder component's files besides index.ts, a helper), which no
// other component may import.
//
// It fails on: a file under src/components or src/blocks that no entry lists; a listed file
// missing; an export missing or extra; any other file in a folder component's folder, or a folder
// beside a one-file component; `@deprecated`; an import of another component's internals; and
// anything under src/lib or src/hooks that imports a component or block.
//
//   node scripts/check-target-api.ts
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

import { isRecord, readJson } from "./json.ts";

/** A component's files, by path from the repository's root: its exports, or null when open. */
export type Target = Record<string, string[] | null>;

const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** A component's files, or undefined when one is not a list of names or null. */
const filesOf = (value: unknown): Target | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }
  const entries = Object.entries(value);
  const lists = entries.flatMap(([path, list]) =>
    list === null || strings(list) ? [[path, list] as const] : []
  );
  return lists.length === entries.length
    ? Object.fromEntries(lists)
    : undefined;
};

/** scripts/target-api.json, checked as it is read. */
export const readTargets = (file: string): Record<string, Target> => {
  const data = readJson(file);
  if (!isRecord(data)) {
    throw new TypeError(`${file}: not an object of components`);
  }
  return Object.fromEntries(
    Object.entries(data).map(([name, entry]) => {
      const files = filesOf(entry);
      if (files === undefined) {
        throw new TypeError(
          `${file}: ${name} needs its files, each path to a list of names or null`
        );
      }
      return [name, files];
    })
  );
};

/** Every file under `dir`, recursively, as paths from `root`. */
export const filesUnder = (root: string, dir: string): string[] => {
  const full = nodePath.join(root, dir);
  if (!existsSync(full)) {
    return [];
  }
  return readdirSync(full).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    return statSync(nodePath.join(root, path)).isDirectory()
      ? filesUnder(root, path)
      : [path];
  });
};

const parse = (path: string, text: string): ts.SourceFile =>
  ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);

/** The modules a file imports or re-exports from, as written. */
export const importsOf = (path: string, text: string): string[] =>
  parse(path, text).statements.flatMap((statement) =>
    (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) &&
    statement.moduleSpecifier !== undefined &&
    ts.isStringLiteral(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : []
  );

const bindingNames = (name: ts.BindingName): string[] =>
  ts.isIdentifier(name)
    ? [name.text]
    : name.elements.flatMap((element) =>
        ts.isOmittedExpression(element) ? [] : bindingNames(element.name)
      );

/** The names a file exports; `default` for a default export, `*` for `export *`. */
export const exportsOf = (path: string, text: string): string[] =>
  parse(path, text).statements.flatMap((statement): string[] => {
    if (ts.isExportAssignment(statement)) {
      return ["default"];
    }
    if (ts.isExportDeclaration(statement)) {
      const clause = statement.exportClause;
      if (clause === undefined) {
        return ["*"];
      }
      return ts.isNamedExports(clause)
        ? clause.elements.map((element) => element.name.text)
        : [clause.name.text];
    }
    const modifiers = ts.canHaveModifiers(statement)
      ? (ts.getModifiers(statement) ?? [])
      : [];
    if (!modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      return [];
    }
    if (modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      return ["default"];
    }
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.flatMap((declaration) =>
        bindingNames(declaration.name)
      );
    }
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isModuleDeclaration(statement)) &&
      statement.name !== undefined
    ) {
      return [statement.name.text];
    }
    return [];
  });

/** The file a relative import names, if it is there. */
const resolve = (
  root: string,
  from: string,
  specifier: string
): string | undefined => {
  const base = nodePath.posix.join(nodePath.posix.dirname(from), specifier);
  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ].find((path) => {
    const full = nodePath.join(root, path);
    return existsSync(full) && statSync(full).isFile();
  });
};

const parts = /^src\/(?:components|blocks)\//u;
/** The folder a component's file sits in, when it is one of a folder component's. */
const folderOf = (path: string): string | undefined =>
  /^(?<folder>src\/(?:components|blocks)\/[^/]+)\/.+$/u.exec(path)?.groups
    ?.folder;

/** May another component import this file? A `.stylex.ts` file, or one with its exports listed. */
const isPublic = (targets: Record<string, Target>, path: string): boolean =>
  path.endsWith(".stylex.ts") ||
  Object.values(targets).some(
    (target) => Object.hasOwn(target, path) && target[path] !== null
  );

const checkComponent = (
  root: string,
  targets: Record<string, Target>,
  name: string,
  target: Target
): string[] => {
  const problems: string[] = [];
  const listed = Object.keys(target);
  const folders = new Set(
    listed.flatMap((path) => {
      const folder = folderOf(path);
      return folder === undefined ? [] : [folder];
    })
  );
  // A folder component's folder holds its listed files and nothing else; a one-file component has
  // no folder.
  for (const path of [...folders].flatMap((folder) =>
    filesUnder(root, folder)
  )) {
    if (!listed.includes(path)) {
      problems.push(`${path}: not one of ${name}'s files`);
    }
  }
  for (const folder of [`src/components/${name}`, `src/blocks/${name}`]) {
    if (!folders.has(folder) && existsSync(nodePath.join(root, folder))) {
      problems.push(
        `${folder}/: a folder left beside a one-file component (one file per primitive, plus its .stylex.ts)`
      );
    }
  }
  for (const [path, expected] of Object.entries(target)) {
    const full = nodePath.join(root, path);
    if (!existsSync(full)) {
      problems.push(`${path}: missing`);
      continue;
    }
    const text = readFileSync(full, "utf-8");
    if (text.includes("@deprecated")) {
      problems.push(`${path}: @deprecated (no deprecated aliases)`);
    }
    for (const specifier of importsOf(path, text)) {
      const into = specifier.startsWith(".")
        ? resolve(root, path, specifier)
        : undefined;
      if (
        into === undefined ||
        !parts.test(into) ||
        Object.hasOwn(target, into)
      ) {
        continue;
      }
      if (!isPublic(targets, into)) {
        problems.push(
          `${path}: imports ${into}, another component's internals; import its entry file`
        );
      }
    }
    if (expected === null) {
      continue;
    }
    const actual = exportsOf(path, text);
    for (const missing of expected.filter((each) => !actual.includes(each))) {
      problems.push(`${path}: does not export ${missing}`);
    }
    for (const extra of actual.filter((each) => !expected.includes(each))) {
      problems.push(
        `${path}: exports ${extra}, which is not in its target API`
      );
    }
  }
  return problems;
};

/** Every problem in the tree at `root` against `targets`. */
export const checkTargetApi = (
  root: string,
  targets: Record<string, Target>
): string[] => [
  ...["src/components", "src/blocks"]
    .flatMap((dir) => filesUnder(root, dir))
    // A file in a component's own folder is that component's to report.
    .filter(
      (path) =>
        !Object.hasOwn(
          targets,
          nodePath.posix.basename(folderOf(path) ?? "")
        ) &&
        !Object.values(targets).some((target) => Object.hasOwn(target, path))
    )
    .map((path) => `${path}: in no entry of scripts/target-api.json`),
  ...Object.entries(targets).flatMap(([name, target]) =>
    checkComponent(root, targets, name, target)
  ),
  ...["src/lib", "src/hooks"]
    .flatMap((dir) => filesUnder(root, dir))
    .filter((path) => /\.tsx?$/u.test(path))
    .flatMap((path) =>
      importsOf(path, readFileSync(nodePath.join(root, path), "utf-8"))
        .filter((specifier) => {
          const into = specifier.startsWith(".")
            ? resolve(root, path, specifier)
            : undefined;
          return into !== undefined && parts.test(into);
        })
        .map(
          (specifier) =>
            `${path}: imports ${specifier}; lib/ and hooks/ never import a component`
        )
    ),
];

if (import.meta.main) {
  const root = nodePath.join(import.meta.dirname, "..");
  const targets = readTargets(nodePath.join(root, "scripts/target-api.json"));
  const problems = checkTargetApi(root, targets);
  for (const problem of problems) {
    console.log(`FAIL  ${problem}`);
  }
  console.log(
    problems.length === 0
      ? `target-api: ${Object.keys(targets).length} components and blocks, all as their target`
      : `target-api: ${problems.length} problem(s)`
  );
  process.exit(problems.length === 0 ? 0 : 1);
}
