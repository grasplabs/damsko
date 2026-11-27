import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

import { types } from "./diagram-sources";

const answer = types
  .map(([name, code]) => `**${name}**\n\n\`\`\`mermaid\n${code}\n\`\`\``)
  .join("\n\n");

// An answer's column, as wide as a chat's.
const layout = stylex.create({ column: { width: "100%", maxWidth: 704 } });

// Every diagram type, in the design's tokens: what a fence of each kind looks like once drawn.
export default function MarkdownDiagramTypes() {
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown>{answer}</Markdown>
    </div>
  );
}
