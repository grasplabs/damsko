// Touch targets, across the library: on a touch phone (390 by 844), in every component example,
// every control takes a finger, and no control's target takes another's press.
//
// - Its own: a press anywhere on a control's visible box (sampled every 2px) lands on that control,
//   never on another control's target. A text field is a control here too. A control drawn on
//   another (a ×, a chevron) takes the presses on its own box.
// - Its reach: through its middle, across and down, a press lands on the control (its own box, the
//   invisible target it draws, or the label it stands in) over the system's tap target (the
//   `size.tapTarget` token, 44px), wherever there is room: on each side as far as half the way to
//   the nearest control beside it, or the screen's edge. Links in running text are left out, as
//   WCAG leaves them, and so are text fields, which keep their size's height.
// - The middle: where two controls stand closer than both targets need, each target stops at the
//   middle of the gap between them, so a press in the gap goes to the nearer one.
// - No scroll: a target never makes a box (or the page) scroll further than its content does.
//
// Not in Firefox, which has no phone mode (playwright.config.ts).
//
// The controls listed below fall short of the tap target, each for a reason named with it; each
// waits on a decision, and is excused its reach only: none covers another control or takes its
// presses, and none makes anything scroll.
import { expect, test } from "@playwright/test";

import { componentExamples, openExample, settled } from "./example.ts";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

// Why each one falls short, for the owner to decide.
// A small link or a words-only button with no target of its own (as on main): whether it grows one.
const noTarget = "no target of its own";
// It stands on another control's box (a × on its tab, a clear button in the field's edge), so its
// target keeps to its own box: it would have to stand beside the other control instead.
const onAnother = "stands on another control";
// At the edge of a box that scrolls or clips (a grid, a diff, a panel that opens, a card), which
// cuts its target: the box would have to make room round it.
const clipped = "cut by the box round it";
// Set closer to its neighbours than two 44px targets need (marks, page numbers, tags, a column's
// menu beside its sort button): the targets meet in the middle; 44px each needs them further apart.
const dense = "closer than two targets need";
// The first or last of an edge-to-edge group: the group gives no room past its edge either, where
// another group stands a gap away.
const grouped = "end of a group set edge to edge";
// The room its row or column gives between its controls (half the gap, from the gap's token) holds
// on its outer side too, or is a step less than the drawn gap: the part would have to say the room
// on that side.
const outer = "the room given is less than the room there";

