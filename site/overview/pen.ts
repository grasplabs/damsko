// The pen: it draws a component for its tile on the overview, as a clean, minimal picture. It runs
// at build time and returns inline SVG as a string: no drawing library and no script in the
// browser, and the same drawing on every build.
//
// How it draws: exact geometry. Every edge sits on a whole pixel, every line is one pixel, every
// corner is a true round, and the one texture is the system's own dither (the 4×4 Bayer matrix and
// the fine "dots" the charts use, src/lib/utils.ts): 1px dots on a 3px pitch.
//
// To keep that exact, a drawing is never stretched to its tile. It is shown at one of two fixed
// sizes (pen.css): SCALE.wide of the sheet, or SCALE.narrow where tiles are small (a phone). Each
// drawing is made once for each size and written in that size's own pixels: its SVG's viewBox is
// its size on the page, so one unit is one pixel and no browser scales or rounds anything. (A
// drawing in sheet units, scaled by its viewBox, left WebKit to round each dot of the dither up
// to two pixels.) The page shows the one that fits.
//
// The drawing language, one for every tile (follow it for each new drawing):
//
//   The sheet    one viewBox for every tile, SHEET.w by SHEET.h (16:9). The component sits centred
//                inside FIELD (the sheet less its margins) and fills about the same share of it as
//                the others: a lone control is drawn larger, a busy one smaller.
//   Lines        one tone for every outline ("pen"), one pixel everywhere. A lighter line ("hair",
//                the hairline token) for dividers inside a part.
//   Fills        a surface (a card, a menu, a field) is filled with the raised ground ("sheet").
//   Dither       the texture. A chosen, hovered or shaded part is dithered ("wash", or `dither` at
//                a level from 1 to 15); light that falls off is a `fade` from one level to another.
//                In the pen's tone, or the accent's.
//   Text         bars, never words: a darker bar for a title or a value ("title"), a lighter one
//                for body text ("body"). Bar ends are round.
//   The accent   one colour for the one part that matters: the primary button's fill
//                ("accent-fill", the action fill), a chosen cell's ring or a tick ("accent", mint).
//   Layers       a dialog, popover, menu, tooltip or open list is drawn open and whole, never cut
//                by the sheet.
//   Few parts    leave out what does not say what the component is.
//
// These drawings are an agreed exception to "nothing drawn by hand", which is for the icons and
// glyphs inside components. They belong to the overview's tiles only; never use them elsewhere.
// Each SVG is decoration (aria-hidden, not focusable): the tile's name carries the meaning.
import {
  BAYER_MATRIX as BAYER,
  DITHER_GEOMETRY as GEOMETRY,
  DITHER_LEVELS as LEVELS,
} from "@grasp-os/ui/lib/utils";

/** The sheet every drawing is made on: one size for all, 16:9. */
export const SHEET = { w: 320, h: 180 } as const;

/** Where a drawing may sit: the sheet less its margins. Centre the component in it. */
export const FIELD = { x: 36, y: 22, w: 248, h: 136 } as const;

/** How large a drawing is shown, as a share of the sheet: 240×135 wide, 160×90 narrow. */
export const SCALE = { wide: 0.75, narrow: 0.5 } as const;

/** The tones a mark can take (pen.css maps each to a token). */
export type Tone =
  | "pen"
  | "hair"
  | "accent"
  | "title"
  | "body"
  | "on-accent"
  | "sheet"
  | "wash"
  | "accent-fill";

/** The two tones a dither's dots can take. */
export type DitherTone = "ink" | "accent";

/** The level "wash" is dithered at: light, so a hovered row or a header band stays quiet. */
const WASH = 5;

/** A seed from a name (FNV-1a), so each drawing's own small choices never change between builds. */
const seedOf = (name: string) => {
  let hash = 2_166_136_261;
  for (const char of name) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619) >>> 0;
  }
  return hash;
};

export interface Fade {
  /** The level it starts at, 0 to 16, at the side `to` names the far end of. */
  from: number;
  /** The level it ends at. */
  to: number;
  /** Which way it runs from `from` to `to`. Down, unless given. */
  dir?: "down" | "up" | "right" | "left";
  /** The dots' tone. The pen's, unless given. */
  tone?: DitherTone;
  /** The corner the whole fade is cut to. */
  r?: number;
}

