import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { openExample } from "./example.ts";

const holdsFocus = async (element: Locator): Promise<boolean> =>
  await element.evaluate((node) => node.contains(document.activeElement));

const nextFrame = async (page: Page): Promise<void> => {
  await page.evaluate(
    async () =>
      // oxlint-disable-next-line promise/avoid-new -- the next frame, which has no promise of its own
      await new Promise((resolve) => {
        requestAnimationFrame(resolve);
      })
  );
};

const focusedName = async (page: Page): Promise<string> =>
  await page.evaluate(() =>
    document.activeElement === document.body
      ? "the page"
      : (document.activeElement?.textContent ?? "").trim()
  );

test("its trigger opens it, named by its title and described by its text", async ({
  page,
}) => {
  await openExample(page, "sheet", "basic");
  await page.getByRole("button", { name: "Report details" }).click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAccessibleDescription(
    "Who made this report, and who can see it."
  );
});

test("the keyboard opens it, Tab stays inside, and Escape gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "sheet", "basic");
  const trigger = page.getByRole("button", { name: "Report details" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await expect.poll(async () => await holdsFocus(sheet)).toBe(true);
  const stops = await sheet.getByRole("button").count();
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step <= stops; step += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await page.keyboard.press(key);
      // oxlint-disable-next-line no-await-in-loop -- see above
      expect(await holdsFocus(sheet)).toBe(true);
    }
  }
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("its close button, named Close, and a press on the shade close it", async ({
  page,
}) => {
  await openExample(page, "sheet", "basic");
  const trigger = page.getByRole("button", { name: "Report details" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await sheet.getByRole("button", { name: "Close" }).first().click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(sheet).toBeVisible();
  await page.mouse.click(5, 450);
  await expect(sheet).toBeHidden();
  // No shade is left over the page: its trigger opens it again.
  await trigger.click();
  await expect(sheet).toBeVisible();
});

test("a drag towards its side closes it", async ({ page }) => {
  await openExample(page, "sheet", "basic");
  await page.getByRole("button", { name: "Report details" }).click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await expect.poll(async () => await holdsFocus(sheet)).toBe(true);
  const box = await sheet.getByRole("heading").boundingBox();
  const x = (box?.x ?? 0) + 20;
  const y = (box?.y ?? 0) + 5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 1; step <= 10; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a hand drags
    await page.mouse.move(x + step * 40, y);
  }
  await page.mouse.up();
  await expect(sheet).toBeHidden();
});

test("the page behind does not scroll while it is open", async ({ page }) => {
  await openExample(page, "sheet", "basic");
  await page.evaluate(() => {
    document.body.style.minHeight = "300vh";
  });
  await page.getByRole("button", { name: "Report details" }).click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await expect.poll(async () => await holdsFocus(sheet)).toBe(true);
  await page.mouse.move(5, 5);
  await expect(async () => {
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press("PageDown");
    await nextFrame(page);
    expect(await page.evaluate(() => scrollY)).toBe(before);
  }).toPass();
});

test("end stands along the right and start along the left, off the window's edges", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [example, trigger, title, side] of [
    ["basic", "Report details", "Quarterly summary", "end"],
    ["start", "Folders", "Folders", "start"],
  ] as const) {
    // oxlint-disable-next-line no-await-in-loop -- one side after the other
    await openExample(page, "sheet", example);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.getByRole("button", { name: trigger }).click();
    const sheet = page.getByRole("dialog", { name: title });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(sheet).toBeVisible();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(async () => {
      const box = await sheet.boundingBox();
      const left = Math.round(box?.x ?? 0);
      const right = Math.round(1440 - (box?.x ?? 0) - (box?.width ?? 0));
      const gap = side === "end" ? right : left;
      expect(gap).toBe(6);
      expect(side === "end" ? left : right).toBeGreaterThan(400);
      expect(Math.round(box?.y ?? 0)).toBe(6);
      expect(Math.round(box?.height ?? 0)).toBe(900 - 12);
    }).toPass();
  }
});

test("lg is wider than the default, and full is as wide as 64rem allows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const widths: number[] = [];
  for (const [example, trigger, title] of [
    ["basic", "Report details", "Quarterly summary"],
    ["wide", "Open the summary", "Quarterly summary"],
    ["full", "Open the year in full", "Requests closed this year"],
  ] as const) {
    // oxlint-disable-next-line no-await-in-loop -- one size after the other
    await openExample(page, "sheet", example);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.getByRole("button", { name: trigger }).click();
    const sheet = page.getByRole("dialog", { name: title });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(sheet).toBeVisible();
    // oxlint-disable-next-line no-await-in-loop -- see above
    const box = await sheet.boundingBox();
    widths.push(Math.round(box?.width ?? 0));
  }
  expect(widths).toEqual([416, 600, 1024]);
});

test("full on a phone is the whole sheet, its body scrolling inside", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "sheet", "full");
  await page.getByRole("button", { name: "Open the year in full" }).click();
  const sheet = page.getByRole("dialog", {
    name: "Requests closed this year",
  });
  await expect(sheet).toBeVisible();
  const box = await sheet.boundingBox();
  expect(Math.round(box?.width ?? 0)).toBe(390 - 12);
  const region = sheet.getByRole("region", {
    name: "Requests closed this year",
  });
  await expect(region).toHaveAttribute("tabindex", "0");
});

