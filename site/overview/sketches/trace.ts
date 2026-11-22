// Trace: a row of steps, each a mark on a faint line of dots, its title and a quiet note; the
// last one running, its dot in the accent; above them the quiet line that opened them.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const x = 62;
  const top = 38;
  // The line that opens the steps.
  pen.bar(x, top, 112, "title", 7);
  pen.chevron(x + 126, top, 4, "pen", true);
  // The steps.
  const rail = x + 6;
  const gap = 24;
  const first = top + 28;
  const steps = [
    [96, 52],
    [118, 0],
    [84, 40],
    [104, 0],
  ];
  pen.line(rail, first, rail, first + gap * (steps.length - 1), "hair", 1);
  for (const [index, [title = 0, note = 0]] of steps.entries()) {
    const sy = first + index * gap;
    const running = index === steps.length - 1;
    pen.fill(rail - 5, sy - 5, 10, 10, 5, "sheet");
    pen.bar(rail, sy, 0, running ? "accent" : "body", running ? 7 : 5);
    pen.bar(x + 20, sy, title, running ? "title" : "body", 5);
    if (note > 0) {
      pen.bar(x + 28 + title, sy, note, "body", 5);
    }
  }
};
