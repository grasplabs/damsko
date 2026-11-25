// What a person sees of a drawn Markdown answer, whatever draws it and however it is styled: its
// blocks one to a line, by role (heading and its level, paragraph, list and item, task and its
// state, table and its cells' alignment, code and its language, quote, rule, section, notes), and
// in each its words with their marks (`**strong**`, `*emphasis*`, `~~struck~~`, `` `code` ``,
// `[words](address)`, `![alt](address)`, `^1` for a note's mark, `↩` for a note's way back, `⏎` for
// a line break, `⟦tex⟧` for a formula in a sentence, `math tex` for one on lines of its own). A
// code block's and a table's controls are named after it (`[download copy]`, with `off` while they
// wait); other controls, icons and words hidden from sight are left out. Read from the HTML of
// Streamdown (scripts/markdown-parity.ts) and of Markdown (scripts/markdown-parity.test.tsx).
import { Window } from "happy-dom";
import type { Element, Node } from "happy-dom";

/** The side a table's cell sets its words to, as `c` or `r`; empty for the start. */
export type AlignOf = (cell: Element) => string;

const window = new Window();
const SKIPPED =
  "button, svg, template, script, style, link, input, output, [role='tooltip'], [aria-hidden='true'], .sr-only, [data-streamdown='image-overlay']";
const BLOCKS =
  /^(?:P|H[1-6]|UL|OL|LI|TABLE|PRE|BLOCKQUOTE|HR|DETAILS|SECTION|DIV)$/u;
const words = (text: string) => text.replaceAll(/\s+/gu, " ");
const attribute = (element: Element, name: string) =>
  element.attributes.getNamedItem(name)?.value ?? "";
const isElement = (node: Node | null | undefined): node is Element =>
  node instanceof window.Element;

/** A block's controls by what they do, from their names: `[download copy]`, `off` while out of use. */
const controlsOf = (block: Element) => {
  const buttons = [...block.querySelectorAll("button")].flatMap((button) => {
    const name = /^(?<does>copy|download)/iu.exec(
      attribute(button, "aria-label") || attribute(button, "title")
    )?.groups?.does;
    return name === undefined
      ? []
      : [{ name, off: button.hasAttribute("disabled") }];
  });
  const names = buttons.map(({ name }) => name.toLowerCase()).join(" ");
  const off = buttons.some((button) => button.off) ? " off" : "";
  return names === "" ? "" : ` [${names}]${off}`;
};

/** A code block's language, words and controls, from Streamdown's or Markdown's own. */
const codeOf = (block: Element) => {
  const code = block.querySelector("code");
  const lang =
    attribute(block, "data-language") ||
    (code === null ? "" : attribute(code, "data-language")) ||
    (/language-(?<lang>\S+)/u.exec(code?.className ?? "")?.groups?.lang ?? "");
  const lines = [
    ...block.querySelectorAll("[data-slot='code-block-line'], code > span"),
  ];
  const text =
    lines.length > 0
      ? lines.map((line) => line.textContent).join("\n")
      : (code?.textContent ?? "");
  return `${`code ${lang === "text" ? "" : lang}`.trim()} ${words(text).trim()}${controlsOf(block)}`;
};

/** A task's state from its box: Streamdown's checkbox, or Markdown's box and its said words. */
const taskOf = (item: Element) => {
  const box = item.querySelector(":scope > input[type='checkbox']");
  if (box !== null) {
    return box.hasAttribute("checked") ? "[x]" : "[ ]";
  }
  const [mark, said] = item.children;
  const ours =
    mark?.matches("[aria-hidden='true']") === true &&
    /^(?:Not done|Done)$/u.test(said?.textContent ?? "");
  if (!ours) {
    return "";
  }
  mark.remove();
  said?.remove();
  return said?.textContent === "Done" ? "[x]" : "[ ]";
};

// A formula: KaTeX's (its TeX in its annotation, or as its error's words) or Markdown's (its TeX).
const FORMULA = ".katex, .katex-error, [data-slot='markdown-math']";
const DISPLAYED =
  ".katex-display, [data-slot='markdown-math'][data-display], div > .katex-error";
const texOf = (node: Element) =>
  words(
    node.querySelector("annotation")?.textContent ??
      (attribute(node, "data-tex") || node.textContent)
  ).trim();

const MARKS: Record<string, string> = {
  STRONG: "**",
  B: "**",
  EM: "*",
  I: "*",
  DEL: "~~",
  S: "~~",
};
const linkOf = (element: Element, text: string) => {
  const shown = text.replace(/ \(opens in a new tab\)$/u, "").trim();
  return /^↩\^?\d*$/u.test(shown) || shown.startsWith("Back to reference")
    ? "↩"
    : `[${shown}](${attribute(element, "href")})`;
};
const inline = (node: Node): string => {
  if (!isElement(node)) {
    return node.nodeType === 3 ? words(node.textContent) : "";
  }
  if (node.matches(SKIPPED)) {
    return "";
  }
  if (node.matches(FORMULA)) {
    return `⟦${texOf(node)}⟧`;
  }
  const kids = () => [...node.childNodes].map(inline).join("");
  const mark = node.matches("[data-streamdown='strong']")
    ? "**"
    : MARKS[node.tagName];
  if (mark !== undefined) {
    return `${mark}${kids()}${mark}`;
  }
  const own: Record<string, () => string> = {
    CODE: () => `\`${words(node.textContent)}\``,
    BR: () => "⏎",
    IMG: () => `![${attribute(node, "alt")}](${attribute(node, "src")})`,
    SUP: () =>
      node.querySelector("a") !== null || /^\d+$/u.test(node.textContent.trim())
        ? `^${node.textContent.trim()}`
        : kids(),
    A: () => linkOf(node, kids()),
  };
  return (own[node.tagName] ?? kids)();
};

