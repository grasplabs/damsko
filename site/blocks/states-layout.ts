// The every-state rows (site/blocks/states.tsx) laid out to their specimens. CSS cannot know the
// widest specimen in a row, so each row is measured once at its natural width (every cell
// max-content, nothing squeezed) and then given as many equal columns as fit, each at least that
// wide, with the cells balanced over the lines (eight cells: 4 + 4, 2 + 2 + 2 + 2, never 3 + 3 + 2).
// Measured again when the stage changes width, a variant is switched in, or a specimen draws
// something new (an island hydrating, a forced state taking hold). Without script the row keeps
// its CSS columns. A column of wide parts ([data-state-grid="column"]) is left to its CSS. Loaded
// by site/blocks/blocks.ts.

const rows = new Set<HTMLElement>();
let queued = false;

const measure = (grid: HTMLElement) => {
  const cells = [
    ...grid.querySelectorAll<HTMLElement>(":scope > [data-state-cell]"),
  ];
  if (!cells.length || !grid.getClientRects().length) {
    return;
  }
  // The natural width: every cell as wide as its content wants, on one line.
  grid.style.gridTemplateColumns = `repeat(${cells.length}, max-content)`;
  grid.style.width = "max-content";
  const widest = Math.ceil(
    Math.max(...cells.map((cell) => cell.getBoundingClientRect().width))
  );
  grid.style.width = "";
  const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
  const room = grid.clientWidth;
  const fit = Math.max(
    1,
    Math.min(cells.length, Math.floor((room + gap) / (widest + gap)))
  );
  const lines = Math.ceil(cells.length / fit);
  const columns = Math.ceil(cells.length / lines);
  // Never wider than the stage: a part wider than a phone shrinks as it does on any page.
  grid.style.gridTemplateColumns = `repeat(${columns}, minmax(min(${widest}px, 100%), 1fr))`;
  grid.dataset.stateColumns = String(columns);
};

const run = () => {
  queued = false;
  for (const grid of rows) {
    if (!grid.isConnected) {
      rows.delete(grid);
      continue;
    }
    measure(grid);
  }
  document.documentElement.dataset.statesLaidOut = "";
};

const queue = () => {
  if (queued) {
    return;
  }
  queued = true;
  requestAnimationFrame(run);
};

// A specimen's own size does not follow its content (it fills its cell), so what is watched is
// what it holds.
const watcher =
  typeof ResizeObserver === "undefined" ? null : new ResizeObserver(queue);
const changes =
  typeof MutationObserver === "undefined" ? null : new MutationObserver(queue);

export const layOutStates = () => {
  for (const grid of document.querySelectorAll<HTMLElement>(
    '[data-state-grid=""]'
  )) {
    if (rows.has(grid)) {
      continue;
    }
    rows.add(grid);
    const holder = grid.parentElement;
    if (holder) {
      watcher?.observe(holder);
    }
    for (const specimen of grid.querySelectorAll<HTMLElement>(
      "[data-state-specimen]"
    )) {
      for (const child of specimen.children) {
        watcher?.observe(child);
      }
      changes?.observe(specimen, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-force", "class"],
      });
    }
  }
  queue();
};
