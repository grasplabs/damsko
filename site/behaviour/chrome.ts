// The behaviour of the site's frame that is not a component's: the bar that names the section being
// read where there is no rail, and the theme put back after each of the Astro router's page swaps.
// Delegated or re-run after each swap, so nothing is bound twice.
//
//   [data-site-onpage]   the bar where there is no rail (the rail is the library's
//                        TableOfContents, which follows the page itself)
import { applyTheme, currentChoice } from "./theme";

// ---- "On this page" where there is no rail ------------------------------------------------------
// The section being read is the last heading above a line a little under the page's header. The
// bar at the top of the column names it. (The rail beside the column is the library's
// TableOfContents, site/chrome/Toc.astro: it follows the page and marks the section itself.)
let railFrame = 0;

/** The box the page scrolls in: the shell's (site/chrome/DocsShell.tsx), else the window's. */
const scroller = () =>
  document.querySelector<HTMLElement>("[data-site-scroller]") ??
  document.documentElement;

const headerBottom = () =>
  document.querySelector("[data-site-scroller]")?.getBoundingClientRect().top ??
  56;

/** The rail's link for the section being read, among `links`; null above the first. */
const currentOf = (links: HTMLAnchorElement[]) => {
  const edge = headerBottom() + 96;
  let current: HTMLAnchorElement | null = null;
  for (const link of links) {
    const target = document.getElementById(
      decodeURIComponent(link.hash.slice(1))
    );
    if (target && target.getBoundingClientRect().top <= edge) {
      current = link;
    }
  }
  // At the very bottom the last section is the one being read, however short it is.
  const box = scroller();
  const atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;
  if (atEnd && box.scrollHeight > box.clientHeight) {
    current = links.at(-1) ?? null;
  }
  return current;
};

const mark = (
  links: HTMLAnchorElement[],
  current: HTMLAnchorElement | null
) => {
  for (const link of links) {
    if (link === current) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }
};

// Where there is no rail: the bar at the top of the column names the section being read.
const syncOnPage = () => {
  railFrame = 0;
  const bar = document.querySelector<HTMLElement>("[data-site-onpage]");
  if (!bar || bar.offsetParent === null) {
    return;
  }
  const links = [
    ...bar.querySelectorAll<HTMLAnchorElement>("a[data-rail-link]"),
  ];
  const current = currentOf(links);
  mark(links, current);
  const words = bar.querySelector<HTMLElement>("[data-site-onpage-current]");
  const text = current?.querySelector("span")?.textContent ?? "";
  if (words && words.textContent !== text) {
    words.textContent = text;
  }
};

const queueRail = () => {
  if (!railFrame) {
    railFrame = requestAnimationFrame(syncOnPage);
  }
};

// Captured, so a scroll inside the shell's card reaches it too (scroll does not bubble).
addEventListener("scroll", queueRail, { passive: true, capture: true });
addEventListener("resize", queueRail, { passive: true });

const sync = () => {
  applyTheme(currentChoice());
  syncOnPage();
};

document.addEventListener("astro:after-swap", sync);
// Fonts can move the rail's items after the first paint.
void document.fonts?.ready.then(syncOnPage);
sync();