const excused = new Map<string, string>([
  ["alert-dialog/removes: Delete Supplier list", outer],
  ["app-shell-01/panel: Show or hide the panel", outer],
  ["attachment/basic: Remove quarter-figures.xlsx", clipped],
  ["attachment/basic: Remove supplier-contract-2027-final.pdf", clipped],
  ["attachment/parts: Remove budget-2027.xlsx", clipped],
  ["attachment/parts: Remove customers-export.csv", clipped],
  ["attachment/states: Cancel the upload of design-system.zip", clipped],
  ["attachment/states: Remove financial-model.xlsx", clipped],
  ["attachment/states: Remove selected-file.pdf", clipped],
  ["badge/link: Design systems and research", noTarget],
  ["badge/link: What is new", noTarget],
  ["button-group/icons: Bold", grouped],
  ["button/truncate: More actions", outer],
  ["carousel/several: Previous", dense],
  ["carousel/states: Next", dense],
  ["chain-of-thought/image: Read 1 file and made a chart", clipped],
  ["chain-of-thought/live: Searching the webSearching the web, Work", clipped],
  ["chain-of-thought/results: Searched once and read 1 file", clipped],
  [
    "chain-of-thought/script: Searching the webSearching the web, Work",
    clipped,
  ],
  [
    "chain-of-thought/states: Writing the summaryWriting the summary, ",
    clipped,
  ],
  ["collapsible/several: Section 1", outer],
  ["collapsible/several: Section 2", outer],
  ["combobox/multiple: Remove Amara Okafor", dense],
  ["combobox/multiple: Remove Design team", dense],
  ["container/settings: BUTTON", noTarget],
  ["data-grid/active-halo: Budget", clipped],
  ["data-grid/active-halo: Owner", clipped],
  ["data-grid/active-halo: Stage", clipped],
  ["data-grid/active-halo: Task", clipped],
  ["data-grid/active-underline: Budget", clipped],
  ["data-grid/active-underline: Owner", clipped],
  ["data-grid/active-underline: Stage", clipped],
  ["data-grid/active-underline: Task", clipped],
  ["data-grid/basic: Budget", clipped],
  ["data-grid/basic: Owner", clipped],
  ["data-grid/basic: Stage", clipped],
  ["data-grid/basic: Task", clipped],
  ["data-grid/header-chip: Budget", clipped],
  ["data-grid/header-chip: Owner", clipped],
  ["data-grid/header-chip: Stage", clipped],
  ["data-grid/header-chip: Task", clipped],
  ["data-grid/header-lifted: Budget", clipped],
  ["data-grid/header-lifted: Owner", clipped],
  ["data-grid/header-lifted: Stage", clipped],
  ["data-grid/header-lifted: Task", clipped],
  ["data-grid/header-quiet: Budget", clipped],
  ["data-grid/header-quiet: Owner", clipped],
  ["data-grid/header-quiet: Stage", clipped],
  ["data-grid/header-quiet: Task", clipped],
  ["data-grid/live: Budget", clipped],
  ["data-grid/live: Owner", clipped],
  ["data-grid/live: Stage", clipped],
  ["data-grid/live: Task", clipped],
  ["data-grid/range-dither: Budget", clipped],
  ["data-grid/range-dither: Owner", clipped],
  ["data-grid/range-dither: Stage", clipped],
  ["data-grid/range-dither: Task", clipped],
  ["data-grid/range-outline: Budget", clipped],
  ["data-grid/range-outline: Owner", clipped],
  ["data-grid/range-outline: Stage", clipped],
  ["data-grid/range-outline: Task", clipped],
  ["data-grid/range-wash: Budget", clipped],
  ["data-grid/range-wash: Owner", clipped],
  ["data-grid/range-wash: Stage", clipped],
  ["data-grid/range-wash: Task", clipped],
  ["data-grid/read-only: Budget", clipped],
  ["data-grid/read-only: Owner", clipped],
  ["data-grid/read-only: Stage", clipped],
  ["data-grid/read-only: Task", clipped],
  ["data-grid/tab-leave: Budget", clipped],
  ["data-grid/tab-leave: Owner", clipped],
  ["data-grid/tab-leave: Stage", clipped],
  ["data-grid/tab-leave: Task", clipped],
  ["data-grid/tab-move: Budget", clipped],
  ["data-grid/tab-move: Owner", clipped],
  ["data-grid/tab-move: Stage", clipped],
  ["data-grid/tab-move: Task", clipped],
  ["data-table/columns-later: Column: Owner", dense],
  ["data-table/columns-later: Column: Report", dense],
  ["data-table/columns: BUTTON", dense],
  ["data-table/columns: Column: Last edited", dense],
  ["data-table/columns: Column: Owner", dense],
  ["data-table/columns: Column: Pages", dense],
  ["data-table/columns: Column: Report", dense],
  ["data-table/columns: Column: Status", dense],
  ["data-table/columns: Column: Team", dense],
  ["data-table/members-narrow: More about Role", dense],
  ["data-table/rows: Report", dense],
  ["data-table/views: Column: Last edited", dense],
  ["data-table/views: Column: Owner", dense],
  ["data-table/views: Column: Pages", dense],
  ["data-table/views: Column: Report", dense],
  ["data-table/workflows: Column: Owner", dense],
  ["data-table/workflows: Column: Workflow", dense],
  ["dialog/footer-sizes: Close", outer],
  ["dialog/footer-sizes: Hold to stop sharing", outer],
  ["dialog/footer-sizes: More ways", outer],
  ["diff-viewer/basic: Show 10 unchanged lines", clipped],
  ["diff-viewer/folded: Show 10 unchanged lines", clipped],
  ["diff-viewer/hunks: Show 3 unchanged lines", clipped],
  ["drawer/removes: Delete Supplier list", outer],
  ["field/focus-sizes: Remove Finance", dense],
  ["field/legend: BUTTON", noTarget],
  ["field/sets: BUTTON", noTarget],
  ["field/status: 90 days", dense],
  ["field/status: Try again", dense],
  ["hover-card/document: Q3 forecast", outer],
  ["image-upload/setting: Change picture", noTarget],
  ["inline-edit/async: Planning notes", noTarget],
  ["inline-edit/basic: Quarterly review", noTarget],
  ["inline-edit/controlled: Launch plan", noTarget],
  ["inline-edit/validation: Design team", noTarget],
  ["input-group/search: Clear search", onAnother],
  ["inspector-01/facts: northwind.example", noTarget],
  ["link/states: Quarterly report", noTarget],
  ["markdown/host-links: Source 1", noTarget],
  ["markdown/host-links: Source 2", noTarget],
  ["markdown/host-links: on their site", noTarget],
  ["markdown/sections-cases: BUTTON", noTarget],
  ["markdown/sections: BUTTON", noTarget],
  ["message-scroller/jump: Turn that into a test.", outer],
  ["page-header/actions-kinds: More actions", outer],
  ["page-header/actions: More actions", outer],
  ["page-header/band: More actions", outer],
  ["page-header/band: Show or hide the panel", outer],
  ["page-header/basic: More actions", outer],
  ["page-header/loading: More actions", outer],
  ["page-header/toolbar: All", outer],
  ["pagination/numbers: 1", dense],
  ["pagination/numbers: Previous page", dense],
  ["prompt-input/accents: Stop", outer],
  ["prompt-input/attachments: Add to message", outer],
  ["prompt-input/banner: Add to message", outer],
  ["prompt-input/banner: Dismiss", outer],
  ["prompt-input/basic: Add to message", outer],
  ["prompt-input/basic: Dictate", outer],
  ["prompt-input/compact: Add to message", outer],
  ["prompt-input/compact: Dictate", outer],
  ["prompt-input/compact: Model: Claude Opus 5.5, Medium", outer],
  ["prompt-input/dictation: Add to message", outer],
  ["prompt-input/dictation: Dictate", outer],
  ["prompt-input/glass: Add to message", outer],
  ["prompt-input/glass: Dictate", outer],
  ["prompt-input/queue: 2 queued", clipped],
  ["prompt-input/queue: Edit: Also compare it with last year's n", clipped],
  ["prompt-input/queue: Edit: And say which region moved most", clipped],
  ["prompt-input/queue: Remove: Also compare it with last year's", clipped],
  ["prompt-input/queue: Remove: And say which region moved most", clipped],
  ["prompt-input/queue: Send now: Also compare it with last year", clipped],
  ["prompt-input/queue: Send now: And say which region moved mos", clipped],
  ["prompt-input/send: Send", outer],
  ["prompt-input/send: Stop", outer],
  ["prompt-input/uploads: Add to message", outer],
  ["prompt-input/voice-problems: Connection", outer],
  ["prompt-input/voice-problems: Dismiss", outer],
  ["prompt-input/voice-problems: Missing", outer],
  ["prompt-input/voice-problems: Timed out", outer],
  ["prompt-input/voice-problems: Unsupported", outer],
  ["prompt-input/working: Add to message", outer],
  ["sheet/removes: Delete Supplier list", outer],
  ["snippet/colours: Copy --damsko-foreground", outer],
  ["snippet/colours: Copy --damsko-mint", outer],
  ["sortable-list/controls: Move Its AI", outer],
  ["sortable-list/controls: Move Its people", outer],
  ["sortable-list/controls: Move Review", outer],
  ["sortable-list/controls: Move Welcome", outer],
  ["sortable-list/disabled: Move Evening", outer],
  ["sortable-list/fields: Move Doing", outer],
  ["sortable-list/fields: Move Done", outer],
  ["sortable-list/fields: Move To do", outer],
  ["sources/open: By kind", outer],
  ["sources/open: By relevance", outer],
  ["sources/open: Fold them away", outer],
  ["stack-trace/basic: Copy the stack trace", outer],
  ["stack-trace/browser: Copy the stack trace", outer],
  ["stack-trace/files: Copy the stack trace", outer],
  ["stepper/fixture: Back", dense],
  ["stepper/fixture: In progress", dense],
  ["stepper/fixture: Next", dense],
  ["stepper/look-light: Back", dense],
  ["stepper/look-light: In progress", dense],
  ["stepper/look-light: Next", dense],
  ["stepper/marks: Company, done", dense],
  ["stepper/marks: Data, done", dense],
  ["stepper/marks: Roles, done", dense],
  ["stepper/marks: Tools, done", dense],
  ["stepper/marks: Workspace, done", dense],
  ["suggestion/prompt: Add to message", outer],
  ["suggestion/prompt: Draft the weekly update", outer],
  ["suggestion/prompt: Find the latest budget", outer],
  ["suggestion/prompt: List what is overdue", outer],
  ["suggestion/prompt: Plan the next sprint", outer],
  ["table-of-contents/basic: Roles", noTarget],
  ["table-of-contents/parts: Keyboard shortcuts", noTarget],
  ["table-of-contents/parts: Limits", noTarget],
  ["table-of-contents/parts: Settings", noTarget],
  ["tabs/files: Close README.md", onAnother],
  ["tabs/files: Close app.tsx", onAnother],
  ["tabs/files: Close invoice-table.tsx", onAnother],
  ["tabs/files: Close invoices.ts", onAnother],
  ["tabs/files: Close suppliers-with-the-longest-name-in", onAnother],
  ["tags-input/basic: Remove Finance", dense],
  ["tags-input/basic: Remove Quarterly", dense],
  ["tags-input/form: Remove Design", dense],
  ["tags-input/form: Remove Research", dense],
  ["tags-input/invalid: Remove jonas@contoso.example", dense],
  ["tags-input/invalid: Remove mira@contoso", dense],
  ["tags-input/invalid: Remove pieter@contoso.example", dense],
  ["tags-input/many: Remove budget", dense],
  ["tags-input/many: Remove hiring", dense],
  ["tags-input/many: Remove project reviews", dense],
  ["tags-input/many: Remove quarterly planning", dense],
  ["tags-input/many: Remove roadmap", dense],
  ["tags-input/many: Remove team retrospectives", dense],
  ["tags-input/suggestions: Remove Design", dense],
  ["terminal/colours: Copy the output", outer],
  ["test-results/basic: rounds to two decimals, Failed", clipped],
  ["test-results/suites: auth.test.ts, 3 passed", clipped],
  ["test-results/suites: db.test.ts, 1 passed, 1 failed, Failed", clipped],
  ["test-results/suites: times out a slow query, 5.00s, Failed", clipped],
  ["test-results/suites: updates a user profile, 240ms, Failed", clipped],
  ["text/truncate: More actions", outer],
  ["toggle/sized: Day", outer],
  ["toggle/sizes: Align to the end", dense],
  ["toggle/sizes: Align to the start", dense],
  ["toggle/wrap: Deutsch", dense],
  ["toggle/wrap: Français", dense],
  ["toggle/wrap: Nederlands", dense],
  ["tooltip/link: Anna de Vries", noTarget],
  ["tooltip/link: Reports", noTarget],
  ["trace/commit: Edited app/login/page.tsx, +1 \u22121", clipped],
  ["trace/queue: 2 completed", clipped],
  ["trace/queue: 3 to do", clipped],
  ["tree-view/actions: Rename reports", outer],
]);

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

