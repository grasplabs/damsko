import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";

const code = `# Summarise the comments on the quarterly report, grouped by the section they are about, and say which ones still need an answer from the team.
summarise --report quarterly-summary --group-by section --open-only --format markdown`;

// Long lines wrap rather than scroll.
export default function CodeBlockWrap() {
  return (
    <CodeBlock language="bash">
      <CodeBlockHeader>
        <CodeBlockTitle />
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap lineNumbers>
        {code}
      </CodeBlockContent>
    </CodeBlock>
  );
}
