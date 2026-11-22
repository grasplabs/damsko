// Diff viewer: a file's lines with signs in a gutter; one removed line marked with a minus, two added
// lines on a wash with plus signs and their runs in the accent.
import type { Pen } from "../pen.ts";

export const diffViewer = (pen: Pen) => {
  const w = 228;
  const head = 26;
  const row = 15;
  const kinds = ["same", "same", "gone", "new", "new", "same"] as const;
  const h = head + 8 + kinds.length * row;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The head: the file's name.
  pen.bar(x + 14, y + head / 2, 72, "title", 5);
  pen.line(x + 4, y + head, x + w - 4, y + head, "hair", 1);
  // The lines.
  for (const [index, kind] of kinds.entries()) {
    const ry = y + head + 4 + index * row;
    const cy = ry + row / 2;
    const sx = x + 16;
    if (kind === "new") {
      pen.fill(x + 4, ry, w - 8, row, 3, "wash");
    }
    if (kind === "gone") {
      pen.line(sx - 3, cy, sx + 3, cy, "pen", 1);
    }
    if (kind === "new") {
      pen.line(sx - 3, cy, sx + 3, cy, "accent", 1);
      pen.line(sx, cy - 3, sx, cy + 3, "accent", 1);
    }
    const indent = index === 0 || index === kinds.length - 1 ? 0 : 14;
    const length = 60 + pen.random() * 90;
    pen.bar(x + 30 + indent, cy, length, kind === "new" ? "accent" : "body", 5);
  }
};

export const draw = diffViewer;
