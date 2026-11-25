import { Markdown } from "@grasp-os/ui/components/markdown";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
// One answer, as a model writes it, drawn two ways: short labelled lines and steps, each on its
// own line with a single newline between them, and a paragraph the model wrapped by hand.
//   off  CommonMark: every single newline is a space, so the short lines run together
//   on   every single newline is a line break, so the wrapped paragraph breaks mid-sentence too
import * as stylex from "@stylexjs/stylex";

const answer = `Here is the plan for the Q3 offsite.

When: 14 and 15 August
Where: Lisbon, the Alfama office
Who: Product and Design, 18 people
Budget: €24,000

I checked three venues against the budget. The Alfama office is
the only one with rooms for breakouts on both days, and it is a
short walk from the hotel the team used last year.

Next steps
Book the rooms by Friday
Send the invite on Monday
Collect dietary needs by the 1st`;

const layout = stylex.create({
  column: { display: "grid", gap: space["8"], width: "100%", maxWidth: 560 },
  part: { display: "grid", gap: space["2"] },
  label: {
    margin: 0,
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

const ways = [
  { value: false, label: "softBreaks off (the default, CommonMark)" },
  { value: true, label: "softBreaks" },
];

export default function MarkdownLineBreaks() {
  return (
    <div {...stylex.props(layout.column)}>
      {ways.map((way) => (
        <section key={way.label} {...stylex.props(layout.part)}>
          <p {...stylex.props(layout.label)}>{way.label}</p>
          <Markdown softBreaks={way.value}>{answer}</Markdown>
        </section>
      ))}
    </div>
  );
}
