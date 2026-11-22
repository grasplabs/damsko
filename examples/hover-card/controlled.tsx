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
import { useState } from "react";

const layout = stylex.create({
  // Room under the link for the card, so it opens inside the stage.
  holder: {
    display: "grid",
    alignContent: "start",
    justifyItems: "start",
    gap: space["3"],
    minHeight: "14rem",
  },
  line: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

// Opened from outside: the host keeps `open` and passes `onOpenChange`, so a Button elsewhere shows
// the card, and resting off it, Escape or a press outside close it as usual.
export default function HoverCardControlled() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(layout.holder)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Show who changed it
      </Button>
      <p {...stylex.props(layout.line)}>
        Last changed by{" "}
        <HoverCard
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
          }}
        >
          <HoverCardTrigger href="#amara-okafor">Amara Okafor</HoverCardTrigger>
          <HoverCardContent>
            <HoverCardTitle>Amara Okafor</HoverCardTitle>
            <HoverCardDescription>
              Leads research. Owns the brief and the interview notes.
            </HoverCardDescription>
          </HoverCardContent>
        </HoverCard>
        .
      </p>
    </div>
  );
}
