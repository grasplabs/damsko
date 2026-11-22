// Every visible word is a prop: the product translates the
// interface, so no word a person reads or a screen reader says may be written into a component
// where a caller cannot replace it. In the files each registry item installs, read as TypeScript,
// this flags a word written straight into JSX:
//   - text between tags ("<span>Show more</span>");
//   - a string given to an attribute that is said or shown (aria-label, aria-description,
//     aria-roledescription, aria-valuetext, title, placeholder, alt, label);
//   - a string inside a JSX expression ({open ? "Show less" : "Show more"}).
//   - a string given to any attribute whose name ends in "Label" (`loadingLabel="Looking"`): it is
//     a word handed on to a part that shows or says it.
// And anywhere in the code, JSX or not (.ts files too):
//   - a unit written in ("KB", "MB", "GB"): a size is formatted by the host, in its language;
//   - a plural chosen by hand (`n === 1 ? "page" : "pages"`): languages make plurals differently.
// A prop's English default (`label = "Close"`) and a words object (`const englishWords = {...}`)
// are not JSX, so they pass: a caller can replace them. So does a unit or a plural inside a words
// object or an English default of its own (a declaration named `...Words`, `english...` or
// `default...`, or one whose comment says it is the English default): the host replaces it. Text with no letter in it (", ", "%", "·") is not a word.
// It also prints what a host translates: every default word in the registry, by item: a prop's
// default (`label = "Close"`), a fallback for a prop (`title ?? "This did not load"`), and each
// entry of a words object (`englishWords.copy`). A default is allowed only there, where a caller
// can replace it. `--quiet` leaves the list out.
// Needs no server.
//
//   node scripts/check-words.ts
//   node scripts/check-words.ts -- --only agent-indicator            one item (a comma-separated list)
//   node scripts/check-words.ts -- --only sheet --with-deps          and every item of ours it installs with it
import { parseArgs } from "node:util";

import ts from "typescript6";

import { registryItems, withDependencies } from "./registry-deps.ts";

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    "with-deps": { type: "boolean", default: false },
    quiet: { type: "boolean", default: false },
  },
});

const named = (values.only ?? "")
  .split(",")
  .map((word) => word.trim().toLowerCase())
  .filter(Boolean);
const only =
  values["with-deps"] && named.length > 0 ? withDependencies(named) : named;

const said = new Set([
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "title",
  "placeholder",
  "alt",
  "label",
]);
const isWord = (text: string) => /\p{L}/u.test(text);
// A unit of size written on its own, or after a number in a template ("${n} MB").
const unitAlone = /^(?:B|kB|KB|MB|GB|TB|KiB|MiB|GiB)$/u;
const unitAfter = /(?:^|\s|\d)(?:kB|KB|MB|GB|TB|KiB|MiB|GiB)\b/u;
// Where the host's words live: a words object, or an English default of its own.
const replaceable = /words$|^english|^default/iu;

interface Found {
  item: string;
  file: string;
  line: number;
  what: string;
}
const found: Found[] = [];
/** What a host translates: a prop's default word, a fallback for a prop, a words object's entry. */
interface Default {
  item: string;
  name: string;
  word: string;
}
const defaults: Default[] = [];

/** The string literals an expression can end as: through ternaries, ?? and ||, and parentheses. */
const literalsIn = (node: ts.Node): ts.Node[] => {
  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateExpression(node)
  ) {
    return [node];
  }
  if (ts.isParenthesizedExpression(node)) {
    return literalsIn(node.expression);
  }
  if (ts.isConditionalExpression(node)) {
    return [...literalsIn(node.whenTrue), ...literalsIn(node.whenFalse)];
  }
  if (
    ts.isBinaryExpression(node) &&
    [
      ts.SyntaxKind.QuestionQuestionToken,
      ts.SyntaxKind.BarBarToken,
      ts.SyntaxKind.AmpersandAmpersandToken,
    ].includes(node.operatorToken.kind)
  ) {
    return node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ? literalsIn(node.right)
      : [...literalsIn(node.left), ...literalsIn(node.right)];
  }
  return [];
};
const textOf = (node: ts.Node, source: ts.SourceFile) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isTemplateExpression(node)) {
    return [
      node.head.text,
      ...node.templateSpans.map((span) => span.literal.text),
    ].join("…");
  }
  return node.getText(source);
};

