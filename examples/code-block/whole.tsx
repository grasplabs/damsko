import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const request = JSON.stringify(
  {
    rows: Array.from({ length: 600 }, (_, index) => ({
      id: index + 1,
      status: "paid",
      total: (index + 1) * 10,
    })),
  },
  null,
  2
);

// What an action will send, read whole before it is confirmed: `maxLines={false}` never folds and
// draws every line, however many (here 3,000 and more), where an opened block draws the first
// 2,000.
export default function CodeBlockWhole() {
  return (
    <CodeBlock language="json">
      <CodeBlockHeader>
        <CodeBlockTitle>request.json</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={request} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent maxLines={false}>{request}</CodeBlockContent>
    </CodeBlock>
  );
}
