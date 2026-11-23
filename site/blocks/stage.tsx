import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
// A line tab: the ring goes round its words, clear of the open tab's line under them (on the
// whole tab, its corners ran into the line).
import { focusCarrier, focusLabel } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { focusMarker } from "@grasp-os/ui/lib/vars.stylex";
// A stage: where a part is shown live, on the grounds it lives on, with its real source one tab
// away. Rendered on the server (Stage.astro and States.astro give it the example and the
// highlighted source); its tabs and ground switch are wired by site/blocks/blocks.ts.
//
//   bar     "Preview" and "Code" on a hairline as wide as the stage, the open one ink with a 2px
//           mint line that slides to it; at its end the ground (Soft, Paper, Night), the library's
//           own ToggleGroup, words only: the raised toggle says which (F73: ringed dots read as
//           radios, and framed squares as checkboxes, since Soft and Paper sit near the track's fill)
//   box     768 wide (the column), at least 400 tall (320 on a phone), 32px in (20 on a phone),
//           the one corner, an edge drawn as a ring
//   views   the preview or the code, one at a time, each at its own height; on a switch the
//           height eases from one to the other (blocks.ts), at once with reduced motion
//
// A ground is a fill and a color-scheme. The third is always the other scheme from the site's:
// on a light page it is Night (`color-scheme: dark`, the night fill), on a dark page Day
// (`color-scheme: light`, the stage ground's light side), so the part shows exactly what it does
// on the other scheme. In dark, Paper was the dark stage ground and Night the dark page: two of
// three alike. The site's sheet (site/system/styles/blocks.css) sets
// --site-stage-other to light on a dark page, before the first paint and with no script; the box,
// the dot and the word read it. The stored choice stays "night" across a theme change.
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { siteColors } from "../system/site-tokens.stylex";
import { CodeBlock } from "./code";
import { stageMarker } from "./markers.stylex";
import { CopyValue, partStyles } from "./parts";

export const segmentStyles = stylex.create({
  track: {
    display: "inline-flex",
    flexWrap: "nowrap",
    alignItems: "center",
    padding: 2,
    gap: 0,
    backgroundColor: colors.accent,
    // The one corner in the system's squircle, as the library's segmented controls; a segment
    // nests inside it, the track's corner less its 2px of padding.
    borderRadius: radius.base,
    cornerShape: radius.shape,
  },
  segment: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxSizing: "border-box",
    height: { default: 28, [media.maxSm]: 36 },
    margin: 0,
    paddingBlock: 0,
    paddingInline: { default: 10, [media.maxSm]: space["3"] },
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightNormal,
    whiteSpace: "nowrap",
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
      ":is([aria-checked=true])": colors.foreground,
    },
    backgroundColor: {
      default: "transparent",
      ":is([aria-checked=true])": colors.card,
    },
    boxShadow: { default: "none", ":is([aria-checked=true])": shadow.sm },
    // In forced colours the fill and the lift are gone: the chosen one keeps a heavier edge in the
    // system's Highlight, the others a 1px one, so which is chosen still shows.
    borderWidth: {
      default: 0,
      [media.forcedColors]: 1,
      ":is([aria-checked=true])": { default: 0, [media.forcedColors]: 2 },
    },
    borderStyle: "solid",
    borderColor: {
      default: "transparent",
      ":is([aria-checked=true])": {
        default: "transparent",
        [media.forcedColors]: "Highlight",
      },
    },
    borderRadius: `calc(${radius.base} - 2px)`,
    cornerShape: radius.shape,
    cursor: "pointer",
    transform: { default: null, ":active": `scale(${size.buttonPressScale})` },
    transitionProperty: "color, background-color, box-shadow, transform",
    transitionDuration: `${duration.hover}, ${duration.hover}, ${duration.hover}, ${duration.press}`,
    transitionTimingFunction: duration.ease,
    // A finger needs 44px; the segment stays as it looks.
    "::before": {
      content: '""',
      position: "absolute",
      insetInline: 0,
      insetBlock: { default: 0, [media.pointerCoarse]: -4 },
    },
  },
});

