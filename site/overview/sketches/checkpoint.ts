// Checkpoint: a turn above and a turn below, and between them a hairline with the checkpoint's
// words and its Restore button in the middle.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const left = 56;
  const right = 264;
  // The turn above: the person's bubble at the end, the answer's line under it.
  pen.fill(right - 96, 30, 96, 20, 8, "wash");
  pen.bar(right - 86, 40, 70, "body", 4);
  pen.bar(left, 66, 170, "body", 5);
  // The checkpoint: a hairline, its words and the trigger in the middle.
  const y = 94;
  pen.line(left, y, 118, y, "hair");
  pen.bar(126, y, 40, "body", 4);
  pen.box(174, y - 7, 22, 14, 4);
  pen.line(204, y, right, y, "hair");
  // The turn below.
  pen.fill(right - 80, 116, 80, 20, 8, "wash");
  pen.bar(right - 70, 126, 56, "body", 4);
  pen.bar(left, 152, 140, "body", 5);
};
