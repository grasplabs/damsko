// What the blocks do in the browser. Loaded once for every page by site/behaviour/docs.ts; every listener sits
// on the document, so pages reached through Astro's router work without being bound again.
// Without script every block still reads: the preview shows, code is cut with its full text
// inside, the states stand still and the filter stays invisible.
//
//   [data-stage-tab]      a stage's Preview and Code tabs (a tab list: arrow keys, Home, End)
//   [data-tab-line]       the open tab's mint line, placed under the selected tab
//   [data-ground-choice]  the ground: Soft, Paper or Night (the library's ToggleGroup, one drawn per
//                         ground, the stage's ground showing the matching one); one for every stage, kept
//   [data-option-choice]  a stage's second switch, such as the variant: shows one [data-option]
//   [data-stage-box]      a live preview: clicking in it never leaves or opens a page
//   [data-code-expand]    "Show all" on a long block of code
//   [data-token-filter]   the filter over a page's token rows (it holds its place while invisible)
import { durations } from "@grasp-os/ui/lib/tokens.values";

import { groundKey } from "../system/head-scripts";
import { glide, spanOf } from "./glide";
import { layOutStates } from "./states-layout";

// ---- The tab line ----

// Placed under the open tab at once (on load, resize, fonts), or glided there when the tab changes
// (./glide.ts, the same line as Tabs').
const placeLine = (stage: HTMLElement, moving = false) => {
  const line = stage.querySelector<HTMLElement>("[data-tab-line]");
  const tab = stage.querySelector<HTMLElement>(
    '[data-stage-tab][aria-selected="true"]'
  );
  if (!(line && tab)) {
    return;
  }
  if (moving) {
    glide(line, spanOf(tab));
  } else {
    for (const running of line.getAnimations()) {
      running.cancel();
    }
    line.style.setProperty("left", `${tab.offsetLeft}px`);
    line.style.setProperty("width", `${tab.offsetWidth}px`);
  }
  stage.dataset.tabsReady = "";
};

const placeLines = () => {
  for (const stage of document.querySelectorAll<HTMLElement>("[data-stage]")) {
    placeLine(stage);
  }
};

// ---- Tabs ----

const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The preview and the code differ in height. The stage's views ease from one height to the
// other, so what follows the stage glides rather than jumps; nothing above it moves.
const easeHeight = (stage: HTMLElement, change: () => void) => {
  const views = stage.querySelector<HTMLElement>("[data-stage-views]");
  const from = views?.getBoundingClientRect().height ?? 0;
  change();
  if (!views || reduced()) {
    return;
  }
  const to = views.getBoundingClientRect().height;
  if (Math.abs(to - from) < 1) {
    return;
  }
  const ease = getComputedStyle(document.documentElement)
    .getPropertyValue("--damsko-ease")
    .trim();
  views.style.overflow = "clip";
  const motion = views.animate(
    [{ height: `${from}px` }, { height: `${to}px` }],
    {
      duration: durations.ui,
      easing: ease || "ease-out",
    }
  );
  motion.onfinish = motion.oncancel = () => {
    views.style.overflow = "";
  };
};

const selectTab = (tab: HTMLElement, focus: boolean) => {
  const stage = tab.closest<HTMLElement>("[data-stage]");
  if (!stage) {
    return;
  }
  if (stage.dataset.view === tab.dataset.stageTab) {
    applyTab(stage, tab);
  } else {
    easeHeight(stage, () => {
      applyTab(stage, tab);
    });
  }
  if (focus) {
    tab.focus();
  }
};

const applyTab = (stage: HTMLElement, tab: HTMLElement) => {
  for (const other of stage.querySelectorAll<HTMLElement>("[data-stage-tab]")) {
    const on = other === tab;
    other.setAttribute("aria-selected", String(on));
    other.tabIndex = on ? 0 : -1;
  }
  stage.dataset.view = tab.dataset.stageTab;
  placeLine(stage, true);
};

// ---- Radio groups: the ground and the second switch ----

