// A code view scrolls sideways with no bar (site/blocks/code.tsx): this marks which of its edges
// has more beyond it, as data-more (start, end, both), and site.css fades that edge. Code reads
// left to right in every page direction, so the edges are left and right. Marked on load, on each
// scroll, when the box changes size, and after a page swap. A Snippet's value
// (src/components/snippet.tsx) is marked the same way: drawn on the server, it has no React to
// mark it, and its own styles fade the end data-more names.
const BOXES = '[data-code-scroll], [data-slot="snippet-value"]';
const mark = (box: HTMLElement) => {
  const start = box.scrollLeft > 1;
  const end = box.scrollLeft + box.clientWidth < box.scrollWidth - 1;
  const more = start && end ? "both" : start ? "start" : end ? "end" : "";
  if (more) {
    box.dataset.more = more;
  } else {
    delete box.dataset.more;
  }
};

let sizes: ResizeObserver | null = null;
const watch = () => {
  sizes?.disconnect();
  sizes =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver((entries) => {
          entries.forEach((entry) => mark(entry.target as HTMLElement));
        });
  for (const box of document.querySelectorAll<HTMLElement>(BOXES)) {
    mark(box);
    sizes?.observe(box);
  }
};

document.addEventListener(
  "scroll",
  (event) => {
    const box = event.target instanceof HTMLElement ? event.target : null;
    if (box?.matches(BOXES)) {
      mark(box);
    }
  },
  { capture: true, passive: true }
);
document.addEventListener("astro:page-load", watch);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", watch);
} else {
  watch();
}
