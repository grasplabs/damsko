// Section header: no card, a large title with a sentence under it and the part's two buttons at
// the end, the primary one in the accent; a rule under them, and the start of the part below.
import type { Pen } from "../pen.ts";

export const sectionHeader = (pen: Pen) => {
  const w = 236;
  const x = 160 - w / 2;
  const y = 52;
  // The title and its sentence.
  pen.bar(x, y, 104, "title", 9);
  pen.bar(x, y + 19, 112, "body", 5);
  // The part's actions at the end.
  const bw = 46;
  const bh = 22;
  const by = y + 9 - bh / 2;
  const primary = x + w - bw;
  const second = primary - 8 - bw;
  pen.box(second, by, bw, bh, bh / 2);
  pen.bar(second + 12, by + bh / 2, bw - 24, "body", 4);
  pen.fill(primary, by, bw, bh, bh / 2, "accent-fill", 1);
  pen.box(primary, by, bw, bh, bh / 2);
  pen.bar(primary + 12, by + bh / 2, bw - 24, "on-accent", 4);
  // The rule, and the part that follows, faint.
  pen.line(x, y + 40, x + w, y + 40, "pen", 1);
  pen.bar(x, y + 58, 200, "body", 5);
  pen.bar(x, y + 71, 150, "body", 5);
};

export const draw = sectionHeader;
