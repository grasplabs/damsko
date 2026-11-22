// Dev only (site/system/client.ts loads it on every page under `astro dev`): keeps StyleX's CSS
// current while files are edited. The CSS itself arrives with the HTML, as
// <link rel="stylesheet" href="/virtual:stylex.css"> in the head (site/layouts/Docs.astro, Frame.astro), so a
// page is styled on first paint without this script; Astro's router carries that link across
// client-router navigations, matched by its href.
//
// The StyleX plugin's own runtime is not used: it copies the CSS into a <style> and disables the
// link, and Astro's router drops that <style> on the next navigation, which left every page
// reached by a link unstyled.
const HREF = "/virtual:stylex.css";
const SELECTOR = `link[rel="stylesheet"][href^="${HREF}"]`;

// A page without the header (an example frame) gets the link here, at the end of the head,
// after the base sheets, so StyleX's layers still outrank them.
if (!document.querySelector(SELECTOR)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = HREF;
  document.head.append(link);
}

// After an edit: load the new CSS into a fresh link beside the current one (same place, so the
// cascade does not move) and remove the old ones only once it has loaded, so no frame is drawn
// without StyleX. Edits in quick succession each add a link; the newest to load removes the rest.
const refresh = () => {
  const current = [...document.querySelectorAll<HTMLLinkElement>(SELECTOR)];
  const last = current.at(-1);
  if (!last) {
    return;
  }
  const next = document.createElement("link");
  next.rel = "stylesheet";
  next.href = `${HREF}?t=${Date.now()}`;
  next.addEventListener(
    "load",
    () => {
      current.forEach((link) => link.remove());
    },
    { once: true }
  );
  next.addEventListener(
    "error",
    () => {
      next.remove();
    },
    { once: true }
  );
  last.after(next);
};

// `stylex:css-update` is sent by the StyleX plugin whenever its collected CSS changes.
import.meta.hot?.on("stylex:css-update", refresh);
