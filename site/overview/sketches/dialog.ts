// Dialog: a rounded card with a title bar, two lighter lines of text, a small x, and two small pills
// at its foot, the primary one in the accent. Drawn whole.
import type { Pen } from "../pen.ts";

export const dialog = (pen: Pen) => {
  const w = 200;
  const h = 116;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 16;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The title and the x that closes.
  pen.bar(x + pad, y + 22, 84, "title", 7);
  pen.cross(x + w - pad - 3, y + 22, 3.6);
  // The text, two lines.
  pen.bar(x + pad, y + 44, 150, "body");
  pen.bar(x + pad, y + 57, 112, "body");
  // The actions: a quiet pill, then the primary one.
  const bw = 44;
  const bh = 18;
  const by = y + h - pad - bh;
  const primary = x + w - pad - bw;
  const second = primary - 8 - bw;
  pen.box(second, by, bw, bh, bh / 2);
  pen.bar(second + 11, by + bh / 2, bw - 22, "body", 4);
  pen.fill(primary, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(primary, by, bw, bh, bh / 2);
  pen.bar(primary + 11, by + bh / 2, bw - 22, "on-accent", 4);
};

/** The overview finds it by this name (./index.ts). */
export const draw = dialog;
