"use client";

import { Button } from "@grasp-os/ui/components/button";
import { ArrowRightIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, media, space } from "@grasp-os/ui/lib/tokens.stylex";
// The exhibits of rooms 05 (Type) and 07 (The visual language): the two faces as a specimen, the
// scale with a real line at each size, a statement with its quiet second half; the library's own
// dithered drawings and the glass door. Every size a token; every word from content.ts.
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";

import markInk from "../../public/brand/grasp-mark-ink.svg?raw";
import { token } from "../blocks/token-data";
import { siteColors } from "../system/site-tokens.stylex";
import { typeScale, typeWords, visualWords } from "./content";
import { useStill } from "./still";

/** A type token's size in pixels, for the specimen's quiet figure. */
const pixels = (name: string) =>
  Math.round(Number.parseFloat(token(name).value) * 16);

const sizeOf = {
  "heading-xl": [font.headingXl, font.headingXlLine],
  "heading-lg": [font.headingLg, font.headingLgLine],
  "heading-md": [font.headingMd, font.headingMdLine],
  "heading-sm": [font.headingSm, font.headingSmLine],
  "text-lg": [font.textLg, font.textLgLine],
  "text-base": [font.textBase, font.textBaseLine],
  "text-sm": [font.textSm, font.textSmLine],
  "text-xs": [font.textXs, font.textXsLine],
} as const;

const s = stylex.create({
  // ---- The faces
  faces: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: { default: space["10"], [media.maxSm]: space["4"] },
    width: "100%",
    maxWidth: "46rem",
    padding: { default: space["10"], [media.maxSm]: space["5"] },
  },
  face: {
    display: "grid",
    gap: space["3"],
    justifyItems: "center",
    margin: 0,
  },
  glyphs: {
    width: "100%",
    height: "auto",
    overflow: "visible",
    fill: colors.brandInk,
  },
  serifGlyph: { fontFamily: font.serif, fontWeight: font.weightNormal },
  sansGlyph: { fontFamily: font.sans, fontWeight: font.weightNormal },
  faceName: {
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.brandPine,
  },
  // ---- The scale
  scale: {
    display: "grid",
    gap: space["4"],
    width: "100%",
    maxWidth: "52rem",
    margin: 0,
    padding: { default: space["10"], [media.maxSm]: space["5"] },
    listStyle: "none",
  },
  rung: {
    display: "grid",
    gridTemplateColumns: "2.5rem minmax(0, 1fr)",
    alignItems: "baseline",
    gap: space["4"],
  },
  figure: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.brandPine,
    fontVariantNumeric: "tabular-nums",
  },
  // One line each where there is room; on a phone the line wraps rather than being cut.
  line: {
    minWidth: 0,
    whiteSpace: { default: "nowrap", [media.maxSm]: "normal" },
    textWrap: "pretty",
    color: colors.brandInk,
  },
  serif: { fontFamily: font.serif, letterSpacing: font.trackingTitle },
  sans: { fontFamily: font.sans },
  size: (size: string, line: string) => ({ fontSize: size, lineHeight: line }),
  // ---- The statement
  statement: {
    margin: 0,
    maxWidth: "18em",
    padding: space["8"],
    fontFamily: font.serif,
    fontWeight: font.weightNormal,
    fontSize: font.headingXl,
    lineHeight: font.headingXlLine,
    letterSpacing: font.trackingTitle,
    color: colors.foreground,
    textWrap: "balance",
  },
  quiet: { color: siteColors.subtleForegroundLarge },
  // ---- Drawn
  sketches: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, 240px)",
      [media.maxMd]: "240px",
    },
    gridAutoRows: "135px",
    gap: { default: space["8"], [media.maxMd]: space["6"] },
    justifyContent: "center",
    padding: space["8"],
  },
  sketch: { position: "relative", width: 240, height: 135 },
  // On a phone three drawings, so the wall's rule is not pushed a screen away.
  sketchWide: { display: { default: "block", [media.maxMd]: "none" } },
  // ---- The dots and the scene
  dots: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  dotsStill: {
    width: { default: "min(62%, 35rem)", [media.maxSm]: "70%" },
    height: "auto",
  },
  dotWhite: { fill: colors.primaryForegroundOnColor },
  dotMint: { fill: colors.brandMint },
});

/** The two faces, drawn large: the serif and Geist. */
export const Faces = () => (
  <div {...stylex.props(s.faces)}>
    {[
      { name: typeWords.serif, glyph: s.serifGlyph },
      { name: typeWords.sans, glyph: s.sansGlyph },
    ].map((face) => (
      <figure key={face.name} {...stylex.props(s.face)}>
        <svg
          viewBox="0 0 100 80"
          role="img"
          aria-label={face.name}
          {...stylex.props(s.glyphs)}
        >
          <text
            x="50"
            y="64"
            textAnchor="middle"
            fontSize="72"
            {...stylex.props(face.glyph)}
          >
            {typeWords.sample}
          </text>
        </svg>
        <figcaption {...stylex.props(s.faceName)}>{face.name}</figcaption>
      </figure>
    ))}
  </div>
);

/** The scale, largest first, each size with a line from the website and its size in pixels. */
export const Scale = () => (
  <ul {...stylex.props(s.scale)}>
    {typeScale.map((rung) => {
      const [size, line] = sizeOf[rung.token as keyof typeof sizeOf];
      return (
        <li key={rung.token} {...stylex.props(s.rung)}>
          <span {...stylex.props(s.figure)}>{pixels(rung.token)}</span>
          <span
            {...stylex.props(
              s.line,
              rung.serif ? s.serif : s.sans,
              s.size(size, line)
            )}
          >
            {rung.line}
          </span>
        </li>
      );
    })}
  </ul>
);

