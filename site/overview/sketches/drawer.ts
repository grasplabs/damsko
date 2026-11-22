// Drawer: a faint page under a scrim, and a panel risen from its bottom edge, with a grip, a title,
// two lines of text and one wide pill in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  // The page, faint, dimmed by the scrim.
  const px = 44;
  const py = 24;
  const pw = 232;
  const ph = 132;
  pen.fill(px, py, pw, ph, 10, "wash");
  pen.box(px, py, pw, ph, 10, "hair");
  pen.bar(px + 14, py + 15, 58, "body", 5);
  pen.bar(px + 14, py + 27, 104, "body", 5);
  // The drawer, standing on the page's bottom edge.
  const w = 152;
  const h = 98;
  const x = 160 - w / 2;
  const y = py + ph - h;
  const pad = 16;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  pen.bar(160 - 14, y + 9, 28, "title", 4);
  pen.bar(x + pad, y + 28, 76, "title", 7);
  pen.bar(x + pad, y + 45, 116, "body");
  pen.bar(x + pad, y + 58, 88, "body");
  const bh = 18;
  const by = y + 70;
  pen.fill(x + pad, by, w - 2 * pad, bh, bh / 2, "accent-fill", 1);
  pen.box(x + pad, by, w - 2 * pad, bh, bh / 2);
  pen.bar(160 - 18, by + bh / 2, 36, "on-accent", 4);
};
