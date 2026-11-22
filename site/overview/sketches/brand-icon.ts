// Brand icon: a set of six rounded tiles, each holding a plain made-up mark built from the pen's
// shapes (no real logo, no letter); the first mark, a solid circle, is the accent.
import type { Pen } from "../pen.ts";

export const brandIcons = (pen: Pen) => {
  const s = 50;
  const gap = 12;
  const columns = 3;
  const w = columns * s + (columns - 1) * gap;
  const h = 2 * s + gap;
  const x0 = 160 - w / 2;
  const y0 = 90 - h / 2;
  const marks: ((cx: number, cy: number) => void)[] = [
    // A solid circle.
    (cx, cy) => {
      pen.fill(cx - 11, cy - 11, 22, 22, 11, "accent-fill", 0.6);
      pen.box(cx - 11, cy - 11, 22, 22, 11, "accent");
    },
    // A triangle.
    (cx, cy) => {
      pen.line(cx, cy - 11, cx + 12, cy + 9, "pen", 1);
      pen.line(cx + 12, cy + 9, cx - 12, cy + 9, "pen", 1);
      pen.line(cx - 12, cy + 9, cx, cy - 11, "pen", 1);
    },
    // Three rising strokes.
    (cx, cy) => {
      pen.line(cx - 8, cy + 10, cx - 8, cy + 2, "pen", 1);
      pen.line(cx, cy + 10, cx, cy - 4, "pen", 1);
      pen.line(cx + 8, cy + 10, cx + 8, cy - 10, "pen", 1);
    },
    // A diamond.
    (cx, cy) => {
      pen.line(cx, cy - 12, cx + 12, cy, "pen", 1);
      pen.line(cx + 12, cy, cx, cy + 12, "pen", 1);
      pen.line(cx, cy + 12, cx - 12, cy, "pen", 1);
      pen.line(cx - 12, cy, cx, cy - 12, "pen", 1);
    },
    // Two rings, one inside the other.
    (cx, cy) => {
      pen.box(cx - 12, cy - 12, 24, 24, 12);
      pen.fill(cx - 5, cy - 5, 10, 10, 5, "wash");
      pen.box(cx - 5, cy - 5, 10, 10, 5);
    },
    // Two circles that overlap.
    (cx, cy) => {
      pen.box(cx - 15, cy - 9, 18, 18, 9);
      pen.box(cx - 3, cy - 9, 18, 18, 9);
    },
  ];
  for (const [index, mark] of marks.entries()) {
    const tx = x0 + (index % columns) * (s + gap);
    const ty = y0 + Math.floor(index / columns) * (s + gap);
    pen.fill(tx, ty, s, s, 12, "sheet");
    pen.box(tx, ty, s, s, 12);
    mark(tx + s / 2, ty + s / 2);
  }
};

export const draw = brandIcons;