// The ground is one choice for the whole page: picking Night on one stage puts every stage on
// Night. It is kept for the visitor: the next page and a reload open on it,
// set before the first paint by groundInit (site/system/head-scripts.ts), which reads the same key.
// Without storage it lasts for the page.

const keepGround = (ground: string) => {
  try {
    localStorage.setItem(groundKey, ground);
  } catch {
    // Storage blocked: the choice lasts for this page.
  }
};

// The stage's ground shows the group drawn with that ground pressed (site/blocks/stage.tsx), so
// setting it is the whole change: no toggle's state is written here.
const setGround = (stage: HTMLElement, ground: string) => {
  stage.dataset.ground = ground;
};

const setGrounds = (ground: string) => {
  for (const stage of document.querySelectorAll<HTMLElement>("[data-stage]")) {
    setGround(stage, ground);
  }
};

const check = (choice: HTMLElement, focus: boolean) => {
  const stage = choice.closest<HTMLElement>("[data-stage]");
  if (!stage) {
    return;
  }
  const ground = choice.dataset.groundChoice;
  if (ground) {
    // The group this toggle is in hides as the ground changes: the focus moves to the same toggle
    // in the group now shown, when it was on this one or the keys moved it.
    const held = focus || document.activeElement === choice;
    setGrounds(ground);
    keepGround(ground);
    if (held) {
      stage
        .querySelector<HTMLElement>(
          `[data-ground-set="${ground}"] [data-ground-choice="${ground}"]`
        )
        ?.focus();
    }
    return;
  }
  const group = choice.closest<HTMLElement>('[role="radiogroup"]');
  if (!group) {
    return;
  }
  for (const other of group.querySelectorAll<HTMLElement>('[role="radio"]')) {
    const on = other === choice;
    other.setAttribute("aria-checked", String(on));
    other.tabIndex = on ? 0 : -1;
  }
  for (const part of stage.querySelectorAll<HTMLElement>("[data-option]")) {
    part.hidden = part.dataset.option !== choice.dataset.optionChoice;
  }
  layOutStates();
  if (focus) {
    choice.focus();
  }
};

// ---- Previews never leave the page ----
//
// A preview shows a component working, so a click in it does what the component does to itself
// (press, focus, working, done) but never goes anywhere: no link is followed, in this tab or a new
// one, and no form is sent. The examples keep their real href, because the Code view and the
// Markdown twin hand that code to people and agents. Done here once, for every stage.

const inPreview = (target: EventTarget | null) =>
  target instanceof Element && target.closest("[data-stage-box]") !== null;

// ---- A pressed link answers ----
//
// A link stopped in a preview still shows it was pressed. In a navigation that marks one link as
// the page (aria-current="page": a sidebar, a top bar's links), the mark moves to the pressed link,
// as it would on the next page. Anywhere else (a crumb, a card, a link in words) the link dims for
// a moment, as a press. No words and no toast: the preview only answers the press. When the
// example moves the mark itself (its own click handler, in state), it is left to the example.

/** How far a pressed link dims, at the deepest of its press. */
const PRESSED_DIM = 0.45;

const plainPress = (event: MouseEvent) =>
  event.button === 0 &&
  !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

/** The one link a navigation marks as the page, or null: none, or more than one. */
const markedPage = (nav: Element) => {
  const marked = nav.querySelectorAll<HTMLElement>('a[aria-current="page"]');
  return marked.length === 1 ? (marked[0] ?? null) : null;
};

