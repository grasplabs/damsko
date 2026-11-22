import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@grasp-os/ui/components/trace";
import {
  FileIcon,
  FilePenIcon,
  GitCompareIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { font, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: { width: "100%", maxWidth: `calc(${size.popupWidth} * 1.6)` },
  lines: { fontFamily: font.mono },
});

// Each file's change, a line at a time: kept, added or removed.
const files: {
  path: string;
  added: boolean;
  lines: string;
  diff: { code: string; change?: "added" | "removed" }[];
}[] = [
  {
    path: "app/login/page.tsx",
    added: false,
    lines: "+1 −1",
    diff: [
      { code: "const { next } = await searchParams;" },
      {
        code: 'const redirectTo = next && next.startsWith("/") ? next : "/";',
        change: "removed",
      },
      { code: "const redirectTo = safeRedirect(next);", change: "added" },
      { code: "return <LoginForm redirectTo={redirectTo} />;" },
    ],
  },
  {
    path: "lib/auth/redirect.ts",
    added: true,
    lines: "+2 −0",
    diff: [
      {
        code: "export const safeRedirect = (next?: string) =>",
        change: "added",
      },
      {
        code: '  next?.startsWith("/") && !next.startsWith("//") ? next : "/";',
        change: "added",
      },
    ],
  },
];

// A commit: one row that opens on a line for each file it changed, saying what changed and how many
// lines; each file opens on its change, its added and removed lines marked.
export default function TraceCommit() {
  return (
    <Trace style={styles.column}>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Icon icon={GitCompareIcon} />
            </TraceIcon>
            <TraceTitle>Committed a1b2c3: Fix the login redirect</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            {files.map((file) => (
              <TraceCollapsible key={file.path}>
                <TraceCollapsibleTrigger>
                  <TraceLine>
                    <TraceIcon>
                      <Icon icon={file.added ? FileIcon : FilePenIcon} />
                    </TraceIcon>
                    <TraceTitle>
                      {file.added ? "Added" : "Edited"} {file.path}
                    </TraceTitle>
                    <TraceDescription>
                      <span {...stylex.props(styles.lines)}>{file.lines}</span>
                    </TraceDescription>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent>
                  <CodeBlock language="tsx">
                    <CodeBlockHeader>
                      <CodeBlockTitle>{file.path}</CodeBlockTitle>
                    </CodeBlockHeader>
                    <CodeBlockContent>
                      {file.diff.map((line, index) => (
                        <CodeBlockLine
                          // The change is fixed: a line's place is its key.
                          key={index}
                          variant={line.change ?? "default"}
                        >
                          {line.code}
                        </CodeBlockLine>
                      ))}
                    </CodeBlockContent>
                  </CodeBlock>
                </TraceCollapsibleContent>
              </TraceCollapsible>
            ))}
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}