/** Whether a test is a count against one: `n === 1`, `count !== 1`, `n > 1`. */
const againstOne = (test: ts.Expression) => {
  const inner = ts.isParenthesizedExpression(test) ? test.expression : test;
  return (
    ts.isBinaryExpression(inner) &&
    [inner.left, inner.right].some(
      (side) => ts.isNumericLiteral(side) && side.text === "1"
    )
  );
};

/** The string literals a JSX attribute's value can give. */
const attributeLiterals = (value: ts.JsxAttributeValue): ts.Node[] => {
  if (ts.isStringLiteral(value)) {
    return [value];
  }
  return ts.isJsxExpression(value) && value.expression
    ? literalsIn(value.expression)
    : [];
};

const scan = (item: string, file: string, code: string) => {
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const flag = (node: ts.Node, what: string) => {
    found.push({
      item,
      file,
      line:
        source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      what,
    });
  };
  /** Whether the node sits in a words object or an English default, which the host replaces. */
  const inWords = (node: ts.Node) => {
    for (
      let at: ts.Node | undefined = node.parent;
      at !== undefined;
      at = at.parent
    ) {
      if (
        (ts.isVariableDeclaration(at) || ts.isFunctionDeclaration(at)) &&
        at.name !== undefined &&
        replaceable.test(at.name.getText(source))
      ) {
        return true;
      }
      // Or a declaration whose own comment says it is the English default a prop replaces.
      if (ts.isVariableStatement(at) || ts.isFunctionDeclaration(at)) {
        const comments =
          ts.getLeadingCommentRanges(code, at.getFullStart()) ?? [];
        if (
          comments.some((range) =>
            /\bEnglish\b/u.test(code.slice(range.pos, range.end))
          )
        ) {
          return true;
        }
      }
    }
    return false;
  };
  const units = (node: ts.Node) => {
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      unitAlone.test(node.text.trim()) &&
      !inWords(node)
    ) {
      flag(node, `a unit written in: "${node.text}"`);
    } else if (ts.isTemplateExpression(node) && !inWords(node)) {
      const text = [
        node.head.text,
        ...node.templateSpans.map((span) => span.literal.text),
      ].join(" ");
      if (unitAfter.test(text)) {
        flag(node, `a unit written in: \`${text.trim().slice(0, 60)}\``);
      }
    } else if (
      ts.isConditionalExpression(node) &&
      againstOne(node.condition) &&
      !inWords(node)
    ) {
      const words = [
        ...literalsIn(node.whenTrue),
        ...literalsIn(node.whenFalse),
      ].map((literal) => textOf(literal, source));
      if (words.length >= 2 && words.every((word) => /\p{L}{3,}/u.test(word))) {
        flag(
          node,
          `a plural chosen by hand: ${words.map((word) => `"${word}"`).join(" or ")}`
        );
      }
    }
    ts.forEachChild(node, units);
  };
  units(source);
  // The default words, wherever a caller can replace them.
  const note = (name: string, node: ts.Node) => {
    for (const literal of literalsIn(node)) {
      const word = textOf(literal, source);
      // One lowercase token is a value (`size = "md"`, `tone = "neutral"`), not a word a person reads.
      if (isWord(word) && !/^[a-z][a-z0-9-]*$/u.test(word)) {
        defaults.push({ item, name, word: word.slice(0, 60) });
      }
    }
  };
  const inventory = (node: ts.Node) => {
    // A prop's default: `label = "Close"` in a component's destructured props.
    if (
      ts.isBindingElement(node) &&
      node.initializer !== undefined &&
      ts.isObjectBindingPattern(node.parent)
    ) {
      note(node.name.getText(source), node.initializer);
    }
    // A fallback for a prop: `title ?? "…"`, `props.label ?? "…"`.
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
      (ts.isIdentifier(node.left) || ts.isPropertyAccessExpression(node.left))
    ) {
      note(`${node.left.getText(source)} ??`, node.right);
    }
    // A words object's entries: `const englishWords = { copy: "Copy" }`.
    if (ts.isPropertyAssignment(node) && inWords(node)) {
      const holder = ts.findAncestor(
        node,
        (at) => ts.isVariableDeclaration(at) || ts.isFunctionDeclaration(at)
      );
      const owner =
        holder &&
        (ts.isVariableDeclaration(holder) || ts.isFunctionDeclaration(holder))
          ? (holder.name?.getText(source) ?? "")
          : "";
      note(`${owner}.${node.name.getText(source)}`, node.initializer);
    }
    ts.forEachChild(node, inventory);
  };
  inventory(source);
  if (!file.endsWith(".tsx")) {
    return;
  }
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.text.replaceAll(/\s+/gu, " ").trim();
      if (text !== "" && isWord(text)) {
        flag(node, `text "${text.slice(0, 60)}"`);
      }
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(source);
      const value = node.initializer;
      if ((said.has(name) || name.endsWith("Label")) && value !== undefined) {
        for (const literal of attributeLiterals(value)) {
          const text = textOf(literal, source);
          if (isWord(text)) {
            flag(literal, `${name}="${text.slice(0, 60)}"`);
          }
        }
        return;
      }
      // Any other attribute is looked into: JSX given to a render prop holds words too.
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      for (const literal of literalsIn(node.expression)) {
        const text = textOf(literal, source);
        if (isWord(text)) {
          flag(literal, `{"${text.slice(0, 60)}"}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
};

let items = 0;
for (const item of registryItems()) {
  if (only.length > 0 && !only.includes(item.name)) {
    continue;
  }
  items += 1;
  for (const file of item.files ?? []) {
    // lib/i18n.tsx is the catalogue: the English defaults every host replaces live there.
    if (
      file.content !== undefined &&
      /\.tsx?$/u.test(file.path) &&
      !file.path.endsWith(".stylex.ts") &&
      file.path !== "src/lib/i18n.tsx"
    ) {
      scan(item.name, file.path, file.content);
    }
  }
}

const byFile = Map.groupBy(found, (each) => each.file);
for (const [file, list] of [...byFile.entries()].toSorted(([a], [b]) =>
  a.localeCompare(b)
)) {
  console.log(`FAIL  ${file}`);
  for (const each of list) {
    console.log(`        :${each.line}  ${each.what}`);
  }
}
const counts = Map.groupBy(found, (each) => each.item);
if (counts.size > 0) {
  console.log("\nper item:");
  for (const [item, list] of [...counts.entries()].toSorted(([a], [b]) =>
    a.localeCompare(b)
  )) {
    console.log(`  ${item.padEnd(24)} ${String(list.length).padStart(4)}`);
  }
}
// What a host translates, by item, so it knows every word it may replace.
const byItem = Map.groupBy(defaults, (each) => each.item);
if (!values.quiet && byItem.size > 0) {
  console.log(
    `\nwhat a host translates: ${defaults.length} default words in ${byItem.size} items, each replaceable`
  );
  for (const [item, list] of [...byItem.entries()].toSorted(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const unique = [
      ...new Map(
        list.map((each) => [`${each.name}=${each.word}`, each])
      ).values(),
    ];
    console.log(
      `  ${item}: ${unique.map((each) => `${each.name} "${each.word}"`).join("; ")}`
    );
  }
}
console.log(
  `\nwords: ${items - counts.size} of ${items} items passed (${found.length} words written into a component)`
);
process.exit(counts.size > 0 ? 1 : 0);
