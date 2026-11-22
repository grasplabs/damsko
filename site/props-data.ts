// Reads a component's props from its source with the TypeScript checker, so the props on its page
// are what the code accepts and cannot drift: `ButtonProps`, the real union a Button is typed with,
// not a copy of it. Used by the Props block (site/blocks/Props.astro) and its Markdown form
// (site/markdown.ts).
//
// Listed: every prop declared in the source file itself (Grasp's own, including the few Base UI
// props it re-declares to say what they mean here). The rest of Base UI's Button and of a
// <button> pass through and are named in one sentence under the list, not repeated.
//
// For each prop: its type (a union of strings becomes its members), its default (`@default`), its
// one sentence (the JSDoc where it is declared; a prop is documented once in its type), and when it
// is required: always, or only in one member of the union (the member's `@when`, such as "with
// state").
//
// A prop is read from the type it belongs to, not by its name in the file, so a file may hold
// several components (Dialog and its parts, Checkbox and CheckboxGroup), each with its own
// `children`. Reading never throws: a missing file or type, or a prop documented twice in one
// type, comes back as a problem beside the rows it could read. The page shows "Props could not be
// read" in that table and `node scripts/check-props.ts` fails with the file and the prop, so one bad
// component file can never stop the dev server.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import ts from "typescript6";

// The repository root: the folder with astro.config.ts, found from where the build runs. (This
// file is bundled into the build's own folder, so its import.meta.url does not lead there.)
const findRoot = () => {
  let folder = process.cwd();
  while (!existsSync(join(folder, "astro.config.ts"))) {
    const parent = dirname(folder);
    if (parent === folder) {
      throw new Error(
        "props-data: no astro.config.ts above the working folder."
      );
    }
    folder = parent;
  }
  return folder;
};
const root = findRoot();

export interface PropRow {
  name: string;
  /** The members of a union of strings, as written ("ink", "quiet"), or empty. */
  members: string[];
  /** The type as text, when it is not a union of strings ("ReactElement", "string"). */
  type?: string;
  /** "Required", "Required with state", or nothing. */
  required?: string;
  default?: string;
  /** The `@deprecated` note: what replaces it ("Use `layout`."). The row follows its replacement. */
  deprecated?: string;
  description: string;
}

export interface PropsResult {
  rows: PropRow[];
  /** What could not be read, each naming the file, the type and the prop. Empty when all is well. */
  problems: string[];
}

// Shared by every copy of this module in one process: a build bundles one into each route that
// reads props (the component pages, their .md twins, the llms files), and each copy kept its own
// cache, so every table was read again by each (about 26 s each time, four times over).
interface PropsMemory {
  cache: Map<string, PropsResult>;
  parsed: Map<string, ts.SourceFile>;
  disk: Record<string, DiskEntry> | null;
  hashes: Map<string, string>;
  dirty: boolean;
}
interface DiskEntry {
  /** Every file the table's program read outside node_modules, and the lockfile, with its hash. */
  deps: Record<string, string>;
  result: PropsResult;
}
const memory = ((
  globalThis as { __damskoProps?: PropsMemory }
).__damskoProps ??= {
  cache: new Map(),
  parsed: new Map(),
  disk: null,
  hashes: new Map(),
  dirty: false,
});
const { cache } = memory;

// Between builds, the tables are kept on disk (node_modules/.cache, which the gate keeps), each with
// the hash of every file its program read; a table is read again only when one of them changed.
// GRASP_PROPS_CACHE=0 reads every table afresh.
// The file's name changes when a row gains a field, so an older cache is not read as current.
const diskFile = join(root, "node_modules", ".cache", "grasp", "props-2.json");
const diskOn = process.env.GRASP_PROPS_CACHE !== "0";
const hashOf = (file: string): string => {
  const known = memory.hashes.get(file);
  if (known !== undefined) {
    return known;
  }
  const made = existsSync(file)
    ? createHash("sha1").update(readFileSync(file)).digest("hex")
    : "missing";
  memory.hashes.set(file, made);
  return made;
};
const disk = (): Record<string, DiskEntry> => {
  if (memory.disk === null) {
    try {
      memory.disk = diskOn
        ? (JSON.parse(readFileSync(diskFile, "utf-8")) as Record<
            string,
            DiskEntry
          >)
        : {};
    } catch {
      memory.disk = {};
    }
    process.once("exit", () => {
      if (!memory.dirty || !diskOn || memory.disk === null) {
        return;
      }
      try {
        mkdirSync(dirname(diskFile), { recursive: true });
        writeFileSync(diskFile, JSON.stringify(memory.disk));
      } catch {
        // A cache that cannot be written is only a slower next build.
      }
    });
  }
  return memory.disk;
};
const fresh = (entry: DiskEntry | undefined): entry is DiskEntry =>
  entry !== undefined &&
  Object.entries(entry.deps).every(([file, hash]) => hashOf(file) === hash);
