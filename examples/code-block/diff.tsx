"use client";

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

const before = `export async function shareReport(id: string, team: string) {
  const report = await reports.get(id);
  await report.share({ with: team });
  return report.link;
}`;

const after = `export async function shareReport(id: string, team: string) {
  const report = await reports.get(id);
  if (!report) throw new Error("No such report");
  await report.share({ with: team, notify: true });
  return report.link;
}`;

// Each line: the version it comes from, and how it changed.
const lines: {
  from: "before" | "after";
  at: number;
  change?: "added" | "removed";
}[] = [
  { from: "after", at: 0 },
  { from: "after", at: 1 },
  { from: "after", at: 2, change: "added" },
  { from: "before", at: 2, change: "removed" },
  { from: "after", at: 3, change: "added" },
  { from: "after", at: 4 },
  { from: "after", at: 5 },
];

// A change: the added and removed lines washed in the diff's colours, each with a bar at its start.
export default function CodeBlockDiff() {
  const old = useHighlightedCode(before, "ts");
  const now = useHighlightedCode(after, "ts");
  return (
    <CodeBlock language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>src/reports/share.ts</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={after} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>
        {lines.map((line, index) => (
          <CodeBlockLine
            // The change is fixed: a line's place is its key.
            key={index}
            variant={line.change ?? "default"}
          >
            {(line.from === "before" ? old : now)[line.at]}
          </CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}
