// Tag: a loose cluster of small squared pills with short labels, one with a dot in the accent and
// one with an x that removes it.
import type { Pen } from "../pen.ts";

export const tag = (pen: Pen) => {
  const h = 28;
  const r = 8;
  const gap = 10;
  const one = (
    tx: number,
    ty: number,
    w: number,
    dot: boolean,
    removable: boolean
  ) => {
    pen.fill(tx, ty, w, h, r, "sheet");
    pen.box(tx, ty, w, h, r);
    let start = tx + 12;
    if (dot) {
      pen.fill(tx + 11, ty + h / 2 - 4, 8, 8, 4, "accent-fill");
      pen.box(tx + 11, ty + h / 2 - 4, 8, 8, 4, "accent");
      start = tx + 25;
    }
    const end = removable ? tx + w - 24 : tx + w - 12;
    pen.bar(start, ty + h / 2, end - start, "title", 5);
    if (removable) {
      pen.cross(tx + w - 14, ty + h / 2, 3);
    }
  };
  // Two rows, set a little apart so they read as a cluster.
  const top = [86, 66];
  const bottom = [62, 104];
  const rowY = [90 - h - 5, 90 + 5];
  const topX = 160 - (top[0]! + gap + top[1]!) / 2 - 8;
  one(topX, rowY[0]!, top[0]!, true, false);
  one(topX + top[0]! + gap, rowY[0]!, top[1]!, false, false);
  const bottomX = 160 - (bottom[0]! + gap + bottom[1]!) / 2 + 8;
  one(bottomX, rowY[1]!, bottom[0]!, false, false);
  one(bottomX + bottom[0]! + gap, rowY[1]!, bottom[1]!, false, true);
};

export const draw = tag;
