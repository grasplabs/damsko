// A page prints light, whatever the screen's mode: before the browser prints, the root takes the
// light mode (data-mode, src/styles/themes.css), and gets its own back after. The print sheet
// (site/system/styles/print.css) does the rest.
let kept: string | undefined | null = null;
addEventListener("beforeprint", () => {
  const root = document.documentElement;
  kept = root.dataset.mode;
  root.dataset.mode = "light";
});
addEventListener("afterprint", () => {
  const root = document.documentElement;
  if (kept === null) {
    return;
  }
  if (kept === undefined) {
    delete root.dataset.mode;
  } else {
    root.dataset.mode = kept;
  }
  kept = null;
});
