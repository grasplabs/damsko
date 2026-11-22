import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardTitle,
  HoverCardTrigger,
} from "@grasp-os/ui/components/hover-card";
import { font, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import type { AnchorHTMLAttributes, ReactNode } from "react";

const layout = stylex.create({
  line: {
    margin: 0,
    maxWidth: size.popupWidth,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// A router's own link, as a product has one (React Router's or TanStack's `Link`): a stand-in here
// that draws an `a` from its `to`.
const RouterLink = ({
  to,
  ...rest
}: {
  to: string;
  children?: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...rest} href={to} data-router-link="" />
);

// The name is the router's link (`asChild`): one link, with the trigger's look and the card on it.
export default function HoverCardRouter() {
  return (
    <p {...stylex.props(layout.line)}>
      The brief was last changed by{" "}
      <HoverCard>
        <HoverCardTrigger asChild>
          <RouterLink to="#amara-okafor">Amara Okafor</RouterLink>
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardTitle>Amara Okafor</HoverCardTitle>
          <HoverCardDescription>
            Leads research. Owns the brief and the interview notes.
          </HoverCardDescription>
        </HoverCardContent>
      </HoverCard>{" "}
      this morning.
    </p>
  );
}
