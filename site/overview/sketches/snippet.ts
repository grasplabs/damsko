// Snippet: one quiet line, a value as a bar inside a filled field, the copy mark at its end drawn
// as two offset rounded squares, the front one in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 220;
  const h = 44;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 14, "wash");
  pen.box(x, y, w, h, 14);
  pen.bar(x + 20, 90, 132, "title", 7);
  // The copy mark: two small rounded squares, one over the other.
  const cx = x + w - 30;
  pen.box(cx - 9, 81, 13, 13, 4);
  pen.fill(cx - 4, 86, 13, 13, 4, "sheet");
  pen.box(cx - 4, 86, 13, 13, 4, "accent");
};
