// Code block: a card with a head (the language as a short bar, a copy mark at the end) and under a
// hairline numbered lines of code, indented, in runs; one keyword in the accent.
import type { Pen } from "../pen.ts";

type Run = [tone: "title" | "body" | "accent", length: number];

export const codeBlock = (pen: Pen) => {
  const w = 232;
  const h = 118;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const head = 26;
  pen.fill(x, y, w, h, 12, "sheet");
  pen.box(x, y, w, h, 12);
  // The head: the language, and the copy mark as two small sheets.
  pen.bar(x + 14, y + head / 2, 32, "body", 4);
  const cx = x + w - 26;
  pen.box(cx, y + 7, 9, 11, 2);
  pen.fill(cx + 4, y + 10, 9, 11, 2, "sheet");
  pen.box(cx + 4, y + 10, 9, 11, 2);
  pen.line(x + 4, y + head, x + w - 4, y + head, "hair", 1);
  // The lines: a number, an indent, then runs.
  const lines: [indent: number, runs: Run[]][] = [
    [
      0,
      [
        ["title", 24],
        ["body", 44],
        ["body", 26],
      ],
    ],
    [
      1,
      [
        ["accent", 28],
        ["body", 54],
      ],
    ],
    [
      1,
      [
        ["body", 34],
        ["title", 22],
        ["body", 38],
      ],
    ],
    [2, [["body", 64]]],
    [0, [["title", 14]]],
  ];
  for (const [index, [indent, runs]] of lines.entries()) {
    const ly = y + head + 16 + index * 17;
    pen.bar(x + 14, ly, 6, "body", 4);
    let lx = x + 34 + indent * 16;
    for (const [tone, length] of runs) {
      pen.bar(lx, ly, length, tone, 5);
      lx += length + 6;
    }
  }
};

export const draw = codeBlock;
