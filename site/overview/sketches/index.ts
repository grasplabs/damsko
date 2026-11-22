// The overview's sketches, one per component, by the name in its route ("data-table"). Each file in
// this folder is one component's drawing, named as its route and exporting `draw(pen)`; it is found
// here by Vite's import.meta.glob, so a new file is a new sketch with no list to edit. Each is drawn
// by the pen (../pen.ts) at build time and seeded by that name.
//
// A file with no `draw`, or whose drawing throws, gives no sketch: its tile shows an empty room, the
// build names it once, so one unfinished drawing never breaks
// the page.
import { sketch } from "../pen.ts";
import type { Pen } from "../pen.ts";

type Draw = (pen: Pen) => void;

const files = import.meta.glob<{ draw?: unknown }>(["./*.ts", "!./index.ts"], {
  eager: true,
});

/** Every drawing by its component's name: "./data-table.ts" is "data-table". */
const drawings = new Map<string, unknown>(
  Object.entries(files).map(([path, module]) => [
    path.replaceAll(/^\.\/|\.ts$/gu, ""),
    module.draw,
  ])
);

const told = new Set<string>();
const tell = (name: string, why: string) => {
  if (told.has(name)) {
    return;
  }
  told.add(name);
  console.warn(
    `[overview] sketches/${name}.ts ${why}; its tile shows an empty room`
  );
};

const drawn = new Map<string, string | null>();

/** The sketch for a component, as inline SVG, or null when it has none (yet). */
export const sketchOf = (name: string): string | null => {
  if (drawn.has(name)) {
    return drawn.get(name) ?? null;
  }
  let svg: string | null = null;
  if (drawings.has(name)) {
    const draw = drawings.get(name);
    if (typeof draw === "function") {
      try {
        svg = sketch(name, draw as Draw);
      } catch (error) {
        tell(
          name,
          `throws while drawing (${error instanceof Error ? error.message : String(error)})`
        );
      }
    } else {
      tell(name, "exports no draw(pen)");
    }
  }
  drawn.set(name, svg);
  return svg;
};
