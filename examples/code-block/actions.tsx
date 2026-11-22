import { Button } from "@grasp-os/ui/components/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import { DownloadIcon, Icon } from "@grasp-os/ui/lib/icons";

const code = `export async function shareReport(id: string, team: string) {
  const report = await reports.get(id);
  if (!report) throw new Error("No such report");
  await report.share({ with: team, notify: true });
  return report.link;
}`;

const title = "src/reports/share.ts";

/** Saves the code as its file, from the page. */
const download = () => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
  link.download = "share.ts";
  link.click();
  URL.revokeObjectURL(link.href);
};

// More in the head beside Copy: Download, a ghost icon button the copy button's size.
export default function CodeBlockActionsExample() {
  return (
    <CodeBlock language="ts">
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Download"
            onClick={download}
          >
            <Icon icon={DownloadIcon} />
          </Button>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  );
}
