// Live previews answer: in every example a docs page draws live (`<Stage live>`, the working
// examples a person and an agent are meant to use), every enabled button, pressed, makes
// something a person could notice happen within half a second: the example's words or markup
// change, a layer opens or closes, focus moves or the address changes. A control already chosen
// (the selected tab, the current page, a chosen radio) answers nothing on purpose and is left out,
// and so is an example that changes by itself (a stream, a timer), which is watched first. The
// guidelines' demonstrations below draw buttons that stand for a point and do nothing on purpose.
import { readdirSync, readFileSync } from "node:fs";
import nodePath from "node:path";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

const demonstrations = new Set([
  "guidelines/accessibility-focus: Rename project",
  "guidelines/accessibility-focus: Project settings",
  "guidelines/accessibility-names: Copy the link",
  "guidelines/accessibility-names: Share the interview",
  "guidelines/accessibility-names: Download the transcript",
  "guidelines/accessibility-names: Delete the interview",
  "guidelines/accessibility-rtl: Search the reports",
  "guidelines/accessibility-touch: Bold",
  "guidelines/accessibility-touch: Italic",
  "guidelines/accessibility-touch: Underline",
  "guidelines/accessibility-touch: Add a comment",
]);

/** Every example a docs page draws live, as `<folder>/<name>`. */
const liveExamples = (): string[] => {
  const docs = nodePath.join(import.meta.dirname, "../docs");
  return [
    ...new Set(
      readdirSync(docs, { recursive: true, encoding: "utf-8" })
        .filter((file) => file.endsWith(".mdx"))
        .flatMap((file) =>
          [
            ...readFileSync(nodePath.join(docs, file), "utf-8").matchAll(
              /<Stage\s[^>]*?path="(?<path>[^"]+)"[^>]*?\slive\b/gu
            ),
          ].map((match) => match.groups?.path ?? "")
        )
    ),
  ].toSorted();
};

/** Presses the nth enabled button, and says whether it answered; null when there is none. */
const press = async (page: Page, index: number) =>
  await page.evaluate(async (at) => {
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>("damsko-island button"),
    ].filter((button) => {
      const box = button.getBoundingClientRect();
      return (
        !button.disabled &&
        button.getAttribute("aria-disabled") !== "true" &&
        box.width > 0 &&
        box.height > 0 &&
        button.closest("[inert], [aria-hidden='true']") === null
      );
    });
    const button = buttons[at];
    if (button === undefined) {
      return null;
    }
    const chosen = ["aria-selected", "aria-current", "aria-checked"].some(
      (name) => !["false", null].includes(button.getAttribute(name))
    );
    const name = (button.getAttribute("aria-label") ?? button.textContent ?? "")
      .trim()
      .slice(0, 40);
    if (chosen) {
      return { name, answered: true };
    }
    // oxlint-disable-next-line unicorn/consistent-function-scoping -- runs in the page, so it carries its own helpers
    const changes = async (wait: number) =>
      // oxlint-disable-next-line promise/avoid-new -- a watch over a time, which has no promise of its own
      await new Promise<boolean>((resolve) => {
        const observer = new MutationObserver(() => {
          observer.disconnect();
          resolve(true);
        });
        observer.observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          characterData: true,
        });
        setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, wait);
      });
    if (await changes(200)) {
      // It changes by itself: a press cannot be told apart.
      return { name, answered: true };
    }
    const where = location.href;
    const focused = document.activeElement;
    const answer = changes(500);
    button.click();
    const answered =
      (await answer) ||
      location.href !== where ||
      document.activeElement !== focused;
    return { name, answered };
  }, index);

for (const path of liveExamples()) {
  test(`${path}: every button answers a press`, async ({ page }) => {
    const [component = "", name = ""] = path.split("/");
    await openExample(page, component, name);
    const dead: string[] = [];
    for (let index = 0; index < 40; index += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one press after the other
      const result = await press(page, index);
      if (result === null) {
        break;
      }
      const said = `${path}: ${result.name}`;
      if (!result.answered && !demonstrations.has(said)) {
        dead.push(said);
      }
      // Whatever the press opened is closed again before the next.
      // oxlint-disable-next-line no-await-in-loop -- one press after the other
      await page.keyboard.press("Escape");
    }
    expect(dead).toStrictEqual([]);
  });
}
