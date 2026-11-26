import { Markdown } from "@grasp-os/ui/components/markdown";
import * as stylex from "@stylexjs/stylex";

// For the spec only (tests/markdown.spec.ts), at /examples/markdown/tables-written; not on the page.
// The tables of markdown/tables while the answer is still being written: the columns share the
// width evenly, so no row that comes moves the ones above it, each at least a few words wide.
const answer = `| Way | What happens | When to use it | Cost |
| :-- | :-- | :-- | --: |
| Email | Everyone on the list gets the PDF in their inbox the moment it is ready. | When readers are outside the workspace. | €0 |
| Printed copy | The print room sends it by post the next working day. | For the board meeting. | €12.50 |

| Office | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
| :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Amsterdam | 9–17 | 9–17 | 9–17 | 9–17 | 9–16 | closed | closed |

Still`;

// An answer's column, as wide as a chat's.
const layout = stylex.create({ column: { width: "100%", maxWidth: 704 } });

export default function MarkdownTablesWritten() {
  return (
    <div {...stylex.props(layout.column)}>
      <Markdown streaming>{answer}</Markdown>
    </div>
  );
}
