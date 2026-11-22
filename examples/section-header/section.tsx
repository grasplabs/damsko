import { Section, SectionHeader } from "@grasp-os/ui/components/section-header";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const look = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
  body: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

export default function SectionHeaderSection() {
  return (
    <Section aria-labelledby="billing" style={look.wide}>
      <SectionHeader
        id="billing"
        title="Billing"
        description="How the workspace pays, and when."
      />
      <p {...stylex.props(look.body)}>
        The next invoice goes to the address on file at the start of the month.
      </p>
      <p {...stylex.props(look.body)}>
        Each seat is counted on the day the invoice is made.
      </p>
    </Section>
  );
}
