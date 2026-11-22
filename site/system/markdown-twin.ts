// A page as plain Markdown, for agents: the `.md` twin of every page, llms-full.txt.
// Each of the site's blocks has a Markdown form (site/markdown.ts, markdownComponents): a
// stage becomes its example's source, a closed row a table with its tokens. This pass finds the
// blocks in a page's MDX and puts their Markdown form in their place; every other byte of the page
// stays as its author wrote it.
//
// How: the page is parsed as MDX (with satteri, the parser Astro's MDX uses, so this pass reads the
// same grammar the page renders with), each block's place in the text is known from the tree, and
// the blocks are replaced back to front. A block's attributes are read as data, never run:
// strings, numbers, booleans, null, arrays, objects and `frontmatter.<key>` (see readValue). A block
// whose attributes cannot be read that way, or whose form returns null, is left as it is.
//
// The output matches what the previous docs system wrote (its ai/component-markdown.ts did the same splice), so the
// twins and the registry read the same text as before.
import { parseExpressionAt } from "acorn";
import type { Expression } from "acorn";
import { mdxToMdast } from "satteri";

import { splitFrontmatter } from "./content.ts";

/** A value read from an attribute or the front matter: plain data only. */
export type Value =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Value[]
  | { [key: string]: Value };

/** What a block's Markdown form receives. */
export interface ComponentMarkdownContext {
  props: Record<string, Value>;
  /** True when some attribute could not be read as data. */
  lossy: boolean;
  /** The block's children, as Markdown (empty when it closes itself). */
  children: string;
  frontmatter: Record<string, Value>;
}

/** A block's Markdown form: its Markdown, or null to leave the block as written. */
export type ComponentMarkdown = (
  context: ComponentMarkdownContext
) => string | null;

// ---- Reading an attribute as data -----------------------------------------------------------------

const NOT_DATA = Symbol("not data");

const evaluate = (
  node: Expression,
  frontmatter: Record<string, Value>
): Value | typeof NOT_DATA => {
  switch (node.type) {
    case "Literal": {
      return node.value instanceof RegExp || typeof node.value === "bigint"
        ? NOT_DATA
        : node.value;
    }
    case "TemplateLiteral": {
      return node.expressions.length === 0
        ? node.quasis.map((part) => part.value.cooked ?? "").join("")
        : NOT_DATA;
    }
    case "ArrayExpression": {
      const items: Value[] = [];
      for (const element of node.elements) {
        if (!element || element.type === "SpreadElement") {
          return NOT_DATA;
        }
        const value = evaluate(element, frontmatter);
        if (value === NOT_DATA) {
          return NOT_DATA;
        }
        items.push(value);
      }
      return items;
    }
    case "ObjectExpression": {
      const object: Record<string, Value> = {};
      for (const property of node.properties) {
        if (
          property.type !== "Property" ||
          property.computed ||
          property.kind !== "init" ||
          property.method
        ) {
          return NOT_DATA;
        }
        const key =
          property.key.type === "Identifier"
            ? property.key.name
            : property.key.type === "Literal"
              ? String(property.key.value)
              : null;
        if (key === null || key === "__proto__") {
          return NOT_DATA;
        }
        const value = evaluate(property.value, frontmatter);
        if (value === NOT_DATA) {
          return NOT_DATA;
        }
        object[key] = value;
      }
      return object;
    }
    case "UnaryExpression": {
      const value = evaluate(node.argument, frontmatter);
      if (typeof value !== "number") {
        return NOT_DATA;
      }
      return node.operator === "-"
        ? -value
        : node.operator === "+"
          ? value
          : NOT_DATA;
    }
    case "MemberExpression": {
      // frontmatter.key, frontmatter["key"], and deeper: frontmatter.a.b
      const path: string[] = [];
      let current: Expression = node;
      while (current.type === "MemberExpression") {
        const { property } = current;
        if (!current.computed && property.type === "Identifier") {
          path.unshift(property.name);
        } else if (current.computed && property.type === "Literal") {
          path.unshift(String(property.value));
        } else {
          return NOT_DATA;
        }
        current = current.object as Expression;
      }
      if (current.type !== "Identifier" || current.name !== "frontmatter") {
        return NOT_DATA;
      }
      let value: Value = frontmatter;
      for (const key of path) {
        if (
          !value ||
          typeof value !== "object" ||
          value instanceof Date ||
          !Object.hasOwn(value, key)
        ) {
          return undefined;
        }
        value = (value as Record<string, Value>)[key];
      }
      return value;
    }
    default: {
      return NOT_DATA;
    }
  }
};

/** An attribute's expression (`{...}`) as data, or NOT_DATA when it is anything else. */
const readValue = (
  source: string,
  frontmatter: Record<string, Value>
): Value | typeof NOT_DATA => {
  try {
    const node = parseExpressionAt(source, 0, { ecmaVersion: "latest" });
    if (source.slice(node.end).trim() !== "") {
      return NOT_DATA;
    }
    return evaluate(node, frontmatter);
  } catch {
    return NOT_DATA;
  }
};

// ---- Finding the blocks ---------------------------------------------------------------------------

interface Node {
  type: string;
  name?: string | null;
  children?: Node[];
  attributes?: {
    type: string;
    name?: string;
    value?: string | { value: string } | null;
  }[];
  position?: { start: { offset: number }; end: { offset: number } };
}

