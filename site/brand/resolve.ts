// Arriving through the dither: the Showcase's entrance (site/pages/index.astro), taken as a module
// the brand book's entrance can use. A part is drawn through the library's 4×4 ordered dither (the
// Bayer matrix of the ground and the chart) from a sparse, coarse ghost to the solid thing: the
// density climbs and the cells shrink. Only a mask changes, so no box moves and the words stay
// words for a screen reader.
//
// The ghost is CSS, so it holds from the first paint: a part marked `data-resolve` stands as its
// sparsest ghost while an ancestor carries `data-arriving` (brand.css), and stands whole under
// reduced motion or with no script. `arrive()` plays the parts and takes the mark away; a key, a
// press or a scroll ends it at once, everything whole.

const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** One level of the dither (of 16) as a 4×4 tile, for `mask-image`. */
export const ditherTile = (level: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4' shape-rendering='crispEdges'>${bayer
      .map((value, index) =>
        value < level
          ? `<rect x='${index % 4}' y='${Math.floor(index / 4)}' width='1' height='1'/>`
          : ""
      )
      .join("")}</svg>`
  )}")`;

/** From a ghost to the thing, coarse to fine: [density of 16, the cell's size in px] at each step. */
type Cells = readonly (readonly [number, number])[];

/** The name's way in: large cells first. */
export const coarse: Cells = [
  [1, 8],
  [2, 7],
  [3, 6],
  [4, 5],
  [6, 4],
  [8, 3],
  [10, 3],
  [12, 2],
  [14, 1],
  [15, 1],
];
/** A part's way in: a little finer from the start. */
export const fine: Cells = [
  [1, 6],
  [2, 6],
  [3, 5],
  [4, 5],
  [6, 4],
  [8, 3],
  [10, 3],
  [12, 2],
  [14, 2],
  [15, 1],
];

const frames = (cells: Cells): Keyframe[] => [
  ...cells.map(([level, size], index) => ({
    offset: index / cells.length,
    maskImage: ditherTile(level),
    maskSize: `${size * 4}px ${size * 4}px`,
    easing: "step-end",
  })),
  { offset: 1, maskImage: "none" },
];

export interface Arrival {
  /** The part, marked `data-resolve`. */
  element: Element;
  /** When it starts, in ms from the beginning. */
  delay: number;
  /** How long it takes. */
  duration: number;
  cells?: Cells;
}

/**
 * Plays an arrival: every part from its ghost to itself, then takes `data-arriving` off `root`.
 * Under reduced motion, without the Web Animations API, or once a key, a press or a scroll comes,
 * everything is whole at once. Returns a function that ends it.
 */
export const arrive = (
  root: HTMLElement,
  parts: readonly Arrival[],
  onDone?: () => void
): (() => void) => {
  const running: Animation[] = [];
  let ended = false;
  const kinds = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  const done = () => {
    if (ended) {
      return;
    }
    ended = true;
    root.removeAttribute("data-arriving");
    for (const animation of running) {
      animation.cancel();
    }
    for (const kind of kinds) {
      removeEventListener(kind, done, true);
    }
    onDone?.();
  };
  const still =
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    typeof root.animate !== "function";
  if (still) {
    done();
    return done;
  }
  for (const kind of kinds) {
    addEventListener(kind, done, { capture: true, passive: true });
  }
  for (const { element, delay, duration, cells = fine } of parts) {
    running.push(
      element.animate(frames(cells), { delay, duration, fill: "both" })
    );
  }
  void Promise.all(running.map((animation) => animation.finished)).then(
    done,
    () => undefined
  );
  return done;
};
