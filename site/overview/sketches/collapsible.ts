// Collapsible: one trigger, a title with a small square button whose chevron is the accent, and
// the single panel open under it as a card of text.
import type { Pen } from "../pen.ts";

export const collapsible = (pen: Pen) => {
  const w = 200;
  const th = 26;
  const gap = 10;
  const ph = 70;
  const h = th + gap + ph;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  // The trigger.
  pen.bar(x + 4, y + th / 2, 108, "title", 7);
  const b = 26;
  pen.box(x + w - b, y, b, b, 7);
  pen.chevron(x + w - b / 2, y + b / 2, 4.5, "accent", true);
  // The panel, open.
  const py = y + th + gap;
  pen.fill(x, py, w, ph, 10, "sheet");
  pen.box(x, py, w, ph, 10);
  pen.bar(x + 14, py + 18, 160, "body", 5);
  pen.bar(x + 14, py + 34, 140, "body", 5);
  pen.bar(x + 14, py + 50, 96, "body", 5);
};

export const draw = collapsible;
