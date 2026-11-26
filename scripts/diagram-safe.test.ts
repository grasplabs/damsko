// What a `mermaid` fence may be for Pele to draw it, and what its drawing keeps
// (src/components/markdown/diagram-safe.ts): a fence with any way to an address in it, or too big,
// is code; a drawing loses every handler, link and outside address, each of them, not every other.
//
//   pnpm exec vp test scripts/diagram-safe.test.ts
import { Window } from "happy-dom";
import { describe, expect, test } from "vitest";

import {
  MOST_CHARACTERS,
  MOST_LINES,
  MOST_PARTS,
  drawable,
  refusalOf,
  safeSvg,
} from "../src/components/markdown/diagram-safe.ts";

const window = new Window();
Reflect.set(globalThis, "DOMParser", window.DOMParser);
Reflect.set(globalThis, "XMLSerializer", window.XMLSerializer);
Reflect.set(globalThis, "CSSStyleSheet", window.CSSStyleSheet);
Reflect.set(globalThis, "CSSStyleRule", window.CSSStyleRule);
Reflect.set(globalThis, "CSSKeyframesRule", window.CSSKeyframesRule);

const ID = "diagram-1";
const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" id="${ID}" viewBox="0 0 10 10">${inner}</svg>`;

describe(drawable, () => {
  test.each([
    'flowchart LR\n  A@{ img: "https://example.com/a.png" }',
    'flowchart LR\n  A@{ "img": "https://example.com/a.png" }',
    'flowchart LR\n  A@{ label: "}", img: "https://example.com/a.png" }',
    'flowchart LR\n  A@{ "IMG": "x" }',
    'stateDiagram-v2\n  classDef c mask-image:image-set("//evil.test/x.png" 1x)\n  s1:::c',
    "classDiagram\n  class A\n  style A fill:url(//evil.test/x.png)",
    "block-beta\n  a\n  classDef c mask:url(//evil.test/x.png)",
    "flowchart LR\n  A --> B\n  style A fill:URL(x)",
    "flowchart LR\n  A[\\75rl] --> B",
    '%%{init: {"themeCSS": "@import x"}}%%\nflowchart LR\n  A --> B',
    'flowchart LR\n  A --> B\n  click A "https://example.com/node"',
    "flowchart LR\n  A[see https://example.com] --> B",
    // Written with character references, which Mermaid's syntax reads.
    "flowchart LR\n  A --> B\n  style A fill:url&lpar;x.png)",
    "flowchart LR\n  A[&sol;&sol;example.com] --> B",
    "flowchart LR\n  A --> B\n  style A fill:url#40;x.png)",
    "flowchart LR\n  A --> B\n  style A fill:&bsol;75rl(x)",
    // An actor's icon, from any address, and details read from the page by an id.
    'sequenceDiagram\n  participant A\n  properties A: {"class": "x", "icon": "icon.png"}\n  A->>A: hi',
    "sequenceDiagram\n  participant A\n  details A: secret-box\n  A->>A: hi",
    'sequenceDiagram\n  participant A\n  PROPERTIES  A : {"icon": "a.png"}\n  A->>A: hi',
  ])("is code: %s", (code) => {
    expect(drawable(code)).toBeFalsy();
  });

  test("an ordinary diagram is drawn, labels and all", () => {
    expect(
      drawable("flowchart LR\n  A[Start] --> B{Done?}\n  B -->|yes| C")
    ).toBeTruthy();
    // Forty steps of three-word labels: its parts are the steps' names, not their words.
    const steps = Array.from(
      { length: MOST_LINES - 1 },
      (_, at) => `  s${at} --> s${at + 1} : step number ${at}`
    );
    expect(drawable(["stateDiagram-v2", ...steps].join("\n"))).toBeTruthy();
  });

  test("says why it is code: past a bound, or a way to an address in it", () => {
    expect(refusalOf("flowchart LR\n  A --> B")).toBeNull();
    expect(refusalOf(`flowchart LR${"\n  A --> B".repeat(MOST_LINES)}`)).toBe(
      "limit"
    );
    expect(refusalOf("flowchart LR\n  A[see https://example.com] --> B")).toBe(
      "source"
    );
  });

  test("past its characters, its lines or its parts it is code", () => {
    expect(
      drawable(`flowchart LR\n  A[${"a".repeat(MOST_CHARACTERS)}]`)
    ).toBeFalsy();
    expect(
      drawable(`flowchart LR${"\n  A --> B".repeat(MOST_LINES)}`)
    ).toBeFalsy();
    // A `;` ends a line as a newline does.
    expect(
      drawable(`flowchart LR\n${"A-->B;".repeat(MOST_LINES)}`)
    ).toBeFalsy();
    // A hundred blocks on one line.
    const blocks = Array.from({ length: MOST_PARTS }, (_, at) => `b${at}`);
    expect(drawable(`block-beta\n  ${blocks.join(" ")}`)).toBeFalsy();
  });

  test("a line ended by both a `;` and a newline, and a blank line, count once and not at all", () => {
    const steps = Array.from(
      { length: MOST_LINES - 1 },
      (_, at) => `  s${at}-->s${at + 1};\n`
    );
    expect(drawable(`flowchart LR\n${steps.join("\n")}`)).toBeTruthy();
  });

  test("words that only look like a statement are drawn", () => {
    expect(
      drawable("sequenceDiagram\n  A->>B: the details of the properties")
    ).toBeTruthy();
  });
});

