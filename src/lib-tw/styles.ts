// The Tailwind experiment's styles.ts. What lib/styles.ts shares, in three forms:
//
// - the focus rings, hyphenation, a hidden scrollbar: `@utility` in styles-tw/damsko.css
//   (`focus-ring`, `focus-field`, `hyphenate`, `scrollbar-hidden`), so a component writes one class;
// - visually hidden words: Tailwind's own `sr-only`, which sets the same eight properties;
// - the larger looks several parts share (a text field's box, the 44px target): class strings here,
//   joined with cn() like any other.
//
// Importing this file starts the focus watcher, once per document: a press marks what it focuses,
// so a field focused by a press keeps its soft halo and one the keyboard reached shows the ring.
// The CSS cannot start it: every component that shows a ring imports this file.

/**
 * Marks an element a pointer press focuses with data-focus-pointer, and takes it off when it loses
 * focus, so a field focused by a press keeps its soft halo and one the keyboard reached shows the
 * ring. Once per document; in the browser only.
 */
const watchPointerFocus = (root: Document) => {
  const flag = "damskoPointerFocus";
  if (root.documentElement.dataset[flag] === "") {
    return;
  }
  root.documentElement.dataset[flag] = "";
  // Until a key is pressed, focus moved by code (a page's first stop after a navigation, focus
  // given back) counts as a press: the ring is the keyboard's, and nothing has come from it yet.
  let pointer = true;
  // A press on what already has focus moves no focus, so focusin never hears it: the element is
  // marked here, so a ring the keyboard drew earlier goes with the press. A key brings it back.
  root.addEventListener(
    "pointerdown",
    (event) => {
      pointer = true;
      const active = root.activeElement;
      if (
        active instanceof HTMLElement &&
        event.target instanceof Node &&
        active.contains(event.target)
      ) {
        active.dataset.focusPointer = "";
      }
    },
    { capture: true, passive: true }
  );
  root.addEventListener(
    "keydown",
    () => {
      pointer = false;
      const active = root.activeElement;
      if (active instanceof HTMLElement) {
        delete active.dataset.focusPointer;
      }
    },
    { capture: true, passive: true }
  );
  root.addEventListener(
    "focusin",
    (event) => {
      if (pointer && event.target instanceof HTMLElement) {
        event.target.dataset.focusPointer = "";
      }
    },
    { capture: true }
  );
  root.addEventListener(
    "focusout",
    (event) => {
      if (event.target instanceof HTMLElement) {
        delete event.target.dataset.focusPointer;
      }
    },
    { capture: true }
  );
};
if (typeof document !== "undefined") {
  watchPointerFocus(document);
}

/**
 * The box a text field draws, the same for Input, Textarea and Select's closed control: its height,
 * padding and corner at each size, the 44px target a finger needs, and its states.
 */
export const inputStyles = {
  sm: "min-h-control-sm py-[calc((var(--damsko-control-sm)-var(--damsko-text-sm-line))/2)] rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-sm)/2))]",
  default:
    "min-h-control-default py-[calc((var(--damsko-control-default)-var(--damsko-text-sm-line))/2)] rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-default)/2))]",
  lg: "min-h-control-lg py-[calc((var(--damsko-control-lg)-var(--damsko-text-sm-line))/2)] rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-lg)/2))]",
  target: "absolute inset-x-0 inset-y-0",
  targetSm:
    "inset-y-0 coarse:inset-y-[calc((var(--damsko-control-sm)-var(--damsko-tap-target))/2)]",
  targetDefault:
    "inset-y-0 coarse:inset-y-[calc((var(--damsko-control-default)-var(--damsko-tap-target))/2)]",
  targetLg: "inset-y-0",
  // Hover never covers the focus edge: the pointer often rests on a field while you type.
  enabled:
    "shadow-[inset_0_0_0_1px_var(--damsko-input),var(--damsko-input-shadow)] hover:not-focus-visible:shadow-[inset_0_0_0_1px_var(--damsko-input-border-hover),var(--damsko-input-shadow)] focus-visible:shadow-(--damsko-input-focus)",
  disabled:
    "opacity-(--damsko-opacity-disabled) shadow-[inset_0_0_0_1px_var(--damsko-input)] cursor-not-allowed",
  invalid:
    // Said for hover too: StyleX replaced the whole box-shadow (its hover with it); cn() replaces
    // only the classes of the same variant, and the hover class of `enabled` would stay.
    "shadow-(--damsko-input-invalid) hover:not-focus-visible:shadow-(--damsko-input-invalid) focus-visible:shadow-(--damsko-input-focus-invalid) border-solid forced-colors:border-dashed",
};

/** The unseen box that grows a small control's target to 44px on a touch screen. */
export const tapTarget =
  "absolute inset-0 coarse:inset-[min(0px,calc((100%-var(--damsko-tap-target))/2))]";

/**
 * A Collapsible's and an Accordion's shared look: a quiet full-width trigger, its words and a
 * chevron at its end that turns as it opens, and the panel under it that opens over its height.
 * A part marks itself disabled with data-disabled, as UI SDK does. Inside a card that holds a Trace
 * row (`data-trace-card`), no line in forced colours and no fill under the pointer.
 */
export const disclosureStyles = {
  // The trigger bleeds out by its own padding, so its words and the panel's share one left edge.
  trigger: [
    "icon-sm relative flex items-center min-h-collapsible-trigger my-0 mx-[calc(-1*var(--damsko-collapsible-padding))] py-0 px-collapsible-padding",
    "border-0 forced-colors:border forced-colors:in-data-trace-card:border-0 border-solid border-transparent rounded-[min(var(--damsko-radius-lg),calc(var(--damsko-collapsible-trigger)/2))] corner-squircle",
    "font-[inherit] text-sm leading-[1.125rem] font-medium text-start text-foreground data-disabled:text-subtle-foreground forced-colors:data-disabled:text-[GrayText] cursor-pointer data-disabled:cursor-not-allowed",
    "active:[transform:scale(var(--damsko-button-press-scale))] active:data-disabled:transform-none transition-[transform,background-color] duration-[var(--damsko-motion-hover),var(--damsko-duration-hover)] ease-ui touch-manipulation tap-highlight-none",
  ],
  // On the page, filled only under the pointer and the press; a disabled trigger takes neither.
  ghost:
    "bg-transparent hover:bg-accent hover:data-disabled:bg-transparent hover:in-data-trace-card:bg-transparent active:bg-accent-active active:data-disabled:bg-transparent active:in-data-trace-card:bg-transparent data-disabled:bg-transparent",
  words: "grow min-w-0 wrap-anywhere",
  // Points down while closed and turns up as it opens.
  chevron:
    "inline-flex shrink-0 transition-[transform] duration-(--damsko-motion-ui) ease-ui",
  chevronOpen: "[transform:rotate(0.5turn)]",
  // The height UI SDK measures and writes. Without script nothing opens a panel: every panel open.
  panel:
    "no-script:block overflow-hidden h-[var(--collapsible-panel-height,var(--accordion-panel-height))] motion-moving:h-0 no-script:h-auto transition-[height] duration-(--damsko-motion-collapsible-open) ease-[ease-out]",
  quiet: "text-xs leading-[1.125rem] text-muted-foreground",
  body: "py-2",
};
