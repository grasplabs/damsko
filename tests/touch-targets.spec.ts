// Touch targets, across the library: on a touch phone (390 by 844), every control in every
// component example can be hit by a finger: through its middle a press lands on it (its own box,
// an invisible hit area it draws, or the label it stands in), not on a neighbour, over at least
// 24px across and 24px down (WCAG 2.5.8). Links in running text are left out, as WCAG leaves them,
// and so are text fields, which keep their size's height.
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

const least = 24;

const known = new Set([
  "app-shell-01/basic: Projects",
  "badge/link: What is new",
  "container/settings: BUTTON",
  "field/legend: BUTTON",
  "field/sets: BUTTON",
  "file-upload/image-upload-setting: Change picture",
  "inspector-01/facts: northwind.example",
  "markdown/host-links: Source 1",
  "markdown/host-links: Source 2",
  "markdown/sections-cases: BUTTON",
  "page-header/band: Notes",
  "tooltip/link: Reports",
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
      const found = await page.evaluate((size) => {
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
          const span = (dx: number, dy: number) => {
            let low = 0;
            let high = 0;
            for (let step = -(size + 4); step <= size + 4; step += 1) {
              const hit = document.elementFromPoint(
                x + dx * step,
                y + dy * step
              );
              if (!owns(control, hit)) {
                continue;
              }
              if (low === 0 && high === 0) {
                low = step;
              }
              high = step;
            }
            return { size: high - low + 1 };
          };
          const runs = [span(1, 0), span(0, 1)];
          // Sampled a pixel apart on fractional boxes, so a target of exactly the least can read
          // up to 3px short.
          if (runs.every((run) => run.size >= size - 3)) {
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
      }, least);
      short.push(...new Set(found.map((issue) => `${path}: ${issue}`)));
    }
    expect(short.filter((each) => !known.has(each))).toStrictEqual([]);
  });
}
