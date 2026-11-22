import { Button } from "@grasp-os/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

// A control that previews: the trigger is the Button, in the Button's own look (`variant="default"`
// adds no underline, colour or ring), and resting on it shows the card.
export default function HoverCardControl() {
  return (
    <div {...stylex.props(layout.row)}>
      Seats
      <HoverCard>
        <HoverCardTrigger variant="default" asChild>
          <Button variant="outline" size="sm">
            3 of 5 in use
          </Button>
        </HoverCardTrigger>
        <HoverCardContent width="content">
          <HoverCardTitle>3 of 5 seats in use</HoverCardTitle>
          <HoverCardDescription>
            Amara, Joris and Wen. Two seats are free.
          </HoverCardDescription>
          <HoverCardDescription variant="muted">
            Renews on 1 December
          </HoverCardDescription>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
