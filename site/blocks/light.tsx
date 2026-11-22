import { CheckIcon, Icon } from "@grasp-os/ui/lib/icons";
import { focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// The light: Grasp's seven stops (paper, lime, sea, mint, pine, ink, night) under reeded glass,
// the signature of the website's opening. The docs show it in exactly two places, both still:
//
//   LightStripView  Colour's first picture: the seven stops as one 136px strip, each stop a button
//                   that copies its value and says "Copied" on itself; on a phone, seven rows
//   LightBandView   Get started's opening: a 200px band of the light, no roll, no pointer
//
// Each stop's words sit at the middle of its seventh, where the gradient is the stop's own
// colour, so they keep their contrast where two stops blend.
import * as stylex from "@stylexjs/stylex";

import { siteColors, siteSize } from "../system/site-tokens.stylex";
import { actionMarker } from "./markers.stylex";
import { partStyles } from "./parts";
import type { TokenEntry } from "./token-data";

/** The stops as a gradient, each at the middle of its seventh, blended in oklch. */
const lightGradient = (way: string, stops: TokenEntry[]) =>
  `linear-gradient(${way} in oklch, ${stops
    .map(
      (stop, index) =>
        `${stop.value} ${(((index + 0.5) / stops.length) * 100).toFixed(2)}%`
    )
    .join(", ")})`;

// By the text column's width, not the window's: inside the shell the sidebar takes room, and seven
// stops across stopped fitting before the window was narrow (site.css makes .site-prose the
// "prose" container).
const narrowColumn = "@container prose (width < 44rem)";
// Narrower still (a phone's column inside the shell): the name above its values, not beside them,
// or a name such as "Paper" got 56px and wrapped.
const thinColumn = "@container prose (width < 22rem)";

// The figures are away from the first frame of a copy until the last of its way back; the words
// that say so are here only between the two crossfades.
const away = ":is([data-action-state], [data-action-shown])";
const here = ':is([data-action-shown]:not([data-action-state="swap"]))';

const styles = stylex.create({
  frame: {
    position: "relative",
    overflow: "hidden",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    isolation: "isolate",
    // The reeds: a ridge every 12px over the light.
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      backgroundImage: siteColors.flutes,
      backgroundSize: siteSize.flutesSize,
      mixBlendMode: "soft-light",
    },
  },
  strip: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(7, minmax(0, 1fr))",
      [narrowColumn]: "minmax(0, 1fr)",
    },
    minHeight: { default: 136, [narrowColumn]: 0 },
    // The space above it is the page's rhythm (site/system/styles/prose.css).
    marginBottom: 0,
    padding: 0,
    listStyle: "none",
  },
  fill: (wide: string, narrow: string) => ({
    backgroundImage: { default: wide, [narrowColumn]: narrow },
  }),
  stop: {
    display: "grid",
    minWidth: 0,
  },
  button: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateRows: { default: "1fr auto", [narrowColumn]: "auto" },
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [narrowColumn]: "minmax(0, 1fr) auto",
      [thinColumn]: "minmax(0, 1fr)",
    },
    justifyItems: { default: "center", [narrowColumn]: "stretch" },
    alignItems: { default: "stretch", [narrowColumn]: "center" },
    gap: space["2"],
    margin: 0,
    paddingBlock: { default: space["4"], [narrowColumn]: space["2"] },
    paddingInline: { default: space["2"], [narrowColumn]: space["4"] },
    minHeight: size.tapTarget,
    textAlign: { default: "center", [narrowColumn]: "start" },
    fontFamily: font.sans,
    color: colors.brandInk,
    backgroundColor: "transparent",
    borderWidth: 0,
    cursor: "copy",
    WebkitTapHighlightColor: "transparent",
    // No press scale here: a stop has no edge of its own inside the one gradient, so a scale only
    // shook its words. The press is answered by the words crossing to "Copied" at once.
    borderRadius: radius.base,
    cornerShape: radius.shape,
  },
  // On the light stops the ring is the light's own ink: the focus green would sit on a green.
  onLight: {
    outlineColor: { default: null, ":focus-visible": colors.brandInk },
  },
  onDark: {
    color: colors.brandPaper,
    // On the dark stops the ring is the mint one a dark ground swaps in.
    outlineColor: { default: null, ":focus-visible": colors.brandMint },
  },
  name: {
    alignSelf: { default: "start", [narrowColumn]: "center" },
    fontFamily: font.serif,
    fontSize: font.headingMd,
    lineHeight: font.headingMdLine,
    letterSpacing: font.trackingTitle,
  },
  values: {
    position: "relative",
    display: "grid",
    justifyItems: {
      default: "center",
      [narrowColumn]: "end",
      [thinColumn]: "start",
    },
    fontFamily: font.mono,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  // The figures and what the copy says share one place: the figures go out, "Copied" comes in
  // there, and back the same way (site/behaviour/copy.ts). Nothing changes size or place: both
  // are always laid out, the one over the other.
  lch: {
    display: "grid",
    // On a phone the stop is a row, so the three values sit side by side.
    gridAutoFlow: { default: "row", [narrowColumn]: "column" },
    columnGap: space["2"],
    justifyItems: { default: "center", [narrowColumn]: "end" },
    opacity: { default: 1, [stylex.when.ancestor(away, actionMarker)]: 0 },
    filter: {
      default: "none",
      [stylex.when.ancestor(away, actionMarker)]: {
        default: size.swapBlur,
        [media.reducedMotion]: "none",
      },
    },
    transform: {
      default: "none",
      [stylex.when.ancestor(away, actionMarker)]: {
        default: `scale(${size.swapScale})`,
        [media.reducedMotion]: "none",
      },
    },
    transitionProperty: "opacity, filter, transform",
    transitionDuration: duration.swap,
    transitionTimingFunction: duration.ease,
  },
  // A little back at rest, full under the pointer. On its own part, so it never argues with the
  // crossfade above (it did: under the pointer the figures stayed and "Copied" lay over them).
  figure: {
    opacity: {
      default: 0.8,
      [stylex.when.ancestor(":hover", actionMarker)]: {
        default: null,
        [media.hover]: 1,
      },
      [stylex.when.ancestor(":focus-visible", actionMarker)]: 1,
    },
    transitionProperty: "opacity",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  letter: {
    opacity: 0.72,
    marginInlineEnd: 4,
  },
  said: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: {
      default: "center",
      [narrowColumn]: "flex-end",
      [thinColumn]: "flex-start",
    },
    fontWeight: font.weightMedium,
    [iconVars.size]: size.iconSm,
    pointerEvents: "none",
    opacity: { default: 0, [stylex.when.ancestor(here, actionMarker)]: 1 },
    filter: {
      default: size.swapBlur,
      [media.reducedMotion]: "none",
      [stylex.when.ancestor(here, actionMarker)]: "none",
    },
    transform: {
      default: `scale(${size.swapScale})`,
      [media.reducedMotion]: "none",
      [stylex.when.ancestor(here, actionMarker)]: "none",
    },
    transitionProperty: "opacity, filter, transform",
    transitionDuration: duration.swap,
    transitionTimingFunction: duration.ease,
  },
  // In the wide strip a stop is narrow, so the longer words take two lines there.
  failed: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-action-shown="failed"]', actionMarker)]:
        "inline",
    },
    whiteSpace: { default: "normal", [narrowColumn]: "nowrap" },
    textAlign: {
      default: "center",
      [narrowColumn]: "end",
      [thinColumn]: "start",
    },
  },
  done: {
    display: {
      default: "inline-flex",
      [stylex.when.ancestor('[data-action-shown="failed"]', actionMarker)]:
        "none",
    },
    alignItems: "center",
    gap: space["1"],
  },
  band: {
    height: 200,
    marginBottom: space["12"],
  },
});