type Out = string[];
const isBlock = (node: Element, parent: Element) =>
  !node.matches(SKIPPED) &&
  (BLOCKS.test(node.tagName) ||
    node.matches(DISPLAYED) ||
    // A paragraph Markdown draws as a span among an item's blocks.
    (node.tagName === "SPAN" &&
      parent.tagName === "DIV" &&
      [...parent.childNodes].every(isElement)));

/** `element`'s children: runs of words as paragraphs, and each block in its own role. */
const children = (
  element: Element,
  depth: number,
  out: Out,
  alignOf: AlignOf
) => {
  let run = "";
  const flush = () => {
    if (run.trim() !== "") {
      out.push(`${"  ".repeat(depth)}p ${run.trim()}`);
    }
    run = "";
  };
  for (const kid of element.childNodes) {
    if (isElement(kid) && isBlock(kid, element)) {
      flush();
      if (kid.tagName === "SPAN" && !kid.matches(DISPLAYED)) {
        run = inline(kid);
        flush();
      } else {
        // oxlint-disable-next-line no-use-before-define -- a block holds blocks
        blockOf(kid, depth, out, alignOf);
      }
    } else {
      run += inline(kid);
    }
  }
  flush();
};

const listOf = (
  element: Element,
  depth: number,
  out: Out,
  alignOf: AlignOf
) => {
  const notes = element.querySelector(":scope > li[id*='fn-']") !== null;
  const start = attribute(element, "start");
  const ordered = start !== "" && start !== "1" ? `ol ${start}` : "ol";
  const name = element.tagName === "OL" ? ordered : "ul";
  out.push(`${"  ".repeat(depth)}${notes ? "notes" : name}`);
  for (const item of element.querySelectorAll(":scope > li")) {
    const task = taskOf(item);
    out.push(`${"  ".repeat(depth + 1)}li${task === "" ? "" : ` ${task}`}`);
    children(item, depth + 2, out, alignOf);
  }
};
const tableOf = (
  element: Element,
  depth: number,
  out: Out,
  alignOf: AlignOf
) => {
  // Its controls stand beside it: in Streamdown's wrapper, in the block Markdown draws it in.
  const holder = element.closest(
    "[data-streamdown='table-wrapper'], [data-slot='markdown'] > div"
  );
  out.push(
    `${"  ".repeat(depth)}table${holder === null ? "" : controlsOf(holder)}`
  );
  for (const row of element.querySelectorAll("tr")) {
    const cells = [...row.querySelectorAll(":scope > th, :scope > td")].map(
      (cell) => {
        const side = alignOf(cell);
        return `${side === "" ? "" : `${side}:`}${inline(cell).trim()}`;
      }
    );
    out.push(`${"  ".repeat(depth + 1)}| ${cells.join(" | ")} |`);
  }
};
const sectionOf = (
  element: Element,
  depth: number,
  out: Out,
  alignOf: AlignOf
) => {
  const summary = [...element.children].find(
    (kid) =>
      kid.tagName === "SUMMARY" ||
      (kid.tagName === "DIV" && kid.hasAttribute("id"))
  );
  const said = summary === undefined ? "" : inline(summary).trim();
  out.push(`${"  ".repeat(depth)}details ${said}`);
  for (const kid of element.children) {
    if (kid !== summary && !kid.matches(SKIPPED)) {
      // oxlint-disable-next-line no-use-before-define -- a block holds blocks
      blockOf(kid, depth + 1, out, alignOf);
    }
  }
};

/** One block in its role. */
const blockOf = (
  element: Element,
  depth: number,
  out: Out,
  alignOf: AlignOf
) => {
  const indent = "  ".repeat(depth);
  const tag = element.tagName;
  if (element.matches(DISPLAYED)) {
    out.push(`${indent}math ${texOf(element)}`);
  } else if (
    element.matches(
      "[data-streamdown='code-block'], [data-slot='code-block'], pre"
    )
  ) {
    out.push(`${indent}${codeOf(element)}`);
  } else if (/^H[1-6]$/u.test(tag) || tag === "P") {
    const text = inline(element).trim();
    const role = tag === "P" ? "p" : `#${tag.slice(1)}`;
    out.push(
      ...(text === "" && tag === "P" ? [] : [`${indent}${role} ${text}`])
    );
  } else if (element.matches("hr, [role='separator']")) {
    out.push(`${indent}hr`);
  } else if (tag === "UL" || tag === "OL") {
    listOf(element, depth, out, alignOf);
  } else if (tag === "TABLE") {
    tableOf(element, depth, out, alignOf);
  } else if (tag === "BLOCKQUOTE") {
    out.push(`${indent}quote`);
    children(element, depth + 1, out, alignOf);
  } else if (element.matches("details, [data-slot='markdown-section']")) {
    sectionOf(element, depth, out, alignOf);
  } else {
    children(element, depth, out, alignOf);
  }
};

/** The roles of the answer drawn as `html`, one block to a line. */
export const rolesOf = (html: string, alignOf: AlignOf) => {
  window.document.body.innerHTML = html;
  const out: Out = [];
  children(window.document.body, 0, out, alignOf);
  return out.join("\n").replaceAll(/ ?⏎ ?/gu, "⏎");
};