// The mark is drawn by the component's own classes (StyleX: a row's look with "current" on top), so
// the look moves with it: what the marked link has and a plain link of its list has not is the
// current look, and what the plain link has and the marked one has not is what the current look
// replaced. The marked link gives up the one and takes the other; the pressed link the reverse.
// React leaves both alone until their own props change, and then writes their whole class again.
const moveMark = (from: HTMLElement, to: HTMLAnchorElement) => {
  const list = from.closest("ul, ol") ?? from.parentElement;
  const plain =
    [
      ...(list?.querySelectorAll<HTMLElement>("a[href]:not([aria-current])") ??
        []),
    ].find((other) => other !== to) ?? to;
  const current = [...from.classList].filter(
    (name) => !plain.classList.contains(name)
  );
  const replaced = [...plain.classList].filter(
    (name) => !from.classList.contains(name)
  );
  from.removeAttribute("aria-current");
  from.classList.remove(...current);
  from.classList.add(...replaced);
  to.setAttribute("aria-current", "page");
  to.classList.remove(...replaced);
  to.classList.add(...current);
};

// A press: the link dims and comes back, in durationUi; with reduced motion it holds dim as long,
// without easing. data-preview-pressed says so while it lasts.
const dip = (link: HTMLAnchorElement) => {
  link.dataset.previewPressed = "";
  const keyframes = reduced()
    ? [{ opacity: PRESSED_DIM }, { opacity: PRESSED_DIM }]
    : [{ opacity: 1 }, { opacity: PRESSED_DIM, offset: 0.35 }, { opacity: 1 }];
  const ease = getComputedStyle(document.documentElement)
    .getPropertyValue("--damsko-ease")
    .trim();
  const motion = link.animate(keyframes, {
    duration: durations.ui,
    easing: ease || "ease-out",
  });
  motion.onfinish = motion.oncancel = () => {
    delete link.dataset.previewPressed;
  };
};

const answer = (link: HTMLAnchorElement) => {
  const nav = link.closest('nav, [role="navigation"]');
  const marked = nav ? markedPage(nav) : null;
  // After the press's own handlers: an example that keeps the page in state has moved it by now.
  window.setTimeout(() => {
    if (!link.isConnected) {
      return;
    }
    const movedByExample =
      marked !== link && link.getAttribute("aria-current") === "page";
    if (movedByExample) {
      return;
    }
    if (
      marked &&
      marked !== link &&
      marked.isConnected &&
      marked.getAttribute("aria-current") === "page"
    ) {
      moveMark(marked, link);
      return;
    }
    dip(link);
  }, 0);
};

const stay = (event: Event) => {
  if (!inPreview(event.target)) {
    return;
  }
  const link = (event.target as Element).closest("a[href], area[href]");
  if (link || event.type === "submit") {
    event.preventDefault();
  }
  // A plain press (or Enter) on a link answers, so the link never reads as dead.
  if (
    link instanceof HTMLAnchorElement &&
    event.type === "click" &&
    plainPress(event as MouseEvent)
  ) {
    answer(link);
  }
};

// A link's own menu ("Open in new tab"): there is none in a preview. A link inside an example's
// own Context menu (a Sidebar row's) keeps the right-click for that menu.
const noMenu = (event: MouseEvent) => {
  const target = event.target as Element;
  if (
    inPreview(event.target) &&
    target.closest("a[href]") &&
    !target.closest('[data-slot="menu-context-trigger"]')
  ) {
    event.preventDefault();
  }
};

// A middle click opens a new tab on mousedown in some browsers, before any click.
const noMiddle = (event: MouseEvent) => {
  if (
    event.button === 1 &&
    inPreview(event.target) &&
    (event.target as Element).closest("a[href]")
  ) {
    event.preventDefault();
  }
};

// ---- Show all ----

const toggleCode = (button: HTMLElement) => {
  const block = button.closest<HTMLElement>("[data-code-block]");
  if (!block) {
    return;
  }
  const open = block.dataset.expanded === undefined;
  if (open) {
    block.dataset.expanded = "";
  } else {
    delete block.dataset.expanded;
  }
  button.setAttribute("aria-expanded", String(open));
  if (!open) {
    block.scrollIntoView({ block: "nearest" });
  }
};

// ---- The token filter ----

