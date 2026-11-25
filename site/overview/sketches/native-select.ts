// Native select: a label over the closed control with its chevron, and under it the system's own
// wheel, the chosen row between two hairlines, the rows above and below it quieter.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 176;
  const th = 28;
  const x = 160 - w / 2;
  const y = 30;
  pen.bar(x + 2, y, 54, "title");
  // The control.
  const fy = y + 10;
  pen.fill(x, fy, w, th, 8, "sheet");
  pen.box(x, fy, w, th, 8);
  pen.bar(x + 12, fy + th / 2, 70, "title");
  pen.chevron(x + w - 16, fy + th / 2, 4.5);
  // The wheel below: five rows, the middle one chosen between two lines.
  const wy = fy + th + 12;
  const row = 14;
  const lengths = [52, 64, 76, 58, 44];
  for (const [index, length] of lengths.entries()) {
    const ry = wy + index * row + row / 2;
    const chosen = index === 2;
    pen.bar(
      160 - length / 2,
      ry,
      length,
      chosen ? "title" : "body",
      chosen ? 5 : 3
    );
  }
  pen.line(x + 24, wy + row * 2, x + w - 24, wy + row * 2, "hair");
  pen.line(x + 24, wy + row * 3, x + w - 24, wy + row * 3, "hair");
};

export const nativeSelect = draw;
