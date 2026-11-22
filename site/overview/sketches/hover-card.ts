// Hover card: a line of text with one link in it, underlined in the accent, and under the link a
// card that previews where it goes: a round picture, a name, two lines and small facts.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 152;
  const h = 92;
  const ly = 34;
  // The sentence, and the link a pointer rests on.
  const lx = 112;
  const lw = 54;
  pen.bar(66, ly, 40, "body", 5);
  pen.bar(lx, ly, lw, "accent", 5);
  pen.line(lx + 1, ly + 6, lx + lw - 1, ly + 6, "accent", 1);
  pen.bar(lx + lw + 6, ly, 70, "body", 5);
  // The card, hanging under the link.
  const x = 160 - w / 2;
  const y = ly + 18;
  const pad = 14;
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  const r = 12;
  pen.fill(x + pad, y + pad, r * 2, r * 2, r, "wash");
  pen.box(x + pad, y + pad, r * 2, r * 2, r);
  pen.bar(x + pad + 34, y + pad + 7, 62, "title", 6);
  pen.bar(x + pad + 34, y + pad + 19, 40, "body", 4);
  pen.bar(x + pad, y + 52, 118, "body", 5);
  pen.bar(x + pad, y + 64, 92, "body", 5);
  pen.bar(x + pad, y + 80, 28, "body", 4);
  pen.bar(x + pad + 38, y + 80, 34, "body", 4);
};
