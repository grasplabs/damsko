// The two scripts that must run before a paint, written inline into the page by the layout
// (site/layouts/Docs.astro). Each runs once per real page load; Astro's router keeps an inline script
// it has already run, so what must hold after every page change listens for the router's events.

/**
 * The theme, before the first paint: the page's fixed look (Docs.astro's `mode`), else the
 * reader's choice from storage ("light" or "dark"), else the system's. The router replaces <html>'s attributes with the next page's, which have no theme,
 * so before each swap the current theme is carried onto the incoming page, and after it the choice
 * is read again (another tab may have changed it). The storage key stays `damsko-theme` until the
 * switch, so a reader's choice survives it.
 */
/** The theme the site stands on (src/styles/themes.css); "" for the system's neutral ground. */
export const siteTheme = "evergreen";

/** Where the reader's choice of light or dark is kept (site/behaviour/theme.ts reads it too). */
export const themeKey = "damsko-theme";

export const themeInit = `(() => {
  const key = ${JSON.stringify(themeKey)};
  // A page that always has one look (data-mode-fixed: the home page's dark) has it; any other page
  // the reader's choice, else the system's. The choice itself is never changed by such a page.
  const modeOf = (root = document.documentElement) => {
    const fixed = root.dataset.modeFixed;
    if (fixed === "light" || fixed === "dark") return fixed;
    let stored = null;
    try { stored = localStorage.getItem(key); } catch {}
    const system = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return stored === "light" || stored === "dark" ? stored : system;
  };
  const apply = () => {
    // data-mode (light or dark) and data-theme, as the library's themes read them
    // (src/styles/themes.css); the site's own sheets read the same two.
    document.documentElement.dataset.mode = modeOf();
    // The site stands on the system's own Evergreen theme (its paper is the site's green in dark):
    // the shell, the sidebar and the stages read one ground. ?ground=neutral shows the system's
    // neutral one beside it, for this page only.
    let ground = ${JSON.stringify(siteTheme)};
    try { if (new URLSearchParams(location.search).get("ground") === "neutral") ground = ""; } catch {}
    if (ground) document.documentElement.dataset.theme = ground;
    else delete document.documentElement.dataset.theme;
  };
  apply();
  document.addEventListener("astro:before-swap", (event) => {
    // The incoming page in the reader's choice.
    event.newDocument.documentElement.dataset.mode = modeOf(event.newDocument.documentElement);
    const ground = document.documentElement.dataset.theme;
    if (ground) event.newDocument.documentElement.dataset.theme = ground;
  });
  document.addEventListener("astro:after-swap", apply);
})();`;

/**
 * The reading direction, before the first paint: right to left only when the address asks for it
 * (?dir=rtl), for the checks and for looking at a page as Arabic or Hebrew would lay it out.
 * Nothing is kept: the next page without the parameter is left to right. The router gives <html>
 * the next page's dir, so before each swap it is set from the address being swapped in.
 */
export const directionInit = `(() => {
  const of = (url) => { try { return new URL(url, location.href).searchParams.get("dir") === "rtl" ? "rtl" : "ltr"; } catch { return "ltr"; } };
  document.documentElement.setAttribute("dir", of(location.href));
  document.addEventListener("astro:before-swap", (event) => {
    event.newDocument.documentElement.setAttribute("dir", of(event.to ?? location.href));
  });
})();`;

/**
 * Whether the page is at its top, for the header (site/system/styles/site.css, .site-header): while
 * it is, <html data-site-top> leaves the bar clear; once the page has moved, the glass comes in.
 * Set before the first paint (for a reload or Back, from the place the page was left at, kept for
 * the tab), again on every scroll, and after every page change. With no script there is no mark and the glass is
 * always on.
 */
