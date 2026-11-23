// Touch targets, across the library: on a touch phone (390 by 844), every control in every
// component example can be hit by a finger. Through its middle, what it takes a press on (its own
// box, an invisible hit area it draws, or the label it stands in) spans the system's tap target
// (the `size.tapTarget` token, 44px) across and down, and at least 24px of that is its own, not a
// neighbour's (WCAG 2.5.8). Links in running text are left out, as WCAG leaves them, and so are
// text fields, which keep their size's height.
//
// Not in Firefox, which has no phone mode (playwright.config.ts).
//
// The controls below are under it today, each waiting on a design decision; one that comes to
// take a finger may leave the list.
import { expect, test } from "@playwright/test";

import { componentExamples, openExample, settled } from "./example.ts";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});

// Controls closer together than the tap target share the space between them: a press there lands
// on the later one. Each keeps at least this much of its own (WCAG 2.5.8).
const unshared = 24;

const known = new Set([
  // Under 24px of their own.
  "app-shell-01/basic: Projects",
  "badge/link: What is new",
  "container/settings: BUTTON",
  "field/legend: BUTTON",
  "field/sets: BUTTON",
  "image-upload/setting: Change picture",
  "inspector-01/facts: northwind.example",
  "markdown/host-links: Source 1",
  "markdown/host-links: Source 2",
  "markdown/sections-cases: BUTTON",
  "page-header/band: Notes",
  "tooltip/link: Reports",
  // A small link or text button with no target of its own: whether it grows one.
  "badge/link: Design systems and research",
  "inline-edit/async: Planning notes",
  "inline-edit/basic: Quarterly review",
  "inline-edit/controlled: Launch plan",
  "inline-edit/validation: Design team",
  "link/states: Quarterly report",
  "markdown/host-links: on their site",
  "markdown/sections: BUTTON",
  "tabs/files: Close README.md",
  "tabs/files: Close app.tsx",
  "tabs/files: Close invoice-table.tsx",
  "tabs/files: Close invoices.ts",
  "tabs/files: Close suppliers-with-the-longest-name-in",
  "table-of-contents/basic: Roles",
  "table-of-contents/parts: Keyboard shortcuts",
  "table-of-contents/parts: Limits",
  "table-of-contents/parts: Settings",
  "tooltip/link: Anna de Vries",
  // Narrower than a finger, beside neighbours: whether its target grows sideways over them (a
  // text Button's grows only up and down; a ToggleGroup's item never past its sides).
  "audio-player/basic: Speed 1×",
  "audio-player/labels: Snelheid 1×",
  "audio-player/moment: Speed 1×",
  "audio-player/narrow: Speed 1×",
  "audio-player/speeds: Speed 1×",
  "audio-player/switch: Speed 1×",
  "audio-player/untrusted: Speed 1×",
  "button-group/text: In",
  "pagination/numbers: 1",
  "pagination/numbers: 5",
  "pagination/numbers: 6",
  "pagination/numbers: 7",
  "pagination/numbers: 20",
  "stepper/marks: Company, done",
  "stepper/marks: Data, done",
  "stepper/marks: Roles, done",
  "stepper/marks: Tools, done",
  "stepper/marks: Workspace, done",
  "toggle/group: List",
  "toggle/multiple: Bold",
  "toggle/multiple: Italic",
  "toggle/multiple: Underline",
  "toggle/sizes: Align in the middle",
  "toggle/sizes: Align to the end",
  "toggle/sizes: Align to the start",
  // Cut by the box that scrolls round it: whether that box makes room.
  "diff-viewer/hunks: Show 3 unchanged lines",
  "suggestion/basic: Draft a reply",
  "suggestion/basic: List the open questions",
  "suggestion/basic: Summarise this thread",
  "suggestion/basic: Turn this into a checklist",
  "suggestion/long: Compare this quarter's supplier costs wi",
  "suggestion/overflow: Compare the two proposals",
  "suggestion/overflow: Find the budget figures",
  "suggestion/overflow: Suggest next steps",
  "suggestion/overflow: What changed since last week?",
  "suggestion/overflow: Who is waiting on an answer?",
  "suggestion/overflow: Write a short status update",
  "suggestion/prompt: Draft the weekly update",
  "suggestion/prompt: Find the latest budget",
  "suggestion/prompt: List what is overdue",
  "suggestion/prompt: Plan the next sprint",
  "suggestion/prompt: Summarise the meeting notes",
]);

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

