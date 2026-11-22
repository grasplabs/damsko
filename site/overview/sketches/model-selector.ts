// Model selector: a quiet chip with a maker's mark, the level and a chevron; under it the open
// panel, a search row, a column of makers' marks beside the chosen maker's models, the chosen one
// ticked, and the effort's segments at its foot.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 160 - 104;
  // The chip.
  const ty = 28;
  pen.fill(x + 6, ty - 6, 12, 12, 6, "accent-fill", 0.6);
  pen.bar(x + 26, ty, 40, "title", 6);
  pen.chevron(x + 78, ty, 4, "pen", true);
  // The panel.
  const w = 208;
  const py = ty + 10;
  const h = 120;
  pen.fill(x, py, w, h, 12, "sheet");
  pen.box(x, py, w, h, 12);
  // The search.
  const sy = py + 13;
  pen.box(x + 12, sy - 5, 10, 10, 5);
  pen.line(x + 20, sy + 3, x + 24, sy + 7, "pen", 1);
  pen.bar(x + 32, sy, 64, "body", 4.5);
  pen.line(x, py + 26, x + w, py + 26, "hair", 1);
  // The makers' column, the first chosen.
  const cx = x + 26;
  pen.line(cx, py + 26, cx, py + 90, "hair", 1);
  for (let index = 0; index < 3; index += 1) {
    const my = py + 30 + index * 18;
    if (index === 0) {
      pen.fill(x + 5, my, 17, 17, 6, "wash");
    }
    pen.fill(x + 9, my + 4, 9, 9, 4.5, "accent-fill", 0.6);
  }
  // The chosen maker's name, then its models.
  pen.bar(cx + 10, py + 38, 32, "body", 3.5);
  const lengths = [88, 72, 96];
  for (const [index, length] of lengths.entries()) {
    const ry = py + 48 + index * 14;
    if (index === 0) {
      pen.fill(cx + 4, ry - 1, w - 34, 14, 6, "wash");
      pen.tick(x + w - 14, ry + 6, 3);
    }
    pen.fill(cx + 9, ry + 2, 8, 8, 4, "accent-fill", 0.6);
    pen.bar(cx + 23, ry + 6, length - 20, index === 0 ? "title" : "body", 4);
  }
  // The effort: its word, and its segments, the second raised.
  pen.line(x, py + 90, x + w, py + 90, "hair", 1);
  pen.bar(x + 12, py + 98, 28, "body", 3.5);
  pen.fill(x + 10, py + 103, w - 20, 13, 6.5, "wash");
  pen.fill(x + 12 + (w - 24) / 4, py + 105, (w - 24) / 4, 9, 4.5, "sheet");
  pen.box(x + 12 + (w - 24) / 4, py + 105, (w - 24) / 4, 9, 4.5);
};
