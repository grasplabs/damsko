// Spinner: a faint ring with a third of it drawn in the accent, and the words beside it that say
// what is working. The pen has no arc, so the ring is built here from short lines.
import type { Pen, Tone } from "../pen.ts";

/** An arc from one angle to another (degrees, 0 at the top, clockwise), as short strokes. */
const arc = (
  pen: Pen,
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  tone: Tone,
  passes = 1
) => {
  const steps = Math.max(2, Math.round(Math.abs(to - from) / 15));
  const at = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
  };
  for (let step = 0; step < steps; step += 1) {
    const [ax, ay] = at(from + ((to - from) * step) / steps);
    const [bx, by] = at(from + ((to - from) * (step + 1)) / steps);
    pen.line(ax, ay, bx, by, tone, passes);
  }
};

export const draw = (pen: Pen) => {
  const r = 30;
  const cx = 120;
  const cy = 90;
  // The ring, faint, and the turning part in the accent, drawn twice.
  pen.box(cx - r, cy - r, 2 * r, 2 * r, r, "hair");
  arc(pen, cx, cy, r, -20, 100, "accent");
  arc(pen, cx, cy, r - 1, -18, 98, "accent");
  // The words beside it.
  pen.bar(cx + r + 16, cy - 7, 74, "title", 7);
  pen.bar(cx + r + 16, cy + 9, 52, "body", 5);
};
