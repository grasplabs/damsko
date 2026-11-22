import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { colors, font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

const layout = stylex.create({
  // Room under the link for the card, so it opens inside the stage.
  holder: {
    display: "grid",
    alignContent: "start",
    justifyItems: "center",
    minHeight: "14rem",
    width: "100%",
  },
  line: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
  },
});

// The card open, held still: the real HoverCard with `open`, its link inert so nothing here can
// be pressed or followed. A card stands above everything on the page, so it is held open only
// while its stage is wholly in view under the site's header, and closes as the stage scrolls away.
export default function HoverCardOpen() {
  const holder = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const element = holder.current;
    if (!element) {
      return;
    }
    element.inert = true;
    const watch = new IntersectionObserver(
      ([entry]) => {
        setOpen(Boolean(entry?.isIntersecting));
      },
      {
        rootMargin: "-64px 0px 0px 0px",
        threshold: 1,
      }
    );
    watch.observe(element);
    return () => {
      watch.disconnect();
    };
  }, []);
  return (
    <div ref={holder} {...stylex.props(layout.holder)}>
      <div {...stylex.props(layout.line)}>
        <HoverCard open={open}>
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
        </HoverCard>
      </div>
    </div>
  );
}
