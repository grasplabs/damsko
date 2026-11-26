import { Markdown } from "@grasp-os/ui/components/markdown";

const answer = `The request goes through three services:

\`\`\`mermaid
flowchart LR
  Browser --> Gateway
  Gateway --> Orders
  Orders --> Database
\`\`\`

A diagram that does not read stays its code:

\`\`\`mermaid
flowchart LR
  A --> -->
\`\`\``;

// A `mermaid` fence: its diagram, with Download, Copy, full screen and zoom; one that does not read, code.
export default function MarkdownDiagram() {
  return <Markdown>{answer}</Markdown>;
}