export interface Pen {
  /** A line, one pixel. Level and upright lines sit on whole pixels. */
  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    tone?: Tone,
    passes?: number
  ): void;
  /** A rounded outline, one pixel, inside the shape's edge. */
  box(x: number, y: number, w: number, h: number, r: number, tone?: Tone): void;
  /** A rounded shape filled. "wash" is a light dither. */
  fill(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    tone: Tone,
    shift?: number
  ): void;
  /** A rounded shape dithered at one level, 1 (sparse) to 15 (dense). */
  dither(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    level: number,
    tone?: DitherTone
  ): void;
  /** A shape whose dither thins from one level to another: light falling off, a shade, a glow. */
  fade(x: number, y: number, w: number, h: number, fade: Fade): void;
  /** Text as a bar: from x, centred on y, w long, with round ends. */
  bar(
    x: number,
    y: number,
    w: number,
    tone: "title" | "body" | "accent" | "on-accent",
    thickness?: number
  ): void;
  /** A chevron pointing down, centred on (cx, cy). */
  chevron(
    cx: number,
    cy: number,
    size: number,
    tone?: Tone,
    up?: boolean
  ): void;
  /** A small x, centred on (cx, cy). */
  cross(cx: number, cy: number, size: number, tone?: Tone): void;
  /** A tick, centred on (cx, cy). */
  tick(cx: number, cy: number, size: number, tone?: Tone): void;
  /** A pointer's arrow, filled, its tip at (x, y): someone at work in the picture. */
  cursor(x: number, y: number, tone?: "pen" | "accent" | "accent-fill"): void;
  /** A seeded number from 0 to 1, for the drawing's own small choices (a bar's length). */
  random(): number;
}

/** Every dither a drawing has asked for, as "ink-3": the page draws a pattern for each (ditherDefs). */
const used = new Set<string>();

const ditherClass = (tone: DitherTone, level: number) => {
  const whole = Math.max(1, Math.min(LEVELS - 1, Math.round(level)));
  used.add(`${tone}-${whole}`);
  return `sk-d-${tone}-${whole}`;
};

