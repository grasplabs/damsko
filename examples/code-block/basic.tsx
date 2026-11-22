import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const code = `import { Badge } from "@grasp-os/ui/components/badge";

export function ReportStatus({ ready }: { ready: boolean }) {
  return <Badge variant={ready ? "success" : "default"}>{ready ? "Ready" : "Draft"}</Badge>;
}`;

export default function CodeBlockBasic() {
  return (
    <CodeBlock language="tsx">
      <CodeBlockHeader>
        <CodeBlockTitle />
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent lineNumbers>{code}</CodeBlockContent>
    </CodeBlock>
  );
}
