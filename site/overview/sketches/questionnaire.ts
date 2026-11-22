// Questionnaire: a card with the question, three answers each led by its number key, the chosen
// one washed with its key and words in the accent, and a field for an answer of one's own.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 200;
  const h = 128;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const pad = 12;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  pen.bar(x + pad + 2, y + 18, 112, "title", 7);
  // The answers.
  const lengths = [96, 78, 108];
  const chosen = 0;
  const row = 22;
  for (const [index, length] of lengths.entries()) {
    const ry = y + 30 + index * row;
    const cy = ry + row / 2;
    if (index === chosen) {
      pen.fill(x + 6, ry + 1, w - 12, row - 2, 6, "wash");
      pen.fill(x + pad, cy - 6, 12, 12, 3, "accent-fill", 0.6);
      pen.box(x + pad, cy - 6, 12, 12, 3, "accent");
      pen.bar(x + pad + 4.5, cy, 3, "on-accent", 3);
      pen.bar(x + pad + 22, cy, length, "accent", 5);
    } else {
      pen.box(x + pad, cy - 6, 12, 12, 3);
      pen.bar(x + pad + 4.5, cy, 3, "title", 3);
      pen.bar(x + pad + 22, cy, length, "body", 5);
    }
  }
  // An answer of one's own, and the send.
  const fy = y + h - pad - 18;
  pen.box(x + pad, fy, 124, 18, 6, "hair");
  pen.bar(x + pad + 9, fy + 9, 54, "body", 4);
  pen.box(x + w - pad - 44, fy, 44, 18, 9);
  pen.bar(x + w - pad - 32, fy + 9, 20, "body", 4);
};
