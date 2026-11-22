// What the Accessibility guideline's examples share (examples/guidelines/accessibility-*.tsx): a
// hook that reads words from the page as it changes, so an example can print what a screen reader
// is given (a name, a description, what a live region says) from the page itself, never typed in;
// and the quiet box those words are printed in.
"use client";

import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useSyncExternalStore } from "react";

/**
 * The words `read` finds in the element with this id, read again whenever anything under it
 * changes. With `everywhere`, whenever anything in the page changes (a live region at the body's
 * end lies outside the example). Empty on the server and before the element is on the page.
 */
export const useRead = (
  id: string,
  read: (root: HTMLElement) => string,
  everywhere = false
): string =>
  useSyncExternalStore(
    (changed) => {
      const target = everywhere ? document.body : document.getElementById(id);
      if (target === null) {
        return () => {};
      }
      const observer = new MutationObserver(changed);
      observer.observe(target, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      return () => {
        observer.disconnect();
      };
    },
    () => {
      const root = document.getElementById(id);
      return root === null ? "" : read(root);
    },
    () => ""
  );

/** A control's name as the page gives it: its aria-label, else the words of what labels it, else its own words. */
export const nameOf = (element: Element): string => {
  const label = element.getAttribute("aria-label");
  if (label !== null && label.trim() !== "") {
    return label.trim();
  }
  const by = (element.getAttribute("aria-labelledby") ?? "")
    .split(/\s+/u)
    .map((id) => (id === "" ? null : document.getElementById(id)))
    .filter((found) => found !== null && found !== element)
    .map((found) => (found?.textContent ?? "").trim())
    .filter((words) => words !== "");
  if (by.length > 0) {
    return by.join(" ").replace(/\s*\*$/u, "");
  }
  return (element.textContent ?? "").replaceAll(/\s+/gu, " ").trim();
};

export const heard = stylex.create({
  box: {
    display: "grid",
    alignContent: "start",
    gap: space["2"],
    minWidth: 0,
    margin: 0,
    padding: space["4"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    boxShadow: size.borderStrong,
    // In forced colours the edge, a shadow, is dropped: a real border keeps the box.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "CanvasText",
  },
  title: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
  list: {
    display: "grid",
    gap: space["1"],
    margin: 0,
    paddingInlineStart: space["5"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
    overflowWrap: "anywhere",
  },
  line: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.foreground,
    overflowWrap: "anywhere",
  },
});
