import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockDownloadButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const code = `export async function shareReport(id: string, team: string) {
  const report = await reports.get(id);
  if (!report) throw new Error("No such report");
  await report.share({ with: team, notify: true });
  return report.link;
}`;

const title = "src/reports/share.ts";

// More in the head beside Copy: Download, which saves the code as its file.
export default function CodeBlockActionsExample() {
  return (
    <CodeBlock language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockDownloadButton value={code} filename="share.ts" />
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  );
}
