import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/diagram-hostile; not on the
// page. Diagrams that try to load something from elsewhere or lead out of a node, through their
// settings, their nodes or their styles, in several diagram types: each is code, never drawn. And
// one that tries to put HTML with a handler in a node: drawn, as words.
const fence = (code: string) => `\`\`\`mermaid\n${code}\n\`\`\``;
const answer = [
  fence(
    `%%{init: {"htmlLabels": true, "flowchart": {"htmlLabels": true}}}%%\nflowchart LR\n  A["<a href='https://example.com/out'>out</a><img src='https://example.com/pic.png'>"] --> B`
  ),
  fence(
    `%%{init: {"themeCSS": ".node rect { fill: url(https://example.com/css.png) }"}}%%\nflowchart LR\n  A --> B`
  ),
  fence(
    `%%{init: {"fontFamily": "x; background: url(https://example.com/font.png)"}}%%\nflowchart LR\n  A --> B`
  ),
  fence(`flowchart LR\n  A --> B\n  click A "https://example.com/node"`),
  fence(
    "sequenceDiagram\n  participant A\n  link A: Home @ https://example.com/home\n  A->>A: hello"
  ),
  fence(
    `flowchart LR\n  A@{ img: "https://example.com/shape.png", label: "shape" }`
  ),
  fence(`flowchart LR\n  A@{ "img": "https://example.com/quoted.png" }`),
  fence(
    `flowchart LR\n  A@{ label: "}", img: "https://example.com/brace.png" }`
  ),
  fence(`flowchart LR\n  A@{ "IMG": "//example.com/upper.png" }`),
  fence(
    `stateDiagram-v2\n  classDef c mask-image:image-set("//example.com/state.png" 1x)\n  s1 --> s2\n  class s1 c`
  ),
  fence(
    "block-beta\n  a b\n  classDef c fill:url(//example.com/block.png)\n  class a c"
  ),
  fence(
    "classDiagram\n  class A\n  classDef c mask:url(//example.com/class.png)\n  class A:::c"
  ),
  fence("flowchart LR\n  A --> B\n  style A fill:url(//example.com/style.png)"),
  fence(
    "flowchart LR\n  A --> B\n  style A fill:\\75 rl(example.com/escaped.png)"
  ),
  fence(
    `%%{init: {"htmlLabels": true, "flowchart": {"htmlLabels": true}}}%%\nflowchart LR\n  A["<b onmouseover=alert(1)>bold</b>"] --> B`
  ),
].join("\n\n");

export default function MarkdownDiagramHostile() {
  return <Markdown>{answer}</Markdown>;
}
