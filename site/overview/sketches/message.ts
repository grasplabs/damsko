// Message: the user's soft bubble at the end of the line, and under it the assistant's plain words
// in its place, its small round mark in the accent.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const left = 56;
  const right = 264;
  // The person's bubble.
  const bw = 120;
  const bh = 36;
  const bx = right - bw;
  const by = 32;
  pen.fill(bx, by, bw, bh, 14, "wash");
  pen.box(bx, by, bw, bh, 14);
  pen.bar(bx + 14, by + 13, 92, "body", 5);
  pen.bar(bx + 14, by + 24, 58, "body", 5);
  // The agent: its mark and name, then its words.
  const ny = by + bh + 20;
  pen.bar(left + 1, ny, 0, "accent", 12);
  pen.bar(left + 14, ny, 44, "title", 6);
  pen.bar(left, ny + 20, 204, "body", 5);
  pen.bar(left, ny + 32, 186, "body", 5);
  pen.bar(left, ny + 44, 122, "body", 5);
};
