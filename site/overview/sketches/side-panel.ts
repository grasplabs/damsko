// Side panel: an inspector beside a page. Its header holds the name and the views as icons; under it,
// sections on one left edge, each a quiet label over a card.
import type { Pen } from "../pen.ts";

export const draw = (pen: Pen) => {
  // The page, behind, on the left.
  pen.fill(40, 30, 120, 120, 12, "wash");
  pen.bar(56, 52, 64, "title", 6);
  pen.bar(56, 68, 88, "body");
  pen.bar(56, 80, 72, "body");
  // The panel beside it.
  const x = 150;
  const w = 134;
  pen.fill(x, 22, w, 136, 14, "sheet");
  pen.box(x, 22, w, 136, 14);
  // Its header: the name, then the views folded to icons, the chosen one in the accent.
  pen.bar(x + 14, 42, 48, "title", 6);
  pen.box(x + w - 54, 34, 16, 16, 5, "accent");
  pen.box(x + w - 32, 34, 16, 16, 5);
  pen.line(x, 60, x + w, 60, "hair", 1);
  // Two sections on one left edge.
  for (const top of [72, 114]) {
    pen.bar(x + 14, top, 36, "body");
    pen.box(x + 14, top + 10, w - 28, 26, 8);
    pen.bar(x + 24, top + 23, 54, "title", 5);
  }
};

export const sidePanel = draw;
