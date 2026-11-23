"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import {
  FileDocIcon,
  GlobeIcon,
  Icon,
  SearchIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

// Under this the head's three do not fit one row.
const NARROW = "@container (width < 26rem)";

const layout = stylex.create({
  answer: { display: "grid", gap: space["5"], width: "100%", maxWidth: 512 },
  words: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  // A citation's number in the sentence: a small box on the soft fill, as its row's number says it.
  // The Citations pattern makes it a link that lights and opens its row.
  cited: {
    marginInlineStart: space["1"],
    paddingBlock: 1,
    paddingInline: space["1"],
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    fontVariantNumeric: "tabular-nums",
    color: colors.mutedForeground,
    backgroundColor: colors.muted,
    boxShadow: size.borderStrong,
  },
  // The open list's head, in the pile's place: the count, the order, the button that folds it. In
  // a narrow column the order takes a line of its own under the other two.
  headBox: { containerType: "inline-size" },
  head: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
    marginBlockEnd: space["2"],
  },
  order: {
    display: "flex",
    order: { default: 0, [NARROW]: 1 },
    flexBasis: { default: "auto", [NARROW]: "100%" },
  },
  heading: {
    flexGrow: 1,
    margin: 0,
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    color: colors.mutedForeground,
  },
});

interface Cited {
  title: string;
  kind: "page" | "file" | "search";
  origin: string;
  quote: string;
  href?: string;
  icon: IconData;
}

// In the order the answer used them: a source's number is its place here, whatever the list's order.
const cited: Cited[] = [
  {
    title: "Pricing page",
    kind: "page",
    origin: "Pricing / Plans",
    quote: "Teams start at €12 per seat a month.",
    href: "#pricing",
    icon: GlobeIcon,
  },
  {
    title: "Notes from the pricing call",
    kind: "file",
    origin: "Shared notes",
    quote: "Hold the team plan for next year.",
    icon: FileDocIcon,
  },
  {
    title: "Price check",
    kind: "search",
    origin: "Search across four plans",
    quote: "Compared four plans on the site.",
    href: "#run",
    icon: SearchIcon,
  },
];

const Cite = ({ index }: { index: number }) => (
  <span
    role="note"
    aria-label={`Source ${index}`}
    {...stylex.props(layout.cited)}
  >
    {index}
  </span>
);

// The open list with a head of the page's own in the pile's place: the count, a switch for the
// order, and a button that folds it away; folded, the pile is back. Each source carries its number
// and the passage used. A press that hides the button pressed hands focus to what took its place.
// The page hears when a source is opened (`onOpen`): one with an address is still a link and goes
// there; one without is a button that only runs it.
export default function SourcesOpen() {
  const [opened, setOpened] = useState("Nothing opened yet");
  const [open, setOpen] = useState(true);
  const [order, setOrder] = useState("relevance");
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLParagraphElement>(null);
  const numbered = cited.map((source, at) => ({ ...source, index: at + 1 }));
  const rows =
    order === "kind"
      ? numbered.toSorted((a, b) => a.kind.localeCompare(b.kind))
      : numbered;
  const toggle = (next: boolean) => {
    flushSync(() => {
      setOpen(next);
    });
    if (next) {
      heading.current?.focus({ preventScroll: true });
    } else {
      root.current?.querySelector("button")?.focus({ preventScroll: true });
    }
  };
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.words)}>
        The team plan costs €12 a seat
        <Cite index={1} />, the call asked to hold it
        <Cite index={2} />, and a search compared the plans
        <Cite index={3} />.
      </p>
      <div ref={root}>
        <Sources open={open} onOpenChange={toggle}>
          {open ? (
            <div {...stylex.props(layout.headBox)}>
              <div {...stylex.props(layout.head)}>
                <p
                  ref={heading}
                  tabIndex={-1}
                  {...stylex.props(layout.heading, focusRingInset)}
                >
                  Sources · {cited.length}
                </p>
                <div {...stylex.props(layout.order)}>
                  <ToggleGroup
                    aria-label="Order"
                    size="sm"
                    value={[order]}
                    deselectable={false}
                    onValueChange={([next]) => {
                      if (next !== undefined) {
                        setOrder(next);
                      }
                    }}
                  >
                    <ToggleGroupItem value="relevance">
                      By relevance
                    </ToggleGroupItem>
                    <ToggleGroupItem value="kind">By kind</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    toggle(false);
                  }}
                >
                  Fold them away
                </Button>
              </div>
            </div>
          ) : (
            <SourcesTrigger count={cited.length}>
              {cited.map((source) => (
                <SourceIcon key={source.title}>
                  <Icon icon={source.icon} />
                </SourceIcon>
              ))}
            </SourcesTrigger>
          )}
          <SourcesContent>
            {rows.map((source) => (
              <Source
                key={source.title}
                title={source.title}
                origin={source.origin}
                quote={source.quote}
                index={source.index}
                href={source.href}
                onOpen={() => {
                  setOpened(`Opened ${source.index}: ${source.title}`);
                }}
              >
                <SourceIcon>
                  <Icon icon={source.icon} />
                </SourceIcon>
              </Source>
            ))}
          </SourcesContent>
        </Sources>
      </div>
      <output {...stylex.props(layout.words)}>{opened}</output>
    </div>
  );
}
