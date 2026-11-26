// What a `mermaid` fence may be for Mermaid to draw it, and what its drawing keeps
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
  safeSvg,
} from "../src/components/markdown/diagram-safe.ts";

const window = new Window();
Reflect.set(globalThis, "DOMParser", window.DOMParser);
Reflect.set(globalThis, "XMLSerializer", window.XMLSerializer);

const svg = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${inner}</svg>`;

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
});

describe(safeSvg, () => {
  test("every handler goes, not every other one", () => {
    const out =
      safeSvg(
        svg('<rect onclick="a()" onmouseover="b()" onfocus="c()" width="1"/>')
      ) ?? "";
    expect(out).not.toMatch(/\bon\w+=/u);
    expect(out).toContain('width="1"');
  });

  test.each([
    'fill="url(https://evil.test/x.png)"',
    'style="mask-image:image-set(&quot;x.png&quot; 1x)"',
    'style="fill:\\75rl(x)"',
    'href="https://evil.test/"',
  ])("an attribute that leads elsewhere goes: %s", (attribute) => {
    const out = safeSvg(svg(`<rect ${attribute} width="1"/>`)) ?? "";
    expect(out).not.toContain(`${attribute.slice(0, attribute.indexOf("="))}=`);
    expect(out).toContain('width="1"');
  });

  test("a fill in the drawing itself stays", () => {
    expect(safeSvg(svg('<rect fill="url(#g)"/>'))).toContain('fill="url(#g)"');
  });

  test.each([
    ".a { fill: url(https://evil.test/x.png) }",
    '.a { mask-image: image-set("x.png" 1x) }',
    ".a { fill: \\75rl(x) }",
    "@import 'x.css';",
  ])("a style that leads elsewhere goes: %s", (css) => {
    expect(safeSvg(svg(`<style>${css}</style><rect/>`))).not.toContain(
      "<style"
    );
  });

  test("a link is its words, and no foreign element stays", () => {
    const out =
      safeSvg(
        svg(
          '<a href="https://evil.test/"><text>out</text></a><foreignObject><div>x</div></foreignObject>'
        )
      ) ?? "";
    expect(out).toContain("<text>out</text>");
    expect(out).not.toMatch(/<a\b|foreignObject|evil/u);
  });
});
