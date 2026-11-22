import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { font, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  line: {
    margin: 0,
    maxWidth: size.popupWidth,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// A name in a sentence. Resting on it shows who it is; pressing it goes to their page.
export default function HoverCardPerson() {
  return (
    <p {...stylex.props(layout.line)}>
      The brief was last changed by{" "}
      <HoverCard>
        <HoverCardTrigger href="#amara-okafor">Amara Okafor</HoverCardTrigger>
        <HoverCardContent>
          <HoverCardTitle>Amara Okafor</HoverCardTitle>
          <HoverCardDescription>
            Leads research. Owns the brief and the interview notes.
          </HoverCardDescription>
          <HoverCardDescription variant="muted">
            Amsterdam, 14:20 local time
          </HoverCardDescription>
        </HoverCardContent>
      </HoverCard>{" "}
      this morning.
    </p>
  );
}
