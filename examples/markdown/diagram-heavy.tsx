import { Markdown } from "@grasp-os/ui/components/markdown";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/diagram-heavy; not on the page.
// Fences within the bounds on characters and lines that would hold the page: forty nodes joined
// by `&` to forty more (1,600 edges), a packet of a billion bits; and two whose front matter does
// not read. Each settles as its code.
const run = (name: string) =>
  Array.from({ length: 40 }, (_, at) => `${name}${at}`).join(" & ");
const fence = (code: string) => `\`\`\`mermaid\n${code}\n\`\`\``;
const answer = [
  fence(
    `flowchart LR\n  ${run("a")} --"${"lbl ".repeat(55).trim()}"--> ${run("b")}`
  ),
  fence('packet-beta\n0-999999999: "x"'),
  fence('---\ntitle: "Order flow\n---\nflowchart LR\n  A --> B'),
  fence("---\nconfig: [\n---\nflowchart LR\n  A --> B"),
].join("\n\n");

export default function MarkdownDiagramHeavy() {
  return <Markdown>{answer}</Markdown>;
}