interface Splice {
  start: number;
  end: number;
  text: string;
  /** A block on lines of its own: the text after it must start a block too. */
  block: boolean;
}

const positioned = (
  node: Node
): node is Node & {
  position: { start: { offset: number }; end: { offset: number } };
} =>
  typeof node.position?.start.offset === "number" &&
  typeof node.position?.end.offset === "number";

const readProps = (node: Node, frontmatter: Record<string, Value>) => {
  const props: Record<string, Value> = {};
  let lossy = false;
  for (const attribute of node.attributes ?? []) {
    if (attribute.type !== "mdxJsxAttribute" || !attribute.name) {
      lossy = true;
      continue;
    }
    if (attribute.value === null || attribute.value === undefined) {
      props[attribute.name] = true;
    } else if (typeof attribute.value === "string") {
      props[attribute.name] = attribute.value;
    } else {
      const value = readValue(attribute.value.value, frontmatter);
      if (value === NOT_DATA) {
        lossy = true;
      } else {
        props[attribute.name] = value;
      }
    }
  }
  return { props, lossy };
};

/** Replaces each range by its text, back to front, keeping an indented block indented. */
const applySplices = (text: string, splices: Splice[]) => {
  let result = text;
  for (const splice of splices.toSorted((a, b) => b.start - a.start)) {
    const lineStart = result.lastIndexOf("\n", splice.start - 1) + 1;
    const prefix = result.slice(lineStart, splice.start);
    const indent = /^[\t ]+$/u.test(prefix) ? prefix : "";
    // The block's closing tag ended a block; its Markdown does not. Text on the very next line
    // would join it (a table's last row, a list's last item), so a blank line keeps it apart.
    const spliced =
      splice.block &&
      splice.text !== "" &&
      /^[\t ]*\n[\t ]*\S/u.test(result.slice(splice.end))
        ? `${splice.text}\n`
        : splice.text;
    const replacement = indent
      ? spliced
          .split("\n")
          .map((line, index) =>
            index === 0 || line === "" ? line : `${indent}${line}`
          )
          .join("\n")
      : spliced;
    result =
      result.slice(0, splice.start) + replacement + result.slice(splice.end);
  }
  return result;
};

const collect = (
  nodes: Node[],
  source: string,
  components: Record<string, ComponentMarkdown>,
  frontmatter: Record<string, Value>,
  out: Splice[]
) => {
  for (const node of nodes) {
    const form =
      node.type === "mdxJsxFlowElement" && node.name
        ? components[node.name]
        : undefined;
    if (form && positioned(node)) {
      const children = (node.children ?? []).filter(positioned);
      const first = children[0];
      const last = children.at(-1);
      let inner = "";
      if (first && last) {
        // The blocks inside a block (<AllTokens> around <SampleRows>) get their forms first, as
        // the previous docs system's pass gave them, so the outer form receives Markdown, not JSX.
        const start = first.position.start.offset;
        const nested: Splice[] = [];
        collect(children, source, components, frontmatter, nested);
        const shifted = nested.map((splice) => ({
          ...splice,
          start: splice.start - start,
          end: splice.end - start,
        }));
        inner = applySplices(
          source.slice(start, last.position.end.offset),
          shifted
        ).trim();
      }
      const text = form({
        ...readProps(node, frontmatter),
        children: inner,
        frontmatter,
      });
      if (text !== null) {
        out.push({
          start: node.position.start.offset,
          end: node.position.end.offset,
          text,
          block: true,
        });
        continue;
      }
    }
    collect(node.children ?? [], source, components, frontmatter, out);
  }
};

/**
 * The page's MDX with each block that has a Markdown form replaced by it. A page with no such block,
 * or one that does not parse, comes back unchanged.
 */
export const downlevelComponents = (
  source: string,
  components: Record<string, ComponentMarkdown>,
  frontmatter: Record<string, Value> = {}
): string => {
  const names = Object.keys(components).map((name) =>
    name.replaceAll(/[$()*+.?[\\\]^{|}]/gu, "\\$&")
  );
  if (!new RegExp(`<(?:${names.join("|")})[\\s/>]`, "u").test(source)) {
    return source;
  }
  let tree: Node;
  try {
    tree = mdxToMdast(source, {
      features: {
        subscript: true,
        superscript: true,
        directive: true,
        math: { singleDollarTextMath: false },
      },
    }) as unknown as Node;
  } catch {
    return source;
  }
  const splices: Splice[] = [];
  collect(tree.children ?? [], source, components, frontmatter, splices);
  return splices.length ? applySplices(source, splices) : source;
};

/** A page's `.md` twin: its whole MDX file, front matter kept, with its blocks as Markdown. */
export const markdownTwin = (
  source: string,
  components: Record<string, ComponentMarkdown>
) =>
  downlevelComponents(
    source,
    components,
    splitFrontmatter(source).data as Record<string, Value>
  );

/** A page's body for llms-full.txt: the front matter left out, then downlevelled. */
export const markdownBody = (
  source: string,
  components: Record<string, ComponentMarkdown>
) => {
  const { data, body } = splitFrontmatter(source);
  return downlevelComponents(
    body,
    components,
    data as Record<string, Value>
  ).trim();
};