const filterTokens = (input: HTMLInputElement) => {
  const words = input.value.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  let shown = 0;
  // Each list is a group with its own label: a group with no match hides whole.
  for (const list of document.querySelectorAll<HTMLElement>(
    "[data-token-list]"
  )) {
    let inList = 0;
    for (const row of list.querySelectorAll<HTMLElement>("[data-token-row]")) {
      const text = row.dataset.tokenWords ?? "";
      const match = words.every((word) => text.includes(word));
      row.hidden = !match;
      if (match) {
        inList += 1;
      }
    }
    shown += inList;
    list.hidden = inList === 0;
  }
  const filter = input.closest<HTMLElement>("[data-token-filter]");
  const count = filter?.querySelector<HTMLElement>("[data-token-count]");
  if (count) {
    const total = Number(count.dataset.total);
    count.textContent =
      words.length === 0
        ? `${total} ${count.dataset.noun ?? "tokens"}`
        : `${shown} of ${total}`;
  }
  const empty = document.querySelector<HTMLElement>("[data-token-empty]");
  if (empty) {
    empty.hidden = shown > 0;
  }
};

// ---- The icons' copy menu ----
// One menu for the grid (site/blocks/foundation.tsx, IconMenuView), a popover that the browser
// closes on Escape and on a click outside. A cell opens it under itself, filled with that icon's
// name, import and JSX; focus goes to its first item and comes back to the cell when it closes.

let menuCell: HTMLElement | null = null;
let closed = { cell: null as HTMLElement | null, at: 0 };

const iconMenu = () => document.querySelector<HTMLElement>("[data-icon-menu]");

const openIconMenu = (cell: HTMLElement) => {
  const menu = iconMenu();
  if (!menu) {
    return;
  }
  const name = cell.dataset.iconCell ?? "";
  const values: Record<string, string> = {
    name,
    import: `import { ${name} } from "@grasp-os/ui/lib/icons";`,
    jsx: `<Icon icon={${name}} />`,
  };
  const said: Record<string, string> = {
    name: "name",
    import: "import",
    jsx: "JSX",
  };
  for (const item of menu.querySelectorAll<HTMLElement>("[data-icon-copy]")) {
    const what = item.dataset.iconCopy ?? "name";
    item.dataset.copy = values[what] ?? name;
    item.dataset.copySaid = `Copied the ${said[what] ?? what} of ${name}`;
  }
  menu.setAttribute("aria-label", `Copy ${name}`);
  menuCell = cell;
  cell.setAttribute("aria-expanded", "true");
  menu.showPopover();
  // Under the cell, centred on it, kept space-4 inside the window; above it when there is no room.
  const edge = 16;
  const gap = 4;
  const box = cell.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = menu;
  const x = Math.min(
    Math.max(edge, box.left + box.width / 2 - width / 2),
    window.innerWidth - edge - width
  );
  const below = box.bottom + gap;
  const y =
    below + height > window.innerHeight - edge
      ? Math.max(edge, box.top - gap - height)
      : below;
  menu.style.setProperty("--icon-menu-x", `${Math.round(x)}px`);
  menu.style.setProperty("--icon-menu-y", `${Math.round(y)}px`);
  menu
    .querySelector<HTMLElement>("[data-icon-copy]")
    ?.focus({ preventScroll: true });
};

const closeIconMenu = () => {
  const menu = iconMenu();
  if (menu?.matches(":popover-open")) {
    menu.hidePopover();
  }
};

// When the menu closes, however it closed: the cell says so, and gets focus back if focus was in
// the menu (or nowhere).
document.addEventListener(
  "toggle",
  (event) => {
    const menu = event.target;
    if (!(menu instanceof HTMLElement && menu.matches("[data-icon-menu]"))) {
      return;
    }
    if (event.newState !== "closed" || !menuCell) {
      return;
    }
    const cell = menuCell;
    menuCell = null;
    closed = { cell, at: performance.now() };
    cell.setAttribute("aria-expanded", "false");
    const active = document.activeElement;
    if (!active || active === document.body || menu.contains(active)) {
      cell.focus({ preventScroll: true });
    }
  },
  true
);

