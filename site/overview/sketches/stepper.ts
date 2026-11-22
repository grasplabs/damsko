// Stepper: four round marks across, joined by lines, two done with ticks, the current one filled in
// the accent, the last still to come; a name under each.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const r = 11;
  const step = 66;
  const cy = 76;
  const first = 160 - (step * 3) / 2;
  const current = 2;
  for (let index = 0; index < 4; index += 1) {
    const cx = first + index * step;
    if (index < 3) {
      pen.line(
        cx + r + 5,
        cy,
        cx + step - r - 5,
        cy,
        index < current ? "pen" : "hair",
        1
      );
    }
    if (index === current) {
      pen.fill(cx - r, cy - r, r * 2, r * 2, r, "accent-fill", 1);
    }
    pen.box(cx - r, cy - r, r * 2, r * 2, r);
    if (index < current) {
      pen.tick(cx, cy, 4.5);
    }
    pen.bar(cx - 20, cy + 26, 40, index === current ? "title" : "body", 5);
    pen.bar(cx - 14, cy + 38, 28, "body", 4);
  }
};
