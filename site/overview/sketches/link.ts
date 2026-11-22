// Link: a short paragraph of light bars with one run of words in the accent, underlined, inside it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 200;
  const step = 18;
  const x = 160 - w / 2;
  const top = 90 - step * 1.5;
  pen.bar(x, top, 196, "body");
  // The sentence that holds the link.
  const ly = top + step;
  pen.bar(x, ly, 52, "body");
  const lx = x + 60;
  const lw = 72;
  pen.bar(lx, ly, lw, "accent");
  pen.line(lx + 1, ly + 7, lx + lw - 1, ly + 7, "accent", 1);
  pen.bar(lx + lw + 8, ly, 60, "body");
  pen.bar(x, top + step * 2, 184, "body");
  pen.bar(x, top + step * 3, 112, "body");
};

export const link = draw;
