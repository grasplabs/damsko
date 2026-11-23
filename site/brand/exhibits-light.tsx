"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  ChartBar,
  ChartContainer,
  ChartXAxis,
} from "@grasp-os/ui/components/chart";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { Skeleton } from "@grasp-os/ui/components/skeleton";
import { Slider } from "@grasp-os/ui/components/slider";
import { DatabaseIcon, KeyIcon, LockIcon } from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The lab's light and its dither, for room 07 (Visual language). Two walls:
//
//   - The light: every look of the lab's light (the website's silk, its finer folds, the login
//     door, and the four sands), side by side as stills (public/brand/looks/), each named with one
//     line on where it is used.
//   - The dither: the parts of the library that wear it, live, with no canvas at all: the Skeleton's
//     dot field, a chart's dithered bars, the levels Slider's round track of dots and the working
//     mark.
import * as stylex from "@stylexjs/stylex";

import { ditherWords, effectWords, lightLooks } from "./content";
import { Embers } from "./embers";
import { PixelIcons } from "./pixel-icons";
import { useStill } from "./still";

const s = stylex.create({
  // ---- The light
  caption: {
    display: "grid",
    gap: space["1"],
    maxWidth: "26rem",
    paddingBlock: space["4"],
    paddingInline: space["5"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
    color: colors.bodyForeground,
  },
  name: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    color: colors.foreground,
  },
  when: { margin: 0, fontSize: font.textBase, lineHeight: font.textBaseLine },
  cost: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  // Every look side by side, named.
  sheet: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(4, minmax(0, 1fr))",
      [media.maxMd]: "repeat(2, minmax(0, 1fr))",
    },
    gap: space["5"],
    width: "100%",
    padding: { default: space["8"], [media.maxSm]: space["4"] },
    colorScheme: "dark",
    color: colors.bodyForeground,
  },
  plate: {
    display: "grid",
    gap: space["2"],
    margin: 0,
    alignContent: "start",
  },
  plateImg: {
    display: "block",
    width: "100%",
    aspectRatio: "16 / 10",
    objectFit: "cover",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
  },
  plateName: {
    margin: 0,
    fontFamily: font.serif,
    fontSize: font.headingSm,
    lineHeight: font.headingSmLine,
    color: colors.foreground,
  },
  plateWhen: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
  // ---- The website's effects, one to a wall
  effect: {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: { default: "36rem", [media.maxSm]: "30rem" },
    overflow: "hidden",
    isolation: "isolate",
  },
  effectCard: {
    position: "absolute",
    insetInlineStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
    insetBlockStart: {
      default: space["6"],
      [media.maxSm]: space["4"],
    },
    maxWidth: "min(26rem, calc(100% - 2rem))",
  },
  pixelRow: {
    position: "absolute",
    insetInline: 0,
    insetBlockStart: "50%",
    height: { default: "13rem", [media.maxSm]: "7rem" },
    transform: "translateY(-30%)",
  },
  effectStill: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  // ---- The dither
  dither: {
    display: "grid",
    // Ranges that do not overlap: one column on a phone, two on a tablet, three beside the label.
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (width >= 40rem) and (width < 64rem)":
        "repeat(2, minmax(0, 1fr))",
      "@media (width >= 64rem)": "repeat(3, minmax(0, 1fr))",
    },
    gridAutoRows: "auto auto",
    columnGap: space["5"],
    rowGap: space["3"],
    width: "100%",
    maxWidth: "64rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  // Each tile spans two rows of the wall's grid and takes them as its own (subgrid): every card in
  // a row is one height, and every caption starts on one line.
  tile: {
    display: "grid",
    gridRow: "span 2",
    gridTemplateRows: "subgrid",
    rowGap: space["3"],
    margin: 0,
    minWidth: 0,
  },
  stage: {
    position: "relative",
    isolation: "isolate",
    display: "grid",
    alignContent: "center",
    justifyItems: "stretch",
    gap: space["2"],
    minHeight: "11rem",
    padding: space["5"],
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.sm,
    overflow: "hidden",
  },
  centred: { justifyItems: "center" },
  // A picture that fills its box keeps the card's padding round it, as the other five do.
  working: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
  short: { width: "60%" },
  long: { width: "82%" },
  tileCaption: { paddingBlockEnd: space["5"] },
  tileName: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  tileWhen: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
  },
});

/** The light's looks side by side, each its still, named with where it is used. */
export const Looks = () => (
  <div {...stylex.props(s.sheet)}>
    {lightLooks.map((each) => (
      <figure key={each.id} {...stylex.props(s.plate)}>
        <img
          src={each.still.replace(/\.jpg$/u, ".small.jpg")}
          alt={each.alt}
          width={640}
          height={400}
          {...stylex.props(s.plateImg)}
        />
        <figcaption>
          <p {...stylex.props(s.plateName)}>{each.name}</p>
          <p {...stylex.props(s.plateWhen)}>{each.when}</p>
        </figcaption>
      </figure>
    ))}
  </div>
);

