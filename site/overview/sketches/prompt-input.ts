// Prompt input: the card alone, a line of what is being written, and at its foot a plus and a
// microphone, and the round send button in the action fill.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 216;
  const h = 84;
  const x = 160 - w / 2;
  const y = 84 - h / 2;
  pen.fill(x, y, w, h, 16, "sheet");
  pen.box(x, y, w, h, 16);
  // What the person has started to write, with a mention in it.
  pen.bar(x + 16, y + 24, 64, "body", 6);
  pen.fill(x + 86, y + 17, 46, 14, 4, "wash");
  pen.bar(x + 92, y + 24, 34, "title", 4);
  // The foot: a plus, then the microphone.
  const fy = y + h - 22;
  pen.line(x + 22 - 5, fy, x + 22 + 5, fy);
  pen.line(x + 22, fy - 5, x + 22, fy + 5);
  pen.box(x + 42, fy - 6, 8, 12, 4, "hair");
  // Send.
  const sx = x + w - 24;
  pen.fill(sx - 12, fy - 12, 24, 24, 12, "accent-fill");
  pen.line(sx, fy + 5, sx, fy - 5, "on-accent");
  pen.chevron(sx, fy - 3, 4, "on-accent", true);
};
