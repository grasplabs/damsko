// Carousel: one slide in view with the edges of its neighbours at either side, and under it the
// buttons that page and a row of dots, the current one a short pill in the accent.
import type { Pen } from "../pen.ts";

export const carousel = (pen: Pen) => {
  const sw = 132;
  const sh = 84;
  const sx = 160 - sw / 2;
  const sy = 34;
  // The neighbours, narrower and lower, then the slide in view.
  const nw = 34;
  const nh = 64;
  const ny = sy + (sh - nh) / 2;
  for (const nx of [sx - 12 - nw, sx + sw + 12]) {
    pen.fill(nx, ny, nw, nh, 8, "wash");
    pen.box(nx, ny, nw, nh, 8);
  }
  pen.fill(sx, sy, sw, sh, 12, "sheet");
  pen.box(sx, sy, sw, sh, 12);
  pen.bar(sx + 16, sy + sh - 32, 70, "title", 7);
  pen.bar(sx + 16, sy + sh - 17, 96, "body", 5);
  // The buttons that page, round, each with its arrow.
  const by = 140;
  const d = 20;
  for (const [cx, way] of [
    [118, -1],
    [202, 1],
  ] as const) {
    pen.box(cx - d / 2, by - d / 2, d, d, d / 2);
    pen.line(cx - way * 2, by - 4, cx + way * 2, by, "pen", 1);
    pen.line(cx + way * 2, by, cx - way * 2, by + 4, "pen", 1);
  }
  // The dots, the current one a short pill.
  const dots = [146, 160, 172];
  pen.bar(dots[0]! - 7, by, 14, "accent", 6);
  for (const cx of dots.slice(1)) {
    pen.bar(cx - 3, by, 6, "body", 6);
  }
};

export const draw = carousel;
