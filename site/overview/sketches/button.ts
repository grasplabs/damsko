// Button: one pill in the action fill, a short bar for its label, and the light it casts under
// it as a dither that thins away. A lone control, so it is drawn large.
import type { Pen } from "../pen.ts";

export const button = (pen: Pen) => {
  const w = 144;
  const h = 48;
  const x = 160 - w / 2;
  const y = 84 - h / 2;
  // The cast: densest just under the pill, gone a few rows down.
  pen.fade(x + 12, y + h - 12, w - 24, 52, { from: 12, to: 2, r: 16 });
  pen.fill(x, y, w, h, h / 2, "accent-fill");
  pen.bar(160 - 32, y + h / 2, 64, "on-accent", 8);
};

/** The overview finds it by this name (./index.ts). */
export const draw = button;
