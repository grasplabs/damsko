import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

// GitHub's alerts, as models write them: a quote whose first line is only `[!NOTE]`, `[!TIP]`,
// `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` is that kind of Alert. Any other mark stays a quote.
const answer = `> [!NOTE]
> The export runs every night at two.

> [!TIP]
> Filter by **owner** to see only your own reports.

> [!IMPORTANT]
> Reports older than a year move to the archive.

> [!WARNING]
> Changing the currency recalculates every open report.

> [!CAUTION]
> Deleting a workspace deletes its reports too:
> - the drafts
> - the shared copies

> [!SUMMARY]
> Not one of GitHub's five, so a plain quote.`;

// An answer's column, as wide as a chat's.
const layout = stylex.create({ column: { width: "100%", maxWidth: 704 } });

export default function MarkdownAlerts() {
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown>{answer}</Markdown>
    </div>
  );
}
