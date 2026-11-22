// FileTree: the files an assistant changed, as folders that open: chevrons down on the open
// folders, a file icon before each file's name, the chosen file raised, and a small button at the
// end of one row.
import type { Pen } from "../pen.ts";

interface Row {
  depth: number;
  folder: boolean;
  length: number;
}

export const draw = (pen: Pen) => {
  const rows: Row[] = [
    { depth: 0, folder: true, length: 30 },
    { depth: 1, folder: false, length: 52 },
    { depth: 1, folder: false, length: 40 },
    { depth: 0, folder: true, length: 58 },
    { depth: 1, folder: false, length: 64 },
    { depth: 0, folder: false, length: 46 },
  ];
  const row = 20;
  const indent = 18;
  const w = 156;
  const x = 160 - w / 2;
  const y = 90 - (rows.length * row) / 2;
  const chosen = 4;
  for (const [index, item] of rows.entries()) {
    const ry = y + index * row;
    const cy = ry + row / 2;
    const left = x + 6 + item.depth * indent;
    if (index === chosen) {
      pen.fill(x, ry, w, row, 6, "wash");
      pen.box(x + w - 18, cy - 6, 12, 12, 3, "hair");
    }
    if (item.folder) {
      pen.chevron(left + 4, cy, 3.4);
      pen.bar(left + 13, cy, 13, "title", 9);
    } else {
      pen.box(left + 12, cy - 5, 8, 10, 2, "hair");
    }
    pen.bar(
      left + 31,
      cy,
      item.length,
      index === chosen ? "accent" : item.folder ? "title" : "body",
      5
    );
  }
};
