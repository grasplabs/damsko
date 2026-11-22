// Empty: a list's place with nothing in it yet. Whole rows of what will stand there, each with its
// mark, its name in dither and a chip, above and below a clearing; in the clearing the title, one
// sentence and the action in the accent. Nothing of the rows is drawn in the words' room.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 132;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12, "hair");
  // A row as it will stand: a mark, the name in dither, a chip, its line under it.
  const row = (ry: number, name: number, faint: boolean) => {
    pen.box(x + 12, ry + 6, 8, 8, 2, faint ? "hair" : undefined);
    pen.dither(x + 28, ry + 7, name, 6, 2, faint ? 5 : 10);
    pen.box(x + w - 52, ry + 5, 28, 10, 5, "hair");
    pen.line(x, ry + 20, x + w, ry + 20, "hair");
  };
  row(y + 2, 92, false);
  row(y + 22, 70, true);
  // The clearing: the words and the action, centred, with nothing behind them.
  pen.bar(160 - 36, y + 56, 72, "title", 7);
  pen.bar(160 - 60, y + 70, 120, "body", 5);
  const aw = 50;
  const ah = 16;
  const ay = y + 80;
  pen.fill(160 - aw / 2, ay, aw, ah, ah / 2, "accent-fill", 1);
  pen.box(160 - aw / 2, ay, aw, ah, ah / 2);
  pen.bar(160 - aw / 2 + 13, ay + ah / 2, aw - 26, "on-accent", 4);
  row(y + 104, 84, true);
};
