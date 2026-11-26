import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

// Tables as a model writes them: sentences in cells wrap, so the table fits its column; a column of
// figures the Markdown sets to the right stays on one line; code in a cell may break. A table of
// many columns scrolls sideways in its own box, said by the fade at its edge and reached by Tab.
// A model's `<br>` in a cell is a line break there.
const answer = `## Ways to send the report

| Way | What happens | When to use it | Cost |
| :-- | :-- | :-- | --: |
| Email | Everyone on the list gets the PDF in their inbox the moment it is ready. | When readers are not in the team. | €0 |
| Shared folder | The file lands in \`/reports/2026/quarterly-summary-final.pdf\`, and the folder's members are told. | When the team keeps its files in one place. | €0 |
| Printed copy | The print room sends it by post.<br>It arrives the next working day. | For the board meeting. | €12.50 |

## Opening hours

| Office | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
| :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Amsterdam | 9–17 | 9–17 | 9–17 | 9–17 | 9–16 | closed | closed |
| Berlin | 8–18 | 8–18 | 8–18 | 8–18 | 8–15 | 10–14 | closed |`;

// An answer's column, as wide as a chat's.
const layout = stylex.create({ column: { width: "100%", maxWidth: 704 } });

export default function MarkdownTables() {
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown>{answer}</Markdown>
    </div>
  );
}
