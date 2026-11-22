import { Markdown } from "@grasp-os/ui/components/markdown";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Answers caught part way while they are written (`streaming`): a fence not yet closed, a link
// whose address has not arrived, a table with its head and half a row. Each is drawn as what it
// will be: code being written, the link's words, a table.
const cases = [
  {
    label: "A fence not yet closed",
    source:
      "Run this to count them:\n\n```python\ndef closed(requests):\n    return sum(",
  },
  {
    label: "A link still being written",
    source: "The numbers are in [the weekly report](https://exa",
  },
  {
    label: "A table still being written",
    source:
      "| Team | Closed | Open |\n| :-- | --: | --: |\n| Support | 58 | 4 |\n| Sal",
  },
];

const layout = stylex.create({
  column: { display: "grid", gap: space["6"], width: "100%", maxWidth: 560 },
  part: { display: "grid", gap: space["2"] },
  label: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

export default function MarkdownHalfWritten() {
  return (
    <div {...stylex.props(layout.column)}>
      {cases.map((each) => (
        <section
          key={each.label}
          aria-label={each.label}
          {...stylex.props(layout.part)}
        >
          <p {...stylex.props(layout.label)}>{each.label}</p>
          <Markdown streaming>{each.source}</Markdown>
        </section>
      ))}
    </div>
  );
}
