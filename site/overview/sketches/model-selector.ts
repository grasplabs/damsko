// Model selector: a quiet trigger with a maker's mark, the model's name and a chevron; under it the
// open panel, a search row and a maker's models, each with its mark, the chosen one ticked.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 160 - 104;
  // The trigger.
  const ty = 30;
  pen.fill(x + 6, ty - 6, 12, 12, 6, "accent-fill", 0.6);
  pen.bar(x + 26, ty, 70, "title", 6);
  pen.chevron(x + 108, ty, 4, "pen", true);
  // The panel.
  const w = 208;
  const py = ty + 16;
  const h = 112;
  pen.fill(x, py, w, h, 12, "sheet");
  pen.box(x, py, w, h, 12);
  const sy = py + 15;
  pen.box(x + 12, sy - 6, 11, 11, 5.5);
  pen.line(x + 21, sy + 3, x + 25, sy + 7, "pen", 1);
  pen.bar(x + 34, sy, 64, "body", 5);
  pen.line(x + 4, py + 30, x + w - 4, py + 30, "pen", 1);
  pen.bar(x + 14, py + 41, 34, "body", 3.5);
  const lengths = [96, 80, 108];
  const chosen = 1;
  for (const [index, length] of lengths.entries()) {
    const ry = py + 50 + index * 20;
    if (index === chosen) {
      pen.fill(x + 5, ry, w - 10, 20, 7, "wash");
      pen.tick(x + w - 18, ry + 10, 3.6);
    }
    pen.fill(x + 14, ry + 5, 10, 10, 5, "accent-fill", 0.6);
    pen.bar(x + 32, ry + 10, length, index === chosen ? "title" : "body", 5);
  }
};
