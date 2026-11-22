// StyleX's sheet keeps one name across builds (/_astro/stylex.css: site/system/vite.ts, stylexSheet),
// and Astro's router keeps a stylesheet whose address has not changed. So a tab open across a deploy
// would draw the new page's markup with the old rules: a style added since would be missing. On each
// navigation by the router the sheet is asked for again beside the page (a conditional request, a 304
// with no body when it has not changed), and when its build stamp differs from the one in use, the
// new page links it by an address of its own (`?build=<stamp>`) and is shown only once that sheet has
// loaded, so nothing is drawn unstyled. A whole page load needs none of this: the sheet is served
// `no-cache`, so the browser asks for it anyway.
const SHEET = "/_astro/stylex.css";

interface Preparation extends Event {
  loader: () => Promise<void>;
  newDocument: Document;
}

/** The build stamp at the head of a sheet's text, or null. */
const stampOf = (text: string) =>
  /--site-stylex-build:\s*"([a-f0-9]+)"/u.exec(text)?.[1] ?? null;

/** The stamp of the sheet the page draws with now. */
const stampInUse = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--site-stylex-build")
    .replaceAll('"', "")
    .trim();

/** Fetches a stylesheet into the cache and resolves when it is there (or failed). */
const preload = (href: string) =>
  new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "style";
    link.href = href;
    link.addEventListener("load", () => {
      resolve();
    });
    link.addEventListener("error", () => {
      resolve();
    });
    document.head.append(link);
  });

const revalidate = async (): Promise<string | null> => {
  try {
    const response = await fetch(SHEET, { cache: "no-cache" });
    return response.ok ? stampOf(await response.text()) : null;
  } catch {
    return null;
  }
};

document.addEventListener("astro:before-preparation", (event) => {
  const preparation = event as Preparation;
  const load = preparation.loader;
  // Asked beside the page, not after it: a navigation waits for the slower of the two.
  const checked = revalidate();
  preparation.loader = async () => {
    await load();
    const stamp = await checked;
    if (stamp === null || stamp === stampInUse()) {
      return;
    }
    const link = preparation.newDocument?.querySelector(
      `link[rel="stylesheet"][href^="${SHEET}"]`
    );
    if (link === null || link === undefined) {
      return;
    }
    const href = `${SHEET}?build=${stamp}`;
    link.setAttribute("href", href);
    await preload(href);
  };
});
