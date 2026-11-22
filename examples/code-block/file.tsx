import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  useHighlightedCode,
} from "@grasp-os/ui/components/code-block";

const code = `export async function shareReport(id: string, team: string) {
  const report = await reports.get(id);
  if (!report) throw new Error("No such report");
  await report.share({ with: team, notify: true });
  return report.link;
}`;

const highlighted = new Set([4, 5]);

// A file name over it, and the two lines the answer is about highlighted: the highlighted code's
// lines, each given as a CodeBlockLine.
export default function CodeBlockFile() {
  const lines = useHighlightedCode(code, "ts");
  return (
    <CodeBlock language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>src/reports/share.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine
            // The code is fixed: a line's place is its key.
            key={index}
            variant={highlighted.has(index + 1) ? "highlighted" : "default"}
          >
            {line}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