// The files the last program read, for its disk entry.
let lastRead: string[] = [];

const jsDocText = (node: ts.Node) => {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  return docs.at(-1);
};

const tagText = (doc: ts.JSDoc | undefined, name: string) => {
  const tag = doc?.tags?.find((candidate) => candidate.tagName.text === name);
  return tag ? (ts.getTextOfJSDocComment(tag.comment) ?? "").trim() : undefined;
};

const options: ts.CompilerOptions = {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
  types: [],
};

/** The exported types of a file whose name ends in "Props", for the check. */
export const propsTypesIn = (source: string): string[] => {
  const file = join(root, source);
  const sourceFile = ts.createSourceFile(
    file,
    readFileSync(file, "utf-8"),
    ts.ScriptTarget.ES2022,
    true
  );
  const found: string[] = [];
  sourceFile.forEachChild((node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text.endsWith("Props") &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      found.push(node.name.text);
    }
  });
  return found;
};

/** The props of `typeName` (an interface or a type alias) in `source`, a path from the root. Never throws. */
export const readPropsResult = (
  source: string,
  typeName: string
): PropsResult => {
  const key = `${source}#${typeName}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  const stored = disk()[key];
  if (fresh(stored)) {
    cache.set(key, stored.result);
    return stored.result;
  }
  let result: PropsResult;
  lastRead = [];
  try {
    result = read(source, typeName);
  } catch (error) {
    result = {
      rows: [],
      problems: [
        `${source}, ${typeName}: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
  cache.set(key, result);
  if (lastRead.length > 0) {
    const files = [
      ...lastRead.filter((file) => !file.includes("/node_modules/")),
      join(root, "pnpm-lock.yaml"),
    ];
    disk()[key] = {
      deps: Object.fromEntries(files.map((file) => [file, hashOf(file)])),
      result,
    };
    memory.dirty = true;
  }
  return result;
};

/** The rows alone, for the Markdown twin. Never throws; a problem leaves its rows out. */
export const readProps = (source: string, typeName: string): PropRow[] =>
  readPropsResult(source, typeName).rows;

// A program per file, as before, so the checker reads every type exactly as it did; but the files
// they read (React's types, the libraries', the components') are parsed once and shared, instead of
// once per program: a program per file took 1 to 3 s, 247 times over, almost all of it parsing the
// same declaration files again (about 240 to 520 s of the build, all through /llms-full.txt).
const { parsed } = memory;
const host = ts.createCompilerHost(options);
const parse = host.getSourceFile.bind(host);
host.getSourceFile = (fileName, languageVersion, onError, fresh) => {
  const key = `${fileName}\u0000${typeof languageVersion === "object" ? languageVersion.languageVersion : languageVersion}`;
  const known = fresh === true ? undefined : parsed.get(key);
  if (known !== undefined) {
    return known;
  }
  const made = parse(fileName, languageVersion, onError, fresh);
  if (made !== undefined) {
    parsed.set(key, made);
  }
  return made;
};

