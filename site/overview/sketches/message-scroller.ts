// Message scroller: a column of turns that runs on above its top, the person's question settled
// near the top with the answer under it, and Jump to latest raised in its own row at the foot.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 176;
  const h = 132;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 12;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The end of the turn before, cut by the top's fade.
  pen.bar(x + pad, y + 10, 92, "body", 4);
  // The question, near the top.
  pen.fill(x + w - pad - 84, y + 22, 84, 20, 9, "wash");
  pen.box(x + w - pad - 84, y + 22, 84, 20, 9);
  pen.bar(x + w - pad - 72, y + 32, 58, "body", 4);
  // The answer, growing into the room under it.
  pen.bar(x + pad, y + 54, 140, "body", 4);
  pen.bar(x + pad, y + 63, 124, "body", 4);
  pen.bar(x + pad, y + 72, 88, "body", 4);
  // Jump to latest, in its own row at the foot.
  const bw = 72;
  const bh = 18;
  const bx = x + (w - bw) / 2;
  const by = y + h - 10 - bh;
  pen.fill(bx, by, bw, bh, 8, "wash");
  pen.box(bx, by, bw, bh, 8);
  pen.line(bx + 14, by + 5, bx + 14, by + 12, "accent", 1);
  pen.chevron(bx + 14, by + 11, 3, "accent", false);
  pen.bar(bx + 24, by + bh / 2, 38, "body", 4);
};
