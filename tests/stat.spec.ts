import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`a stat alone is a region named by its label, read label, value, change, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "stat", "single", {
      theme,
    });
    const revenue = page.getByRole("region", { name: "Total revenue" });
    await expect(revenue).toHaveText("Total revenue€124,567+12%");
    await expect(
      page.getByRole("region", { name: "Conversion rate" })
    ).toHaveText("Conversion rate3.45%−0.2%");
    // The icons are hidden: the words say it.
    await expect(page.getByRole("img")).toHaveCount(0);
  });
}

test("a group is a list named by its aria-label, each figure an item named by its label", async ({
  page,
}) => {
  await openExample(page, "stat", "grid");
  const row = page.getByRole("list", { name: "This month" });
  await expect(row.getByRole("listitem")).toHaveCount(4);
  // The trend is said in the change's own words, after the value.
  await expect(row.getByRole("listitem", { name: "Returns" })).toHaveText(
    "Returns89+2.1%"
  );
  await expect(row.getByRole("listitem", { name: "Orders" })).toHaveText(
    "Orders1,234+15.3%"
  );
});

test("while the figures load, the group says it is busy and the labels show", async ({
  page,
}) => {
  await openExample(page, "stat", "loading");
  const row = page.getByRole("list", { name: "This quarter" });
  await expect(row).toHaveAttribute("aria-busy", "true");
  await expect(row.getByRole("listitem")).toHaveText([
    "Revenue",
    "Orders",
    "Average order",
  ]);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the last figure takes what is left of its row, so no place stands empty", async ({
    page,
  }) => {
    await openExample(page, "stat", "loading");
    const row = page.getByRole("list", { name: "This quarter" });
    const list = await row.boundingBox();
    const last = await row
      .getByRole("listitem", { name: "Average order" })
      .boundingBox();
    expect(list).not.toBeNull();
    expect(last).not.toBeNull();
    expect(Math.abs((last?.width ?? 0) - (list?.width ?? 0))).toBeLessThan(2);
  });
});

test("a group of Stat children reads as the same list, the ones made with map too", async ({
  page,
}) => {
  await openExample(page, "stat", "children");
  const row = page.getByRole("list", { name: "This week" });
  await expect(row.getByRole("listitem")).toHaveText([
    "Spend€2,310−4% on last week",
    "Refunds€184+3 since Monday",
    "Orders96+12 on last week",
  ]);
  // Three figures, three columns: the last ends where the box does, no place left empty.
  const list = await row.boundingBox();
  const orders = await row
    .getByRole("listitem", { name: "Orders" })
    .boundingBox();
  expect(list).not.toBeNull();
  expect(orders).not.toBeNull();
  expect(
    Math.abs(
      (orders?.x ?? 0) +
        (orders?.width ?? 0) -
        (list?.x ?? 0) -
        (list?.width ?? 0)
    )
  ).toBeLessThan(2);
});

test("while it loads a figure waits on a soft tile, a body line tall", async ({
  page,
}) => {
  await openExample(page, "stat", "loading");
  const tile = await page
    .getByRole("listitem", { name: "Revenue" })
    .evaluate((item) => {
      const wait = item.querySelector("[data-slot=skeleton]");
      return wait === null
        ? null
        : {
            height: wait.getBoundingClientRect().height,
            ground: getComputedStyle(wait).backgroundColor,
          };
    });
  expect(tile?.height).toBe(24);
  expect(tile?.ground).not.toBe("rgba(0, 0, 0, 0)");
});
