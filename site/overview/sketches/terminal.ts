// Terminal: the command's line, a prompt's mark, its words and the chevron, open on its output: a
// pane of short lines, one in the accent, a copy mark beside the line.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 220;
  const x = 160 - w / 2;
  const top = 40;
  // The line: the prompt's mark, the command, the chevron; the copy mark at the end.
  pen.box(x, top - 6, 13, 12, 3);
  pen.line(x + 3, top - 2, x + 6, top, "pen", 1);
  pen.line(x + 6, top, x + 3, top + 2, "pen", 1);
  pen.bar(x + 22, top, 92, "title", 6);
  pen.chevron(x + 126, top, 4, "pen", true);
  pen.box(x + w - 13, top - 6, 9, 11, 2);
  // The output: lines of what it printed, on the code surface.
  const py = top + 16;
  pen.fill(x, py, w, 84, 8, "wash");
  pen.box(x, py, w, 84, 8);
  for (const [at, [length, tone]] of (
    [
      [64, "body"],
      [118, "body"],
      [96, "accent"],
      [140, "body"],
      [52, "body"],
      [88, "body"],
    ] as const
  ).entries()) {
    pen.bar(x + 12, py + 14 + at * 11, length, tone, 4);
  }
};
