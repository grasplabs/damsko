// The docs pages last visited, newest first, kept in this browser for the search dialog's empty
// state (site/behaviour/search.ts, idle). Five at most; a page not found is not kept. Nothing leaves
// the browser, and a browser that keeps nothing (private, storage off) simply shows no "Recent".
const key = "damsko-docs-recent";
const base = import.meta.env.BASE_URL.replace(/\/$/u, "");

const keep = () => {
  if (document.querySelector(".site-not-found")) {
    return;
  }
  const route = location.pathname.replace(base, "").replace(/\/$/u, "") || "/";
  const title =
    document.querySelector("#content h1")?.textContent?.trim() ||
    document.title.replace(/\s+[-–]\s+[^-–]+$/u, "").trim();
  if (!title) {
    return;
  }
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    const list = (Array.isArray(kept) ? kept : []).filter(
      (page: { route?: unknown }) => page?.route !== route
    );
    localStorage.setItem(
      key,
      JSON.stringify([{ title, route }, ...list].slice(0, 5))
    );
  } catch {
    // Storage off: nothing to keep.
  }
};

document.addEventListener("astro:page-load", keep);
