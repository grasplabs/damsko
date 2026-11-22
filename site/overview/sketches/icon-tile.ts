// Icon tile: the small rounded square that holds an object's own icon, at the head of an inspector,
// its mark in the accent, the object's name and a quiet line beside it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const s = 56;
  const x = 160 - 92;
  const y = 90 - s / 2;
  pen.fill(x, y, s, s, 14, "wash");
  pen.box(x, y, s, s, 14);
  // The object's icon: a page with a folded corner, in the accent.
  pen.box(x + 18, y + 14, 20, 28, 3, "accent");
  pen.line(x + 22, y + 24, x + 34, y + 24, "accent", 1);
  pen.line(x + 22, y + 31, x + 31, y + 31, "accent", 1);
  // Its name and a quiet line.
  pen.bar(x + s + 18, y + 20, 92, "title", 7);
  pen.bar(x + s + 18, y + 38, 64, "body");
};

export const iconTile = draw;
