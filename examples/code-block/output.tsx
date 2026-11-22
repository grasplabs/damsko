import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const output = Array.from(
  { length: 5000 },
  (_, index) => `fetched page ${index + 1} of 5000`
).join("\n");

// A tool's very long output: folded, only the lines that show are drawn; opened, the first 2,000
// are, and a line under them says how many more there are. Copy takes all of it.
export default function CodeBlockOutput() {
  return (
    <CodeBlock language="text">
      <CodeBlockHeader>
        <CodeBlockTitle>fetch.log</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={output} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{output}</CodeBlockContent>
    </CodeBlock>
  );
}
