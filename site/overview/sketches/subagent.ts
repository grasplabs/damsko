// Subagent: the run's line (its mark, the run, the model as a small pill, a chevron turned up), and
// under it the task, the tool calls on a faint rail and what it found.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 38;
  // The run's line.
  pen.box(x, top - 5, 10, 10, 5);
  pen.bar(x + 20, top, 92, "title", 7);
  pen.fill(x + 120, top - 7, 46, 14, 7, "wash");
  pen.bar(x + 128, top, 30, "body", 4);
  pen.chevron(x + 180, top, 4, "pen", true);
  // The task.
  pen.bar(x + 20, top + 24, 128, "body", 4);
  // The tool calls.
  const rail = x + 25;
  const first = top + 46;
  const gap = 20;
  const lengths = [96, 120];
  pen.line(rail, first, rail, first + gap, "hair", 1);
  for (const [index, length] of lengths.entries()) {
    const sy = first + index * gap;
    pen.fill(rail - 5, sy - 5, 10, 10, 5, "sheet");
    pen.tick(rail, sy, 3.2);
    pen.bar(rail + 16, sy, length, "body", 4);
  }
  // What it found.
  pen.bar(x + 20, first + gap * 2 + 6, 150, "title", 5);
};
