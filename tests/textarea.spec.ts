import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("it grows with its lines, stops at its most and scrolls, and shrinks back", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openExample(page, "textarea", "field");
  const area = page.getByRole("textbox", { name: "Notes for the team" });
  const measure = async () =>
    await area.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        line: Number(style.lineHeight.replace("px", "")),
        most: Number(style.maxHeight.replace("px", "")),
        scrolls: element.scrollHeight > element.clientHeight + 1,
      };
    });
  const empty = await measure();
  // Three lines and the padding of a default control round them.
  expect(Math.abs(empty.height - (3 * empty.line + 16))).toBeLessThanOrEqual(1);

  await area.fill("One\nTwo\nThree\nFour\nFive");
  await expect
    .poll(async () => {
      const five = await measure();
      return five.height;
    })
    .toBeGreaterThan(empty.height);

  await area.fill(`One${"\nmore".repeat(30)}`);
  await expect
    .poll(async () => {
      const full = await measure();
      return Math.abs(full.height - full.most) <= 1 && full.scrolls;
    })
    .toBe(true);

  await area.fill("");
  await expect
    .poll(async () => {
      const cleared = await measure();
      return Math.abs(cleared.height - empty.height);
    })
    .toBeLessThanOrEqual(1);
});

test("Cmd or Ctrl+Enter checks its form first; plain Enter adds a line", async ({
  page,
}) => {
  await openExample(page, "textarea", "invalid");
  const area = page.getByRole("textbox", { name: "Reason for the change" });
  await area.click();
  // UI SDK's "mod" is Cmd on a Mac and Ctrl elsewhere, by the browser's own platform.
  await page.keyboard.press("Control+Enter");
  await page.keyboard.press("Meta+Enter");
  await expect(area).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("Say why, so reviewers can follow.")
  ).toBeVisible();
  await expect(area).toBeFocused();

  await page.keyboard.type("First");
  await page.keyboard.press("Enter");
  await page.keyboard.type("second");
  await expect(area).toHaveValue("First\nsecond");
});

test("disabled, wrong and read only, it says so", async ({ page }) => {
  await openExample(page, "textarea", "field-states");
  const summary = page.getByRole("textbox", { name: "Summary" });
  await expect(summary).toHaveAttribute("aria-invalid", "true");
  await expect(summary).toHaveAccessibleDescription(
    "Write a sentence or two, so reviewers can follow."
  );

  const reply = page.getByRole("textbox", { name: "Reply" });
  await expect(reply).toBeDisabled();
  await expect(reply).toHaveValue("Replies are closed for this thread.");

  const brief = page.getByRole("textbox", { name: "Brief" });
  await expect(brief).not.toBeEditable();
  await brief.focus();
  await expect(brief).toBeFocused();
});

test("an agent finds it by its label, reads it and sets it", async ({
  page,
}) => {
  await openExample(page, "textarea", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const run = await page.evaluate(async () => {
    const agent = window.damskoAgent;
    const before = agent
      ?.snapshot()
      .find((entry) => entry.label === "Notes")?.value;
    const set = await agent?.act({
      steps: [{ ref: "Notes", action: "setValue", args: ["Ship on Monday."] }],
    });
    return { before, ok: set?.ok };
  });
  expect(run).toEqual({ before: "Check the numbers before Friday.", ok: true });
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(
    "Ship on Monday."
  );
});

test("on a touch screen its words are 16px, so the page never zooms in", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openExample(page, "textarea", "mono");
  // The mono face is a step smaller elsewhere; on touch it is 16px too.
  await expect(page.getByRole("textbox", { name: "Request body" })).toHaveCSS(
    "font-size",
    "16px"
  );
  await context.close();
});

test("on a touch screen its words grow with the reader's text size, as the words round it do", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await openExample(page, "textarea", "field");
  // A reader who doubles the browser's text size: the root's size, which every rem follows.
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await expect(page.getByRole("textbox").first()).toHaveCSS(
    "font-size",
    "32px"
  );
  await context.close();
});
