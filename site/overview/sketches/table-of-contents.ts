// Table of contents: the page's sections in one column on one left edge, under a small title and a thin
// measure of how much is read; one mark in the accent beside the section being read, a part's name
// quieter above its sections, and a collapsed section with its small chevron.
import type { Pen } from "../pen.ts";

/** A small chevron pointing right, centred on (cx, cy). */
const across = (pen: Pen, cx: number, cy: number, size: number) => {
  pen.line(cx - size * 0.5, cy - size, cx + size * 0.5, cy, "pen", 1);
  pen.line(cx + size * 0.5, cy, cx - size * 0.5, cy + size, "pen", 1);
};

export const draw = (pen: Pen) => {
  const x = 86;
  const left = x + 12;
  // The title, and the measure under it: read to a little under half.
  pen.bar(left, 32, 56, "title", 7);
  pen.line(left, 46, left + 132, 46, "hair", 1);
  pen.fill(left, 45, 56, 2, 1, "accent");
  // The sections; the third is being read.
  const rows = [
    { y: 64, length: 72 },
    { y: 81, length: 96 },
    { y: 98, length: 64, current: true },
    { y: 115, length: 84 },
  ];
  for (const row of rows) {
    pen.bar(
      left,
      row.y,
      row.length,
      row.current === true ? "title" : "body",
      6
    );
  }
  pen.fill(x, 91, 2, 14, 1, "accent");
  // A part's name, quieter, then a collapsed section.
  pen.bar(left, 136, 38, "body", 4);
  pen.bar(left, 151, 52, "body", 6);
  across(pen, left + 61, 151, 3);
};
