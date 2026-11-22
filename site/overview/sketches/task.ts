// Task: its line (the title and a chevron turned up) and under it the steps on a faint rail, one
// naming a file as a small chip.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 40;
  // The title and the chevron.
  pen.bar(x, top, 118, "title", 7);
  pen.chevron(x + 132, top, 4, "pen", true);
  // The steps, each a mark on the rail, one naming a file.
  const rail = x + 6;
  const gap = 24;
  const first = top + 28;
  const steps: [number, number][] = [
    [104, 0],
    [36, 64],
    [88, 0],
    [36, 72],
  ];
  pen.line(rail, first, rail, first + gap * (steps.length - 1), "hair", 1);
  for (const [index, [title, file]] of steps.entries()) {
    const sy = first + index * gap;
    pen.fill(rail - 5, sy - 5, 10, 10, 5, "sheet");
    pen.bar(rail, sy, 0, "body", 5);
    pen.bar(x + 20, sy, title, "body", 5);
    if (file > 0) {
      pen.fill(x + 26 + title, sy - 7, file, 14, 4, "wash");
      pen.box(x + 26 + title, sy - 7, file, 14, 4, "hair");
      pen.bar(x + 32 + title, sy, file - 12, "title", 3);
    }
  }
};
