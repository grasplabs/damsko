// Audio player: one long pill, a round play button, the time, the timeline with the part played
// and its thumb in the accent, the speed and the sound.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const w = 236;
  const h = 48;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const cy = 90;
  pen.fill(x, y, w, h, h / 2, "sheet");
  pen.box(x, y, w, h, h / 2);
  // Play.
  const px = x + 26;
  pen.box(px - 14, cy - 14, 28, 28, 14);
  pen.line(px - 3.5, cy - 6.5, px - 3.5, cy + 6.5, "pen", 1);
  pen.line(px - 3.5, cy + 6.5, px + 7, cy, "pen", 1);
  pen.line(px + 7, cy, px - 3.5, cy - 6.5, "pen", 1);
  // The time, then the timeline.
  pen.bar(x + 50, cy, 24, "title", 5);
  const tx = x + 84;
  const tw = 90;
  pen.bar(tx, cy, tw, "body", 4);
  pen.bar(tx, cy, tw * 0.42, "accent", 4);
  pen.fill(tx + tw * 0.42 - 5, cy - 5, 10, 10, 5, "accent-fill");
  // The speed and the sound.
  const sx = x + w - 56;
  pen.box(sx, cy - 8, 24, 16, 5, "hair");
  pen.bar(sx + 7, cy, 10, "body", 4);
  const vx = x + w - 24;
  pen.box(vx - 5, cy - 3, 4, 6, 1);
  pen.line(vx - 1, cy - 3, vx + 4, cy - 7, "pen", 1);
  pen.line(vx + 4, cy - 7, vx + 4, cy + 7, "pen", 1);
  pen.line(vx + 4, cy + 7, vx - 1, cy + 3, "pen", 1);
};
