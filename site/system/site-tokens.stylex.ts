// The docs site's own tokens for StyleX: each names its CSS variable in
// site/system/styles/tokens.css, which every page of the site loads. Constants, as the library's
// (src/lib/tokens.stylex.ts): the variables already exist, so StyleX inlines `var(--…)`.
import * as stylex from "@stylexjs/stylex";

export const siteColors = stylex.defineConsts({
  stageBg: "var(--stage-bg)",
  flutes: "var(--flutes)",
  frameUnderline: "var(--frame-underline)",
  frameScrim: "var(--frame-scrim)",
  subtleForegroundLarge: "var(--subtle-foreground-large)",
  chipRing: "var(--chip-ring)",
  hallDitherLit: "var(--hall-dither-lit)",
  hallDitherMask: "var(--hall-dither-mask)",
  showcaseGroundLit: "var(--showcase-ground-lit)",
  showcaseGroundMask: "var(--showcase-ground-mask)",
  buildBlock: "var(--build-block)",
  buildDot: "var(--build-dot)",
  buildDetail: "var(--build-detail)",
  buildGrid: "var(--build-grid)",
  buildOutline: "var(--build-outline)",
  buildOnCursor: "var(--build-on-cursor)",
});

/** App building's sketches on the home page (site/start/app-building/). */
export const siteBuild = stylex.defineConsts({
  beat: "var(--build-beat)",
  minHeight: "var(--build-min-height)",
  dither: "var(--build-dither)",
});

export const siteSize = stylex.defineConsts({
  frameHeader: "var(--frame-header)",
  frameColumn: "var(--frame-column)",
  frameRail: "var(--frame-rail)",
  frameMeasure: "var(--frame-measure)",
  frameMark: "var(--frame-mark)",
  frameDot: "var(--frame-dot)",
  stageMin: "var(--stage-min)",
  flutesSize: "var(--flutes-size)",
  trackingTag: "var(--tracking-tag)",
});
