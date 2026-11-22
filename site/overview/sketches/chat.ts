// Chat: a whole thread in one tall column, bubbles and answers in turn, and the prompt input at
// its foot with its send in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 176;
  const h = 132;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 12;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // A person asks.
  pen.fill(x + w - pad - 84, y + 10, 84, 20, 9, "wash");
  pen.box(x + w - pad - 84, y + 10, 84, 20, 9);
  pen.bar(x + w - pad - 72, y + 20, 58, "body", 4);
  // The agent answers.
  pen.bar(x + pad, y + 42, 136, "body", 4);
  pen.bar(x + pad, y + 51, 120, "body", 4);
  pen.bar(x + pad, y + 60, 82, "body", 4);
  // The person again, and the answer begins.
  pen.fill(x + w - pad - 64, y + 70, 64, 18, 8, "wash");
  pen.box(x + w - pad - 64, y + 70, 64, 18, 8);
  pen.bar(x + w - pad - 53, y + 79, 42, "body", 4);
  pen.bar(x + pad, y + 98, 104, "body", 4);
  // The prompt input at the foot.
  const ch = 24;
  const cy = y + h - 8 - ch;
  pen.box(x + 8, cy, w - 16, ch, 10);
  pen.bar(x + 18, cy + ch / 2, 70, "body", 4);
  const sx = x + w - 8 - 14;
  const sy = cy + ch / 2;
  pen.box(sx - 8, sy - 8, 16, 16, 8, "accent");
  pen.line(sx, sy + 4, sx, sy - 3.5, "accent", 1);
  pen.chevron(sx, sy - 2.2, 3, "accent", true);
};
