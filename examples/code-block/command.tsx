import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const command = "pnpm dlx shadcn add @damsko/code-block";

// A command to copy: no line numbers.
export default function CodeBlockCommand() {
  return (
    <CodeBlock language="bash">
      <CodeBlockHeader>
        <CodeBlockTitle />
        <CodeBlockActions>
          <CodeBlockCopyButton value={command} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent>{command}</CodeBlockContent>
    </CodeBlock>
  );
}
