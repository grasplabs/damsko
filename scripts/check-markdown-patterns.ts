// Markdown reads untrusted text, so none of its patterns may backtrack without bound. Every regular
// expression in src/components/markdown/ is read here, and it fails when one has a shape that costs
// more than its length: a repeated group holding a quantifier (`(?:a+)*`, `(?: {0,3}> ?)*`); two
// unbounded quantifiers side by side over characters they share (`[ \t]*\s*`, `.*:.*`), with
// nothing between them that must match; or an unbounded quantifier searched for from every place up
// to the input's end (`[*_]+$`). Such a pattern is written as a scanner instead; the few
// kept are listed in ALLOWED, each with the one line that proves it linear. A pattern built at run
// time (`new RegExp(…)`) cannot be read here, so it is not allowed at all.
//
// The cost of every entry point is weighed too, on generated hostile answers
// (scripts/markdown-cost*.test.ts*); this check catches a shape before any answer has to find it.
//
//   node scripts/check-markdown-patterns.ts
import { readdirSync, readFileSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

const folder = new URL("../src/components/markdown/", import.meta.url).pathname;

/**
 * The patterns kept though they have a flagged shape, by their source, each with why it is
 * linear all the same.
 */
const ALLOWED: Record<string, string> = {};

/** The characters an atom matches, as ranges of code points. */
type Ranges = [number, number][];

const ALL: Ranges = [[0, 0x10_ff_ff]];
const range = (from: string, to = from): Ranges => [
  [from.codePointAt(0) ?? 0, to.codePointAt(0) ?? 0],
];
const DIGITS = range("0", "9");
const WORD: Ranges = [
  ...range("0", "9"),
  ...range("A", "Z"),
  ...range("_"),
  ...range("a", "z"),
];
const SPACES: Ranges = [
  [9, 13],
  [32, 32],
  [0xa0, 0xa0],
  [0x16_80, 0x16_80],
  [0x20_00, 0x20_0a],
  [0x20_28, 0x20_29],
  [0x20_2f, 0x20_2f],
  [0x20_5f, 0x20_5f],
  [0x30_00, 0x30_00],
  [0xfe_ff, 0xfe_ff],
];

const complement = (ranges: Ranges): Ranges => {
  const sorted = ranges.toSorted((one, other) => one[0] - other[0]);
  const out: Ranges = [];
  let next = 0;
  for (const [from, to] of sorted) {
    if (from > next) {
      out.push([next, from - 1]);
    }
    next = Math.max(next, to + 1);
  }
  if (next <= 0x10_ff_ff) {
    out.push([next, 0x10_ff_ff]);
  }
  return out;
};

const overlaps = (one: Ranges, other: Ranges) =>
  one.some(([from, to]) =>
    other.some(([start, end]) => from <= end && start <= to)
  );

/** The escapes that stand for a set of characters, by the letter after the backslash. */
const ESCAPES: Partial<Record<string, Ranges>> = {
  d: DIGITS,
  D: complement(DIGITS),
  w: WORD,
  W: complement(WORD),
  s: SPACES,
  S: complement(SPACES),
  t: range("\t"),
  n: range("\n"),
  r: range("\r"),
  f: range("\f"),
  v: range("\v"),
  0: range("\0"),
};

/** A pattern's tree: a node is an atom and how often it may repeat. */
interface Node {
  atom: Atom;
  min: number;
  max: number;
}
type Atom =
  | { kind: "chars"; chars: Ranges }
  | { kind: "group"; alternatives: Node[][] }
  | { kind: "assertion" };

/** Reads a pattern (with the `u` flag, as every pattern here has) into its tree. */
const read = (source: string, dotAll: boolean): Node[][] => {
  let at = 0;
  const lookarounds: Node[][][] = [];
  const peek = () => source[at] ?? "";

  const escape = (inClass: boolean): Ranges | "assertion" => {
    const char = source[at] ?? "";
    at += 1;
    const known = ESCAPES[char];
    if (known !== undefined) {
      return known;
    }
    if (char === "b" || char === "B") {
      return inClass ? range("\b") : "assertion";
    }
    // A property of Unicode, or a named group's match: any character, which overlaps everything.
    if (char === "p" || char === "P" || char === "k") {
      at = source.indexOf(char === "k" ? ">" : "}", at) + 1;
      return ALL;
    }
    if (char === "x" || (char === "u" && source[at] !== "{")) {
      const digits = char === "x" ? 2 : 4;
      const code = Number.parseInt(source.slice(at, at + digits), 16);
      at += digits;
      return [[code, code]];
    }
    if (char === "u") {
      const end = source.indexOf("}", at);
      const code = Number.parseInt(source.slice(at + 1, end), 16);
      at = end + 1;
      return [[code, code]];
    }
    // A back reference matches what its group did: any character.
    return /[1-9]/u.test(char) ? ALL : range(char);
  };

  const charOrEscape = (): Ranges => {
    if (peek() === "\\") {
      at += 1;
      const found = escape(true);
      return found === "assertion" ? [] : found;
    }
    const code = source.codePointAt(at) ?? 0;
    at += code > 0xff_ff ? 2 : 1;
    return [[code, code]];
  };

  const characterClass = (): Ranges => {
    // After the `[`.
    const negated = peek() === "^";
    at += negated ? 1 : 0;
    const chars: Ranges = [];
    while (at < source.length && peek() !== "]") {
      const first = charOrEscape();
      if (peek() === "-" && source[at + 1] !== "]" && first.length === 1) {
        at += 1;
        const last = charOrEscape();
        chars.push([first[0]?.[0] ?? 0, last[0]?.[1] ?? 0]);
      } else {
        chars.push(...first);
      }
    }
    at += 1;
    return negated ? complement(chars) : chars;
  };

  const quantifier = (): [number, number] => {
    const char = peek();
    let bounds: [number, number] = [1, 1];
    if (char === "*") {
      bounds = [0, Number.POSITIVE_INFINITY];
      at += 1;
    } else if (char === "+") {
      bounds = [1, Number.POSITIVE_INFINITY];
      at += 1;
    } else if (char === "?") {
      bounds = [0, 1];
      at += 1;
    } else if (char === "{") {
      const found = /^\{(?<min>\d+)(?<comma>,(?<max>\d*))?\}/u.exec(
        source.slice(at)
      );
      if (found === null) {
        return bounds;
      }
      const { min = "0", comma, max = "" } = found.groups ?? {};
      let most = Number(max === "" ? Number.POSITIVE_INFINITY : max);
      if (comma === undefined) {
        most = Number(min);
      }
      bounds = [Number(min), most];
      at += found[0].length;
    } else {
      return bounds;
    }
    // Lazy or not, the same.
    at += peek() === "?" ? 1 : 0;
    return bounds;
  };

  const alternatives = (): Node[][] => {
    const all: Node[][] = [[]];
    while (at < source.length && peek() !== ")") {
      const char = peek();
      let atom: Atom;
      if (char === "|") {
        at += 1;
        all.push([]);
        continue;
      } else if (char === "(") {
        at += 1;
        const look = /^\?(?:[=!]|<[=!])/u.exec(source.slice(at));
        if (look !== null) {
          at += look[0].length;
        } else if (source.startsWith("?:", at)) {
          at += 2;
        } else if (source.startsWith("?<", at)) {
          at = source.indexOf(">", at) + 1;
        }
        const inner = alternatives();
        at += 1;
        atom = { kind: "group", alternatives: inner };
        // A lookaround matches nothing itself; its own body is read for its shapes.
        if (look !== null) {
          lookarounds.push(inner);
          atom = { kind: "assertion" };
        }
      } else if (char === "[") {
        at += 1;
        atom = { kind: "chars", chars: characterClass() };
      } else if (char === "\\") {
        at += 1;
        const found = escape(false);
        atom =
          found === "assertion"
            ? { kind: "assertion" }
            : { kind: "chars", chars: found };
      } else if (char === "^" || char === "$") {
        at += 1;
        atom = { kind: "assertion" };
      } else if (char === ".") {
        at += 1;
        atom = {
          kind: "chars",
          chars: dotAll
            ? ALL
            : complement([...range("\n"), ...range("\r"), [0x20_28, 0x20_29]]),
        };
      } else {
        atom = { kind: "chars", chars: charOrEscape() };
      }
      const [min, max] = quantifier();
      all.at(-1)?.push({ atom, min, max });
    }
    return all;
  };

  const tree = alternatives();
  return [...tree, ...lookarounds.flat()];
};

/** Every character a node can match. */
const charsOf = (node: Node): Ranges => {
  if (node.atom.kind === "chars") {
    return node.atom.chars;
  }
  return node.atom.kind === "group"
    ? node.atom.alternatives.flat().flatMap(charsOf)
    : [];
};

const isQuantified = (node: Node) => node.min !== 1 || node.max !== 1;

/** Whether a node or anything inside it has a quantifier. */
const holdsQuantifier = (node: Node): boolean =>
  isQuantified(node) ||
  (node.atom.kind === "group" &&
    node.atom.alternatives.flat().some(holdsQuantifier));

/**
 * A pattern that is not anchored at its start, ends at the input's end (`$`) and repeats without
 * bound is tried from every place and runs to the end from each (`[*_]+$` on a run of stars and a
 * letter): the square of the length. Such a search belongs in a loop from the end, or in a window.
 */
const searchedToEnd = (source: string): string[] =>
  !source.startsWith("^") &&
  source.endsWith("$") &&
  !source.endsWith("\\$") &&
  read(source, false)
    .flat()
    .some((node) => node.max === Number.POSITIVE_INFINITY)
    ? ["searched from every place to the end"]
    : [];

/** What is wrong with a sequence of nodes and every sequence inside it, as words. */
const shapesOf = (sequence: Node[]): string[] => {
  const found: string[] = [];
  for (const [index, node] of sequence.entries()) {
    if (node.atom.kind !== "group") {
      continue;
    }
    if (node.max > 1 && node.atom.alternatives.flat().some(holdsQuantifier)) {
      found.push("a repeated group holds a quantifier");
    }
    for (const inner of node.atom.alternatives) {
      found.push(...shapesOf(inner));
    }
    void index;
  }
  for (const [index, node] of sequence.entries()) {
    if (node.max !== Number.POSITIVE_INFINITY) {
      continue;
    }
    for (const later of sequence.slice(index + 1)) {
      if (
        later.max === Number.POSITIVE_INFINITY &&
        overlaps(charsOf(node), charsOf(later))
      ) {
        found.push("two unbounded quantifiers side by side share characters");
        break;
      }
      // Something that must match stands between them.
      if (later.atom.kind !== "assertion" && later.min > 0) {
        break;
      }
    }
  }
  return found;
};

/** Every pattern in a file: its source, flags, line, and whether it is built at run time. */
const patternsIn = (file: string) => {
  const text = readFileSync(file, "utf-8");
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const found: {
    source: string;
    flags: string;
    line: number;
    built: boolean;
  }[] = [];
  const visit = (node: ts.Node) => {
    const line = tree.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    if (ts.isRegularExpressionLiteral(node)) {
      const literal = node.text;
      const end = literal.lastIndexOf("/");
      found.push({
        source: literal.slice(1, end),
        flags: literal.slice(end + 1),
        line,
        built: false,
      });
    } else if (
      (ts.isNewExpression(node) || ts.isCallExpression(node)) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "RegExp"
    ) {
      found.push({ source: node.getText(), flags: "", line, built: true });
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return found;
};

const failures: string[] = [];
const seen = new Set<string>();
for (const name of readdirSync(folder).filter((file) =>
  /\.tsx?$/u.test(file)
)) {
  for (const { source, flags, line, built } of patternsIn(
    nodePath.join(folder, name)
  )) {
    const where = `src/components/markdown/${name}:${line}`;
    if (built) {
      failures.push(
        `${where}: built at run time, so it cannot be read: ${source}`
      );
      continue;
    }
    const shapes = [
      ...new Set(read(source, flags.includes("s")).flatMap(shapesOf)),
      ...searchedToEnd(source),
    ];
    if (shapes.length === 0) {
      continue;
    }
    seen.add(source);
    if (ALLOWED[source] === undefined) {
      failures.push(`${where}: /${source}/${flags}: ${shapes.join("; ")}`);
    }
  }
}
for (const source of Object.keys(ALLOWED)) {
  if (!seen.has(source)) {
    failures.push(`ALLOWED lists /${source}/, which no longer needs it`);
  }
}

if (failures.length > 0) {
  console.error(
    `check-markdown-patterns: ${failures.length} pattern(s) may backtrack without bound; write each as a scanner, or list it in ALLOWED with why it is linear:\n${failures.map((failure) => `  ${failure}`).join("\n")}`
  );
  process.exit(1);
}
console.log(
  "check-markdown-patterns: every pattern in src/components/markdown is linear"
);