document.addEventListener("keydown", (event) => {
  const item = (event.target as Element | null)?.closest<HTMLElement>(
    "[data-icon-copy]"
  );
  const menu = item?.closest<HTMLElement>("[data-icon-menu]");
  if (!(item && menu)) {
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    closeIconMenu();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    return;
  }
  event.preventDefault();
  const items = [...menu.querySelectorAll<HTMLElement>("[data-icon-copy]")];
  const index = items.indexOf(item);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
          items.length;
  items[next]?.focus();
});

// The menu stands where the cell was; once the page scrolls it would stand alone, so it closes.
window.addEventListener(
  "scroll",
  () => {
    if (menuCell) {
      closeIconMenu();
    }
  },
  { passive: true }
);

// ---- Wiring ----

const ready = () => {
  placeLines();
  layOutStates();
  for (const filter of document.querySelectorAll<HTMLElement>(
    "[data-token-filter]"
  )) {
    filter.style.visibility = "";
  }
};

document.addEventListener("click", stay, true);
document.addEventListener("auxclick", stay, true);
document.addEventListener("submit", stay, true);
document.addEventListener("contextmenu", noMenu, true);
document.addEventListener("mousedown", noMiddle, true);

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) {
    return;
  }
  const tab = target.closest<HTMLElement>("[data-stage-tab]");
  if (tab) {
    selectTab(tab, false);
    return;
  }
  const choice = target.closest<HTMLElement>(
    "[data-ground-choice], [data-option-choice]"
  );
  if (choice) {
    check(choice, false);
    return;
  }
  const expand = target.closest<HTMLElement>("[data-code-expand]");
  if (expand) {
    toggleCode(expand);
    return;
  }
  const cell = target.closest<HTMLElement>("[data-icon-cell]");
  if (cell) {
    // A click on the cell whose menu the same press just closed leaves it closed.
    if (
      event.detail > 0 &&
      closed.cell === cell &&
      performance.now() - closed.at < 400
    ) {
      return;
    }
    openIconMenu(cell);
    return;
  }
  const copied = target.closest<HTMLElement>("[data-icon-copy]");
  if (copied) {
    // Long enough to read "Copied", then the menu goes and focus returns to the cell.
    const from = menuCell;
    window.setTimeout(
      () => {
        if (menuCell === from) {
          closeIconMenu();
        }
      },
      durations.swap * 2 + durations.hold
    );
  }
});

// Arrow keys move along a tab list, a radio group or the ground's toggle group, as the ARIA
// patterns describe; in a radio group and the ground the move also chooses.
document.addEventListener("keydown", (event) => {
  if (
    ![
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(event.key)
  ) {
    return;
  }
  const item = (event.target as Element | null)?.closest<HTMLElement>(
    "[data-stage-tab], [data-ground-choice], [data-option-choice]"
  );
  const group = item?.closest<HTMLElement>(
    '[role="tablist"], [role="radiogroup"], [role="group"]'
  );
  if (!(item && group)) {
    return;
  }
  const items = [
    ...group.querySelectorAll<HTMLElement>(
      '[role="tab"], [role="radio"], [data-ground-choice]'
    ),
  ];
  const index = items.indexOf(item);
  // Right to left the line runs the other way, so ArrowLeft goes on.
  const rtl = getComputedStyle(group).direction === "rtl";
  const forward =
    event.key === (rtl ? "ArrowLeft" : "ArrowRight") ||
    event.key === "ArrowDown";
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (index + (forward ? 1 : -1) + items.length) % items.length;
  const to = items[next];
  if (!to) {
    return;
  }
  event.preventDefault();
  if (to.dataset.stageTab) {
    selectTab(to, true);
  } else {
    check(to, true);
  }
});

document.addEventListener("input", (event) => {
  const { target } = event;
  if (
    target instanceof HTMLInputElement &&
    target.closest("[data-token-filter]")
  ) {
    filterTokens(target);
  }
});

window.addEventListener("resize", placeLines);
document.fonts?.ready.then(placeLines);
document.addEventListener("astro:page-load", ready);
ready();