export const scrollInit = `(() => {
  const root = () => document.documentElement;
  const set = (element, top) => {
    if (top) element.setAttribute("data-site-top", "");
    else element.removeAttribute("data-site-top");
  };
  const mark = () => set(root(), scrollY <= 0);
  // A reload, Back or Forward puts the page back where it was only after the first paint, so
  // scrollY still reads 0 then: the place each page was left at, kept for this tab, says whether
  // it opens scrolled. Kept when a page is left, by the browser or by the router.
  const keyOf = (path) => "site-scrolled:" + path;
  const keep = () => { try { sessionStorage.setItem(keyOf(location.pathname), scrollY > 0 ? "1" : "0"); } catch {} };
  const kept = (path) => { try { return sessionStorage.getItem(keyOf(path)) === "1"; } catch { return false; } };
  let kind = "navigate";
  try { kind = performance.getEntriesByType("navigation")[0]?.type ?? kind; } catch {}
  if ((kind === "reload" || kind === "back_forward") && kept(location.pathname)) set(root(), false);
  else mark();
  addEventListener("pagehide", keep);
  addEventListener("pageshow", (event) => { if (event.persisted) mark(); });
  addEventListener("scroll", mark, { passive: true });
  // The router gives <html> the next page's attributes. A new page opens at its top (or at a
  // section, marked once it is there); Back and Forward open where the page was left.
  document.addEventListener("astro:before-swap", (event) => {
    keep();
    const to = event.to ? new URL(event.to) : null;
    const next = event.newDocument.documentElement;
    if (event.navigationType === "traverse") set(next, !(to && kept(to.pathname)));
    else set(next, !(to && to.hash));
  });
})();`;

/**
 * The sidebar keeps its own scroll. It is its own scroll box and is new markup after
 * every page change, so it would start at the top: its place is saved before the swap and put back
 * after it. On a first load, or when the current page's link is out of sight, the link is brought
 * to the middle. Runs right after the sidebar's markup, before it paints, and again once the shell
 * wakes (site:nav-woke, from DocsShell).
 */
export const sidebarScroll = `(() => {
  const box = () => document.querySelector("[data-site-nav]");
  const centre = () => {
    const sidebar = box();
    const link = sidebar && [...sidebar.querySelectorAll('a[aria-current="page"]')].find((a) => a.getClientRects().length);
    if (!link) return;
    const outer = sidebar.getBoundingClientRect();
    const inner = link.getBoundingClientRect();
    if (inner.top >= outer.top && inner.bottom <= outer.bottom) return;
    sidebar.scrollTop += inner.top - outer.top - (sidebar.clientHeight - inner.height) / 2;
  };
  let saved = -1;
  document.addEventListener("astro:before-swap", () => { saved = box()?.scrollTop ?? -1; });
  document.addEventListener("astro:after-swap", () => {
    const sidebar = box();
    if (sidebar && saved >= 0) sidebar.scrollTop = saved;
    centre();
  });
  // Awake, the link is followed for a moment, while the runs settle.
  document.addEventListener("site:nav-woke", () => {
    const sidebar = box();
    if (!sidebar) return;
    centre();
    const follow = new ResizeObserver(centre);
    for (const child of sidebar.children) follow.observe(child);
    setTimeout(() => follow.disconnect(), 1000);
  });
  centre();
})();`;

/**
 * The stages' ground, before the first paint: the visitor's choice of Soft, Paper or Night is kept
 * (site/blocks/blocks.ts writes it), and every stage is put on it as the parser adds it, so a page
 * never draws Soft first and then changes. The stages come after this script in the page, so a
 * mutation observer sets each stage and each ground radio as it arrives (its records are handled
 * before the next frame) and stops once the page is read. On a page change the incoming page's
 * stages are set before the swap.
 */
export const groundKey = "damsko-stage-ground";

export const groundInit = `(() => {
  const key = ${JSON.stringify(groundKey)};
  const grounds = ["soft", "paper", "night"];
  const read = () => {
    let stored = null;
    try { stored = localStorage.getItem(key); } catch {}
    return grounds.includes(stored) ? stored : "soft";
  };
  // The stage's ground shows the ground group drawn with it pressed (site/blocks/stage.tsx): the
  // toggles themselves are never written.
  const set = (element, ground) => {
    if (element.hasAttribute("data-stage")) element.setAttribute("data-ground", ground);
  };
  const setAll = (root, ground) => {
    for (const element of root.querySelectorAll("[data-stage]")) set(element, ground);
  };
  const ground = read();
  if (ground !== "soft") {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          set(node, ground);
          setAll(node, ground);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => {
      observer.disconnect();
      setAll(document, ground);
    }, { once: true });
  }
  document.addEventListener("astro:before-swap", (event) => {
    const next = read();
    if (next !== "soft") setAll(event.newDocument, next);
  });
})();`;
