import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

for (const theme of ["light", "dark"] as const) {
  test(`a mark on its own is an image named by its brand, at Avatar's sizes, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "brand-icon", "sizes", { theme });
    const marks = page.getByRole("img", { name: "Slack" });
    await expect(marks).toHaveCount(5);
    const widths = await marks.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width)
    );
    // Four tiles, 24 to 48px, and the mark alone at half the default tile.
    expect(widths).toEqual([24, 32, 40, 48, 16]);
  });
}

test("beside its name the mark is decorative: the words say the brand once", async ({
  page,
}) => {
  await openExample(page, "brand-icon", "sources");
  await expect(page.getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("listitem")).toHaveText([
    /^Slack/u,
    /^Google Drive/u,
    /^Notion/u,
  ]);
});

test("every brand in the set keeps its key whole on one line", async ({
  page,
}) => {
  await openExample(page, "brand-icon", "set");
  const cells = page.getByRole("listitem");
  await expect(cells).toHaveCount(33);
  const heights = await cells.evaluateAll((elements) =>
    elements.map((element) =>
      Math.round(element.getBoundingClientRect().height)
    )
  );
  expect(new Set(heights).size).toBe(1);
});

test("mono draws every mark in the text colour, brand in its own", async ({
  page,
}) => {
  await openExample(page, "brand-icon", "tones");
  await Promise.all(
    ["Google", "Slack", "Figma", "GitHub", "YouTube", "X"].map(async (name) => {
      await expect(page.getByRole("img", { name, exact: true })).toHaveCount(2);
    })
  );
  const mono = await page
    .getByRole("img", { name: "Slack", exact: true })
    .last()
    .evaluate((mark) => {
      const ink = getComputedStyle(mark).color;
      return [...mark.querySelectorAll("path")].every(
        (path) => getComputedStyle(path).fill === ink
      );
    });
  expect(mono).toBe(true);
  const brand = await page
    .getByRole("img", { name: "Slack", exact: true })
    .first()
    .evaluate((mark) => {
      const ink = getComputedStyle(mark).color;
      return [...mark.querySelectorAll("path")].some(
        (path) => getComputedStyle(path).fill !== ink
      );
    });
  expect(brand).toBe(true);
});

test("a group is one picture, named once, with the rest as +N", async ({
  page,
}) => {
  await openExample(page, "brand-icon", "group");
  await expect(
    page.getByRole("img", { name: "Slack, Google Drive, Notion and 2 others" })
  ).toHaveCount(2);
  await expect(
    page.getByRole("img", { name: "Slack and Google Sheets" })
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Slack, Acme CRM, Notion and 1 other" })
  ).toBeVisible();
  // Its tiles are not named one by one: the group's name says them.
  await expect(
    page.getByRole("img", { name: "Slack", exact: true })
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("img", { name: "Slack, Google Drive, Notion and 2 others" })
      .first()
  ).toHaveText("+2");
});

test("a brand with no mark is named by its label and shows its first letter on a tile as large as a mark's", async ({
  page,
}) => {
  await openExample(page, "brand-icon", "fallback");
  const letters = page.getByRole("img", { name: "Acme CRM" });
  await expect(letters).toHaveCount(4);
  await expect(letters.first()).toHaveText("A");
  const sizes = await page.evaluate(() =>
    [...document.querySelectorAll('[role="img"]')].map((element) => {
      const box = element.getBoundingClientRect();
      return `${element.getAttribute("aria-label")} ${box.width}x${box.height}`;
    })
  );
  expect(sizes.slice(0, 3)).toEqual([
    "Slack 24x24",
    "Acme CRM 24x24",
    "Notion 24x24",
  ]);
});
