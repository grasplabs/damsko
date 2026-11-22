// The styles StyleX's compiler drops from a file. @stylexjs/babel-plugin 0.19.2, the version the product
// builds with (`stylex()` from @stylexjs/unplugin with its defaults, in the product's Vite config), inlines each `stylex.props(styles.a, …)` it can read and deletes every namespace it did not
// see used. It does not look inside an argument that is itself an index into a literal:
// `stylex.props([styles.three, styles.four][n])` or `stylex.props({ a: styles.a }[key])`. Those
// namespaces are deleted, their CSS still ships, and the element gets no class, in dev and in a build.
//
// This fails that form wherever stylex.props or stylex.attrs is given it, and compiles the file as the
// product does and reads what came out: every `styles.x` the compiled code
// still reads must still be in the compiled `styles`, and a `styles[key]` read needs every namespace kept.
// scripts/check-react-compiler.ts runs it on every file it judges. Not run on its own.
import { transformSync } from "@babel/core";
import type { TransformOptions } from "@babel/core";
import stylexBabel from "@stylexjs/babel-plugin";

interface Node {
  type: string;
  [key: string]: unknown;
}
export interface Pruned {
  line: number;
  message: string;
}

const isNode = (value: unknown): value is Node =>
  typeof value === "object" &&
  value !== null &&
  "type" in value &&
  typeof value.type === "string";

/** A node's child at `key`, when it is one. */
const child = (node: Node, key: string): Node | undefined => {
  const value = node[key];
  return isNode(value) ? value : undefined;
};

/** A node's children at `key`, when it holds a list. */
const children = (node: Node, key: string): Node[] => {
  const value = node[key];
  return Array.isArray(value) ? value.filter(isNode) : [];
};

/** The line a node starts on, or 0. */
const lineOf = (node: Node): number => {
  const { loc } = node;
  if (typeof loc !== "object" || loc === null || !("start" in loc)) {
    return 0;
  }
  const { start } = loc;
  return typeof start === "object" &&
    start !== null &&
    "line" in start &&
    typeof start.line === "number"
    ? start.line
    : 0;
};

const walk = (node: Node, visit: (node: Node) => void) => {
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "extra") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (isNode(item)) {
          walk(item, visit);
        }
      }
    } else if (isNode(value)) {
      walk(value, visit);
    }
  }
};

const keyName = (
  node: Node | undefined,
  computed: unknown
): string | undefined => {
  if (node === undefined) {
    return undefined;
  }
  if (
    computed !== true &&
    node.type === "Identifier" &&
    typeof node.name === "string"
  ) {
    return node.name;
  }
  if (
    (node.type === "StringLiteral" || node.type === "NumericLiteral") &&
    (typeof node.value === "string" || typeof node.value === "number")
  ) {
    return String(node.value);
  }
  return undefined;
};

/** An identifier's name, or undefined for any other node. */
const identifier = (node: Node | undefined): string | undefined =>
  node?.type === "Identifier" && typeof node.name === "string"
    ? node.name
    : undefined;

const isCreate = (node: Node) => {
  const callee = child(node, "callee");
  if (node.type !== "CallExpression" || callee === undefined) {
    return false;
  }
  if (callee.type === "Identifier") {
    return callee.name === "create";
  }
  return (
    callee.type === "MemberExpression" &&
    keyName(child(callee, "property"), callee.computed) === "create"
  );
};

/** Each `const name = <object>` in the file, with its keys: in the source the objects given to
 * `stylex.create`, in the compiled code the objects it left in their place. */
const objectsIn = (ast: Node, inCreate: boolean) => {
  const found = new Map<string, Set<string>>();
  walk(ast, (node) => {
    const name = identifier(child(node, "id"));
    const init = child(node, "init");
    if (
      node.type !== "VariableDeclarator" ||
      name === undefined ||
      init === undefined
    ) {
      return;
    }
    const madeBy = isCreate(init) ? children(init, "arguments")[0] : undefined;
    const object = inCreate ? madeBy : init;
    if (object?.type !== "ObjectExpression") {
      return;
    }
    const keys = children(object, "properties").flatMap(
      (property) => keyName(child(property, "key"), property.computed) ?? []
    );
    found.set(name, new Set(keys));
  });
  return found;
};

/** The picks StyleX's compiler drops from `code` (a .ts or .tsx file). Empty when it makes no styles. */
export const prunedPicks = (
  code: string,
  filename: string,
  rootDir: string
): Pruned[] => {
  if (!code.includes("stylex")) {
    return [];
  }
  const options: TransformOptions = {
    babelrc: false,
    configFile: false,
    ast: true,
    code: false,
    retainLines: true,
    filename,
    parserOpts: { plugins: ["typescript", "jsx"] },
  };
  const source = transformSync(code, options)?.ast;
  if (!isNode(source)) {
    return [];
  }
  const made = objectsIn(source, true);
  if (made.size === 0) {
    return [];
  }
  const pruned: Pruned[] = [];
  // The form itself, even where another use keeps the namespaces today: an index into a literal of styles.
  walk(source, (node) => {
    const callee = child(node, "callee");
    if (node.type !== "CallExpression" || callee?.type !== "MemberExpression") {
      return;
    }
    const method = keyName(child(callee, "property"), callee.computed) ?? "";
    if (!["props", "attrs"].includes(method)) {
      return;
    }
    for (const argument of children(node, "arguments")) {
      const object = child(argument, "object");
      if (
        argument.type !== "MemberExpression" ||
        argument.computed !== true ||
        (object?.type !== "ArrayExpression" &&
          object?.type !== "ObjectExpression")
      ) {
        continue;
      }
      pruned.push({
        line: lineOf(argument),
        message: `stylex.${method} picks a style by an index into a ${object.type === "ArrayExpression" ? "list" : "lookup object"}, which StyleX's compiler does not read: write each as \`condition && styles.x\``,
      });
    }
  });
  const compiled = transformSync(code, {
    ...options,
    plugins: [
      stylexBabel.withOptions({
        dev: false,
        treeshakeCompensation: true,
        unstable_moduleResolution: { type: "commonJS", rootDir },
      }),
    ],
  })?.ast;
  if (!isNode(compiled)) {
    return pruned;
  }
  const kept = objectsIn(compiled, false);
  walk(compiled, (node) => {
    const name = identifier(child(node, "object"));
    if (node.type !== "MemberExpression" || name === undefined) {
      return;
    }
    const namespaces = made.get(name);
    if (namespaces === undefined) {
      return;
    }
    const left = kept.get(name) ?? new Set<string>();
    const line = lineOf(node);
    const key = keyName(child(node, "property"), node.computed);
    if (key !== undefined) {
      if (namespaces.has(key) && !left.has(key)) {
        pruned.push({
          line,
          message: `${name}.${key} is read, but StyleX's compiler dropped it: pass it to stylex.props as \`${name}.${key}\` itself, not through an index into a list or object`,
        });
      }
      return;
    }
    const lost = [...namespaces].filter((namespace) => !left.has(namespace));
    if (lost.length > 0) {
      pruned.push({
        line,
        message: `${name}[…] can reach ${lost.map((namespace) => `${name}.${namespace}`).join(", ")}, which StyleX's compiler dropped`,
      });
    }
  });
  return pruned;
};
