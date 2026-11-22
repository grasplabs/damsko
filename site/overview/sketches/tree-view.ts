// TreeView: nested rows of folders and files, open folders with chevrons down and guide lines under
// them, closed ones with chevrons across; the chosen file is raised, its name in the accent.
import type { Pen } from "../pen.ts";

/** A small chevron pointing right, centred on (cx, cy). */
const across = (pen: Pen, cx: number, cy: number, size: number) => {
  pen.line(cx - size * 0.5, cy - size, cx + size * 0.5, cy, "pen", 1);
  pen.line(cx + size * 0.5, cy, cx - size * 0.5, cy + size, "pen", 1);
};

interface Row {
  depth: number;
  kind: "open" | "closed" | "file";
  length: number;
}

export const draw = (pen: Pen) => {
  const rows: Row[] = [
    { depth: 0, kind: "open", length: 54 },
    { depth: 1, kind: "open", length: 46 },
    { depth: 2, kind: "file", length: 58 },
    { depth: 2, kind: "file", length: 44 },
    { depth: 1, kind: "closed", length: 50 },
    { depth: 0, kind: "closed", length: 42 },
  ];
  const row = 20;
  const indent = 18;
  const w = 156;
  const x = 160 - w / 2;
  const y = 90 - (rows.length * row) / 2;
  const chosen = 2;
  for (const [index, item] of rows.entries()) {
    const ry = y + index * row;
    const cy = ry + row / 2;
    const left = x + 6 + item.depth * indent;
    if (index === chosen) {
      pen.fill(x, ry, w, row, 6, "wash");
    }
    if (item.kind === "open") {
      pen.chevron(left + 4, cy, 3.4);
    }
    if (item.kind === "closed") {
      across(pen, left + 4, cy, 3.4);
    }
    if (item.kind === "file") {
      pen.bar(left + 15, cy, 8, "body", 8);
    } else {
      pen.bar(left + 13, cy, 13, "title", 9);
    }
    pen.bar(
      left + 31,
      cy,
      item.length,
      index === chosen ? "accent" : item.kind === "file" ? "body" : "title",
      5
    );
  }
  // Guide lines under the open folders.
  pen.line(x + 10, y + row + 2, x + 10, y + 5 * row - 2, "hair", 1);
  pen.line(
    x + 10 + indent,
    y + 2 * row + 2,
    x + 10 + indent,
    y + 4 * row - 2,
    "hair",
    1
  );
};