for (const [component, paths] of byComponent) {
  test(`${component}: every control takes a finger`, async ({ page }) => {
    test.setTimeout(120_000);
    const short: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, component, name);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await settled(page);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      const found = await page.evaluate((least) => {
        // The tap target, as the page's tokens set it.
        const size = Number(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--damsko-tap-target")
            .trim()
            .replace(/px$/u, "")
        );
        const controls =
          "button, a[href], input[type=checkbox], input[type=radio], input[type=range], select, summary, [role=button], [role=tab], [role=checkbox], [role=radio], [role=switch], [role=slider], [role=link]";
        // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
        const shown = (element: Element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 1 &&
            rect.height > 1
          );
        };
        // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
        const inText = (element: Element) =>
          element.tagName === "A" &&
          [...(element.parentElement?.childNodes ?? [])].some(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              (node.textContent ?? "").trim().length > 0
          );
        // What a finger at a point would press: the control, anything inside it, the label it
        // stands in, or (for a slider's thumb) the slider's own track.
        // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
        const owns = (control: Element, hit: Element | null) => {
          if (hit === null) {
            return false;
          }
          if (control === hit || control.contains(hit)) {
            return true;
          }
          const labels = [
            control.closest("label"),
            ...(control instanceof HTMLInputElement
              ? (control.labels ?? [])
              : []),
            ...(control.getAttribute("aria-labelledby") ?? "")
              .split(" ")
              .map((id) =>
                id === "" ? null : document.querySelector(`#${id}`)
              ),
          ];
          if (labels.some((label) => label?.contains(hit) === true)) {
            return true;
          }
          // A native select's target is drawn beside the <select>, in the box round it.
          if (
            control
              .closest('[data-slot="native-select-wrapper"]')
              ?.contains(hit) === true
          ) {
            return true;
          }
          const slider = control.closest('[data-slot="slider"]');
          return (
            slider !== null &&
            slider.contains(hit) &&
            hit.closest('[data-slot^="slider"]') !== null
          );
        };
        const issues: string[] = [];
        for (const control of document.querySelectorAll(controls)) {
          const style = getComputedStyle(control);
          if (
            !shown(control) ||
            inText(control) ||
            control.closest("[hidden], [inert], [aria-hidden='true']") !==
              null ||
            (control instanceof HTMLButtonElement && control.disabled) ||
            control.getAttribute("aria-disabled") === "true" ||
            (control.tagName === "INPUT" &&
              (style.opacity === "0" || style.pointerEvents === "none"))
          ) {
            continue;
          }
          control.scrollIntoView({
            block: "center",
            inline: "center",
            behavior: "instant",
          });
          const rect = control.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          // How far across (or down) through its middle a press lands on it: on top of whatever
          // else is there (`topmost`), or anywhere under it, where a neighbour's own target may
          // overlap it (its own target's size).
          const span = (dx: number, dy: number, topmost: boolean) => {
            let low = 0;
            let high = 0;
            for (let step = -(size + 4); step <= size + 4; step += 1) {
              const [atX, atY] = [x + dx * step, y + dy * step];
              const hits = topmost
                ? [document.elementFromPoint(atX, atY)]
                : document.elementsFromPoint(atX, atY);
              if (!hits.some((hit) => owns(control, hit))) {
                continue;
              }
              if (low === 0 && high === 0) {
                low = step;
              }
              high = step;
            }
            return high - low + 1;
          };
          // Sampled a pixel apart on fractional boxes, so a target of exactly the least can read
          // up to 3px short.
          const reaches = (across: number, topmost: boolean) =>
            span(1, 0, topmost) >= across - 3 &&
            span(0, 1, topmost) >= across - 3;
          if (reaches(size, false) && reaches(least, true)) {
            continue;
          }
          const label = (
            control.getAttribute("aria-label") ??
            control.textContent ??
            ""
          )
            .trim()
            .slice(0, 40);
          issues.push(label || control.tagName);
        }
        return issues;
      }, unshared);
      short.push(...new Set(found.map((issue) => `${path}: ${issue}`)));
    }
    expect(short.filter((each) => !known.has(each))).toStrictEqual([]);
  });
}
