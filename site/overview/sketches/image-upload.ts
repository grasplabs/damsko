// Image upload: a square well with soft corners holding a picture (a hill under a sun, the sun in
// the accent), its remove a small round x on the corner, and its name beside it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const s = 84;
  const x = 76;
  const y = 90 - s / 2;
  pen.fill(x, y, s, s, 16, "wash");
  pen.box(x, y, s, s, 16);
  // The picture: a sun and a hill.
  pen.box(x + 50, y + 18, 16, 16, 8, "accent");
  pen.line(x + 12, y + s - 18, x + 34, y + 40, "pen", 1);
  pen.line(x + 34, y + 40, x + 52, y + s - 26, "pen", 1);
  pen.line(x + 52, y + s - 26, x + 60, y + s - 34, "pen", 1);
  pen.line(x + 60, y + s - 34, x + s - 12, y + s - 18, "pen", 1);
  // The remove, on the corner.
  pen.fill(x + s - 12, y - 8, 20, 20, 10, "sheet");
  pen.box(x + s - 12, y - 8, 20, 20, 10);
  pen.cross(x + s - 2, y + 2, 3.2);
  // Its name and what it is for.
  pen.bar(x + s + 24, 82, 56, "title", 6);
  pen.bar(x + s + 24, 98, 76, "body");
};
