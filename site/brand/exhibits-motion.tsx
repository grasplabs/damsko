"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  ArrowRightIcon,
  BrainIcon,
  CalendarIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  FolderIcon,
  HouseIcon,
  Icon,
  InboxIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  SearchIcon,
  UsersIcon,
  WorkflowIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// The exhibits of room 09 (Icons and marks): the set drawn large in its one stroke, and the Company
// Brain's own mark. (Room 08's are in exhibits-moving.tsx.)
import * as stylex from "@stylexjs/stylex";

import { iconWords } from "./content";

const s = stylex.create({
  // ---- Icons
  icons: {
    [iconVars.size]: `calc(${size.iconDefault} * 3)`,
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(6, auto)",
      [media.maxSm]: "repeat(4, auto)",
    },
    justifyContent: "center",
    // On a phone the gaps scale with the width, so four icons fit at 320.
    gap: {
      default: space["12"],
      [media.maxSm]: `min(${space["8"]}, 6vw)`,
    },
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    color: colors.foreground,
  },
  brain: {
    [iconVars.size]: `calc(${size.iconDefault} * 7)`,
    display: "grid",
    justifyItems: "center",
    gap: space["6"],
    color: colors.foreground,
  },
  brainName: {
    fontFamily: font.serif,
    fontSize: font.headingLg,
    lineHeight: font.headingLgLine,
    letterSpacing: font.trackingTitle,
  },
});

/** The icons drawn large, in their one stroke. */
export const Icons = () => (
  <div {...stylex.props(s.icons)}>
    {[
      HouseIcon,
      InboxIcon,
      SearchIcon,
      MessageCircleIcon,
      UsersIcon,
      CalendarIcon,
      ChartColumnIcon,
      ClipboardListIcon,
      FolderIcon,
      MailIcon,
      LockIcon,
      WorkflowIcon,
    ].map((icon, index) => (
      // The set has no names to key by; the order is fixed.
      <Icon key={`icon-${index}`} icon={icon} />
    ))}
  </div>
);

export const IconsPickup = () => (
  <Button variant="secondary" size="sm" asChild>
    <a href={iconWords.foundationsHref}>
      {iconWords.foundations}
      <Icon icon={ArrowRightIcon} />
    </a>
  </Button>
);

/** The Company Brain's own mark, large, with its name. */
export const BrainMark = () => (
  <div {...stylex.props(s.brain)}>
    <Icon icon={BrainIcon} label={iconWords.brainName} />
    <span {...stylex.props(s.brainName)}>{iconWords.brainName}</span>
  </div>
);
