"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import { FileDocIcon, FilePdfIcon, Icon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import {
  colors,
  duration,
  font,
  radius,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

const layout = stylex.create({
  answer: { display: "grid", gap: space["4"], width: "100%", maxWidth: 640 },
  words: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  // A citation in the words, and a source's row: each takes the quiet fill while the other end of
  // the pair is under the pointer or holds focus.
  cited: {
    display: "inline-flex",
    verticalAlign: "baseline",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    transitionProperty: "background-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  row: {
    borderRadius: radius.row,
    cornerShape: radius.shape,
    transitionProperty: "background-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  lit: { backgroundColor: colors.accent },
});

const sources: { id: string; title: string; origin: string; icon: IconData }[] =
  [
    {
      id: "churn",
      title: "Churn by region, Q3",
      origin: "Finance / Reports",
      icon: FilePdfIcon,
    },
    {
      id: "plan",
      title: "Onboarding plan, autumn",
      origin: "Customer success / Plans",
      icon: FileDocIcon,
    },
  ];

// An answer whose words cite its sources by number. Resting on a citation, or tabbing to it,
// lights the row it stands for, and a row lights every citation of it; a press on a citation opens
// the list and goes to its row. The page holds which source is lit, and whether the list is open.
export default function Citations() {
  // The source under the pointer, and the one holding focus: either lights its pair.
  const [pointed, setPointed] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const lit = focused ?? pointed;
  const [open, setOpen] = useState(false);
  const rows = useRef(new Map<string, HTMLElement>());
  const light = (id: string) => ({
    onPointerEnter: () => {
      setPointed(id);
    },
    onPointerLeave: () => {
      setPointed(null);
    },
    onFocus: () => {
      setFocused(id);
    },
    onBlur: () => {
      setFocused(null);
    },
  });
  const goTo = (id: string) => {
    // Opened in this same step, so the row is there to take focus.
    flushSync(() => {
      setOpen(true);
    });
    const link = rows.current.get(id)?.querySelector("a, button");
    if (link instanceof HTMLElement) {
      link.focus();
      link.scrollIntoView({ block: "nearest" });
    }
  };
  const cite = (id: string) => {
    const number = sources.findIndex((source) => source.id === id) + 1;
    const title = sources[number - 1]?.title ?? "";
    return (
      <span {...stylex.props(layout.cited, lit === id && layout.lit)}>
        <Button
          variant="secondary"
          size="xs"
          aria-label={`Source ${number}: ${title}`}
          {...light(id)}
          onClick={() => {
            goTo(id);
          }}
        >
          {number}
        </Button>
      </span>
    );
  };
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.words)}>
        Churn in the north fell from 6.1% to 4.6% last quarter {cite("churn")},
        after every new team got a guided first week from August {cite("plan")}.
        The quarterly review called it the one change tied to churn{" "}
        {cite("churn")}.
      </p>
      <Sources open={open} onOpenChange={setOpen}>
        <SourcesTrigger count={sources.length}>
          {sources.map((source) => (
            <SourceIcon key={source.id}>
              <Icon icon={source.icon} />
            </SourceIcon>
          ))}
        </SourcesTrigger>
        <SourcesContent>
          {sources.map((source, index) => (
            // The list's own rows stay its items; this box only carries the light and the place.
            <div
              key={source.id}
              role="presentation"
              ref={(node) => {
                if (node === null) {
                  rows.current.delete(source.id);
                } else {
                  rows.current.set(source.id, node);
                }
              }}
              {...light(source.id)}
              {...stylex.props(layout.row, lit === source.id && layout.lit)}
            >
              <Source
                title={`${index + 1}. ${source.title}`}
                origin={source.origin}
                href={`#${source.id}`}
              >
                <SourceIcon>
                  <Icon icon={source.icon} />
                </SourceIcon>
              </Source>
            </div>
          ))}
        </SourcesContent>
      </Sources>
    </div>
  );
}
