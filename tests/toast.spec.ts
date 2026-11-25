import { expect, test } from "@playwright/test";

import { liveRegion, openExample } from "./example.ts";

test("a press shows a toast with its words in Notifications, and focus stays where it was", async ({
  page,
}) => {
  await openExample(page, "toast", "basic");
  const share = page.getByRole("button", { name: "Share report" });
  await share.click();
  const region = page.getByRole("region", { name: "Notifications" });
  await expect(region.getByText("Report shared")).toBeVisible();
  await expect(
    region.getByText("Everyone on the team can read it now.")
  ).toBeVisible();
  await expect(share).toBeFocused();
});

test("a toast is said to a screen reader without taking focus", async ({
  page,
}) => {
  await openExample(page, "toast", "basic");
  await page.getByRole("button", { name: "Share report" }).click();
  await expect(
    liveRegion(page).filter({ hasText: "Report shared" })
  ).toHaveCount(1);
});

test("a Toaster's live regions are on the page before the first toast, and neither is an alert", async ({
  page,
}) => {
  await openExample(page, "toast", "types");
  // There before a toast comes, so a screen reader knows them; empty, and no alert on the page.
  const live = page.locator("[aria-live]:not([data-slot=toast-region])");
  await expect(live).toHaveCount(2);
  await expect(live).toHaveText(["", ""]);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(await page.locator("body").ariaSnapshot()).not.toMatch(/\balert\b/u);
  // An error interrupts, by the assertive region, and is still no second alert on the page.
  await page.getByRole("button", { name: "Error" }).click();
  await expect(page.locator("[aria-live=assertive]")).toHaveText(
    "Could not save. Check your connection and try again."
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("F6 moves focus to the newest toast, Escape dismisses it, and focus goes back", async ({
  page,
}) => {
  await openExample(page, "toast", "basic");
  const share = page.getByRole("button", { name: "Share report" });
  await share.click();
  const region = page.getByRole("region", { name: "Notifications" });
  const shown = region.getByRole("listitem");
  await expect(shown).toHaveCount(1);
  await page.keyboard.press("F6");
  await expect
    .poll(
      async () =>
        await shown.evaluate((node) => node.contains(document.activeElement))
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(region.getByText("Report shared")).toBeHidden();
  await expect(share).toBeFocused();
});

test("its action runs, and the toast goes", async ({ page }) => {
  await openExample(page, "toast", "actions");
  await page.getByRole("button", { name: "Archive report" }).click();
  const region = page.getByRole("region", { name: "Notifications" });
  await region.getByRole("button", { name: "Undo" }).click();
  await expect(region.getByText("Report archived")).toBeHidden();
  await expect(region.getByText("Report restored")).toBeVisible();
});

test("an action whose work takes a while keeps the toast until it is done", async ({
  page,
}) => {
  await openExample(page, "toast", "actions");
  await page.getByRole("button", { name: "Leave the editor" }).click();
  const region = page.getByRole("region", { name: "Notifications" });
  const save = region.getByRole("button", { name: "Save now" });
  await save.click();
  await expect(save).toHaveAttribute("aria-busy", "true");
  await expect(region.getByText("Unsaved changes")).toBeVisible();
  await expect(region.getByText("Unsaved changes")).toBeHidden();
});

test("toasts stack, the newest in front, and the stack opens under the pointer", async ({
  page,
}) => {
  await openExample(page, "toast", "basic");
  const share = page.getByRole("button", { name: "Share report" });
  await share.click();
  const region = page.getByRole("region", { name: "Notifications" });
  await expect(region.getByText("Report shared")).toBeVisible();
  const height = async () => {
    const box = await region.boundingBox();
    return box?.height ?? 0;
  };
  const one = await height();
  await share.click();
  await share.click();
  // Closed, the stack is as tall as its front toast.
  await expect.poll(height).toBeLessThan(one + 2);
  await region.hover();
  await expect.poll(height).toBeGreaterThan(one * 2.5);
});

test("a toast with a time has no close button; one that stays has one that puts it away", async ({
  page,
}) => {
  await openExample(page, "toast", "dismiss");
  const region = page.getByRole("region", { name: "Notifications" });
  await page.getByRole("button", { name: "Show a toast" }).click();
  await expect(region.getByText("Report shared")).toBeVisible();
  await expect(region.getByRole("button", { name: "Close" })).toHaveCount(0);
  await page.getByRole("button", { name: "Persistent" }).click();
  const exporting = region.getByRole("listitem").filter({
    hasText: "Exporting the report",
  });
  await expect(exporting).toBeVisible();
  await exporting.getByRole("button", { name: "Close" }).click();
  await expect(region.getByText("Exporting the report")).toBeHidden();
});

test("top-center stands in the middle of the window's top edge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "center");
  await page.getByRole("button", { name: "Go offline" }).click();
  const toast = page
    .getByRole("region", { name: "Notifications" })
    .getByRole("listitem");
  await expect(toast).toBeVisible();
  const box = await toast.boundingBox();
  const middle = (box?.x ?? 0) + (box?.width ?? 0) / 2;
  expect(Math.abs(middle - 640)).toBeLessThan(2);
  expect(box?.y ?? 800).toBeLessThan(100);
});

const layers = [
  { trigger: "Share in a dialog", role: "dialog" },
  { trigger: "Share in an alert dialog", role: "alertdialog" },
  { trigger: "Share in a sheet", role: "dialog" },
  { trigger: "Share in a drawer", role: "dialog" },
  { trigger: "Share in a popover", role: "dialog" },
] as const;

for (const { trigger, role } of layers) {
  test(`over a layer opened by "${trigger}", Undo pressed by a pointer runs and the layer stays`, async ({
    page,
  }) => {
    await openExample(page, "toast", "in-dialog");
    await page.getByRole("button", { name: trigger, exact: true }).click();
    const layer = page.getByRole(role, { name: "Share the workflow" });
    await layer.getByRole("button", { name: "Unshare Design" }).click();
    await expect(
      layer.getByRole("button", { name: "Unshare Design" })
    ).toBeHidden();
    const undo = page
      .getByRole("region", { name: "Notifications" })
      .getByRole("button", { name: "Undo" });
    const box = await undo.boundingBox();
    await page.mouse.move(
      (box?.x ?? 0) + (box?.width ?? 0) / 2,
      (box?.y ?? 0) + (box?.height ?? 0) / 2
    );
    await page.mouse.down();
    await page.mouse.up();
    await expect(
      layer.getByRole("button", { name: "Unshare Design" })
    ).toBeVisible();
    await expect(layer).toBeVisible();
  });
}

test("over a layer, F6 reaches the toast, Tab its Undo, and Enter runs it", async ({
  page,
}) => {
  await openExample(page, "toast", "in-dialog");
  await page.getByRole("button", { name: "Share in a dialog" }).click();
  const layer = page.getByRole("dialog", { name: "Share the workflow" });
  await layer.getByRole("button", { name: "Unshare Design" }).click();
  const undo = page
    .getByRole("region", { name: "Notifications" })
    .getByRole("button", { name: "Undo" });
  await expect(undo).toBeVisible();
  await page.keyboard.press("F6");
  const focused = async () =>
    await undo.evaluate((node) => node === document.activeElement);
  for (let step = 0; step < 4; step += 1) {
    // oxlint-disable-next-line no-await-in-loop -- one key after the other, until Undo has focus
    if (await focused()) {
      break;
    }
    // oxlint-disable-next-line no-await-in-loop -- see above
    await page.keyboard.press("Tab");
  }
  await expect(undo).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    layer.getByRole("button", { name: "Unshare Design" })
  ).toBeVisible();
  await expect(layer).toBeVisible();
});

test("a second Toaster on the same toasts warns once in the console", async ({
  page,
}) => {
  const warned: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().startsWith("Toaster:")) {
      warned.push(message.text());
    }
  });
  await openExample(page, "toast", "two-toasters");
  await expect.poll(() => warned.length).toBe(1);
  expect(warned[0]).toContain("2 Toasters draw the same toasts");
});
