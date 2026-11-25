import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/diagram-hostile; not on the
// page. Diagrams that try, through their own settings or their nodes, to put HTML in the drawing,
// load something from elsewhere, or lead out of a node.
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
].join("\n\n");

export default function MarkdownDiagramHostile() {
  return <Markdown>{answer}</Markdown>;
}
