// Command: a card with a search row at its top, a magnifier and the typed words, and under a line
// a group of actions with icons, the chosen one in the accent with its key.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 208;
  const search = 32;
  const row = 20;
  const rows = 3;
  const h = search + 18 + rows * row + 8;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The search row: a magnifier, the words, a caret.
  const sy = y + search / 2;
  pen.box(x + 12, sy - 6, 11, 11, 5.5);
  pen.line(x + 21, sy + 3, x + 25, sy + 7, "pen", 1);
  pen.bar(x + 34, sy, 58, "title", 6);
  pen.line(x + 97, sy - 6, x + 97, sy + 6, "pen", 1);
  pen.line(x + 4, y + search, x + w - 4, y + search, "pen", 1);
  // A group's name, then its actions.
  pen.bar(x + 14, y + search + 11, 30, "body", 3.5);
  const lengths = [84, 66, 74];
  const chosen = 0;
  for (const [index, length] of lengths.entries()) {
    const ry = y + search + 18 + index * row;
    const tone = index === chosen ? "accent" : "body";
    if (index === chosen) {
      pen.fill(x + 5, ry, w - 10, row, 7, "wash");
      pen.box(x + w - 34, ry + 4, 20, 12, 3);
      pen.bar(x + w - 29, ry + row / 2, 10, "body", 3);
    }
    pen.bar(x + 14, ry + row / 2, 9, "body", 9);
    pen.bar(x + 32, ry + row / 2, length, tone, 5);
  }
};