/** A caption for a drawn effect: its name, where it is used and what it costs. */
const EffectCaption = ({
  name,
  when,
  cost,
}: {
  name: string;
  when: string;
  cost: string;
}) => (
  <div data-looks-card="" {...stylex.props(s.effectCard)}>
    <div {...stylex.props(s.caption)}>
      <p {...stylex.props(s.name)}>{name}</p>
      <p {...stylex.props(s.when)}>{when}</p>
      <p {...stylex.props(s.cost)}>{cost}</p>
    </div>
  </div>
);

/** The website's embers, live; in the book, their still. */
export const EmbersWall = () => {
  const still = useStill();
  return (
    <div data-effect="embers" {...stylex.props(s.effect)}>
      {still ? (
        <img
          src={effectWords.stillEmbers.replace(/\.jpg$/u, ".small.jpg")}
          alt={effectWords.embersAlt}
          width={640}
          height={400}
          {...stylex.props(s.effectStill)}
        />
      ) : (
        <Embers framing={{ reach: 0.5, rise: 0.6, heat: 2.4 }} />
      )}
      <EffectCaption
        name={effectWords.embersName}
        when={effectWords.embersWhen}
        cost={effectWords.embersCost}
      />
    </div>
  );
};

const pixelIcons = [KeyIcon, LockIcon, DatabaseIcon];

/** The website's pixel icons, live; in the book, their still. */
export const PixelIconsWall = () => {
  const still = useStill();
  return (
    <div data-effect="pixel-icons" {...stylex.props(s.effect)}>
      {still ? (
        <img
          src={effectWords.stillPixels.replace(/\.jpg$/u, ".small.jpg")}
          alt={effectWords.pixelsAlt}
          width={640}
          height={400}
          {...stylex.props(s.effectStill)}
        />
      ) : (
        <div {...stylex.props(s.pixelRow)}>
          <PixelIcons icons={pixelIcons} gap={0} />
        </div>
      )}
      <EffectCaption
        name={effectWords.pixelsName}
        when={effectWords.pixelsWhen}
        cost={effectWords.pixelsCost}
      />
    </div>
  );
};

const runs = ditherWords.chartData;

/** The parts of the library that wear the dither, live; each named, with where it is used. */
export const Dither = () => (
  <div {...stylex.props(s.dither)}>
    <figure {...stylex.props(s.tile)}>
      <div {...stylex.props(s.stage)}>
        <Skeleton size="lg" style={s.short} />
        <Skeleton size="sm" />
        <Skeleton size="sm" style={s.long} />
      </div>
      <figcaption {...stylex.props(s.tileCaption)}>
        <p {...stylex.props(s.tileName)}>{ditherWords.skeleton}</p>
        <p {...stylex.props(s.tileWhen)}>{ditherWords.skeletonWhen}</p>
      </figcaption>
    </figure>
    <figure {...stylex.props(s.tile)}>
      <div {...stylex.props(s.stage)}>
        <ChartContainer
          aria-label={ditherWords.chartLabel}
          summary={ditherWords.chartSummary}
          data={runs}
          xKey="day"
          config={{ runs: { label: ditherWords.chartSeries } }}
          height={120}
        >
          <ChartXAxis />
          <ChartBar dataKey="runs" pattern="dither-pixels" />
        </ChartContainer>
      </div>
      <figcaption {...stylex.props(s.tileCaption)}>
        <p {...stylex.props(s.tileName)}>{ditherWords.chart}</p>
        <p {...stylex.props(s.tileWhen)}>{ditherWords.chartWhen}</p>
      </figcaption>
    </figure>
    <figure {...stylex.props(s.tile)}>
      <div {...stylex.props(s.stage)}>
        <Slider
          variant="levels"
          label={ditherWords.levelLabel}
          levels={ditherWords.levels}
          defaultValue="medium"
        />
      </div>
      <figcaption {...stylex.props(s.tileCaption)}>
        <p {...stylex.props(s.tileName)}>{ditherWords.level}</p>
        <p {...stylex.props(s.tileWhen)}>{ditherWords.levelWhen}</p>
      </figcaption>
    </figure>
    <figure {...stylex.props(s.tile)}>
      <div {...stylex.props(s.stage, s.centred)}>
        <span {...stylex.props(s.working)}>
          <AgentIndicator variant="dither" path="wave" />
          <Shimmer>{ditherWords.markLabel}</Shimmer>
        </span>
      </div>
      <figcaption {...stylex.props(s.tileCaption)}>
        <p {...stylex.props(s.tileName)}>{ditherWords.mark}</p>
        <p {...stylex.props(s.tileWhen)}>{ditherWords.markWhen}</p>
      </figcaption>
    </figure>
  </div>
);
