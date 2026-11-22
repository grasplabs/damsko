// Bubble: three framed surfaces in a conversation, the person's soft ones at the end of the line,
// the other side's at its start, a small reaction laid over one's edge.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const left = 56;
  const right = 264;
  // The other side's bubble, at the start.
  pen.fill(left, 34, 132, 30, 12, "sheet");
  pen.box(left, 34, 132, 30, 12);
  pen.bar(left + 14, 49, 100, "body", 5);
  // The person's two, close together at the end.
  pen.fill(right - 112, 78, 112, 28, 12, "wash");
  pen.box(right - 112, 78, 112, 28, 12);
  pen.bar(right - 98, 92, 80, "body", 5);
  pen.fill(right - 150, 112, 150, 28, 12, "wash");
  pen.box(right - 150, 112, 150, 28, 12);
  pen.bar(right - 136, 126, 118, "body", 5);
  // A reaction over the last one's foot.
  pen.fill(right - 150 + 12, 134, 22, 14, 7, "sheet");
  pen.box(right - 150 + 12, 134, 22, 14, 7, "accent");
};
