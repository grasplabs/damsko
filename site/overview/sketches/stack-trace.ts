// Stack trace: the error's line in the accent with its alert mark and the chevron, open on a muted
// block of frames, the first in ink with its path dotted under, the rest quiet.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 220;
  const x = 160 - w / 2;
  const top = 40;
  // The error: the alert, its type and message, the chevron.
  pen.box(x, top - 6, 12, 12, 6, "accent");
  pen.bar(x + 6, top - 2, 0, "accent", 2);
  pen.bar(x + 6, top + 2, 0, "accent", 2);
  pen.bar(x + 22, top, 40, "accent", 6);
  pen.bar(x + 68, top, 70, "accent", 5);
  pen.chevron(x + 150, top, 4, "pen", true);
  // The frames.
  const py = top + 16;
  pen.fill(x, py, w, 84, 8, "wash");
  const frames = [
    [56, 96, "title"],
    [72, 84, "title"],
    [88, 110, "body"],
    [64, 120, "body"],
    [80, 92, "body"],
  ] as const;
  for (const [at, [name, path, tone]] of frames.entries()) {
    const ly = py + 14 + at * 14;
    pen.bar(x + 12, ly, name, tone, 4);
    pen.bar(x + 20 + name, ly, path, "body", 4);
    if (at === 0) {
      pen.line(x + 20 + name, ly + 5, x + 20 + name + path, ly + 5, "hair", 1);
    }
  }
};
