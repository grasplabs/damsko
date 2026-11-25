// Sortable list: four rows, each with its grip at the start; the second lifted off the list on the
// raised ground, a little down, and the pointer on its grip, the rows below making room.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 180;
  const row = 26;
  const x = 160 - w / 2;
  const y = 36;
  const grip = (gx: number, cy: number) => {
    for (const dy of [-4, 0, 4]) {
      pen.fill(gx - 3, cy + dy - 1, 2, 2, 1, "pen");
      pen.fill(gx + 1, cy + dy - 1, 2, 2, 1, "pen");
    }
  };
  const lengths = [72, 96, 60, 84];
  for (const [index, length] of lengths.entries()) {
    if (index === 1) {
      continue;
    }
    // The rows after the lifted one stand a row lower: the room it will drop into.
    const ry = y + (index > 1 ? index + 1 : index) * row;
    grip(x + 14, ry + row / 2);
    pen.bar(x + 32, ry + row / 2, length, "body");
  }
  // The lifted row, over the gap it left and the one it opened.
  const ly = y + row + 12;
  pen.fill(x - 4, ly, w + 8, row, 8, "sheet");
  pen.box(x - 4, ly, w + 8, row, 8);
  grip(x + 14, ly + row / 2);
  pen.bar(x + 32, ly + row / 2, lengths[1] ?? 96, "title");
  pen.cursor(x + 16, ly + row / 2 + 2, "accent-fill");
};

export const sortableList = draw;
