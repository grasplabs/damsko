// The far field's one drawing that is not a component's page in the overview: the prompt input,
// the card a chat starts from, with its dithered glow. Drawn by the overview's pen
// (site/overview/pen.ts), seeded by its name as every sketch is, so it stands among the others.
import { sketch } from "../overview/pen.ts";
import type { Pen } from "../overview/pen.ts";

const draw = (pen: Pen) => {
  const w = 216;
  const h = 84;
  const x = 160 - w / 2;
  const y = 84 - h / 2;
  // The glow: mint dots, densest at the card's foot.
  pen.fade(x + 12, y + h - 16, w - 24, 52, {
    from: 12,
    to: 2,
    tone: "accent",
    r: 16,
  });
  pen.fill(x, y, w, h, 16, "sheet");
  pen.box(x, y, w, h, 16);
  // What the person has started to write.
  pen.bar(x + 16, y + 24, 128, "body", 6);
  // The foot: a plus, then the model.
  const fy = y + h - 22;
  pen.line(x + 22 - 5, fy, x + 22 + 5, fy);
  pen.line(x + 22, fy - 5, x + 22, fy + 5);
  pen.box(x + 38, fy - 10, 62, 20, 10, "hair");
  pen.bar(x + 47, fy, 30, "body", 4);
  pen.chevron(x + 90, fy, 3);
  // Send.
  const sx = x + w - 24;
  pen.fill(sx - 12, fy - 12, 24, 24, 12, "accent-fill");
  pen.line(sx, fy + 5, sx, fy - 5, "on-accent");
  pen.chevron(sx, fy - 3, 4, "on-accent", true);
};

/** The prompt input's drawing, at both sizes. */
export const promptInputSketch = (): string => sketch("prompt-input", draw);
