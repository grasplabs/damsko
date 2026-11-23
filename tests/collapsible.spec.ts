import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

// Its fill once any transition under way has ended.
const fill = async (element: Locator): Promise<string> =>
  await element.evaluate(async (node) => {
    await Promise.all(
      node.getAnimations().map(async (each) => await each.finished)
    );
    return getComputedStyle(node).backgroundColor;
  });

test("a click on its trigger opens the panel and another closes it", async ({
  page,
}) => {
  await openExample(page, "collapsible", "basic");
  const trigger = page.getByRole("button", { name: "What counts as a review" });
  const words = page.getByText("A review is closed once its owner");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(words).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(words).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(words).toBeHidden();
});

test("the keyboard reaches it with a ring; Enter opens and Space closes, focus staying", async ({
  page,
}) => {
  await openExample(page, "collapsible", "basic");
  const trigger = page.getByRole("button", { name: "What counts as a review" });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  expect(await hasFocusRing(trigger)).toBe(true);

  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("a closed panel's words stay in the page, hidden, for find in page", async ({
  page,
}) => {
  await openExample(page, "collapsible", "basic");
  const words = page.getByText("A review is closed once its owner");
  await expect(words).toBeAttached();
  await expect(words).toBeHidden();
  // Hidden until found: the browser's find in page reaches the words and opens the panel.
  expect(
    await words.evaluate((node) =>
      node.closest("[hidden]")?.getAttribute("hidden")
    )
  ).toBe("until-found");
});

for (const width of [1440, 390]) {
  test(`each opens on its own, and an open panel's words stand off their trigger, ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await openExample(page, "collapsible", "several");
    const first = page.getByRole("button", { name: "Section 1" });
    const second = page.getByRole("button", { name: "Section 2" });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");

    // The words themselves, not the box round them: at least space-2 (8px) under their trigger,
    // and nearer it than the next trigger below.
    const words = await page
      .getByText("The brief, the owner and the date it is due.")
      .evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        const box = range.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom };
      });
    const above = await first.boundingBox();
    const below = await second.boundingBox();
    const over = words.top - (above?.y ?? 0) - (above?.height ?? 0);
    const under = (below?.y ?? 0) - words.bottom;
    expect(over).toBeGreaterThanOrEqual(7.5);
    expect(over).toBeLessThan(under);

    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "true");
  });
}

test("a disabled trigger does nothing, stays focusable and keeps its rest fill under the pointer", async ({
  page,
}) => {
  await openExample(page, "collapsible", "disabled");
  const trigger = page.getByRole("button", { name: "Advanced settings" });
  await expect(trigger).toHaveAttribute("aria-disabled", "true");
  const rest = await fill(trigger);
  await trigger.hover({ force: true });
  expect(await fill(trigger)).toBe(rest);
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click({ force: true });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("content drawn as its one child opens as a panel does, as that element", async ({
  page,
}) => {
  await openExample(page, "collapsible", "as-child");
  const trigger = page.getByRole("button", { name: "Who can see this" });
  const list = page.getByRole("list", { name: "Who can see this" });
  await expect(list).toBeHidden();
  // The list itself is the panel: hidden until found, with its own items inside.
  expect(
    await page
      .getByText("Everyone in Finance")
      .evaluate((node) => node.closest("ul")?.getAttribute("hidden"))
  ).toBe("until-found");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(list.getByRole("listitem")).toHaveCount(2);
  await trigger.click();
  await expect(list).toBeHidden();
});
