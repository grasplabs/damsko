// Confirmation: a tinted note with the request in one sentence, a short list of what it touches,
// and the two answers at the end of its foot, Approve last in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 208;
  const h = 112;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 14;
  pen.fill(x, y, w, h, 12, "wash");
  // The request.
  pen.bar(x + pad, y + 20, 150, "title", 6);
  // What it touches.
  pen.bar(x + pad, y + 38, 96, "body", 4);
  pen.bar(x + pad, y + 50, 82, "body", 4);
  // Decline, then Approve, at the end.
  const bh = 18;
  const by = y + h - pad - bh;
  const aw = 56;
  const ax = x + w - pad - aw;
  pen.fill(ax, by, aw, bh, bh / 2, "accent-fill", 1);
  pen.bar(ax + 14, by + bh / 2, aw - 28, "on-accent", 4);
  const dx = ax - 8 - 52;
  pen.box(dx, by, 52, bh, bh / 2);
  pen.bar(dx + 12, by + bh / 2, 28, "body", 4);
};
