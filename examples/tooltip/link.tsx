"use client";

import { Avatar, AvatarFallback } from "@grasp-os/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { AnchorHTMLAttributes } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["6"],
    flexWrap: "wrap",
  },
  link: {
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// A tooltip on what the host draws itself: a router's link (here a stand-in that moves without
// loading the page), with words or with a face in it. Each keeps its own look and name; the tooltip
// is its description.
export default function TooltipLink() {
  const [open, setOpen] = useState("");
  const RouterLink = ({
    to,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a
      {...rest}
      href={`#${to}`}
      aria-current={open === to ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        setOpen(to);
      }}
      // Its own look beside what it is handed (the trigger's layout): a router's link merges both.
      className={[rest.className, stylex.props(layout.link).className]
        .filter(Boolean)
        .join(" ")}
    />
  );
  return (
    <div {...stylex.props(layout.row)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <RouterLink to="reports">Reports</RouterLink>
        </TooltipTrigger>
        <TooltipContent>Every report the team has shared</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <RouterLink to="anna" aria-label="Anna de Vries">
            <Avatar name="Anna de Vries" decorative>
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
          </RouterLink>
        </TooltipTrigger>
        <TooltipContent>Wrote this note on Monday</TooltipContent>
      </Tooltip>
    </div>
  );
}
