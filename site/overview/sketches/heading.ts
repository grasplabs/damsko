// Heading: two levels of the type scale, a large first heading in the accent and a smaller second
// one under it, each followed by lines of quieter text.
import type { Pen } from "../pen.ts";

export const heading = (pen: Pen) => {
  const w = 216;
  const x = 160 - w / 2;
  const y = 46;
  pen.bar(x, y, 168, "accent", 14);
  pen.bar(x, y + 24, w, "body", 5);
  pen.bar(x, y + 37, 160, "body", 5);
  pen.bar(x, y + 61, 116, "title", 9);
  pen.bar(x, y + 80, w - 10, "body", 5);
};

export const draw = heading;