test("a long body is a region named by the title that the keys scroll", async ({
  page,
}) => {
  await openExample(page, "sheet", "long-body");
  await page.getByRole("button", { name: "History" }).click();
  const sheet = page.getByRole("dialog", { name: "History" });
  const region = sheet.getByRole("region", { name: "History" });
  await expect(region).toHaveAttribute("tabindex", "0");
  await region.focus();
  await page.keyboard.press("End");
  await expect
    .poll(async () => await region.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
  await expect(sheet.getByRole("button", { name: "Done" })).toBeInViewport();
});

test("a body that fills after it opens becomes a region the keys scroll", async ({
  page,
}) => {
  await openExample(page, "sheet", "basic");
  await page.getByRole("button", { name: "Report details" }).click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("region")).toHaveCount(0);
  // Content that arrives later, as a list that loads does: the sheet's body keeps its height.
  await sheet.getByText("Owner").evaluate((term) => {
    const body = term.closest('[data-slot="sheet-body"]');
    for (let row = 0; row < 40; row += 1) {
      const line = document.createElement("p");
      line.textContent = `Edit ${row + 1}`;
      body?.append(line);
    }
  });
  await expect(
    sheet.getByRole("region", { name: "Quarterly summary" })
  ).toHaveAttribute("tabindex", "0");
});

test("opened by `open` with no trigger, focus goes back to the opener", async ({
  page,
}) => {
  for (const example of ["by-prop", "mounted"]) {
    // oxlint-disable-next-line no-await-in-loop -- one example after the other
    await openExample(page, "sheet", example);
    const ask = page.getByRole("button", { name: "Ask" });
    for (const how of ["Escape", "Not yet"]) {
      // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
      await ask.focus();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.keyboard.press("Enter");
      const sheet = page.getByRole("dialog", { name: "Send the report?" });
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect.poll(async () => await holdsFocus(sheet)).toBe(true);
      // oxlint-disable-next-line no-await-in-loop -- see above
      await (how === "Escape"
        ? page.keyboard.press("Escape")
        : sheet.getByRole("button", { name: how }).click());
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(sheet).toBeHidden();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(ask).toBeFocused();
    }
  }
});

test("when its yes removes the button that opened it, focus goes to a neighbour, never the page", async ({
  page,
}) => {
  await openExample(page, "sheet", "removes");
  await page.getByRole("button", { name: "Delete Quarterly summary" }).focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", {
    name: "Delete Quarterly summary?",
  });
  await sheet.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect
    .poll(async () => await focusedName(page))
    .toBe("Delete Supplier list");
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts).
const act = async (page: Page, ref: string, args?: string[]) =>
  await page.evaluate(
    async ([name, list]) => {
      const result = await window.damskoAgent?.act({
        steps: [{ ref: name, action: "press", args: list }],
      });
      return { ok: result?.ok === true, message: result?.error?.message ?? "" };
    },
    [ref, args] as const
  );

const agentSees = async (page: Page): Promise<string[]> =>
  await page.evaluate(() =>
    (window.damskoAgent?.snapshot() ?? []).map((entry) => entry.label ?? "")
  );

test("an agent opens it by its trigger, reads its title and presses its action by name", async ({
  page,
}) => {
  await openExample(page, "sheet", "agent");
  const opened = await act(page, "Remind me tomorrow");
  expect(opened.ok).toBe(true);
  const sheet = page.getByRole("dialog", { name: "Set a reminder" });
  await expect(sheet).toBeVisible();
  await expect
    .poll(async () => await agentSees(page))
    .toContain("Set a reminder");
  const saved = await act(page, "Set a reminder", ["Set reminder"]);
  expect(saved.ok).toBe(true);
  await expect
    .poll(async () => await page.evaluate(() => window.sheetLog ?? []))
    .toContain("reminded");
  await expect(sheet).toBeHidden();
});

test("an agent hears a failed action in its words, and the sheet stays open", async ({
  page,
}) => {
  await openExample(page, "sheet", "agent");
  await act(page, "Send report");
  const sheet = page.getByRole("dialog", { name: "Send the report" });
  await expect(sheet).toBeVisible();
  const failed = await act(page, "Send the report", ["Send now"]);
  expect(failed.ok).toBe(false);
  expect(failed.message).toContain("Could not send");
  await expect(sheet).toBeVisible();
  await expect(
    sheet.getByRole("button", { name: "Could not send" })
  ).toBeVisible();
});

test("on a phone its footer's buttons share the line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "sheet", "basic");
  await page.getByRole("button", { name: "Report details" }).click();
  const sheet = page.getByRole("dialog", { name: "Quarterly summary" });
  const close = await sheet
    .getByRole("button", { name: "Close", exact: true })
    .filter({ hasText: "Close" })
    .boundingBox();
  const archive = await sheet
    .getByRole("button", { name: "Archive" })
    .boundingBox();
  expect(Math.abs((close?.width ?? 0) - (archive?.width ?? 0))).toBeLessThan(2);
  expect((close?.width ?? 0) + (archive?.width ?? 0)).toBeGreaterThan(300);
});
