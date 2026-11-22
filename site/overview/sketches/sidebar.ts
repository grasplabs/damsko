// Sidebar: a window's left column, drawn in full, with the product's mark, rows of icons and names,
// the current page's row raised with its name in the accent, and the person at its foot; the page
// beside it faint.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const px = 44;
  const py = 24;
  const pw = 232;
  const ph = 132;
  // The window, faint, and the page in it.
  pen.box(px, py, pw, ph, 10, "hair");
  pen.bar(px + 120, py + 18, 56, "body", 5);
  pen.bar(px + 120, py + 32, 92, "body", 5);
  pen.box(px + 120, py + 48, 96, 64, 8, "hair");
  // The sidebar.
  const w = 104;
  const x = px;
  const y = py;
  pen.fill(x, y, w, ph, 10, "sheet");
  pen.box(x, y, w, ph, 10);
  pen.bar(x + 12, y + 19, 13, "title", 13);
  pen.bar(x + 32, y + 19, 42, "title", 6);
  const lengths = [44, 52, 38, 48];
  const current = 1;
  const row = 18;
  for (const [index, length] of lengths.entries()) {
    const ry = y + 38 + index * row;
    if (index === current) {
      pen.fill(x + 6, ry, w - 12, row, 6, "wash");
    }
    pen.bar(x + 14, ry + row / 2, 8, "body", 8);
    pen.bar(
      x + 30,
      ry + row / 2,
      length,
      index === current ? "accent" : "body",
      5
    );
  }
  // The person, at the foot.
  const fy = y + ph - 18;
  pen.bar(x + 12, fy, 12, "body", 12);
  pen.bar(x + 30, fy, 40, "body", 4);
};
