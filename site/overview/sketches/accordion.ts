// Accordion: a stack of headings with chevrons between rules; the middle one open, its heading
// and upturned chevron in the accent and its text showing under it.
import type { Pen } from "../pen.ts";

export const accordion = (pen: Pen) => {
  const w = 216;
  const head = 28;
  const panel = 40;
  const h = head * 3 + panel;
  const x = 160 - w / 2;
  const y = 90 - h / 2;
  const open = 1;
  const titles = [92, 118, 80];
  let cy = y;
  pen.line(x, cy, x + w, cy, "hair", 1);
  for (const [index, length] of titles.entries()) {
    const chosen = index === open;
    pen.bar(x + 6, cy + head / 2, length, chosen ? "accent" : "title", 6);
    pen.chevron(
      x + w - 12,
      cy + head / 2,
      4,
      chosen ? "accent" : "pen",
      chosen
    );
    cy += head;
    if (chosen) {
      pen.bar(x + 6, cy + 8, 180, "body", 5);
      pen.bar(x + 6, cy + 21, 132, "body", 5);
      cy += panel;
    }
    pen.line(
      x,
      cy,
      x + w,
      cy,
      index === titles.length - 1 ? "hair" : "hair",
      1
    );
  }
};

export const draw = accordion;
