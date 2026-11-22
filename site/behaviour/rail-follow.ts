// The rail keeps the section being read in sight. Where the rail is taller than its room (a page of
// many sections in a short window) it scrolls, and the Outline marks the current item with
// aria-current; when that item changes and stands outside the rail's room, the rail (not the page)
// scrolls just enough to show it, with a little room round it; at the last item, to its own end,
// so the page tools under the list show too. Smooth unless motion is reduced.
const ROOM = 24;

let watcher: MutationObserver | null = null;

const keepInSight = (column: HTMLElement) => {
  const current = column.querySelector<HTMLElement>("[aria-current]");
  if (!current || column.scrollHeight <= column.clientHeight) {
    return;
  }
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The last item: the rail goes to its own end, so the page tools under the list show too.
  const links = column.querySelectorAll(
    "[data-outline-link], a[data-rail-link]"
  );
  const last = [...links].at(-1);
  if (last?.contains(current) || last === current) {
    column.scrollTo({
      top: column.scrollHeight,
      behavior: smooth ? "smooth" : "instant",
    });
    return;
  }
  const box = column.getBoundingClientRect();
  const item = current.getBoundingClientRect();
  let delta = 0;
  if (item.top < box.top + ROOM) {
    delta = item.top - box.top - ROOM;
  } else if (item.bottom > box.bottom - ROOM) {
    delta = item.bottom - box.bottom + ROOM;
  }
  if (delta === 0) {
    return;
  }
  column.scrollBy({ top: delta, behavior: smooth ? "smooth" : "instant" });
};

const start = () => {
  watcher?.disconnect();
  const column = document.querySelector<HTMLElement>("[data-site-toc]");
  const rail = column?.querySelector("[data-site-rail]");
  if (!column || !rail) {
    return;
  }
  watcher = new MutationObserver(() => {
    keepInSight(column);
  });
  watcher.observe(rail, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-current"],
  });
  keepInSight(column);
};

document.addEventListener("astro:page-load", start);
start();
