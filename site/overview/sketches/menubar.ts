// Menubar: a strip of menu names, the second one open, and under it its menu of commands with
// their shortcuts, a hairline between groups, and the hovered command in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 208;
  const bh = 26;
  const x = 160 - w / 2;
  const row = 18;
  const mh = 4 * row + 16;
  const y = 90 - (bh + 4 + mh) / 2;
  // The strip.
  pen.fill(x, y, w, bh, 8, "sheet");
  pen.box(x, y, w, bh, 8);
  const lengths = [22, 26, 24, 30, 20];
  const open = 1;
  let left = x + 12;
  let menuX = x;
  for (const [index, length] of lengths.entries()) {
    if (index === open) {
      pen.fill(left - 6, y + 4, length + 12, bh - 8, 6, "wash");
      menuX = left - 6;
    }
    pen.bar(left, y + bh / 2, length, "title", 5);
    left += length + 16;
  }
  // The open menu, hanging from its name.
  const mw = 132;
  const my = y + bh + 4;
  pen.fill(menuX, my, mw, mh, 10, "sheet");
  pen.box(menuX, my, mw, mh, 10);
  const items = [48, 60, 42, 54];
  const hovered = 0;
  for (const [index, length] of items.entries()) {
    const ry = my + 4 + index * row + (index > 1 ? 8 : 0);
    if (index === hovered) {
      pen.fill(menuX + 4, ry, mw - 8, row, 6, "wash");
    }
    pen.bar(
      menuX + 14,
      ry + row / 2,
      length,
      index === hovered ? "accent" : "body",
      5
    );
    pen.bar(menuX + mw - 34, ry + row / 2, 20, "body", 4);
  }
  pen.line(
    menuX + 8,
    my + 4 + 2 * row + 4,
    menuX + mw - 8,
    my + 4 + 2 * row + 4,
    "hair",
    1
  );
};
