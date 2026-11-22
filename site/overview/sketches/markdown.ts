// Markdown: an answer as it is written, a heading, a paragraph with a code chip in it, a list of
// three with bullets, and the caret where the writing goes on, in the accent.
import type { Pen } from "../pen.ts";

export const markdown = (pen: Pen) => {
  const w = 216;
  const x = 160 - w / 2;
  const y = 44;
  pen.bar(x, y, 104, "title", 8);
  // The paragraph, a code chip in its second line.
  pen.bar(x, y + 20, w, "body", 5);
  pen.bar(x, y + 34, 108, "body", 5);
  pen.fill(x + 114, y + 34 - 7, 46, 14, 4, "wash");
  pen.box(x + 114, y + 34 - 7, 46, 14, 4, "hair");
  pen.bar(x + 120, y + 34, 34, "title", 4);
  pen.bar(x + 166, y + 34, 40, "body", 5);
  // The list, the last item still being written.
  const items = [132, 160, 88];
  for (const [index, length] of items.entries()) {
    const ly = y + 56 + index * 15;
    pen.bar(x + 2, ly, 5, "title", 5);
    pen.bar(x + 16, ly, length, "body", 5);
    if (index === items.length - 1) {
      pen.line(
        x + 16 + length + 6,
        ly - 7,
        x + 16 + length + 6,
        ly + 7,
        "accent",
        1
      );
    }
  }
};

export const draw = markdown;
