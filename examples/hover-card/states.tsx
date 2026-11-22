import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  line: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

// The link in one state. The docs draw it once per state; hover and keyboard focus are forced from
// the link's own CSS, so the card itself does not open here (its delay is a timer, not a style).
export default function HoverCardState() {
  return (
    <div {...stylex.props(layout.line)}>
      <HoverCard>
        <HoverCardTrigger href="#amara-okafor">Amara Okafor</HoverCardTrigger>
        <HoverCardContent>
          <HoverCardTitle>Amara Okafor</HoverCardTitle>
          <HoverCardDescription>
            Leads research. Owns the brief and the interview notes.
          </HoverCardDescription>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
