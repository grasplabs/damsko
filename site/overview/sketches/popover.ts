// Popover: a pressed button, and under it a small card that points up at it, with a title, a line
// of text, a field and a small pill in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const tw = 64;
  const th = 24;
  const gap = 10;
  const w = 144;
  const h = 78;
  const total = th + gap + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  // The trigger, pressed while its popover is open.
  const tx = x + 8;
  pen.fill(tx, y, tw, th, th / 2, "wash");
  pen.box(tx, y, tw, th, th / 2);
  pen.bar(tx + 16, y + th / 2, tw - 32, "title", 5);
  // The card, with a point up at the trigger.
  const cy = y + th + gap;
  const point = tx + tw / 2;
  pen.fill(x, cy, w, h, 10, "sheet");
  pen.box(x, cy, w, h, 10);
  pen.chevron(point, cy - 2.6, 5.5, "pen", true);
  const pad = 14;
  pen.bar(x + pad, cy + 18, 64, "title", 6);
  pen.bar(x + pad, cy + 32, 104, "body", 5);
  const fy = cy + 46;
  pen.box(x + pad, fy, 76, 18, 6);
  pen.bar(x + pad + 8, fy + 9, 34, "body", 4);
  const bw = 34;
  pen.fill(x + w - pad - bw, fy, bw, 18, 9, "accent-fill", 1);
  pen.box(x + w - pad - bw, fy, bw, 18, 9);
  pen.bar(x + w - pad - bw + 9, fy + 9, bw - 18, "on-accent", 4);
};
