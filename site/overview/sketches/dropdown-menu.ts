// Dropdown menu: a pressed button with a chevron, and under it, wider, a menu of actions with small
// icons and shortcuts, a hairline between groups, and the hovered action in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const tw = 76;
  const th = 24;
  const gap = 6;
  const w = 136;
  const row = 18;
  const h = 4 * row + 16;
  const total = th + gap + h;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  // The button, pressed while its menu is open.
  pen.fill(x, y, tw, th, th / 2, "wash");
  pen.box(x, y, tw, th, th / 2);
  pen.bar(x + 13, y + th / 2, 34, "title", 5);
  pen.chevron(x + tw - 15, y + th / 2, 3.6);
  // The menu, two groups of two.
  const my = y + th + gap;
  pen.fill(x, my, w, h, 10, "sheet");
  pen.box(x, my, w, h, 10);
  const lengths = [52, 64, 46, 58];
  const hovered = 1;
  for (const [index, length] of lengths.entries()) {
    const ry = my + 4 + index * row + (index > 1 ? 8 : 0);
    const tone = index === hovered ? "accent" : "body";
    if (index === hovered) {
      pen.fill(x + 4, ry, w - 8, row, 6, "wash");
    }
    pen.bar(x + 11, ry + row / 2, 8, "body", 8);
    pen.bar(x + 26, ry + row / 2, length, tone, 5);
    pen.bar(x + w - 30, ry + row / 2, 16, "body", 4);
  }
  pen.line(
    x + 8,
    my + 4 + 2 * row + 4,
    x + w - 8,
    my + 4 + 2 * row + 4,
    "hair",
    1
  );
};