/** What is wrong with the touch targets on the page, read in it. */
const inThePage = (): string[] => {
  // The tap target, as the page's tokens set it.
  const tap = Number(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--damsko-tap-target")
      .trim()
      .replace(/px$/u, "")
  );
  const reaching =
    "button, a[href], input[type=checkbox], input[type=radio], input[type=range], select, summary, [role=button], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=slider], [role=link]";
  const fields =
    "input:not([type=checkbox], [type=radio], [type=range], [type=hidden]), textarea, [role=textbox]";
  const controls = `${reaching}, ${fields}`;
  const out: string[] = [];

  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const usable = (element: Element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      rect.width > 1 &&
      rect.height > 1 &&
      element.closest("[hidden], [inert], [aria-hidden='true']") === null &&
      !(element instanceof HTMLButtonElement && element.disabled) &&
      element.getAttribute("aria-disabled") !== "true" &&
      !(
        element.tagName === "INPUT" &&
        (style.opacity === "0" || style.pointerEvents === "none")
      )
    );
  };
  // A link in running text, also through wrappers that hold it alone (a note's mark, up high).
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const inText = (element: Element) => {
    let inner: Element = element;
    while (
      inner.parentElement !== null &&
      inner.parentElement.childNodes.length === 1
    ) {
      inner = inner.parentElement;
    }
    return (
      element.tagName === "A" &&
      [...(inner.parentElement?.childNodes ?? [])].some(
        (node) =>
          node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? "").trim().length > 0
      )
    );
  };
  // The unseen target a control draws: inside it, or beside it in a field's box (a native select's too).
  const isTarget = (control: Element, hit: Element) =>
    control.contains(hit) ||
    (control.matches(`${fields}, select`) &&
      hit.parentElement === control.parentElement &&
      hit.getAttribute("aria-hidden") === "true" &&
      hit.childNodes.length === 0);
  // What a finger at a point would press: the control, its target, the label it stands in, or (for
  // a slider's thumb) the slider's own track.
  const owns = (control: Element, hit: Element | null) => {
    if (hit === null) {
      return false;
    }
    if (isTarget(control, hit)) {
      return true;
    }
    const labels = [
      control.closest("label"),
      ...(control instanceof HTMLInputElement ? (control.labels ?? []) : []),
      ...(control.getAttribute("aria-labelledby") ?? "")
        .split(" ")
        .map((id) => (id === "" ? null : document.querySelector(`#${id}`))),
    ];
    if (labels.some((label) => label?.contains(hit) === true)) {
      return true;
    }
    const slider = control.closest('[data-slot="slider"]');
    return (
      slider !== null &&
      slider.contains(hit) &&
      hit.closest('[data-slot^="slider"]') !== null
    );
  };
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const named = (control: Element) =>
    (control.getAttribute("aria-label") ?? control.textContent ?? "")
      .trim()
      .slice(0, 40) || control.tagName;
  // Whether a point is drawn: a rounded corner's cut-off pixels are not.
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const drawnAt = (element: Element, box: DOMRect, x: number, y: number) => {
    const style = getComputedStyle(element);
    const corners = [
      [style.borderTopLeftRadius, box.left, box.top, 1, 1],
      [style.borderTopRightRadius, box.right, box.top, -1, 1],
      [style.borderBottomLeftRadius, box.left, box.bottom, 1, -1],
      [style.borderBottomRightRadius, box.right, box.bottom, -1, -1],
    ] as const;
    return corners.every(([radius, cornerX, cornerY, signX, signY]) => {
      const round = Math.min(
        Number(radius.replace(/px.*$/u, "")) || 0,
        box.width / 2,
        box.height / 2
      );
      const middleX = cornerX + signX * round;
      const middleY = cornerY + signY * round;
      return (
        round <= 0 ||
        (x - middleX) * signX >= 0 ||
        (y - middleY) * signY >= 0 ||
        Math.hypot(x - middleX, y - middleY) <= round - 1.5
      );
    });
  };
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const within = (box: DOMRect, x: number, y: number) =>
    x >= box.left - 1 &&
    x <= box.right + 1 &&
    y >= box.top - 1 &&
    y <= box.bottom + 1;

  // No target makes anything scroll further: every box's scroll extent, with the targets drawn
  // and without.
  const scrolling = () => {
    const targets = [...document.querySelectorAll(controls)]
      .flatMap((control) => [
        ...control.children,
        ...(control.parentElement?.children ?? []),
      ])
      .filter(
        (child): child is HTMLSpanElement =>
          child instanceof HTMLSpanElement &&
          child.getAttribute("aria-hidden") === "true" &&
          child.childNodes.length === 0 &&
          getComputedStyle(child).position === "absolute"
      );
    const scrollers = [
      document.documentElement,
      ...[...document.querySelectorAll("body *")].filter((element) => {
        const style = getComputedStyle(element);
        // A box that scrolls, by hand or by script; one that only clips (`clip`) does not.
        const scrolls = new Set(["auto", "scroll", "hidden"]);
        return (
          !element.matches(fields) &&
          (scrolls.has(style.overflowX) || scrolls.has(style.overflowY))
        );
      }),
    ];
    const extents = () =>
      scrollers.map((element) => [
        element.scrollWidth - element.clientWidth,
        element.scrollHeight - element.clientHeight,
      ]);
    const drawn = extents();
    for (const target of targets) {
      target.style.display = "none";
    }
    const bare = extents();
    for (const target of targets) {
      target.style.display = "";
    }
    for (const [index, element] of scrollers.entries()) {
      const [wide = 0, tall = 0] = drawn[index] ?? [];
      const [bareWide = 0, bareTall = 0] = bare[index] ?? [];
      if (wide > bareWide || tall > bareTall) {
        const slot =
          element instanceof HTMLElement ? (element.dataset.slot ?? "") : "";
        out.push(
          `targets make ${element.tagName.toLowerCase()}[${slot}] scroll ${bareWide},${bareTall} → ${wide},${tall}`
        );
      }
    }
  };

  // Its own box: every press on it is its own.
  const ownBox = (control: Element, box: DOMRect, others: Element[]) => {
    const taken = new Set<string>();
    for (let x = box.left + 0.5; x < box.right; x += 2) {
      for (let y = box.top + 0.5; y < box.bottom; y += 2) {
        const shown = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
        const hit =
          shown && drawnAt(control, box, x, y)
            ? document.elementFromPoint(x, y)
            : null;
        const other = hit?.closest(controls);
        if (
          hit !== null &&
          !owns(control, hit) &&
          other !== null &&
          other !== undefined &&
          others.includes(other) &&
          !within(other.getBoundingClientRect(), x, y)
        ) {
          taken.add(named(other));
        }
      }
    }
    for (const other of taken) {
      out.push(`${named(control)}: presses on it go to ${other}`);
    }
  };

  const sides = [
    { side: "start", dx: -1, dy: 0 },
    { side: "end", dx: 1, dy: 0 },
    { side: "top", dx: 0, dy: -1 },
    { side: "bottom", dx: 0, dy: 1 },
  ] as const;
  type Side = (typeof sides)[number];
  // How far a box's edge is from another's, past it on a side; and from the screen's edge.
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const gapTo = (box: DOMRect, other: DOMRect, { side }: Side) =>
    ({
      start: box.left - other.right,
      end: other.left - box.right,
      top: box.top - other.bottom,
      bottom: other.top - box.bottom,
    })[side];
  // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
  const toScreen = (box: DOMRect, { side }: Side) =>
    ({
      start: box.left,
      end: innerWidth - box.right,
      top: box.top,
      bottom: innerHeight - box.bottom,
    })[side];
  // Half the way to the nearest control past this side, beside any part of it.
  const roomOn = (box: DOMRect, boxes: DOMRect[], way: Side) => {
    const middleX = box.left + box.width / 2;
    const middleY = box.top + box.height / 2;
    let room = Number.POSITIVE_INFINITY;
    for (const other of boxes) {
      // A neighbour beside any of it, not only its middle: their targets would meet.
      const meets =
        way.dx === 0
          ? other.left < box.right - 1 && other.right > box.left + 1
          : other.top < box.bottom - 1 && other.bottom > box.top + 1;
      const gap = gapTo(box, other, way);
      if (meets && gap >= -0.5) {
        room = Math.min(room, Math.max(0, gap) / 2);
      }
      // A control it stands on (a field round its button, a card round its actions): no room.
      const past = {
        x: way.dx === 0 ? middleX : middleX + way.dx * (box.width / 2 + 1),
        y: way.dy === 0 ? middleY : middleY + way.dy * (box.height / 2 + 1),
      };
      if (
        other.left <= past.x &&
        other.right >= past.x &&
        other.top <= past.y &&
        other.bottom >= past.y
      ) {
        room = 0;
      }
    }
    return room;
  };
  // How far past this side a press lands on it, and how far on its own target alone.
  const reachOn = (control: Element, box: DOMRect, way: Side) => {
    const edge = {
      start: box.left,
      end: box.right,
      top: box.top,
      bottom: box.bottom,
    }[way.side];
    let got = 0;
    let drawn = 0;
    for (let step = 0.5; step <= tap; step += 0.5) {
      const hit = document.elementFromPoint(
        way.dx === 0 ? box.left + box.width / 2 : edge + way.dx * step,
        way.dy === 0 ? box.top + box.height / 2 : edge + way.dy * step
      );
      if (hit === null || !owns(control, hit)) {
        break;
      }
      got = step;
      // A switch's or a checkbox's press area over its whole Field row is the row's, not a
      // target past the control, and so is a press stretched over its whole row (Item's).
      if (
        drawn === step - 0.5 &&
        isTarget(control, hit) &&
        hit.closest('[data-slot$="hit-area"]') === null &&
        !control.matches("[data-row-press]")
      ) {
        drawn = step;
      }
    }
    return { got, drawn };
  };
  // Its reach through its middle, on each side, against the room there.
  const reach = (control: Element, box: DOMRect, boxes: DOMRect[]) => {
    const short: { side: string; text: string }[] = [];
    let across = box.width;
    let down = box.height;
    for (const way of sides) {
      const own = way.dx === 0 ? box.height : box.width;
      const want = Math.max(0, (tap - own) / 2);
      const room = roomOn(box, boxes, way);
      const { got, drawn } = reachOn(control, box, way);
      if (way.dx === 0) {
        down += got;
      } else {
        across += got;
      }
      const need = Math.min(want, room, toScreen(box, way));
      // Sampled every half pixel on fractional boxes: a pixel off is the sampling.
      if (got < need - 1) {
        short.push({
          side: way.side,
          text: `${way.side} ${got}px of ${need}px`,
        });
      }
      // A target reaches the tap target at most; a press area wider than that (a card's whole
      // link) is the control's own.
      if (drawn > room + 1 && drawn <= want + 1) {
        out.push(
          `${named(control)}: its target reaches ${drawn}px to the ${way.side}, past the middle of the gap (${room}px)`
        );
      }
    }
    // A control that spans the tap target across (or down), its label with it, is wide (or tall)
    // enough whatever its sides.
    const unmet = short.filter(({ side }) =>
      side === "start" || side === "end" ? across < tap - 2 : down < tap - 2
    );
    if (unmet.length > 0) {
      out.push(
        `${named(control)}: short of the tap target, ${unmet.map(({ text }) => text).join(", ")}`
      );
    }
  };

  scrolling();
  const all = [...document.querySelectorAll(controls)].filter(usable);
  // Every control drawn, one out of use too: a neighbour whatever its state.
  const drawn = [...document.querySelectorAll(controls)].filter((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 1 &&
      rect.height > 1 &&
      getComputedStyle(element).visibility !== "hidden" &&
      element.closest("[hidden], [inert], [aria-hidden='true']") === null
    );
  });
  for (const control of all) {
    control.scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "instant",
    });
    const box = control.getBoundingClientRect();
    const others = all.filter(
      (other) =>
        other !== control &&
        !other.contains(control) &&
        !control.contains(other)
    );
    ownBox(control, box, others);
    if (control.matches(reaching) && !inText(control)) {
      reach(
        control,
        box,
        drawn
          .filter(
            (other) =>
              other !== control &&
              !other.contains(control) &&
              !control.contains(other)
          )
          .map((other) => other.getBoundingClientRect())
      );
    }
  }
  return out;
};

