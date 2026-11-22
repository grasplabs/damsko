// Alert: a note set into the page, between lines of the page's own text, with a round icon in the
// accent, a title and one line of body.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 56;
  const x = 160 - w / 2;
  const y = 62;
  // The page's text above and below, so the note sits in it.
  pen.bar(x, 34, 184, "body");
  pen.bar(x, 48, 136, "body");
  pen.bar(x, 132, 196, "body");
  pen.bar(x, 146, 152, "body");
  // The note.
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  // Its icon: a ring with a mark, in the accent.
  const cx = x + 22;
  const cy = y + 20;
  pen.box(cx - 7.5, cy - 7.5, 15, 15, 7.5, "accent");
  pen.line(cx, cy - 3.6, cx, cy + 0.8, "accent", 1);
  pen.bar(cx - 1, cy + 3.6, 2, "accent", 2.2);
  pen.bar(x + 40, cy, 78, "title", 7);
  pen.bar(x + 40, y + 38, 150, "body");
};
