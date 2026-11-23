// How a theme changes, for the theme examples: in one frame; a crossfade of the whole page (View
// Transitions, 280ms); or a reveal, a soft circle growing from the switch on our ease (300ms).
// Both animations are at or under the product's 300ms limit. With reduced motion, and where a
// browser has no View Transitions, every way is one frame.
import { flushSync } from "react-dom";

/** The ways a theme can change. */
export type ThemeChangeWay = "frame" | "fade" | "reveal";

// The View Transition's own pseudo-elements live on the document, so their rules are global: draw
// them once, in a <style>. The reveal grows a circle from the point the switch stood at, read from
// three custom properties.
export const themeChangeCss = `
::view-transition-old(root), ::view-transition-new(root) { animation: none; mix-blend-mode: normal; }
html[data-damsko-change="fade"]::view-transition-old(root) { animation: damsko-fade-out 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="fade"]::view-transition-new(root) { animation: damsko-fade-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both; }
html[data-damsko-change="reveal"]::view-transition-new(root) { animation: damsko-reveal 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes damsko-fade-out { to { opacity: 0; } }
@keyframes damsko-fade-in { from { opacity: 0; } }
@keyframes damsko-reveal {
  from { clip-path: circle(0 at var(--theme-change-x) var(--theme-change-y)); }
  to { clip-path: circle(var(--theme-change-r) at var(--theme-change-x) var(--theme-change-y)); }
}
`;

/** Applies a change the chosen way: at once, or inside a View Transition that starts at `from`. */
export const changeTheme = (
  way: ThemeChangeWay,
  apply: () => void,
  from: { x: number; y: number }
) => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (way === "frame" || reduced || !("startViewTransition" in document)) {
    apply();
    return;
  }
  // The circle reaches the farthest corner of the window from where it starts.
  const r = Math.hypot(
    Math.max(from.x, window.innerWidth - from.x),
    Math.max(from.y, window.innerHeight - from.y)
  );
  root.style.setProperty("--theme-change-x", `${from.x}px`);
  root.style.setProperty("--theme-change-y", `${from.y}px`);
  root.style.setProperty("--theme-change-r", `${r}px`);
  root.dataset.damskoChange = way;
  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });
  void transition.finished.then(() => {
    delete root.dataset.damskoChange;
  });
};

/** The middle of an element's box, where a change it made starts from. */
export const middleOf = (element: Element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