export const ScalePickup = () => (
  <Button variant="outline" size="sm" asChild>
    <a href={typeWords.foundationsHref}>
      {typeWords.foundations}
      <Icon icon={ArrowRightIcon} />
    </a>
  </Button>
);

/** A statement: the lead in full ink, the second half quiet. */
export const LeadAndQuiet = () => (
  <p {...stylex.props(s.statement)}>
    {typeWords.lead} <span {...stylex.props(s.quiet)}>{typeWords.quiet}</span>
  </p>
);

/** The library's own drawings (site/overview/pen.ts), dithered, at their own pixels. */
export const Drawn = ({ sketches }: { sketches: string[] }) => (
  <div {...stylex.props(s.sketches)}>
    {sketches.map((drawing, index) => (
      <div
        key={visualWords.sketches[index] ?? index}
        {...stylex.props(s.sketch, index >= 3 && s.sketchWide)}
        dangerouslySetInnerHTML={{ __html: drawing }}
      />
    ))}
  </div>
);

/**
 * The website's fine square dots (its 404, About's stairs, the Company Brain), here drawing the
 * mark: dots on a 7px grid where the mark is, white with one in nine mint, each brightening and
 * dimming at its own slow pace. Still with reduced motion; drawn only while seen.
 */
/** The mark's own shapes, read from its file. */
const markPaths = [...markInk.matchAll(/ d="([^"]+)"/gu)].map(
  (match) => match[1] ?? ""
);

/** The dots, still, for the one-file book: a 7px grid of dots, one in nine mint, masked by the mark. */
const DotMarkStill = () => (
  <svg
    viewBox="0 0 584 494"
    role="img"
    aria-label={visualWords.dotsLabel}
    {...stylex.props(s.dotsStill)}
  >
    <defs>
      <pattern
        id="brand-dots"
        width="7"
        height="7"
        patternUnits="userSpaceOnUse"
      >
        <rect width="3" height="3" {...stylex.props(s.dotWhite)} />
      </pattern>
      <pattern
        id="brand-dots-mint"
        width="21"
        height="21"
        patternUnits="userSpaceOnUse"
      >
        <rect x="7" y="14" width="3" height="3" {...stylex.props(s.dotMint)} />
      </pattern>
      <mask id="brand-dots-mark">
        <g transform="scale(20)">
          {markPaths.map((d) => (
            <path key={d} d={d} fill="white" />
          ))}
        </g>
      </mask>
    </defs>
    <rect
      width="584"
      height="494"
      fill="url(#brand-dots)"
      mask="url(#brand-dots-mark)"
    />
    <rect
      width="584"
      height="494"
      fill="url(#brand-dots-mint)"
      mask="url(#brand-dots-mark)"
    />
  </svg>
);

export const DotMark = () => {
  const still = useStill();
  if (still) {
    return <DotMarkStill />;
  }
  return <DotMarkLive />;
};

const DotMarkLive = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const css = getComputedStyle(canvas);
    const white = css
      .getPropertyValue("--damsko-primary-foreground-on-color")
      .trim();
    const mint = css.getPropertyValue("--damsko-brand-mint").trim();
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grid = 7;
    let dots: { x: number; y: number; mint: boolean; phase: number }[] = [];
    let width = 0;
    let height = 0;
    const lay = async () => {
      const scale = devicePixelRatio;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const markWidth = Math.min(width * 0.62, 560);
      const markHeight = (markWidth * 24.7) / 29.2;
      const columns = Math.floor(markWidth / grid);
      const rows = Math.floor(markHeight / grid);
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markInk)}`;
      await image.decode();
      const sample = document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true });
      if (!sample) {
        return;
      }
      sample.canvas.width = columns;
      sample.canvas.height = rows;
      sample.drawImage(image, 0, 0, columns, rows);
      const alpha = sample.getImageData(0, 0, columns, rows).data;
      const left = (width - columns * grid) / 2;
      const top = (height - rows * grid) / 2;
      dots = [];
      let count = 0;
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          if ((alpha[(row * columns + column) * 4 + 3] ?? 0) < 128) {
            continue;
          }
          count += 1;
          dots.push({
            x: left + column * grid,
            y: top + row * grid,
            mint: count % 9 === 0,
            phase: ((column * 13 + row * 7) % 31) / 31,
          });
        }
      }
    };
    const draw = (now: number) => {
      context.clearRect(0, 0, width, height);
      for (const dot of dots) {
        const glow = still
          ? 1
          : 0.55 + 0.45 * Math.sin(now / 1400 + dot.phase * Math.PI * 2);
        context.globalAlpha = glow;
        context.fillStyle = dot.mint ? mint : white;
        context.fillRect(dot.x, dot.y, 3, 3);
      }
      context.globalAlpha = 1;
    };
    let frame = 0;
    let visible = false;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (visible) {
        draw(now);
      }
    };
    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting === true;
    });
    const resized = new ResizeObserver(() => {
      void lay().then(() => {
        draw(performance.now());
      });
    });
    seen.observe(canvas);
    resized.observe(canvas);
    if (!still) {
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      resized.disconnect();
    };
  }, []);
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={visualWords.dotsLabel}
      {...stylex.props(s.dots)}
    />
  );
};
