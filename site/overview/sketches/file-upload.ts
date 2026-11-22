// File upload: a dashed place to drop files with an arrow up in the accent and its two lines of
// words, and under it one chosen file with its x.
import type { Pen } from "../pen.ts";

/** A dashed rounded outline, from short strokes of the pen; each corner cut by one short line. */
const dashed = (
  pen: Pen,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const dash = 6;
  const gap = 5;
  const run = (ax: number, ay: number, bx: number, by: number) => {
    const length = Math.hypot(bx - ax, by - ay);
    const count = Math.floor((length + gap) / (dash + gap));
    const spare = (length - (count * (dash + gap) - gap)) / 2;
    const ux = (bx - ax) / length;
    const uy = (by - ay) / length;
    for (let index = 0; index < count; index += 1) {
      const start = spare + index * (dash + gap);
      pen.line(
        ax + ux * start,
        ay + uy * start,
        ax + ux * (start + dash),
        ay + uy * (start + dash),
        "pen",
        1
      );
    }
  };
  run(x + r, y, x + w - r, y);
  run(x + w, y + r, x + w, y + h - r);
  run(x + w - r, y + h, x + r, y + h);
  run(x, y + h - r, x, y + r);
  const c = r * 0.3;
  pen.line(x + c, y + r - c * 1.4, x + r - c * 1.4, y + c, "pen", 1);
  pen.line(x + w - r + c * 1.4, y + c, x + w - c, y + r - c * 1.4, "pen", 1);
  pen.line(
    x + w - c,
    y + h - r + c * 1.4,
    x + w - r + c * 1.4,
    y + h - c,
    "pen",
    1
  );
  pen.line(x + r - c * 1.4, y + h - c, x + c, y + h - r + c * 1.4, "pen", 1);
};

export const draw = (pen: Pen) => {
  const w = 216;
  const dh = 78;
  const fh = 28;
  const gap = 8;
  const total = dh + gap + fh;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  pen.fill(x, y, w, dh, 12, "wash");
  dashed(pen, x, y, w, dh, 12);
  // The arrow up.
  const ax = 160;
  pen.line(ax, y + 30, ax, y + 14, "accent", 1);
  pen.line(ax - 6, y + 20, ax, y + 14, "accent", 1);
  pen.line(ax, y + 14, ax + 6, y + 20, "accent", 1);
  pen.bar(160 - 46, y + 46, 92, "title");
  pen.bar(160 - 32, y + 60, 64, "body", 5);
  // One chosen file.
  const fy = y + dh + gap;
  pen.fill(x, fy, w, fh, 8, "sheet");
  pen.box(x, fy, w, fh, 8);
  pen.box(x + 10, fy + 7, 11, 14, 2);
  pen.bar(x + 30, fy + fh / 2, 80, "title", 5);
  pen.bar(x + 120, fy + fh / 2, 28, "body", 5);
  pen.cross(x + w - 14, fy + fh / 2, 3.2);
};

export const fileUpload = draw;
