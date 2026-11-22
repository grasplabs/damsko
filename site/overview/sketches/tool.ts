// Tool: a card with its header open, a wrench, the tool's name and its state in a small pill
// ticked done, the chevron at the end; under it the input and the output as two code panes.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 220;
  const h = 124;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The header: the wrench, the name, the state's pill, the chevron.
  const hy = y + 18;
  pen.box(x + 12, hy - 5, 10, 10, 3);
  pen.bar(x + 30, hy, 86, "title", 6);
  pen.box(x + 126, hy - 7, 46, 14, 7, "accent");
  pen.tick(x + 134, hy, 3);
  pen.bar(x + 144, hy, 20, "accent", 4);
  pen.chevron(x + w - 16, hy, 4, "pen", true);
  // The input and the output, each a pane with its name and lines of code.
  for (const [index, lines] of [
    [92, 64],
    [118, 80, 104],
  ].entries()) {
    const py = y + 36 + index * 42;
    const ph = index === 0 ? 34 : 40;
    pen.fill(x + 12, py, w - 24, ph, 6, "wash");
    pen.bar(x + 20, py + 8, 24, "body", 3);
    for (const [at, length] of lines.entries()) {
      pen.bar(x + 20, py + 17 + at * 8, length, "body", 3);
    }
  }
};
