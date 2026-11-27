"use client";

import { useEffect, useState } from "react";

// The drawing itself, for this spec alone: no product draws a diagram unchecked.
import { drawDiagram } from "../../src/components/markdown/diagram";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/diagram-unchecked; not on the
// page. Fences that would load something from elsewhere, a picture node's picture among them, given
// to Pele with the source check off: it draws a string with links and pictures off, and the drawing
// is held to SVG's own shapes, so none of them loads anything.
const at = "https://example.com";
export const fences = [
  `%%{init: {"themeCSS": ".node rect { fill: url(${at}/theme.png) }"}}%%\nflowchart LR\n  A --> B`,
  `%%{init: {"fontFamily": "x; background: url(${at}/font.png)"}}%%\nflowchart LR\n  A --> B`,
  `stateDiagram-v2\n  classDef c mask-image:image-set("${at}/state.png" 1x)\n  s1 --> s2\n  class s1 c`,
  `block-beta\n  a b\n  classDef c fill:url(${at}/block.png)\n  class a c`,
  `classDiagram\n  class A\n  classDef c mask:url(${at}/class.png)\n  class A:::c`,
  `sequenceDiagram\n  participant A\n  properties A: {"class": "x", "icon": "${at}/icon.png"}\n  A->>A: hi`,
  `sequenceDiagram\n  participant A\n  properties A: {"class": "x", "icon": "relative-icon.png"}\n  A->>A: hi`,
  `%%{init: {"htmlLabels": true, "flowchart": {"htmlLabels": true}}}%%\nflowchart LR\n  A["<img src='${at}/label.png'>"] --> B`,
  `flowchart LR\n  A@{ img: "${at}/shape.png", label: "shape" }\n  B@{ icon: "${at}/icon.svg" }`,
  `flowchart LR\n  A --> B\n  click A "${at}/node"`,
];

export default function MarkdownDiagramUnchecked() {
  const [drawn, setDrawn] = useState<number | null>(null);
  useEffect(() => {
    const draw = async () => {
      const made = await Promise.all(
        fences.map(
          async (code, place) =>
            await drawDiagram(code, `unchecked-${place}`, { check: false })
        )
      );
      setDrawn(made.filter((each) => "svg" in each).length);
    };
    void draw();
  }, []);
  // Busy while they are drawn, as a diagram is: a spec that measures the page waits for it.
  return (
    <p
      data-slot="markdown-diagram"
      aria-busy={drawn === null}
      data-drawn={drawn ?? undefined}
    >
      Drawn: {drawn ?? "…"}
    </p>
  );
}
