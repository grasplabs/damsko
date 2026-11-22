// Sheet: a faint page under a scrim, and a tall panel along its right edge, with a title, an x,
// lines of text and fields, and a small pill in the accent at its foot.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  // The page, faint, dimmed by the scrim.
  const px = 44;
  const py = 24;
  const pw = 232;
  const ph = 132;
  pen.fill(px, py, pw, ph, 10, "wash");
  pen.box(px, py, pw, ph, 10, "hair");
  pen.bar(px + 14, py + 16, 56, "body", 5);
  pen.bar(px + 14, py + 30, 96, "body", 5);
  pen.bar(px + 14, py + 42, 78, "body", 5);
  pen.box(px + 14, py + 58, 104, 56, 8, "hair");
  // The sheet, along the page's right edge, top to bottom.
  const w = 96;
  const x = px + pw - w;
  const y = py;
  const h = ph;
  const pad = 12;
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  pen.bar(x + pad, y + 18, 46, "title", 6);
  pen.cross(x + w - pad - 2, y + 18, 3.2);
  pen.bar(x + pad, y + 36, 68, "body", 5);
  pen.bar(x + pad, y + 48, 52, "body", 5);
  pen.box(x + pad, y + 60, w - 2 * pad, 16, 6);
  pen.box(x + pad, y + 82, w - 2 * pad, 16, 6);
  const bw = 40;
  const bh = 16;
  const bx = x + w - pad - bw;
  const by = y + h - pad - bh;
  pen.fill(bx, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(bx, by, bw, bh, bh / 2);
  pen.bar(bx + 10, by + bh / 2, bw - 20, "on-accent", 4);
};
