// Agent indicator: the dither glyph, three by three, a diagonal of it lit in the accent as the light
// passes, and the words beside it that say what is working.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const size = 8;
  const gap = 8;
  const x = 76;
  const y = 70;
  // Which diagonal the light is on now: the middle one.
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const lit = row + column === 2;
      pen.bar(
        x + column * (size + gap),
        y + row * (size + gap) + size / 2,
        size,
        lit ? "accent" : "body",
        size
      );
    }
  }
  // The words beside it.
  const tx = x + 3 * size + 2 * gap + 20;
  pen.bar(tx, 82, 84, "title", 8);
  pen.bar(tx, 100, 56, "body", 5);
};
