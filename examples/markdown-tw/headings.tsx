import { Markdown } from "@grasp-os/ui/components-tw/markdown";
import { Heading } from "@grasp-os/ui/components/heading";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// An answer under a page's own section title (an h2): `headingLevel={3}` starts its headings one
// below it, so the page's outline never skips or repeats a level.
const answer = `# Where the money went

Most of the quarter's spend was travel.

## Travel

Trains for every trip under five hours.

### Hotels

Booked through the company's agent.`;

const layout = stylex.create({
  column: { display: "grid", gap: space["4"], width: "100%", maxWidth: 560 },
});

export default function MarkdownHeadings() {
  return (
    <div {...stylex.props(layout.column)}>
      <Heading level={2}>Expenses review</Heading>
      <Markdown headingLevel={3}>{answer}</Markdown>
    </div>
  );
}