const styles = stylex.create({
  stage: {
    display: "grid",
    minWidth: 0,
    margin: 0,
    marginTop: space["6"],
    // Never the browser's scroll anchor: opening a field's list in a stage (a Combobox at 320px)
    // made the browser re-anchor the page by 102px, carrying the field and its list off the screen.
    overflowAnchor: "none",
  },
  bar: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    columnGap: space["4"],
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
  },
  tabs: {
    position: "relative",
    display: "flex",
    gap: space["5"],
  },
  tab: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    margin: 0,
    paddingTop: space["2"],
    paddingBottom: 10,
    paddingInline: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightNormal,
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
      ":is([aria-selected=true])": colors.foreground,
    },
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "none",
    cursor: "pointer",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    transitionProperty: "color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
    // A finger needs 44px.
    "::before": {
      content: '""',
      position: "absolute",
      insetInline: -6,
      insetBlock: { default: 0, [media.pointerCoarse]: -3 },
    },
    // Without script (and in forced colours) the open tab draws its own line.
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: 0,
      bottom: 0,
      height: 2,
      borderRadius: 2,
      backgroundColor: {
        default: "transparent",
        ":is([aria-selected=true])": {
          default: colors.mint,
          [stylex.when.ancestor("[data-tabs-ready]", stageMarker)]:
            "transparent",
          [media.forcedColors]: "CanvasText",
        },
      },
    },
  },
  // The open tab's line, one element that glides to the tab chosen, stretching as it goes (its place
  // and its motion are set by script: site/blocks/glide.ts, as Tabs' line).
  line: {
    position: "absolute",
    // Physical on purpose: the script places it by the tab's offsetLeft, which is measured from the
    // left in either direction. From the inline start, right to left it stood past the stage's edge.
    left: 0,
    bottom: 0,
    width: 0,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.mint,
    opacity: {
      default: 0,
      [stylex.when.ancestor("[data-tabs-ready]", stageMarker)]: 1,
    },
    pointerEvents: "none",
  },
  // The ground at the bar's end, level with the tabs' words. One group per ground, each drawn with
  // its own ground pressed; the stage's ground (set before the first paint by groundInit, and by
  // blocks.ts on a choice) shows the one that matches, so the pressed toggle is right with no script.
  grounds: {
    display: "flex",
    alignSelf: "center",
    marginBlockEnd: space["1"],
  },
  groundSetSoft: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-ground="soft"]', stageMarker)]: "flex",
    },
  },
  groundSetPaper: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-ground="paper"]', stageMarker)]: "flex",
    },
  },
  groundSetNight: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-ground="night"]', stageMarker)]: "flex",
    },
  },
  // The third ground's two words, one shown per theme (the hidden one out of the accessible name).
  wordNight: { display: "var(--site-stage-night-word, inline)" },
  wordDay: { display: "var(--site-stage-day-word, none)" },
  views: {
    display: "grid",
    minWidth: 0,
    marginTop: space["4"],
  },
  panel: {
    position: "relative",
    gridArea: "1 / 1",
    minWidth: 0,
  },
  // One view at a time, each at its own height: the code box fits its code, so the stage is as
  // tall as what it shows. Only the stage's own height changes when the tab does.
  shownWhenPreview: {
    display: {
      default: "block",
      [stylex.when.ancestor('[data-view="code"]', stageMarker)]: "none",
    },
  },
  shownWhenCode: {
    display: {
      default: "none",
      [stylex.when.ancestor('[data-view="code"]', stageMarker)]: "block",
    },
  },
  box: {
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    gap: space["3"],
    height: "100%",
    // As tall as what it shows, with even room above and below (a row of
    // buttons in 400px of grey made the page long). A least height only for something tiny.
    minHeight: `calc(3 * ${space["16"]})`,
    padding: { default: space["8"], [media.maxSm]: space["5"] },
    color: colors.bodyForeground,
    colorScheme: {
      default: "inherit",
      [stylex.when.ancestor('[data-ground="paper"]', stageMarker)]: "inherit",
      [stylex.when.ancestor('[data-ground="night"]', stageMarker)]:
        "var(--site-stage-other, dark)",
    },
    // Paper is the soft stage ground (stage-ground), so white controls read by their fill.
    backgroundColor: {
      default: siteColors.stageBg,
      [stylex.when.ancestor('[data-ground="soft"]', stageMarker)]: colors.muted,
      // The other scheme's ground: night when the box is dark, the stage ground when it is light.
      [stylex.when.ancestor('[data-ground="night"]', stageMarker)]:
        `light-dark(${siteColors.stageBg}, ${colors.brandNight})`,
    },
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    transitionProperty: "background-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // A preview that fills the box's width (the states row).
  wide: {
    alignItems: "stretch",
  },
  // "Also add" under the code: one quiet sentence and the command, in the code view only.
  alsoAdd: {
    display: "grid",
    justifyItems: "start",
    gap: space["2"],
    marginTop: space["3"],
    minWidth: 0,
  },
  alsoAddWords: {
    margin: 0,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
  foot: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
    marginTop: space["5"],
  },
});

export interface StageViewProps {
  /** Unique on the page and the same on every build: names the tabs and panels. */
  id: string;
  /** The section it shows, for the tabs' accessible name ("Variants"). */
  label: string;
  /** The example's real source, already highlighted (the inside of Shiki's <code>). */
  codeHtml: string;
  /** The example's file, for the code's name. */
  file: string;
  /** The preview fills the box's width (a row of cells). */
  wide?: boolean;
  /** What stands under the stage (the states row's variant switch). */
  foot?: ReactNode;
  /**
   * An example an agent may operate, through the page's agent bridge (site/behaviour/agent.ts).
   * Without it the stage is a specimen and the bridge does not see it (`data-agent-hidden`), so
   * the same button drawn in five states never makes a name an agent cannot tell apart.
   */
  live?: boolean;
  /** The live example. */
  children: ReactNode;
  /**
   * On a component page, what the example imports that the page's install line does not bring
   * (site/lib/install-extra.ts): shown under the code with the command that adds it.
   */
  alsoAdd?: { items: string[]; command: string };
}