describe(safeSvg, () => {
  test("every handler goes, not every other one", () => {
    const out =
      safeSvg(
        svg('<rect onclick="a()" onmouseover="b()" onfocus="c()" width="1"/>'),
        ID
      ) ?? "";
    expect(out).not.toMatch(/\bon\w+=/u);
    expect(out).toContain('width="1"');
  });

  test.each([
    'fill="url(https://evil.test/x.png)"',
    'style="mask-image:image-set(&quot;x.png&quot; 1x)"',
    'style="fill:\\75rl(x)"',
    'href="https://evil.test/"',
    'data-icon="https://evil.test/icon.svg"',
    'data-id="A"',
  ])(
    "an attribute that leads elsewhere, or is the renderer's own note, goes: %s",
    (attribute) => {
      const out = safeSvg(svg(`<rect ${attribute} width="1"/>`), ID) ?? "";
      expect(out).not.toContain(
        `${attribute.slice(0, attribute.indexOf("="))}=`
      );
      expect(out).toContain('width="1"');
    }
  );

  test("a style's `url()` to the drawing itself stays, quoted as a browser writes it", () => {
    const out =
      safeSvg(
        svg(
          `<style>#${ID} .node rect{stroke:url("#${ID}-gradient")} #${ID} .a{fill:url('#g')}</style><rect/>`
        ),
        ID
      ) ?? "";
    expect(out).toContain(`url("#${ID}-gradient")`);
    expect(
      safeSvg(
        svg(
          `<style>#${ID} .a{fill:url("https://evil.test/x.png")}</style><rect/>`
        ),
        ID
      )
    ).not.toContain("<style");
  });

  test("a fill in the drawing itself stays", () => {
    expect(safeSvg(svg('<rect fill="url(#g)"/>'), ID)).toContain(
      'fill="url(#g)"'
    );
  });

  test.each([
    ".a { fill: url(https://evil.test/x.png) }",
    '.a { mask-image: image-set("x.png" 1x) }',
    ".a { fill: \\75rl(x) }",
    "@import 'x.css';",
  ])("a style that leads elsewhere goes: %s", (css) => {
    expect(safeSvg(svg(`<style>${css}</style><rect/>`), ID)).not.toContain(
      "<style"
    );
  });

  test("a link is its words, and no foreign element stays", () => {
    const out =
      safeSvg(
        svg(
          '<a href="https://evil.test/"><text>out</text></a><foreignObject><div>x</div></foreignObject>'
        ),
        ID
      ) ?? "";
    expect(out).toContain("<text>out</text>");
    expect(out).not.toMatch(/<a\b|foreignObject|evil/u);
  });

  test("an element in no SVG namespace goes, and the root must be SVG's", () => {
    const out =
      safeSvg(
        svg(
          '<g><rect width="1"/></g><g xmlns="http://www.w3.org/1999/xhtml"><rect width="2"/></g>'
        ),
        ID
      ) ?? "";
    expect(out).toContain('width="1"');
    expect(out).not.toContain('width="2"');
    expect(safeSvg('<svg viewBox="0 0 1 1"><rect/></svg>', ID)).toBeNull();
  });

  test("a style keeps only its rules for the drawing and its keyframes", () => {
    const out =
      safeSvg(
        svg(
          `<style>#${ID} .node{fill:red}body{display:none}#${ID} a, p{color:red}@keyframes dash{to{opacity:0}}</style><rect/>`
        ),
        ID
      ) ?? "";
    expect(out).toContain(`#${ID} .node`);
    expect(out).toContain("@keyframes dash");
    expect(out).not.toMatch(/body|\bp\b/u);
  });
});
