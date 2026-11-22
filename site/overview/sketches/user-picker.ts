// User picker, open: a field with the chosen person's round avatar and name, and under it the people to
// choose from, each with an avatar, a name and a role; the chosen one's name in the accent.
import type { Pen } from "../pen.ts";

const avatar = (pen: Pen, cx: number, cy: number, r: number) => {
  pen.fill(cx - r, cy - r, r * 2, r * 2, r, "wash");
  pen.box(cx - r, cy - r, r * 2, r * 2, r);
};

export const draw = (pen: Pen) => {
  const w = 176;
  const th = 32;
  const gap = 6;
  const row = 26;
  const rows = 3;
  const lh = rows * row + 8;
  const total = th + gap + lh;
  const x = 160 - w / 2;
  const y = 90 - total / 2;
  const cy = y + th / 2;
  // The field: who is chosen now.
  pen.fill(x, y, w, th, 8, "sheet");
  pen.box(x, y, w, th, 8);
  avatar(pen, x + 18, cy, 9);
  pen.bar(x + 34, cy, 60, "title");
  pen.chevron(x + w - 16, cy, 4.5);
  // The people.
  const ly = y + th + gap;
  pen.fill(x, ly, w, lh, 10, "sheet");
  pen.box(x, ly, w, lh, 10);
  const names = [58, 48, 66];
  const roles = [36, 44, 30];
  const chosen = 0;
  for (const [index, length] of names.entries()) {
    const ry = ly + 4 + index * row;
    const ryc = ry + row / 2;
    if (index === chosen) {
      pen.fill(x + 4, ry, w - 8, row, 6, "wash");
    }
    avatar(pen, x + 18, ryc, 8);
    pen.bar(x + 34, ryc, length, index === chosen ? "accent" : "title", 5);
    pen.bar(x + 34 + length + 8, ryc, roles[index] ?? 30, "body", 5);
  }
};

export const ownerPicker = draw;
