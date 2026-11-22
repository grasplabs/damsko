// The Reference's folds (site/blocks/Reference.astro): a link to a fold's id (#api), or to a heading
// inside one (#useaction), opens it before the page goes there, so a link never lands on a closed
// box. On load with such an address, the same. The browser's find opens a fold by itself (its panel
// is hidden="until-found").
import { durations } from "@grasp-os/ui/lib/tokens.values";

const foldOf = (id: string) => {
  const target = id ? document.getElementById(id) : null;
  const fold = target?.closest<HTMLElement>("[data-site-fold]") ?? null;
  return { target, fold };
};

const openFold = (fold: HTMLElement) => {
  const trigger = fold.querySelector<HTMLElement>("[aria-expanded]");
  if (trigger?.getAttribute("aria-expanded") === "false") {
    trigger.click();
  }
};

const go = (id: string, smooth: boolean) => {
  const { target, fold } = foldOf(id);
  if (!(target && fold)) {
    return false;
  }
  openFold(fold);
  // After the panel has its height, so the heading inside is where it will stay.
  const place = () => {
    target.scrollIntoView({
      block: "start",
      behavior: smooth ? "smooth" : "instant",
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(place));
  // Once more after the panel has opened (duration-open), in case what is above it moved.
  if (!smooth) {
    setTimeout(place, durations.open + 50);
  }
  return true;
};

document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
    'a[href^="#"]'
  );
  if (!link || link.closest("[data-site-fold] [aria-expanded]")) {
    return;
  }
  const id = decodeURIComponent(link.hash.slice(1));
  if (!foldOf(id).fold) {
    return;
  }
  event.preventDefault();
  history.pushState(null, "", `#${encodeURIComponent(id)}`);
  go(id, !matchMedia("(prefers-reduced-motion: reduce)").matches);
});

// From the address: a fold wakes a moment after the page, so keep trying for up to two seconds.
const fromAddress = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const { fold } = foldOf(id);
  if (!fold) {
    return;
  }
  const started = performance.now();
  const attempt = () => {
    go(id, false);
    const trigger = fold.querySelector("[aria-expanded]");
    if (
      trigger?.getAttribute("aria-expanded") !== "true" &&
      performance.now() - started < 2000
    ) {
      setTimeout(attempt, 100);
    }
  };
  attempt();
};
window.addEventListener("hashchange", fromAddress);
document.addEventListener("astro:page-load", fromAddress);
fromAddress();

// The bar at the top of a narrow page closes once a section is chosen from it.
document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement | null)?.closest(
    "[data-site-onpage] a[data-rail-link]"
  );
  link?.closest("details")?.removeAttribute("open");
});
