import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("folded, the pile says only its count; pressing it shows each source as a link by its title", async ({
  page,
}) => {
  await openExample(page, "sources", "basic");
  const trigger = page.getByRole("button", { name: /^5 sources/u });
  await expect(trigger).toHaveText("5 sources");
  const first = page.getByRole("link", {
    name: /^Churn by region, Q3\s*, Finance \/ Reports \(opens in a new tab\)$/u,
  });
  await expect(first).toBeHidden();

  await trigger.click();
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute("target", "_blank");
});

test("the trigger says whether the list is open, and opens and closes it", async ({
  page,
}) => {
  await openExample(page, "sources", "basic");
  const trigger = page.getByRole("button", { name: "5 sources" });
  const list = page.getByRole("list", { name: "Sources" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(list).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(list.getByRole("listitem")).toHaveCount(5);
  await expect(list.getByRole("link")).toHaveCount(5);

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(list).toBeHidden();
});

test("the keyboard reaches the trigger with a ring; Enter opens and Space closes, focus staying", async ({
  page,
}) => {
  await openExample(page, "sources", "basic");
  const trigger = page.getByRole("button", { name: "5 sources" });
  await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  expect(await hasFocusRing(trigger)).toBe(true);

  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Churn by region, Q3" })
  ).toBeFocused();

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

for (const dir of ["ltr", "rtl"]) {
  test(`folded, the pile's first mark lines up with the words above it, ${dir}`, async ({
    page,
  }) => {
    await openExample(page, "sources", "basic");
    await page.evaluate((direction) => {
      document.documentElement.dir = direction;
    }, dir);
    const words = await page
      .getByRole("paragraph")
      .first()
      .evaluate((node) => {
        const box = node.getBoundingClientRect();
        return { left: box.left, right: box.right };
      });
    // The first mark: the tile of the first picture in the pile, before its count.
    const mark = await page
      .getByRole("button", { name: /^5 sources/u })
      .evaluate((node) => {
        const box = node
          .querySelector("svg")
          ?.parentElement?.getBoundingClientRect();
        return { left: box?.left ?? 0, right: box?.right ?? 0 };
      });
    if (dir === "ltr") {
      expect(Math.abs(mark.left - words.left)).toBeLessThanOrEqual(1);
    } else {
      expect(Math.abs(mark.right - words.right)).toBeLessThanOrEqual(1);
    }
  });
}

test("a source with an address is a link that also tells the page; one without is a button", async ({
  page,
}) => {
  await openExample(page, "sources", "open");
  await expect(page.getByText("Nothing opened yet")).toBeVisible();

  const link = page.getByRole("link", { name: /^Pricing page\b/u });
  await expect(link).toHaveAttribute("href", "#pricing");
  const tab = page.context().waitForEvent("page");
  await link.click();
  const opened = await tab;
  await opened.close();
  await expect(page.getByText("Opened 1: Pricing page")).toBeVisible();

  await page
    .getByRole("button", { name: /^Notes from the pricing call\b/u })
    .click();
  await expect(
    page.getByText("Opened 2: Notes from the pricing call")
  ).toBeVisible();
});

test("a source the person cannot open, or that could not be opened, says so and is not a link", async ({
  page,
}) => {
  await openExample(page, "sources", "access");
  const row = (title: string) =>
    page.getByRole("listitem").filter({ hasText: title });

  await expect(row("Board pricing memo")).toContainText("You cannot open this");
  await expect(
    page.getByRole("link", { name: /^Board pricing memo/u })
  ).toHaveCount(0);

  await expect(row("Competitor price list")).toContainText(
    "Could not be opened"
  );
  await expect(
    page.getByRole("link", { name: /^Competitor price list/u })
  ).toHaveCount(0);

  await expect(
    page.getByRole("link", { name: /^Churn by region, Q3\b/u })
  ).toBeVisible();
});

test("a source on another site shows the host its address names, not words of its own", async ({
  page,
}) => {
  await openExample(page, "sources", "basic");
  await page.getByRole("button", { name: "5 sources" }).click();
  await expect(
    page.getByRole("link", {
      name: /^How onboarding shapes the first year\s*, research\.example\.com \(opens in a new tab\)$/u,
    })
  ).toHaveAttribute("href", "https://research.example.com/onboarding");
});
