// Theme toggle: a pill track of three segments, a sun, a moon and a screen; the moon is chosen,
// raised out of the track on its own pill, its mark in the accent.
import type { Pen, Tone } from "../pen.ts";

/** An arc as short strokes, from angle a to angle b (radians, clockwise from the right). */
const arc = (
  pen: Pen,
  cx: number,
  cy: number,
  r: number,
  a: number,
  b: number,
  tone: Tone
) => {
  const steps = Math.max(3, Math.round((Math.abs(b - a) * r) / 4));
  for (let index = 0; index < steps; index += 1) {
    const t1 = a + ((b - a) * index) / steps;
    const t2 = a + ((b - a) * (index + 1)) / steps;
    pen.line(
      cx + r * Math.cos(t1),
      cy + r * Math.sin(t1),
      cx + r * Math.cos(t2),
      cy + r * Math.sin(t2),
      tone,
      1
    );
  }
};

const sun = (pen: Pen, cx: number, cy: number) => {
  arc(pen, cx, cy, 6, 0, Math.PI * 2, "pen");
  for (let index = 0; index < 8; index += 1) {
    const t = (index * Math.PI) / 4;
    pen.line(
      cx + 9.5 * Math.cos(t),
      cy + 9.5 * Math.sin(t),
      cx + 13 * Math.cos(t),
      cy + 13 * Math.sin(t),
      "pen",
      1
    );
  }
};

const moon = (pen: Pen, cx: number, cy: number) => {
  // The outer edge the long way round, and the bite: a smaller circle set off to the upper right,
  // drawn only where it lies inside the first. Both meet where the two circles cross.
  const big = 11;
  const small = 9;
  const toward = -Math.PI / 4;
  const apart = 7;
  const along = (big * big - small * small + apart * apart) / (2 * apart);
  const across = Math.sqrt(big * big - along * along);
  const outer = Math.atan2(across, along);
  const inner = Math.atan2(across, apart - along);
  arc(pen, cx, cy, big, toward + outer, toward - outer + Math.PI * 2, "accent");
  const bx = cx + apart * Math.cos(toward);
  const by = cy + apart * Math.sin(toward);
  arc(
    pen,
    bx,
    by,
    small,
    toward + Math.PI - inner,
    toward + Math.PI + inner,
    "accent"
  );
};

const screen = (pen: Pen, cx: number, cy: number) => {
  pen.box(cx - 13, cy - 11, 26, 17, 3);
  pen.line(cx, cy + 6, cx, cy + 11, "pen", 1);
  pen.line(cx - 7, cy + 12, cx + 7, cy + 12, "pen", 1);
};

export const draw = (pen: Pen) => {
  const w = 204;
  const h = 64;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 6;
  pen.fill(x, y, w, h, h / 2, "wash");
  pen.box(x, y, w, h, h / 2, "hair");
  const sw = (w - pad * 2) / 3;
  const sh = h - pad * 2;
  const centres = [0, 1, 2].map((index) => x + pad + sw * index + sw / 2);
  // The chosen segment, dark: its own pill above the track.
  pen.fill(x + pad + sw, y + pad, sw, sh, sh / 2, "sheet");
  pen.box(x + pad + sw, y + pad, sw, sh, sh / 2);
  sun(pen, centres[0] ?? 0, 90);
  moon(pen, centres[1] ?? 0, 90);
  screen(pen, centres[2] ?? 0, 90);
};

export const themeToggle = draw;
