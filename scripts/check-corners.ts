// Every corner is the system's squircle: a rounded radius has `cornerShape: radius.shape`
// (`corner-shape: var(--damsko-radius-shape)` in CSS) beside it, in the same style object or rule,
// so no corner falls back to a plain round one. The exceptions, and only these:
//   - no corner: `0`, `null`;
//   - a corner taken from the parent, `"inherit"`, which takes the parent's shape with it
//     (`cornerShape: "inherit"`), so an inner corner follows the outer one exactly;
//   - a pill or a circle: `radius.full` or `radius.circle` (`--damsko-radius-full`, `-circle`):
//     round by its radius alone, which a squircle would deform. It takes no shape, or `"round"`;
//   - round by design, named in ROUND below with why: `cornerShape: "round"`.
// A shape is one of those three values, never another or one per condition, and never stands
// without a radius beside it (one on a style a radius joins says nothing a pair does not). A
// radius written per condition counts as rounded when any of its values is; there `"inherit"`
// counts as no corner (a part in a group takes the group's corner and keeps its own shape).
// Per-corner shapes (`cornerTopLeftShape`) count as shapes. Reads files only.
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

// Round by design, as `<file>#<style>`, each with why.
const ROUND = new Set([
  // A badge is a pill, its radius half its height so that more lines round its corners, not its
  // ends: radius.full would not.
  "src/components/badge.tsx#default",
  "src/components/badge.tsx#sm",
  // The round corner the Corners page compares the squircle with.
  "examples/foundations/corners-squircle.tsx#round",
  "examples/foundations/corners-squircle.tsx#dashed",
  // A pill's and a circle's token drawn as a sample, round as the parts that use them are.
  "site/blocks/foundation.tsx#round",
]);
const roundSeen = new Set<string>();

type Shape = "squircle" | "inherit" | "round" | "other";
const SHAPES: Record<string, Shape> = {
  "radius.shape": "squircle",
  "var(--damsko-radius-shape)": "squircle",
  '"inherit"': "inherit",
  inherit: "inherit",
  '"round"': "round",
  round: "round",
};
const shapeOf = (text: string): Shape =>
  Object.hasOwn(SHAPES, text) ? (SHAPES[text] ?? "other") : "other";

const failures: string[] = [];
let corners = 0;

const fail = (at: string, problem: string) => {
  failures.push(`${at}: ${problem}`);
};

/** One style object or rule: its radii, the shapes beside them, and its name (`file#style`). */
const checkBox = (
  at: string,
  radii: readonly { name: string; corner: Corner }[],
  shapes: readonly Shape[],
  style: string
) => {
  corners += radii.length;
  const listed = ROUND.has(style);
  if (listed) {
    roundSeen.add(style);
  }
  if (shapes.includes("other")) {
    fail(at, "a corner shape other than radius.shape, inherit or round");
  }
  if (radii.length === 0 && shapes.length > 0 && !listed) {
    fail(at, "a corner shape with no radius beside it");
  }
  if (listed && !shapes.includes("round")) {
    fail(at, `${style} is round by design: its shape is round`);
  }
  for (const { name, corner } of radii) {
    if (corner === "rounded" && shapes.length === 0) {
      fail(at, `${name} is rounded with no corner shape beside it`);
    }
    if (corner === "rounded" && shapes.includes("round") && !listed) {
      fail(at, `${name} is rounded but its shape is round`);
    }
    if (corner === "inherit" && !shapes.includes("inherit")) {
      fail(at, `${name} inherits its corner but not its shape`);
    }
    if (corner === "pill" && shapes.some((shape) => shape !== "round")) {
      fail(at, `${name} is a pill or a circle: round, or no shape`);
    }
  }
};

const SHAPE =
  /^corner(?:(?:Top|Bottom)(?:Left|Right)|(?:Start|End){2})?Shape$/u;

const checkScript = (file: string, text: string) => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const radii: { name: string; corner: Corner }[] = [];
      const shapes: Shape[] = [];
      for (const property of node.properties) {
        const name = nameOf(property);
        if (name === undefined || !ts.isPropertyAssignment(property)) {
          continue;
        }
        if (RADIUS.test(name)) {
          radii.push({ name, corner: cornerOf(property.initializer) });
        } else if (SHAPE.test(name)) {
          shapes.push(shapeOf(property.initializer.getText()));
        }
      }
      if (radii.length > 0 || shapes.length > 0) {
        const { parent } = node;
        const owner =
          ts.isPropertyAssignment(parent) || ts.isVariableDeclaration(parent)
            ? parent.name.getText()
            : "";
        const { line } = source.getLineAndCharacterOfPosition(node.getStart());
        checkBox(`${file}:${line + 1}`, radii, shapes, `${file}#${owner}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
};

const CSS_SHAPE =
  /(?<![\w(-])corner(?:-(?:top|bottom)-(?:left|right)|-(?:start|end)-(?:start|end))?-shape\s*:\s*(?<value>[^;}]+)/gu;

const checkSheet = (file: string, text: string) => {
  // Comments blanked, their lines kept; then each innermost rule's declarations: what sits
  // between one brace and the next.
  const code = text.replaceAll(/\/\*[\s\S]*?\*\//gu, (comment) =>
    comment.replaceAll(/[^\n]/gu, " ")
  );
  let line = 1;
  for (const block of code.split(/[{}]/u)) {
    const radii = [...block.matchAll(CSS_RADIUS)].map((match) => ({
      name: match.groups?.name ?? "",
      corner: kindOf((match.groups?.value ?? "").trim(), CSS_NONE, CSS_PILL),
    }));
    const shapes = [...block.matchAll(CSS_SHAPE)].map((match) =>
      shapeOf((match.groups?.value ?? "").trim())
    );
    const lead = block.length - block.trimStart().length;
    const at = `${file}:${line + block.slice(0, lead).split("\n").length - 1}`;
    if (radii.length > 0 || shapes.length > 0) {
      checkBox(at, radii, shapes, "");
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

for (const style of ROUND) {
  if (!roundSeen.has(style)) {
    fail(style, "listed as round by design but not found");
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
