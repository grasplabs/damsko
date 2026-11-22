import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const command = "pnpm add @damsko/ui";

// One code block in one state. The docs draw it once per state; hover and keyboard focus on the
// copy button are forced from its own CSS.
export default function CodeBlockState({
  streaming = false,
}: {
  streaming?: boolean;
}) {
  return (
    <CodeBlock language="bash" streaming={streaming}>
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