const read = (source: string, typeName: string): PropsResult => {
  const file = join(root, source);
  if (!existsSync(file)) {
    return { rows: [], problems: [`${source} does not exist.`] };
  }
  const program = ts.createProgram([file], options, host);
  lastRead = program.getSourceFiles().map((each) => each.fileName);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(file);
  if (!sourceFile) {
    return { rows: [], problems: [`${source} could not be read.`] };
  }
  let declaration:
    | ts.InterfaceDeclaration
    | ts.TypeAliasDeclaration
    | undefined;
  sourceFile.forEachChild((node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === typeName
    ) {
      declaration = node;
    }
  });
  if (!declaration) {
    return { rows: [], problems: [`${source} has no type ${typeName}.`] };
  }
  const type = checker.getTypeAtLocation(declaration.name);
  const constituents = type.isUnion() ? type.types : [type];

  // The props of this type that are declared in this file, keyed by the type's own properties, so
  // a prop of another component in the same file is never mixed in. In the order first written.
  // A name is read whether it is written plain (`label`) or quoted (`"aria-label"`); a prop whose
  // name is neither (a computed key) is reported, never skipped in silence.
  const own = new Map<string, ts.PropertySignature[]>();
  const problems: string[] = [];
  for (const part of constituents) {
    for (const symbol of checker.getPropertiesOfType(part)) {
      for (const node of symbol.declarations ?? []) {
        if (
          !(ts.isPropertySignature(node) && node.getSourceFile() === sourceFile)
        ) {
          continue;
        }
        if (!(ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
          const problem = `${source}, ${typeName}: \`${symbol.name}\` has a name the props table cannot read; write it plain or quoted.`;
          if (!problems.includes(problem)) {
            problems.push(problem);
          }
          continue;
        }
        const list = own.get(symbol.name) ?? [];
        if (!list.includes(node)) {
          list.push(node);
        }
        own.set(symbol.name, list);
      }
    }
  }
  const names = [...own.keys()].sort(
    (a, b) =>
      Math.min(...(own.get(a) ?? []).map((node) => node.pos)) -
      Math.min(...(own.get(b) ?? []).map((node) => node.pos))
  );

  const rows: PropRow[] = [];
  for (const name of names) {
    const declarations = own.get(name) ?? [];
    const documented = declarations.filter((node) => {
      const doc = jsDocText(node);
      return Boolean(doc && ts.getTextOfJSDocComment(doc.comment));
    });
    if (documented.length > 1) {
      problems.push(
        `${source}, ${typeName}: \`${name}\` is documented ${documented.length} times; document it once.`
      );
    }
    const main = documented[0] ?? declarations[0];
    if (!main) {
      continue;
    }
    const doc = jsDocText(main);

    // The type, from a declaration that is not `never`.
    const usable = (node: ts.PropertySignature) =>
      node.type !== undefined &&
      node.type.kind !== ts.SyntaxKind.NeverKeyword &&
      node.type.kind !== ts.SyntaxKind.UndefinedKeyword;
    const typed = usable(main) ? main : (declarations.find(usable) ?? main);
    const propType = typed.type
      ? checker.getTypeFromTypeNode(typed.type)
      : checker.getAnyType();
    const literalParts = propType.isUnion() ? propType.types : [propType];
    const strings = literalParts.filter((part) => part.isStringLiteral());
    const others = literalParts.filter(
      (part) =>
        !part.isStringLiteral() &&
        !(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Never))
    );
    const members =
      others.length === 0 && strings.length > 0
        ? strings.map((part) => part.value)
        : [];
    const typeText =
      members.length > 0
        ? undefined
        : typed.type && ts.isTypeReferenceNode(typed.type)
          ? typed.type.getText(sourceFile)
          : checker.typeToString(propType).replaceAll(/\s+/gu, " ");

    // Required: in every member of the union where it may appear, or only in some.
    const states = constituents.map((part) => {
      const symbol = checker.getPropertyOfType(part, name);
      if (!symbol) {
        return "absent";
      }
      const symbolType = checker.getTypeOfSymbol(symbol);
      if (symbolType.flags & ts.TypeFlags.Never) {
        return "absent";
      }
      return symbol.flags & ts.SymbolFlags.Optional ? "optional" : "required";
    });
    // Required always, or only in the member of the union it belongs to (that member's `@when`).
    // The prop that chooses a member (its `@by`) is not required by it.
    // A words or labels type (`DataTableWords`, `SourcesLabels`) is never required: its members are
    // required inside the type, but the `words` prop takes any of them over the English defaults.
    const wordsType = /(?:Words|Labels)$/u.test(typeName);
    let required: string | undefined;
    if (wordsType) {
      required = undefined;
    } else if (states.every((state) => state === "required")) {
      required = "Required";
    } else if (states.includes("required")) {
      const holder = declarations.find((node) => !node.questionToken);
      const parentDoc =
        holder && ts.isInterfaceDeclaration(holder.parent)
          ? jsDocText(holder.parent)
          : undefined;
      const when = tagText(parentDoc, "when");
      required =
        tagText(parentDoc, "by") === name
          ? undefined
          : when
            ? `Required ${when}`
            : "Required";
    }

    rows.push({
      name,
      members,
      ...(typeText ? { type: typeText } : {}),
      ...(required ? { required } : {}),
      ...(tagText(doc, "default")
        ? { default: tagText(doc, "default")?.replaceAll('"', "") }
        : {}),
      ...(tagText(doc, "deprecated") === undefined
        ? {}
        : { deprecated: tagText(doc, "deprecated")!.replaceAll(/\s+/gu, " ") }),
      description: (ts.getTextOfJSDocComment(doc?.comment) ?? "")
        .replaceAll(/\s+/gu, " ")
        .trim(),
    });
  }
  // A deprecated prop stands right after the one that replaces it (named first in its note).
  for (const row of rows.filter(
    (candidate) => candidate.deprecated !== undefined
  )) {
    const by = /`([^`]+)`/u.exec(row.deprecated ?? "")?.[1];
    const at = rows.findIndex((candidate) => candidate.name === by);
    if (at === -1) {
      continue;
    }
    rows.splice(rows.indexOf(row), 1);
    rows.splice(
      rows.findIndex((candidate) => candidate.name === by) + 1,
      0,
      row
    );
  }
  return { rows, problems };
};
