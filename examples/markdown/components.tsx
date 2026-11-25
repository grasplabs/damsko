import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@grasp-os/ui/components/code-block";
import { Link } from "@grasp-os/ui/components/link";
import { Markdown } from "@grasp-os/ui/components/markdown";
import type { MarkdownComponents } from "@grasp-os/ui/components/markdown";
import { colors, font, radius, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// An answer whose links and code the product draws itself, through `components`: a link names the
// site it leads to after its words, and fenced code is a CodeBlock with no line numbers, its
// file named when the fence gives one (```ts title=report.ts). Code in a sentence is the product's
// own chip. A link to anywhere but http, https or mailto never reaches `a`: it is words.
const answer = `The report is built by [the reporting service](https://reports.example.com/docs) every morning, and its numbers come from \`daily_totals\`.

\`\`\`ts title=report.ts
export const totals = await report.daily({ team: "support" });
\`\`\`

A [link the model was tricked into](javascript:alert(1)) stays words.`;

const styles = stylex.create({
  site: { color: colors.mutedForeground },
  chip: {
    paddingInline: space["1"],
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    backgroundColor: colors.accent,
    fontFamily: font.mono,
    fontSize: font.textSm,
  },
});

/** The site an address leads to, as people read it. */
const siteOf = (href: string) => new URL(href).host.replace(/^www\./u, "");

const components: MarkdownComponents = {
  a: ({ href = "", children }) => (
    <Link href={href} external={!href.startsWith("mailto:")}>
      {children}
      {href.startsWith("mailto:") ? null : (
        <span {...stylex.props(styles.site)}> ({siteOf(href)})</span>
      )}
    </Link>
  ),
  code: ({ node, className, children }) => {
    if (node.type !== "code") {
      return <code {...stylex.props(styles.chip)}>{children}</code>;
    }
    const title = /title=(?<name>\S+)/u.exec(node.meta ?? "")?.groups?.name;
    return (
      <CodeBlock language={className?.replace("language-", "") ?? "text"}>
        <CodeBlockHeader>
          <CodeBlockTitle>{title}</CodeBlockTitle>
        </CodeBlockHeader>
        <CodeBlockContent>{node.value}</CodeBlockContent>
      </CodeBlock>
    );
  },
};

export default function MarkdownComponentsExample() {
  return <Markdown components={components}>{answer}</Markdown>;
}
