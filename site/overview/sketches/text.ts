// Text: a paragraph of running lines, the last one short, with one emphasised run in the accent.
import type { Pen } from "../pen.ts";

export const text = (pen: Pen) => {
  const w = 224;
  const leading = 16;
  const widths = [w, w - 8, w, w - 14, 128];
  const x = 160 - w / 2;
  const y = 90 - ((widths.length - 1) * leading) / 2;
  for (const [index, width] of widths.entries()) {
    const ly = y + index * leading;
    if (index === 2) {
      // The emphasised run, in the middle of a line.
      pen.bar(x, ly, 62, "body");
      pen.bar(x + 68, ly, 56, "accent");
      pen.bar(x + 130, ly, width - 130, "body");
    } else {
      pen.bar(x, ly, width, "body");
    }
  }
};

export const draw = text;
