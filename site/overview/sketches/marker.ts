// Marker: lines that mark what happened in a conversation: a date in the middle of a hairline, a
// status with its small spinning mark in the accent, and a note with a rule under it.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  const left = 56;
  const right = 264;
  // A date between two hairlines.
  pen.line(left, 46, 136, 46, "hair");
  pen.bar(144, 46, 32, "body", 5);
  pen.line(184, 46, right, 46, "hair");
  // A status: its mark, then its words.
  pen.box(left, 84, 12, 12, 6, "accent");
  pen.bar(left + 20, 90, 96, "body", 5);
  // A note with a rule under it.
  pen.box(left, 118, 12, 12, 3);
  pen.bar(left + 20, 124, 120, "body", 5);
  pen.line(left, 142, right, 142, "hair");
};