// Soft first and by default: the ground most parts live on.
// The third keeps the id "night" whatever the theme, so a remembered choice holds across a theme
// change (groundInit in site/system/head-scripts.ts reads it before the first paint).
const grounds = [
  { id: "soft", label: <>Soft</>, set: styles.groundSetSoft },
  { id: "paper", label: <>Paper</>, set: styles.groundSetPaper },
  {
    id: "night",
    label: (
      <>
        <span data-ground-word="night" {...stylex.props(styles.wordNight)}>
          Night
        </span>
        <span data-ground-word="day" {...stylex.props(styles.wordDay)}>
          Day
        </span>
      </>
    ),
    set: styles.groundSetNight,
  },
];

/**
 * The ground, three times: one ToggleGroup for each ground, drawn with that ground pressed; the
 * stage's ground shows the matching one (see `grounds` in the styles). A choice is wired by
 * site/blocks/blocks.ts, which sets the stage's ground and keeps the focus on the same toggle.
 */
function GroundPicker() {
  return (
    <div data-stage-grounds="" {...stylex.props(styles.grounds)}>
      {grounds.map((shown) => (
        <div
          key={shown.id}
          data-ground-set={shown.id}
          {...stylex.props(shown.set)}
        >
          <ToggleGroup aria-label="Ground" size="xs" value={[shown.id]}>
            {grounds.map((option) => (
              <ToggleGroupItem
                key={option.id}
                value={option.id}
                data-ground-choice={option.id}
                tabIndex={option.id === shown.id ? 0 : -1}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ))}
    </div>
  );
}

export function StageView({
  id,
  label,
  codeHtml,
  file,
  wide = false,
  foot,
  live = false,
  children,
  alsoAdd,
}: StageViewProps) {
  const root = stylex.props(stageMarker, partStyles.block, styles.stage);
  return (
    <figure
      {...root}
      className={`not-prose site-stage ${root.className ?? ""}`}
      data-stage=""
      data-live={live ? "" : undefined}
      data-agent-hidden={live ? undefined : ""}
      data-view="preview"
      data-ground="soft"
    >
      <div {...stylex.props(styles.bar)}>
        <div
          role="tablist"
          aria-label={`${label}: preview or code`}
          {...stylex.props(styles.tabs)}
        >
          <button
            type="button"
            role="tab"
            id={`${id}-preview-tab`}
            aria-controls={`${id}-preview`}
            aria-selected="true"
            tabIndex={0}
            data-stage-tab="preview"
            {...stylex.props(styles.tab, focusMarker, focusCarrier)}
          >
            <span {...stylex.props(focusLabel)}>Preview</span>
          </button>
          <button
            type="button"
            role="tab"
            id={`${id}-code-tab`}
            aria-controls={`${id}-code`}
            aria-selected="false"
            tabIndex={-1}
            data-stage-tab="code"
            {...stylex.props(styles.tab, focusMarker, focusCarrier)}
          >
            <span {...stylex.props(focusLabel)}>Code</span>
          </button>
          <span
            aria-hidden="true"
            data-tab-line=""
            {...stylex.props(styles.line)}
          />
        </div>
        <GroundPicker />
      </div>
      <div data-stage-views="" {...stylex.props(styles.views)}>
        <div
          role="tabpanel"
          id={`${id}-preview`}
          aria-labelledby={`${id}-preview-tab`}
          data-stage-preview=""
          {...stylex.props(styles.panel, styles.shownWhenPreview)}
        >
          <div
            data-stage-box=""
            {...stylex.props(styles.box, wide && styles.wide)}
          >
            {children}
          </div>
        </div>
        <div
          role="tabpanel"
          id={`${id}-code`}
          aria-labelledby={`${id}-code-tab`}
          {...stylex.props(styles.panel, styles.shownWhenCode)}
        >
          <CodeBlock
            html={codeHtml}
            language={file}
            inStage
            said={`Copied the code of ${label}`}
          />
          {alsoAdd && (
            <div data-also-add="" {...stylex.props(styles.alsoAdd)}>
              <p {...stylex.props(styles.alsoAddWords)}>
                This example also uses {alsoAdd.items.join(", ")}, which the
                install line above does not bring:
              </p>
              <CopyValue
                value={alsoAdd.command}
                label="Copy the command that adds them"
                said="Copied the command"
                size="default"
              />
            </div>
          )}
        </div>
      </div>
      {foot && <div {...stylex.props(styles.foot)}>{foot}</div>}
    </figure>
  );
}
