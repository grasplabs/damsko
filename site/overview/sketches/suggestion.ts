// Suggestion: the prompt box at the foot, and over it a row of filled pills, the last cut off
// at the edge where the row runs on; the pointer on the second.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 40;
  const w = 240;
  // The row of suggestions, the last running past the edge.
  const lengths = [62, 74, 58, 70];
  let at = x;
  for (const length of lengths) {
    const pw = Math.min(length + 20, x + w - at);
    if (pw <= 12) {
      break;
    }
    pen.fill(at, 58, pw, 22, 6, "wash");
    pen.bar(at + 10, 69, Math.min(length, pw - 14), "title", 4);
    at += pw + 8;
  }
  pen.fade(x + w - 24, 56, 24, 26, { from: 0, to: 12, dir: "right" });
  pen.cursor(x + 120, 74);
  // The prompt it fills.
  pen.fill(x, 96, w, 46, 10, "sheet");
  pen.box(x, 96, w, 46, 10);
  pen.bar(x + 14, 112, 96, "body", 5);
  pen.fill(x + w - 30, 120, 20, 16, 5, "accent-fill");
};
