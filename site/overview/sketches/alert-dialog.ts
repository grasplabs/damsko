// Alert dialog: a narrow card with a round warning mark, a centred title and question, no x, and
// a pair of equal pills at its foot, the confirming one in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 184;
  const h = 128;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 16;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The warning mark: a ring with a stroke and a dot.
  const my = y + 22;
  pen.box(160 - 9, my - 9, 18, 18, 9);
  pen.line(160, my - 4.5, 160, my + 1, "pen", 1);
  pen.bar(158.8, my + 4.4, 2.4, "title", 2.4);
  // The question, centred.
  pen.bar(160 - 48, y + 47, 96, "title", 7);
  pen.bar(160 - 64, y + 65, 128, "body");
  pen.bar(160 - 46, y + 78, 92, "body");
  // The pair: cancel, then the confirming one, side by side across the foot.
  const bh = 20;
  const by = y + h - pad - bh;
  const bw = (w - 2 * pad - 8) / 2;
  const cancel = x + pad;
  const confirm = cancel + bw + 8;
  pen.box(cancel, by, bw, bh, bh / 2);
  pen.bar(cancel + 18, by + bh / 2, bw - 36, "body", 4);
  pen.fill(confirm, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(confirm, by, bw, bh, bh / 2);
  pen.bar(confirm + 18, by + bh / 2, bw - 36, "on-accent", 4);
};
