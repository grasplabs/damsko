"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
} from "@grasp-os/ui/components/code-block";

const command = "pnpm add @damsko/ui";

// No header: the copy button stands over the code's corner, shown under a pointer or focus, and
// always on a touch screen.
export default function CodeBlockFloating() {
  return (
    <CodeBlock language="bash" aria-label="Install command">
      <CodeBlockActions>
        <CodeBlockCopyButton value={command} />
      </CodeBlockActions>
      <CodeBlockContent>{command}</CodeBlockContent>
    </CodeBlock>
  );
}