// A listed control is excused its reach only: it never covers another, nor takes its presses.
const isExcused = (each: string) =>
  [": short of the tap target, ", ": its target reaches "].some(
    (at) => each.includes(at) && excused.has(each.slice(0, each.indexOf(at)))
  );

for (const [component, paths] of byComponent) {
  test(`${component}: every control takes a finger, and only its own presses`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const found: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, component, name);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await settled(page);
      // A diagram's controls are measured once Mermaid has drawn it.
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await expect(
        page.locator("[data-slot=markdown-diagram][aria-busy=true]")
      ).toHaveCount(0, {
        timeout: 30_000,
      });
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      const issues = await page.evaluate(inThePage);
      found.push(...new Set(issues.map((issue) => `${path}: ${issue}`)));
    }
    expect(found.filter((each) => !isExcused(each))).toStrictEqual([]);
  });
}

// A layer's footer is closed in its example: opened, its actions stand side by side, and on a
// phone four of them wrap onto rows, each row's targets clear of the next.
for (const { example, trigger, width, height, rows } of [
  {
    example: "basic",
    trigger: "Publish report",
    width: 820,
    height: 1180,
    rows: 1,
  },
  {
    example: "footer-sizes",
    trigger: "Share the report",
    width: 390,
    height: 844,
    rows: 2,
  },
]) {
  test(`dialog/${example}: the footer's actions, on ${rows} row(s), each take a finger, and only their own presses`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await openExample(page, "dialog", example);
    await page.getByRole("button", { name: trigger }).click();
    const footer = page
      .getByRole("dialog")
      .locator('[data-slot="dialog-footer"]');
    await expect(footer).toBeVisible();
    await settled(page);
    const tops = await footer
      .getByRole("button")
      .evaluateAll((actions) =>
        actions.map((action) => Math.round(action.getBoundingClientRect().top))
      );
    expect(new Set(tops).size).toBe(rows);
    const found = await page.evaluate(inThePage);
    expect(
      found.filter((each) => !isExcused(`dialog/${example}: ${each}`))
    ).toStrictEqual([]);
  });
}
