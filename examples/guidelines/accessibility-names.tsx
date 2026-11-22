"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  CopyIcon,
  DownloadIcon,
  Icon,
  ShareIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

import { heard, nameOf, useRead } from "./accessibility-fixtures";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: "minmax(0, 3fr) minmax(0, 2fr)",
    },
    gap: space["6"],
    alignItems: "start",
    width: "100%",
    maxWidth: 840,
    minWidth: 0,
  },
  parts: { display: "grid", gap: space["5"], minWidth: 0 },
  row: { display: "flex", flexWrap: "wrap", gap: space["2"] },
});

// Each control's name, read from the page as a screen reader is given it: an icon button's label.
const read = (root: HTMLElement) =>
  [...root.querySelectorAll("[data-icon-row] button")]
    .map((button) => `${nameOf(button)}, button`)
    .join("\n");

export default function AccessibilityNames() {
  const id = useId();
  const names = useRead(id, read);
  return (
    <div id={id} {...stylex.props(styles.grid)}>
      <div {...stylex.props(styles.parts)}>
        <div data-icon-row="" {...stylex.props(styles.row)}>
          <Button variant="ghost" size="icon" aria-label="Copy the link">
            <Icon icon={CopyIcon} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Share the interview">
            <Icon icon={ShareIcon} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Download the transcript"
          >
            <Icon icon={DownloadIcon} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Delete the interview">
            <Icon icon={TrashIcon} />
          </Button>
        </div>
      </div>
      <figure {...stylex.props(heard.box)}>
        <figcaption {...stylex.props(heard.title)}>
          What a screen reader hears, read from the page
        </figcaption>
        <ol {...stylex.props(heard.list)}>
          {names
            .split("\n")
            .filter(Boolean)
            .map((line) => (
              <li key={line}>{line}</li>
            ))}
        </ol>
      </figure>
    </div>
  );
}
