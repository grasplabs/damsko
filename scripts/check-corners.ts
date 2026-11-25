// Every corner is the system's squircle: a rounded radius has its `cornerShape` (`corner-shape` in
// CSS) beside it, in the same style object or rule, so no corner falls back to a plain round one.
// The exceptions, and only these:
//   - no corner: `0`, `null`;
//   - a corner taken from the parent, `"inherit"`, which takes the parent's shape with it
//     (`cornerShape: "inherit"`), so an inner corner follows the outer one exactly;
//   - a pill or a circle: `radius.full` or `radius.circle` (`--damsko-radius-full`, `-circle`):
//     round by its radius alone, which a squircle would deform. It never takes the squircle, and
//     it may say `cornerShape: "round"` to make that plain where a style it joins carries one;
//   - a pill by design whose radius is half its height rather than `radius.full`, so that more
//     lines round its corners and not its ends (a badge): named in PILLS below, `cornerShape:
//     "round"` beside it.
// A radius written per condition counts as rounded when any of its values is; there `"inherit"`
// counts as no corner (a part in a group takes the group's corner and keeps its own shape).
// Reads files only.
//
//   node scripts/check-corners.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

import ts from "typescript6";

const root = nodePath.join(import.meta.dirname, "..");
const folders = ["src", "site", "examples"];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = nodePath.join(dir, entry);
    if (statSync(path).isDirectory()) {
      return walk(path);
    }
    return /\.(?:tsx?|css)$/u.test(entry) ? [path] : [];
  });

type Corner = "none" | "inherit" | "pill" | "rounded";

const NONE = /^(?:0|"0"|"0px"|null)$/u;
const PILL = /^radius\.(?:full|circle)$/u;
const CSS_NONE = /^(?:0|0px|initial|unset)$/u;
const CSS_PILL = /^var\(--damsko-radius-(?:full|circle)\)$/u;

const kindOf = (text: string, none: RegExp, pill: RegExp): Corner => {
  if (none.test(text)) {
    return "none";
  }
  if (/^"?inherit"?$/u.test(text)) {
    return "inherit";
  }
  return pill.test(text) ? "pill" : "rounded";
};

/** A radius's own corner: the roundest of its values, one per condition. */
const cornerOf = (value: ts.Expression): Corner => {
  if (!ts.isObjectLiteralExpression(value)) {
    return kindOf(value.getText().replaceAll(/\s+/gu, " "), NONE, PILL);
  }
  const kinds = new Set(
    value.properties.map((property) =>
      ts.isPropertyAssignment(property) &&
      cornerOf(property.initializer) !== "inherit"
        ? cornerOf(property.initializer)
        : "none"
    )
  );
  if (kinds.has("rounded")) {
    return "rounded";
  }
  return kinds.has("pill") ? "pill" : "none";
};

const nameOf = (property: ts.ObjectLiteralElementLike): string | undefined =>
  property.name !== undefined &&
  (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))
    ? property.name.text
    : undefined;

const RADIUS =
  /^border(?:(?:Top|Bottom)(?:Left|Right)|(?:Start|End){2})?Radius$/u;
const CSS_RADIUS =
  /(?:^|[;{\s])(?<name>border(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-radius)\s*:\s*(?<value>[^;}]+)/gu;

// Pills by design, as `<file>#<style>`: round, with a radius of their own that radius.full is not.
const PILLS = new Set([
  "src/components/badge.tsx#default",
  "src/components/badge.tsx#sm",
]);
const pillsSeen = new Set<string>();

const failures: string[] = [];
let corners = 0;

const fail = (at: string, problem: string) => {
  failures.push(`${at}: ${problem}`);
};

/** One radius against the shape beside it (`shape`: its source text) and its style's name. */
const checkRadius = (
  at: string,
  name: string,
  corner: Corner,
  shape: string | undefined,
  style: string
) => {
  if (corner === "rounded" && shape === undefined) {
    fail(at, `${name} is rounded with no cornerShape beside it`);
  }
  if (PILLS.has(style)) {
    pillsSeen.add(style);
    if (shape !== '"round"') {
      fail(at, `${name} is a pill by design: its cornerShape is "round"`);
    }
  } else if (corner === "rounded" && shape === '"round"') {
    fail(at, `${name} is rounded but its cornerShape is round`);
  }
  if (corner === "inherit" && shape !== '"inherit"') {
    fail(at, `${name} inherits its corner but not its cornerShape`);
  }
  if (corner === "pill" && shape === "radius.shape") {
    fail(at, `${name} is a pill or a circle, which a squircle deforms`);
  }
};

const checkScript = (file: string, text: string) => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const lineOf = (node: ts.Node) =>
    source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const shape = node.properties.find((p) => nameOf(p) === "cornerShape");
      const shapeText =
        shape !== undefined && ts.isPropertyAssignment(shape)
          ? shape.initializer.getText()
          : undefined;
      for (const property of node.properties) {
        const name = nameOf(property);
        if (
          name === undefined ||
          !RADIUS.test(name) ||
          !ts.isPropertyAssignment(property)
        ) {
          continue;
        }
        corners += 1;
        const style = ts.isPropertyAssignment(node.parent)
          ? `${file}#${nameOf(node.parent) ?? ""}`
          : "";
        checkRadius(
          `${file}:${lineOf(property)}`,
          name,
          cornerOf(property.initializer),
          shapeText,
          style
        );
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
};

const checkSheet = (file: string, text: string) => {
  // Each innermost rule's declarations: what sits between one brace and the next.
  let line = 1;
  for (const block of text.split(/[{}]/u)) {
    for (const match of block.matchAll(CSS_RADIUS)) {
      corners += 1;
      const { name = "", value = "" } = match.groups ?? {};
      const corner = kindOf(value.trim(), CSS_NONE, CSS_PILL);
      const shape = /corner-shape\s*:\s*(?<shape>[^;]+)/u
        .exec(block)
        ?.groups?.shape?.trim();
      const at = `${file}:${line + block.slice(0, match.index).split("\n").length - 1}`;
      if (corner === "rounded" && shape === undefined) {
        fail(at, `${name} is rounded with no corner-shape beside it`);
      }
      if (corner === "inherit" && shape !== "inherit") {
        fail(at, `${name} inherits its corner but not its corner-shape`);
      }
      if (corner === "pill" && shape === "var(--damsko-radius-shape)") {
        fail(at, `${name} is a pill or a circle, which a squircle deforms`);
      }
    }
    line += block.split("\n").length - 1;
  }
};

for (const folder of folders) {
  for (const path of walk(nodePath.join(root, folder))) {
    const file = nodePath.relative(root, path).split("\\").join("/");
    const text = readFileSync(path, "utf-8");
    if (file.endsWith(".css")) {
      checkSheet(file, text);
    } else {
      checkScript(file, text);
    }
  }
}

for (const pill of PILLS) {
  if (!pillsSeen.has(pill)) {
    fail(pill, "listed as a pill by design but sets no radius there");
  }
}

for (const failure of failures) {
  console.log(`FAIL  ${failure}`);
}
console.log(
  failures.length === 0
    ? `corners: ${corners} corners, each the squircle, a pill or a circle, or none`
    : `corners: ${failures.length} problem(s) in ${corners} corners`
);
process.exit(failures.length === 0 ? 0 : 1);
