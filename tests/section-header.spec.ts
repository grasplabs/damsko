import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("its title is an h2 unless set, with its sentence under it", async ({
  page,
}) => {
  await openExample(page, "section-header", "basic");
  const title = page.getByRole("heading", { name: "Usage", level: 2 });
  await expect(title).toBeVisible();
  const sentence = page.getByText(
    "Seats and storage used this month, across every workspace."
  );
  const titleBox = await title.boundingBox();
  const sentenceBox = await sentence.boundingBox();
  expect(sentenceBox?.y ?? 0).toBeGreaterThanOrEqual(
    (titleBox?.y ?? 0) + (titleBox?.height ?? 0) - 0.5
  );
});

test("a section is a region named by its header's title", async ({ page }) => {
  await openExample(page, "section-header", "section");
  const region = page.getByRole("region", { name: "Billing" });
  await expect(region).toBeVisible();
  await expect(
    region.getByRole("heading", { name: "Billing", level: 2 })
  ).toBeVisible();
  await expect(
    region.getByText("Each seat is counted on the day the invoice is made.")
  ).toBeVisible();
});

test("while it loads, placeholders stand in for the words", async ({
  page,
}) => {
  await openExample(page, "section-header", "loading");
  await expect(page.getByRole("heading")).toHaveCount(0);
  await expect(page.getByText("Usage")).toHaveCount(0);
});

for (const [width, dir] of [
  [390, "ltr"],
  [320, "ltr"],
  [390, "rtl"],
] as const) {
  test(`its action stays at the end of the title's first line while it fits, ${String(width)} ${dir}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "section-header", "actions");
    await page.evaluate((direction) => {
      document.documentElement.dir = direction;
    }, dir);
    const title = page.getByRole("heading", {
      name: "Usage across every workspace this month",
    });
    const action = page.getByRole("button", { name: "Export" });
    const line = await title.evaluate((node) =>
      Number(getComputedStyle(node).lineHeight.replace("px", ""))
    );
    const t = await title.boundingBox();
    const a = await action.boundingBox();
    if (t === null || a === null) {
      throw new Error("no title or action drawn");
    }
    // On the title's first line, at its end; the long title wraps beside it.
    expect(a.y).toBeLessThan(t.y + line);
    expect(a.y + a.height).toBeGreaterThan(t.y);
    if (dir === "rtl") {
      expect(a.x + a.width).toBeLessThanOrEqual(t.x + 0.5);
    } else {
      expect(a.x).toBeGreaterThanOrEqual(t.x + t.width - 0.5);
    }
    expect(t.height).toBeGreaterThan(line * 1.5);
  });
}

test("its actions are reached by the keyboard after nothing else", async ({
  page,
}) => {
  await openExample(page, "section-header", "actions");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Export" })).toBeFocused();
});

test("over a card of rows, a group's xs action ends on the foot of the title's line", async ({
  page,
}) => {
  await openExample(page, "card", "grouped");
  const title = page.getByRole("heading", { name: "Plan", exact: true });
  const action = page.getByRole("button", { name: "Change plan" });
  const line = await title.evaluate((node) =>
    Number(getComputedStyle(node).lineHeight.replace("px", ""))
  );
  const t = await title.boundingBox();
  const a = await action.boundingBox();
  if (t === null || a === null) {
    throw new Error("no title or action drawn");
  }
  expect(Math.abs(a.y + a.height - (t.y + line))).toBeLessThanOrEqual(1);
});
