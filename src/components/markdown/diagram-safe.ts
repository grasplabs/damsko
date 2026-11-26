// What a `mermaid` fence may be for Mermaid to draw it, and what its drawing may hold (diagram.tsx
// draws it). Mermaid draws into the page before its drawing can be read, so a fence that could make
// it load anything is never given to it: its source is weighed first, as written, and is code when
// it holds any way to an address. Then its drawing is read as SVG and held to SVG's own shapes.

/**
 * Words in a fence that could lead its drawing elsewhere: a picture node (`img`), a style's
 * `url(…)` or `image-set(…)`, an address (`//`), `@import`, and a backslash, with which CSS writes
 * any of them another way. A diagram with a web address in a label is code too: the price of
 * weighing the words, not each diagram type's reading of them.
 */
const LEADS = /url\(|image-set\(|img|\/\/|\\|@import/iu;

/**
 * The most a fence may hold and be drawn, for every diagram type: characters, lines (a `;` ends one
 * too), and parts, the words outside its labels (a block diagram names a hundred blocks on one
 * line). At these, the slowest type (a class diagram) holds a slow machine's page for about 400
 * ms; past them, for seconds (a mindmap of 20,000 characters, 35 s). The measurements are in the
 * pull request that set them.
 */
export const MOST_CHARACTERS = 1500;
export const MOST_LINES = 40;
export const MOST_PARTS = 100;
// A label: quoted, in brackets, between bars, or after a colon to the line's end.
const LABELS =
  /"[^"\n]*"|\[[^\]\n]*\]|\([^)\n]*\)|\{[^}\n]*\}|\|[^|\n]*\||:[^\n;]*/gu;
const partsOf = (code: string) =>
  code.replaceAll(LABELS, " ").match(/[\p{L}\p{N}_]+/gu)?.length ?? 0;

/** Whether Mermaid may draw this fence: small enough, and with no way to an address in it. */
export const drawable = (code: string) =>
  code.length <= MOST_CHARACTERS &&
  code.split(/[\n;]/u).length <= MOST_LINES &&
  partsOf(code) <= MOST_PARTS &&
  !LEADS.test(code);

// What a drawing may hold: SVG's own shapes, text and styles, nothing that leads or loads.
const TAGS = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "defs",
  "marker",
  "style",
  "title",
  "desc",
  "clipPath",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "mask",
  "symbol",
  "use",
]);
// A style's way to anywhere but the drawing itself, or a backslash that could write one.
const ELSEWHERE = /url\(\s*['"]?(?!#)|image-set\(|\\|@import/iu;

/**
 * Mermaid's drawing, read as SVG (never as HTML), held to TAGS: a link is its words, and no
 * handler, address or `url()` to anywhere but the drawing itself stays. Null when it is no SVG.
 */
export const safeSvg = (svg: string) => {
  // Mermaid writes a link's `xlink:href` without declaring its namespace, which SVG's own reading
  // refuses: declared here, so the link can be read, and taken out.
  const declared = svg.includes("xmlns:xlink=")
    ? svg
    : svg.replace(
        /^<svg\b/u,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
  const read = new DOMParser().parseFromString(declared, "image/svg+xml");
  const root = read.documentElement;
  if (root.localName !== "svg" || read.querySelector("parsererror") !== null) {
    return null;
  }
  for (const link of [...root.querySelectorAll("a")].toReversed()) {
    link.replaceWith(...link.childNodes);
  }
  for (const element of root.querySelectorAll("*")) {
    const elsewhere =
      element.localName === "style" &&
      ELSEWHERE.test(element.textContent ?? "");
    if (!TAGS.has(element.localName) || elsewhere) {
      element.remove();
    }
  }
  for (const element of [root, ...root.querySelectorAll("*")]) {
    // Their names, a list of its own: one taken out of the live list as it is read skips the next.
    for (const name of element.getAttributeNames()) {
      const value = element.getAttribute(name) ?? "";
      const leads = /href$/iu.test(name) && !value.startsWith("#");
      if (/^on/iu.test(name) || leads || ELSEWHERE.test(value)) {
        element.removeAttribute(name);
      }
    }
  }
  return new XMLSerializer().serializeToString(root);
};
