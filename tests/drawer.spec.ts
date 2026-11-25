import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

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

test("its trigger opens it, named by its title and described by its text", async ({
  page,
}) => {
  await openExample(page, "drawer", "basic");
  await page.getByRole("button", { name: "Remind me tomorrow" }).click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAccessibleDescription(
    "We will send a reminder about this report to your inbox at 9:00."
  );
});

test("the keyboard opens it, Tab stays inside, and Escape gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "drawer", "basic");
  const trigger = page.getByRole("button", { name: "Remind me tomorrow" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  await expect.poll(async () => await holdsFocus(drawer)).toBe(true);
  const stops = await drawer.getByRole("button").count();
  for (let step = 0; step <= stops; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other
    await page.keyboard.press("Tab");
    // oxlint-disable-next-line no-await-in-loop -- see above
    expect(await holdsFocus(drawer)).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("a press on the shade closes it, and the page takes presses again", async ({
  page,
}) => {
  await openExample(page, "drawer", "basic");
  const trigger = page.getByRole("button", { name: "Remind me tomorrow" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  await expect(drawer).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(drawer).toBeHidden();
  await trigger.click();
  await expect(drawer).toBeVisible();
});

test("a drag down closes it", async ({ page }) => {
  await openExample(page, "drawer", "basic");
  await page.getByRole("button", { name: "Remind me tomorrow" }).click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  await expect.poll(async () => await holdsFocus(drawer)).toBe(true);
  const box = await drawer.getByRole("heading").boundingBox();
  const x = (box?.x ?? 0) + 20;
  const y = (box?.y ?? 0) + 5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 1; step <= 10; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one move after the other, as a hand drags
    await page.mouse.move(x, y + step * 40);
  }
  await page.mouse.up();
  await expect(drawer).toBeHidden();
});

test("the page behind does not scroll while it is open", async ({ page }) => {
  await openExample(page, "drawer", "basic");
  await page.evaluate(() => {
    document.body.style.minHeight = "300vh";
  });
  await page.getByRole("button", { name: "Remind me tomorrow" }).click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  await expect.poll(async () => await holdsFocus(drawer)).toBe(true);
  // The lock comes in as the drawer settles: from then on, the wheel and the keys leave the page put.
  await page.mouse.move(5, 5);
  await expect(async () => {
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await page.keyboard.press("PageDown");
    await nextFrame(page);
    expect(await page.evaluate(() => scrollY)).toBe(before);
  }).toPass();
});

test("while its action works it stays open, and it closes once the work is done", async ({
  page,
}) => {
  await openExample(page, "drawer", "basic");
  await page.getByRole("button", { name: "Remind me tomorrow" }).click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  const save = drawer.getByRole("button", { name: "Set reminder" });
  await save.click();
  await expect(save).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await expect(drawer).toBeVisible();
  await expect(drawer).toBeHidden();
});

test("on a phone its actions share the line", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "drawer", "basic");
  await page.getByRole("button", { name: "Remind me tomorrow" }).click();
  const drawer = page.getByRole("dialog", { name: "Remind me tomorrow" });
  const cancel = await drawer
    .getByRole("button", { name: "Cancel" })
    .boundingBox();
  const save = await drawer
    .getByRole("button", { name: "Set reminder" })
    .boundingBox();
  expect(Math.abs((cancel?.width ?? 0) - (save?.width ?? 0))).toBeLessThan(2);
  expect((cancel?.width ?? 0) + (save?.width ?? 0)).toBeGreaterThan(300);
});

test("a failed action says so and keeps it open", async ({ page }) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "drawer", "check-failed");
  await page.getByRole("button", { name: "Test the connection" }).click();
  const drawer = page.getByRole("dialog", { name: "Test the connection" });
  const check = drawer.getByRole("button", { name: "Test", exact: true });
  await check.click();
  // With no errorText, the alert stands on the button and the catalogue's words are said.
  await expect(check).toHaveAttribute("data-status", "error");
  await expect.poll(said).toContain("Could not finish");
  await expect(drawer).toBeVisible();
});

test("with two heights it rests low, its actions in view, and its handle moves it higher", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openExample(page, "drawer", "heights");
  await page.getByRole("button", { name: "Show the stops" }).click();
  const drawer = page.getByRole("dialog", { name: "Stops on this route" });
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("button", { name: "Close", exact: true })
  ).toBeInViewport({ ratio: 1 });
  const handle = drawer.getByRole("button", { name: "Resize" });
  await expect(handle).toHaveCount(1);
  const top = async () => {
    const box = await handle.boundingBox();
    return box?.y ?? 0;
  };
  const low = await top();
  await handle.focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(top).toBeLessThan(low - 100);
});

