"use client";

import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
import {
  colors,
  duration,
  font,
  media,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// Colour, scene: the four inks, darkest first, each saying what it is for in its own colour, with
// its contrast measured live against the ground you choose. Text needs 4.5:1; every ink holds it
// on every ground, the night included.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

import { asRatio, measurer } from "./contrast";

const styles = stylex.create({
  panel: {
    display: "grid",
    rowGap: space["6"],
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
    transitionProperty: "background-color",
    transitionDuration: duration.ui,
    transitionTimingFunction: duration.ease,
  },
  paper: { backgroundColor: colors.background },
  soft: { backgroundColor: colors.muted },
  night: { colorScheme: "dark", backgroundColor: colors.brandNight },
  list: { display: "grid", margin: 0, padding: 0, listStyle: "none" },
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      [media.maxSm]: "minmax(0, 1fr)",
    },
    alignItems: "baseline",
    columnGap: space["6"],
    rowGap: space["1"],
    paddingBlock: space["4"],
    boxShadow: `inset 0 calc(-1 * ${size.hairline}) 0 ${colors.border}`,
  },
  words: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: { default: font.headingSm, [media.maxSm]: font.textLg },
    lineHeight: {
      default: font.headingSmLine,
      [media.maxSm]: font.textLgLine,
    },
    textWrap: "pretty",
  },
  ink: { color: colors.foreground },
  text: { color: colors.bodyForeground },
  muted: { color: colors.mutedForeground },
  quiet: { color: colors.subtleForeground },
  facts: {
    display: "flex",
    alignItems: "baseline",
    gap: space["3"],
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  // Room for the widest figure, "14.6:1" (six characters of the mono face): at 5ch the two-digit
  // figures pushed their token names 8px further in than the others', so no edge held.
  ratio: {
    fontVariantNumeric: "tabular-nums",
    color: colors.bodyForeground,
    minWidth: "6ch",
    textAlign: "end",
  },
});

const inks = [
  { id: "ink", token: "foreground", words: "Ink says what to read first." },
  {
    id: "text",
    token: "body-foreground",
    words: "Text carries the sentences and the cells.",
  },
  {
    id: "muted",
    token: "muted-foreground",
    words: "Muted holds the second things: a date, a count.",
  },
  {
    id: "quiet",
    token: "subtle-foreground",
    words: "Quiet is for what counts but can wait.",
  },
] as const;

type Ground = "paper" | "soft" | "night";

export default function ColourInks() {
  const [ground, setGround] = useState<Ground>("paper");
  const [ratios, setRatios] = useState<Record<string, string>>({});
  const panel = useRef<HTMLDivElement>(null);

  // Measured from the drawn page once the ground has landed, so the figures are what you see.
  useEffect(() => {
    const element = panel.current;
    if (!element) {
      return;
    }
    const measure = () => {
      const ratio = measurer();
      const ground = getComputedStyle(element).backgroundColor;
      const next: Record<string, string> = {};
      for (const line of element.querySelectorAll<HTMLElement>("[data-ink]")) {
        next[line.dataset.ink ?? ""] = asRatio(
          ratio(getComputedStyle(line).color, ground)
        );
      }
      setRatios(next);
    };
    const timer = window.setTimeout(measure, 320);
    return () => {
      window.clearTimeout(timer);
    };
  }, [ground]);

  return (
    <div ref={panel} {...stylex.props(styles.panel, styles[ground])}>
      <Tabs
        value={ground}
        onValueChange={(value) => value && setGround(value as Ground)}
      >
        <TabsList variant="default" aria-label="Ground">
          <TabsTrigger value="paper">Paper</TabsTrigger>
          <TabsTrigger value="soft">Soft</TabsTrigger>
          <TabsTrigger value="night">Night</TabsTrigger>
        </TabsList>
      </Tabs>
      <ul {...stylex.props(styles.list)}>
        {inks.map((ink) => (
          <li key={ink.id} {...stylex.props(styles.row)}>
            <p
              data-ink={ink.id}
              {...stylex.props(styles.words, styles[ink.id])}
            >
              {ink.words}
            </p>
            <span {...stylex.props(styles.facts)}>
              <span>--damsko-{ink.token}</span>
              <span {...stylex.props(styles.ratio)}>
                {ratios[ink.id] ?? " "}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