const isDark = (name: string) =>
  ["brand-pine", "brand-ink", "brand-night"].includes(name);
const stopName = (name: string) => {
  const word = name.replace("brand-", "");
  return word.charAt(0).toUpperCase() + word.slice(1);
};
/**
 * "oklch(0.8005 0.1625 165.25)" into its three numbers at one precision: lightness and chroma to
 * three places, hue to two, zeros kept ("0.800" beside "0.432", never "0.8"). What is copied is
 * the token's own value, whole.
 */
const lch = (value: string) =>
  (/oklch\(([^)]+)\)/u.exec(value)?.[1] ?? "")
    .split(/\s+/u)
    .slice(0, 3)
    .map((part, index) => Number(part).toFixed(index === 2 ? 2 : 3));

export function LightStripView({ stops }: { stops: TokenEntry[] }) {
  const root = stylex.props(
    partStyles.block,
    styles.frame,
    styles.strip,
    styles.fill(lightGradient("90deg", stops), lightGradient("180deg", stops))
  );
  return (
    <ol
      aria-label="The seven stops of the light"
      {...root}
      className={`not-prose ${root.className ?? ""}`}
      data-light-strip=""
    >
      {stops.map((stop) => {
        const [l, c, h] = lch(stop.value);
        return (
          <li key={stop.name} {...stylex.props(styles.stop)}>
            <button
              type="button"
              data-copy={stop.value}
              // A stop is a token of the light (light-paper is not the ground paper): it is named
              // by its token, and what it copies is that token's value, read from the tokens.
              data-copy-token={stop.cssVar}
              data-copy-said={`Copied ${stop.cssVar}, ${stop.value}`}
              aria-label={`Copy ${stop.cssVar}, ${stop.value}`}
              title={stop.cssVar}
              {...stylex.props(
                actionMarker,
                styles.button,
                focusRingInset,
                isDark(stop.name) ? styles.onDark : styles.onLight
              )}
            >
              <span {...stylex.props(styles.name)}>{stopName(stop.name)}</span>
              <span {...stylex.props(styles.values)}>
                <span {...stylex.props(styles.lch)}>
                  <span {...stylex.props(styles.figure)}>
                    <span {...stylex.props(styles.letter)}>L</span>
                    {l}
                  </span>
                  <span {...stylex.props(styles.figure)}>
                    <span {...stylex.props(styles.letter)}>C</span>
                    {c}
                  </span>
                  <span {...stylex.props(styles.figure)}>
                    <span {...stylex.props(styles.letter)}>H</span>
                    {h}
                  </span>
                </span>
                <span aria-hidden="true" {...stylex.props(styles.said)}>
                  <span {...stylex.props(styles.done)}>
                    <Icon icon={CheckIcon} />
                    Copied
                  </span>
                  <span {...stylex.props(styles.failed)}>Could not copy</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function LightBandView({ stops }: { stops: TokenEntry[] }) {
  const root = stylex.props(
    styles.frame,
    styles.band,
    styles.fill(lightGradient("90deg", stops), lightGradient("90deg", stops))
  );
  return (
    <div
      aria-hidden="true"
      {...root}
      className={`not-prose site-light-band ${root.className ?? ""}`}
    />
  );
}