/** Draws one component at one size and returns its SVG, decorative and still. */
const render = (
  name: string,
  draw: (pen: Pen) => void,
  size: keyof typeof SCALE
): string => {
  const scale = SCALE[size];
  // Every number written into the SVG, in this size's pixels: a drawing is made in sheet units
  // and written out a pixel to a unit.
  const n = (value: number) => String(Number((value * scale).toFixed(2)));
  /** One pixel and half a pixel of this size, in sheet units. */
  const PX = 1 / scale;
  const HALF = PX / 2;
  /** To a whole pixel of this size. */
  const snap = (value: number) => Math.round(value * scale) / scale;
  let state = seedOf(name);
  const random = () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return state / 4_294_967_296;
  };
  // Fills, then bars, then lines over them: each kind in the order it was drawn.
  const fills: string[] = [];
  const bars: string[] = [];
  const lines: string[] = [];
  const clips: string[] = [];

  const rect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    classes: string
  ) =>
    `<rect class="${classes}" x="${n(x)}" y="${n(y)}" width="${n(Math.max(w, 0))}" height="${n(Math.max(h, 0))}"${r > 0 ? ` rx="${n(Math.min(r, w / 2, h / 2))}"` : ""}/>`;

  /** A shape's edges on whole pixels. */
  const edges = (x: number, y: number, w: number, h: number) => {
    const left = snap(x);
    const top = snap(y);
    return {
      x: left,
      y: top,
      w: Math.max(snap(x + w) - left, PX),
      h: Math.max(snap(y + h) - top, PX),
    };
  };

  const line: Pen["line"] = (x1, y1, x2, y2, tone = "pen") => {
    let [ax, ay, bx, by] = [x1, y1, x2, y2];
    if (Math.abs(y1 - y2) < 0.01) {
      // Level: on a whole pixel row, its ends on whole pixels.
      ay = by = snap(y1) + HALF;
      [ax, bx] = [snap(x1), snap(x2)];
    } else if (Math.abs(x1 - x2) < 0.01) {
      ax = bx = snap(x1) + HALF;
      [ay, by] = [snap(y1), snap(y2)];
    }
    lines.push(
      `<path class="sk-l sk-${tone}" d="M${n(ax)} ${n(ay)}L${n(bx)} ${n(by)}"/>`
    );
  };

  const box: Pen["box"] = (x, y, w, h, r, tone = "pen") => {
    const at = edges(x, y, w, h);
    lines.push(
      rect(
        at.x + HALF,
        at.y + HALF,
        at.w - PX,
        at.h - PX,
        Math.max(r - HALF, 0),
        `sk-l sk-${tone}`
      )
    );
  };

  const dither: Pen["dither"] = (x, y, w, h, r, level, tone = "ink") => {
    const at = edges(x, y, w, h);
    fills.push(
      rect(at.x, at.y, at.w, at.h, r, `sk-f ${ditherClass(tone, level)}`)
    );
  };

  const fill: Pen["fill"] = (x, y, w, h, r, tone) => {
    if (tone === "wash") {
      // A part too slight to hold the dither (a thin track, a small dot or chip) would show a few
      // stray dots: it takes a flat tint.
      const small = Math.min(w, h) * scale;
      const large = Math.max(w, h) * scale;
      if (small < 2 * GEOMETRY.dots.pitch + 1 || (small < 14 && large < 22)) {
        const slight = edges(x, y, w, h);
        fills.push(
          rect(slight.x, slight.y, slight.w, slight.h, r, "sk-f sk-tint")
        );
        return;
      }
      dither(x, y, w, h, r, WASH);
      return;
    }
    const at = edges(x, y, w, h);
    fills.push(rect(at.x, at.y, at.w, at.h, r, `sk-f sk-${tone}`));
  };

  const fade: Pen["fade"] = (
    x,
    y,
    w,
    h,
    { from, to, dir = "down", tone = "ink", r = 0 }
  ) => {
    const at = edges(x, y, w, h);
    const upright = dir === "down" || dir === "up";
    const length = upright ? at.h : at.w;
    // One band per level, each two rows of dots deep or more, and cut on the dither's own rows
    // (counted from the sheet's corner, as the patterns are), so no row of dots is ever split.
    const row = GEOMETRY.dots.pitch * PX;
    const start = upright ? at.y : at.x;
    const cuts = [start];
    for (
      let cut = (Math.floor(start / (2 * row)) + 1) * 2 * row;
      cut < start + length - row;
      cut += 2 * row
    ) {
      if (cut - start >= row) {
        cuts.push(cut);
      }
    }
    cuts.push(start + length);
    const steps = cuts.length - 1;
    const forwards = dir === "down" || dir === "right";
    const bands: string[] = [];
    for (let step = 0; step < steps; step += 1) {
      const along = forwards ? step : steps - 1 - step;
      const level = Math.round(
        from + ((to - from) * along) / Math.max(steps - 1, 1)
      );
      if (level < 1) {
        continue;
      }
      const [near = 0, far = 0] = [cuts[step], cuts[step + 1]];
      const classes = `sk-f ${ditherClass(tone, level)}`;
      bands.push(
        upright
          ? rect(at.x, near, at.w, far - near, 0, classes)
          : rect(near, at.y, far - near, at.h, 0, classes)
      );
    }
    if (r > 0) {
      const id = `sk-clip-${name}-${size}-${clips.length}`;
      clips.push(
        `<clipPath id="${id}">${rect(at.x, at.y, at.w, at.h, r, "sk-clip")}</clipPath>`
      );
      fills.push(`<g clip-path="url(#${id})">${bands.join("")}</g>`);
    } else {
      fills.push(bands.join(""));
    }
  };

  const bar: Pen["bar"] = (x, y, w, tone, thickness = 6) => {
    const deep = Math.max(snap(thickness), 2 * PX);
    const left = snap(x);
    const long = Math.max(snap(x + w) - left, deep);
    bars.push(
      rect(left, snap(y - deep / 2), long, deep, deep / 2, `sk-b sk-${tone}`)
    );
  };

  const path = (points: [number, number][], tone: Tone) => {
    lines.push(
      `<path class="sk-l sk-${tone}" d="${points.map(([px, py], index) => `${index === 0 ? "M" : "L"}${n(px)} ${n(py)}`).join("")}"/>`
    );
  };

  const chevron: Pen["chevron"] = (cx, cy, size, tone = "pen", up = false) => {
    const dy = (up ? -1 : 1) * size * 0.5;
    path(
      [
        [cx - size, cy - dy],
        [cx, cy + dy],
        [cx + size, cy - dy],
      ],
      tone
    );
  };

  const cross: Pen["cross"] = (cx, cy, size, tone = "pen") => {
    lines.push(
      `<path class="sk-l sk-${tone}" d="M${n(cx - size)} ${n(cy - size)}L${n(cx + size)} ${n(cy + size)}M${n(cx + size)} ${n(cy - size)}L${n(cx - size)} ${n(cy + size)}"/>`
    );
  };

  const tick: Pen["tick"] = (cx, cy, size, tone = "pen") => {
    path(
      [
        [cx - size, cy],
        [cx - size * 0.3, cy + size * 0.7],
        [cx + size, cy - size * 0.8],
      ],
      tone
    );
  };

  // The arrow's outline from its tip, in sheet units: the usual pointer, tail to the lower right.
  const ARROW: [number, number][] = [
    [0, 0],
    [0, 17],
    [4.5, 13],
    [7.5, 20],
    [10.5, 18.5],
    [7.5, 12],
    [13, 12],
  ];
  const cursor: Pen["cursor"] = (x, y, tone = "pen") => {
    const [tx, ty] = [snap(x), snap(y)];
    // Over the fills and the bars, with the lines: a pointer is always on top.
    lines.push(
      `<path class="sk-f sk-${tone}" d="${ARROW.map(([px, py], index) => `${index === 0 ? "M" : "L"}${n(tx + px)} ${n(ty + py)}`).join("")}Z"/>`
    );
  };

  draw({
    line,
    box,
    fill,
    dither,
    fade,
    bar,
    chevron,
    cross,
    tick,
    cursor,
    random,
  });

  const defs = clips.length > 0 ? `<defs>${clips.join("")}</defs>` : "";
  return `<svg class="sketch sketch-${size}" viewBox="0 0 ${SHEET.w * scale} ${SHEET.h * scale}" aria-hidden="true" focusable="false">${defs}${fills.join("")}${bars.join("")}${lines.join("")}</svg>`;
};

