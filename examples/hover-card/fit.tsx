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

// Cards as wide as what they hold (`width="content"`): a short one stays small, down to the least
// width; a long one grows to the most width and wraps there.
export default function HoverCardFit() {
  return (
    <p {...stylex.props(layout.line)}>
      Linked to{" "}
      <HoverCard>
        <HoverCardTrigger href="#q3">Q3</HoverCardTrigger>
        <HoverCardContent width="content">
          <HoverCardTitle>Q3</HoverCardTitle>
          <HoverCardDescription variant="muted">Draft</HoverCardDescription>
        </HoverCardContent>
      </HoverCard>{" "}
      and{" "}
      <HoverCard>
        <HoverCardTrigger href="#supplier-review">
          the supplier review
        </HoverCardTrigger>
        <HoverCardContent width="content">
          <HoverCardTitle>Supplier review, autumn</HoverCardTitle>
          <HoverCardDescription>
            Five visits, three new partners, and the open questions on delivery
            times that the team still has to answer before the contracts are
            signed.
          </HoverCardDescription>
          <HoverCardDescription variant="muted">
            Updated yesterday
          </HoverCardDescription>
        </HoverCardContent>
      </HoverCard>
      .
    </p>
  );
}
