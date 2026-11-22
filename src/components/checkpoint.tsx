// Checkpoint: a point in a conversation the person can return to, after shadcn's AI Elements
// pattern (content/docs/ai-elements/base/checkpoint.mdx), built on Marker, Button and Tooltip. It is
// a separator Marker after a turn: its words in the middle of the hairline, with a Restore button
// beside them. Restoring keeps that turn and drops every message after it; the caller does that.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Checkpoint>
//     Button renamed
//     <CheckpointTrigger aria-label="Restore to Button renamed" onClick={restore}>
//       Restore
//     </CheckpointTrigger>
//   </Checkpoint>
//
// Its words are ordinary content and its rules are drawn, not read (Marker's separator). The trigger
// is a small outline Button, as shadcn draws its Restore, named by its words or `aria-label`;
// its tooltip describes it and opens on hover and keyboard focus. Out of use with a tooltip, it stays
// in the tab order so the tooltip can say why. A caller may set layout only (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import type { MouseEvent, ReactNode } from "react";

import { BookmarkIcon, Icon } from "../lib/icons";
import { space } from "../lib/tokens.stylex";
import type { LayoutStyle } from "../lib/utils";
import { Button } from "./button";
import type { ButtonVariant } from "./button";
import { Marker, MarkerContent, MarkerIcon } from "./marker";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** Every prop a Checkpoint takes. */
export interface CheckpointProps {
  /** Its words ("Button renamed"), a CheckpointIcon before them if it helps, and its CheckpointTrigger. */
  children: ReactNode;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a CheckpointIcon takes. */
export interface CheckpointIconProps {
  /** A mark of its own, an `<Icon />`, in place of the bookmark. */
  children?: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a CheckpointTrigger takes. */
export interface CheckpointTriggerProps {
  /** Its words, a verb first ("Restore"). With `asChild`, the one element drawn as the button. */
  children: ReactNode;
  /**
   * Its name, when its words alone do not say which checkpoint it restores ("Restore to Button
   * renamed").
   */
  "aria-label"?: string;
  /** A few words on what restoring does, or why it cannot, shown on hover and focus and said as its description. */
  tooltip?: string;
  /** Runs when it is pressed: keep the turn before the checkpoint and drop every message after it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * The button's weight: `outline`, a quiet trigger in the conversation's line, as shadcn draws it.
   * @default "outline"
   */
  variant?: ButtonVariant;
  /**
   * The button's height: `xs` 28px, `sm` 32px, `default` 36px, `lg` 44px.
   * @default "xs"
   */
  size?: "xs" | "sm" | "default" | "lg";
  /**
   * Out of use: no press. With a `tooltip` it stays in the tab order, so the tooltip can say why.
   * @default false
   */
  disabled?: boolean;
  /**
   * Draw the one element given as the child (a router's link) as the button, with its look.
   * @default false
   */
  asChild?: boolean;
  /** Where it sits. */
  style?: LayoutStyle;
}

const styles = stylex.create({
  // The words, the mark and the trigger on one line in the middle of the hairline.
  row: {
    display: "inline-flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
  },
});

/** A separator Marker after a turn: its words in the middle of the hairline, and its trigger. */
export const Checkpoint = ({ children, style }: CheckpointProps) => (
  <Marker variant="separator" style={style}>
    <MarkerContent>
      <span {...stylex.props(styles.row)}>{children}</span>
    </MarkerContent>
  </Marker>
);

/** The checkpoint's mark: a bookmark, or the one given. A picture only. */
export const CheckpointIcon = ({ children, style }: CheckpointIconProps) => (
  <MarkerIcon style={style}>
    {children ?? <Icon icon={BookmarkIcon} />}
  </MarkerIcon>
);

/** The button that restores the conversation to the checkpoint, with its tooltip if given. */
export const CheckpointTrigger = ({
  children,
  "aria-label": label,
  tooltip,
  onClick,
  variant = "outline",
  size: height = "xs",
  disabled = false,
  asChild = false,
  style,
}: CheckpointTriggerProps) => {
  const described = tooltip !== undefined && tooltip !== "";
  const button = (
    <Button
      type="button"
      aria-label={label}
      variant={variant}
      size={height}
      disabled={disabled}
      // Held in the tab order while out of use, so its tooltip can still say why.
      focusableWhenDisabled={described && disabled}
      asChild={asChild}
      onClick={onClick}
      style={style}
    >
      {children}
    </Button>
  );
  if (!described) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
