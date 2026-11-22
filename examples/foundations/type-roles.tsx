"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { KeyValueList } from "@grasp-os/ui/components/key-value";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { Text } from "@grasp-os/ui/components/text";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Type, scene: every word on a real page has a role. A report's page, made of Grasp parts; point at
// any words (or tab to a button) and the line below reads their type off the drawn page: the role,
// the family, the size token with its size over its line, and the weight.
import * as stylex from "@stylexjs/stylex";
import { useCallback, useRef, useState } from "react";
import type { FocusEvent, PointerEvent } from "react";

const styles = stylex.create({
  scene: { display: "grid" },
  page: {
    position: "relative",
    display: "grid",
    rowGap: space["8"],
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
  },
  body: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 3fr) minmax(0, 2fr)",
      [media.maxMd]: "minmax(0, 1fr)",
    },
    columnGap: space["10"],
    rowGap: space["6"],
    alignItems: "start",
  },
  words: { display: "grid", rowGap: space["3"] },
  mark: {
    position: "absolute",
    insetBlockStart: 0,
    insetInlineStart: 0,
    pointerEvents: "none",
    borderRadius: radius.mark,
    boxShadow: `0 0 0 ${size.hairline} ${colors.pine}`,
    backgroundColor: `color-mix(in oklch, ${colors.mint} 18%, transparent)`,
    transitionProperty: {
      default: "transform, width, height, opacity",
      [media.reducedMotion]: "opacity",
    },
    transitionDuration: duration.ui,
    transitionTimingFunction: duration.ease,
  },
  caption: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: space["3"],
    rowGap: space["1"],
    minHeight: space["12"],
    alignContent: "center",
    paddingBlock: space["3"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
    backgroundColor: colors.muted,
    boxShadow: `inset 0 ${size.hairline} 0 ${colors.border}`,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  role: { fontWeight: font.weightMedium, color: colors.foreground },
  fact: {
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.bodyForeground,
    whiteSpace: "nowrap",
  },
});

// The size tokens, read from the page so a size maps back to its name.
const SIZES = [
  "heading-xl",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "heading-xs",
  "text-lg",
  "text-base",
  "text-sm",
  "text-xs",
];

interface Reading {
  role: string;
  family: string;
  size: string;
  weight: string;
}

/** What a piece of words is for, from where it sits. */
const roleOf = (element: Element): string => {
  if (element.closest("button")) {
    return "Button label";
  }
  if (element.closest("h1")) {
    return "Page title";
  }
  if (element.closest("dt")) {
    return "A fact's name";
  }
  if (element.closest("[data-mono]")) {
    return "An id, typed exactly";
  }
  if (element.closest("dd")) {
    return "A fact";
  }
  return (
    element.closest<HTMLElement>("[data-role]")?.dataset.role ?? "Words"
  ).trim();
};

/** The nearest element that holds words of its own. */
const wordsAt = (start: Element | null, root: Element): Element | null => {
  for (
    let element = start;
    element && element !== root;
    element = element.parentElement
  ) {
    if (
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      )
    ) {
      return element;
    }
  }
  return null;
};

export default function TypeRoles() {
  const page = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState<Reading | null>(null);

  const read = useCallback((target: EventTarget | null) => {
    const root = page.current;
    if (!root || !(target instanceof Element)) {
      return;
    }
    const element = wordsAt(target, root);
    if (!element) {
      return;
    }
    const style = getComputedStyle(element);
    const rootStyle = getComputedStyle(document.documentElement);
    const size = Number.parseFloat(style.fontSize);
    const token =
      SIZES.find(
        (name) =>
          Number.parseFloat(rootStyle.getPropertyValue(`--damsko-${name}`)) ===
          size
      ) ?? `${size}px`;
    const family = (style.fontFamily.split(",")[0] ?? "")
      .replaceAll('"', "")
      .trim();
    setReading({
      role: roleOf(element),
      family,
      size: `${token} ${size}/${Number.parseFloat(style.lineHeight) || size}`,
      weight: style.fontWeight,
    });
    // The mark sits over the words themselves, not the box around them.
    const range = document.createRange();
    range.selectNodeContents(element);
    const box = range.getBoundingClientRect();
    const frame = root.getBoundingClientRect();
    const pad = 4;
    if (mark.current) {
      Object.assign(mark.current.style, {
        opacity: "1",
        width: `${box.width + pad * 2}px`,
        height: `${box.height + pad}px`,
        transform: `translate(${box.left - frame.left - pad}px, ${box.top - frame.top - pad / 2}px)`,
      });
    }
  }, []);

  const onPointer = (event: PointerEvent) => {
    read(event.target);
  };
  const onFocus = (event: FocusEvent) => {
    read(event.target);
  };
  const onLeave = () => {
    if (mark.current) {
      mark.current.style.opacity = "0";
    }
  };

  return (
    <div {...stylex.props(styles.scene)}>
      <div
        ref={page}
        onPointerOver={onPointer}
        onPointerLeave={onLeave}
        onFocus={onFocus}
        {...stylex.props(styles.page)}
      >
        <div
          ref={mark}
          aria-hidden="true"
          style={{ opacity: 0, width: 0, height: 0 }}
          {...stylex.props(styles.mark)}
        />
        <PageHeader
          title="Quarterly board report"
          description="Drafted by the research agent from 14 sources. Two figures wait for a person."
          actions={
            <>
              <Button variant="outline">Ask why</Button>
              <Button variant="default">Approve</Button>
            </>
          }
        />
        <div {...stylex.props(styles.body)}>
          <div data-role="Body text" {...stylex.props(styles.words)}>
            <Text>
              Revenue rose 12% on the quarter, led by the new Teams plan. Churn
              held at 2.1%.
            </Text>
            <Text color="muted" size="sm">
              The agent left out the March refunds until finance confirms them.
            </Text>
          </div>
          <KeyValueList
            items={[
              {
                id: "status",
                label: "Status",
                value: <Badge variant="warning">Waiting for you</Badge>,
              },
              { id: "owner", label: "Owner", value: "Research agent" },
              { id: "due", label: "Due", value: "28 November" },
              {
                id: "run",
                label: "Run",
                value: <span data-mono="">run_7f3k</span>,
              },
            ]}
          />
        </div>
      </div>
      <p {...stylex.props(styles.caption)}>
        {reading ? (
          <>
            <span {...stylex.props(styles.role)}>{reading.role}</span>
            <span {...stylex.props(styles.fact)}>{reading.family}</span>
            <span {...stylex.props(styles.fact)}>{reading.size}</span>
            <span {...stylex.props(styles.fact)}>weight {reading.weight}</span>
          </>
        ) : (
          <span>Point at any words, or tab to a button, to read its type.</span>
        )}
      </p>
    </div>
  );
}