/** A component's drawing, once for each size it is shown at; pen.css shows the one that fits. */
export const sketch = (name: string, draw: (pen: Pen) => void): string =>
  `${render(name, draw, "wide")}${render(name, draw, "narrow")}`;

/** One level's pattern, in pixels: the lit cells of the Bayer matrix, each a 1px square on a 3px pitch. */
const pattern = (id: string, tone: DitherTone, level: number) => {
  const { pitch, square } = GEOMETRY.dots;
  const offset = (pitch - square) / 2;
  const tile = pitch * BAYER.length;
  const cells = BAYER.flatMap((row, y) =>
    row.flatMap((threshold, x) =>
      threshold < level
        ? [
            `<rect x="${x * pitch + offset}" y="${y * pitch + offset}" width="${square}" height="${square}"/>`,
          ]
        : []
    )
  ).join("");
  return `<pattern id="${id}" class="sk-dots sk-dots-${tone}" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">${cells}</pattern>`;
};

/**
 * The patterns for every dither the drawings used, and the rules that fill with them: once per
 * page, after every drawing is made. A drawing's units are pixels at either size, so one pattern
 * a level serves both: whole pixels by construction.
 */
export const ditherDefs = (): string => {
  const keys = [...used].sort();
  const patterns: string[] = [];
  const rules: string[] = [];
  for (const key of keys) {
    const [tone = "ink", level = "1"] = key.split("-") as [DitherTone, string];
    patterns.push(pattern(`sk-${key}`, tone, Number(level)));
    rules.push(`.sk-d-${key}{fill:url(#sk-${key})}`);
  }
  return `<svg class="sketch-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>${patterns.join("")}</defs></svg><style>${rules.join("")}</style>`;
};