test("a long body is a region the keys can scroll", async ({ page }) => {
  await openExample(page, "drawer", "long-body");
  await page.getByRole("button", { name: "What is new" }).click();
  const region = page.getByRole("region", { name: "What is new this month" });
  await expect(region).toHaveAttribute("tabindex", "0");
  await region.focus();
  await page.keyboard.press("End");
  await expect
    .poll(async () => await region.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
});

test("opened by `open` with no trigger, focus goes back to the opener", async ({
  page,
}) => {
  await openExample(page, "drawer", "by-prop");
  const ask = page.getByRole("button", { name: "Ask" });
  for (const how of ["Escape", "Not yet"]) {
    // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
    await ask.focus();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Send the report?" });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(drawer).toHaveAccessibleDescription(
      "Everyone on the team gets it by email."
    );
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect.poll(async () => await holdsFocus(drawer)).toBe(true);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await (how === "Escape"
      ? page.keyboard.press("Escape")
      : drawer.getByRole("button", { name: how }).press("Enter"));
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(drawer).toBeHidden();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(ask).toBeFocused();
  }
});

test("mounted only while open, it gives focus back to the opener as it leaves", async ({
  page,
}) => {
  await openExample(page, "drawer", "mounted");
  const ask = page.getByRole("button", { name: "Ask" });
  for (const how of ["Escape", "Not yet", "shade"]) {
    // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
    await ask.focus();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Send the report?" });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect.poll(async () => await holdsFocus(drawer)).toBe(true);
    if (how === "Escape") {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.keyboard.press("Escape");
    } else if (how === "shade") {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.mouse.click(8, 8);
    } else {
      // oxlint-disable-next-line no-await-in-loop -- see above
      await drawer.getByRole("button", { name: how }).click();
    }
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(drawer).toBeHidden();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(ask).toBeFocused();
  }
});

test("when what opened it is gone, focus goes to its neighbour, never the page", async ({
  page,
}) => {
  await openExample(page, "drawer", "removes");
  const remove = async (row: string) => {
    await page.getByRole("button", { name: `Delete ${row}` }).focus();
    await page.keyboard.press("Enter");
    const drawer = page.getByRole("dialog", { name: `Delete ${row}?` });
    await drawer.getByRole("button", { name: "Delete", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(drawer).toBeHidden();
  };
  await remove("Quarterly summary");
  await expect(
    page.getByRole("button", { name: "Delete Supplier list" })
  ).toBeFocused();
  await remove("Team survey");
  await expect(
    page.getByRole("button", { name: "Delete Supplier list" })
  ).toBeFocused();
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

test("an agent opens it by its trigger, reads its title and presses its action by name", async ({
  page,
}) => {
  await openExample(page, "drawer", "agent");
  const opened = await act(page, "Remind me tomorrow");
  expect(opened.ok).toBe(true);
  const drawer = page.getByRole("dialog", { name: "Set a reminder" });
  await expect(drawer).toBeVisible();
  await expect
    .poll(
      async () =>
        await page.evaluate(() =>
          (window.damskoAgent?.snapshot() ?? []).map((entry) => entry.label)
        )
    )
    .toContain("Set a reminder");
  const pressed = await act(page, "Set a reminder", ["Set reminder"]);
  expect(pressed.ok).toBe(true);
  expect(await page.evaluate(() => window.drawerLog ?? [])).toContain(
    "reminded"
  );
  await expect(drawer).toBeHidden();
});

test("an agent hears a failed action in its words, and the drawer stays open", async ({
  page,
}) => {
  await openExample(page, "drawer", "agent");
  const failed = await act(page, "Send report", ["Send now"]);
  expect(failed.ok).toBe(false);
  expect(failed.message).toContain("Could not send");
  const drawer = page.getByRole("dialog", { name: "Send the report" });
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("button", { name: "Could not send" })
  ).toBeVisible();
});
