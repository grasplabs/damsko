// Context menu: a faint card that was right-clicked, the pointer where it was pressed, and the menu
// opened at that point, with shortcuts, a hairline and the hovered action in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  // The thing that was right-clicked: a faint card, a wash with no outline, so the menu sits clean over it.
  const cx = 56;
  const cy = 28;
  pen.fill(cx, cy, 136, 84, 10, "wash");
  pen.fill(cx + 12, cy + 12, 26, 26, 6, "sheet");
  pen.bar(cx + 46, cy + 19, 62, "title", 5);
  pen.bar(cx + 46, cy + 31, 44, "body", 4);
  // The menu, opened at the point that was pressed.
  const tx = cx + 70;
  const ty = cy + 46;
  const x = tx + 2;
  const y = ty + 2;
  const w = 136;
  const row = 18;
  const h = 4 * row + 16;
  pen.fill(x, y, w, h, 10, "sheet");
  pen.box(x, y, w, h, 10);
  const lengths = [50, 62, 44, 56];
  const hovered = 2;
  for (const [index, length] of lengths.entries()) {
    const ry = y + 4 + index * row + (index > 1 ? 8 : 0);
    const tone = index === hovered ? "accent" : "body";
    if (index === hovered) {
      pen.fill(x + 4, ry, w - 8, row, 6, "wash");
    }
    pen.bar(x + 16, ry + row / 2, length, tone, 5);
    pen.bar(x + w - 32, ry + row / 2, 18, "body", 4);
  }
  pen.line(
    x + 8,
    y + 4 + 2 * row + 4,
    x + w - 8,
    y + 4 + 2 * row + 4,
    "hair",
    1
  );
  pen.cursor(tx, ty);
};
