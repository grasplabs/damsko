import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("a link in a sentence is a link named by its words", async ({ page }) => {
  await openExample(page, "link", "inline");
  const link = page.getByRole("link", { name: "sharing guide" });
  await expect(link).toHaveAttribute("href", "#sharing");
  await expect(link).not.toHaveAttribute("target");
});

test("a link on its own is named by its words", async ({ page }) => {
  await openExample(page, "link", "standalone");
  await expect(
    page.getByRole("link", { name: "View all reports" })
  ).toHaveAttribute("href", "#reports");
});

test("an external link opens a new tab, safely, and says so", async ({
  page,
}) => {
  await openExample(page, "link", "external");
  await Promise.all(
    ["status page", "Help centre"].map(async (words) => {
      const link = page.getByRole("link", {
        name: `${words} (opens in a new tab)`,
      });
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    })
  );
});

test("a router's link is the element: one link, its own address and attributes kept", async ({
  page,
}) => {
  await openExample(page, "link", "router");
  const links = page.getByRole("link");
  await expect(links).toHaveCount(1);
  const link = page.getByRole("link", { name: "activity log" });
  await expect(link).toHaveAttribute("href", "#activity");
  await expect(link).toHaveAttribute("data-router-link", "");
  await expect(page.getByText("activity log, newest first.")).toBeVisible();
});

test("the keyboard's focus shows a ring and moves no words", async ({
  page,
}) => {
  await openExample(page, "link", "external");
  const sentence = page.getByText("for planned maintenance.");
  const before = await sentence.boundingBox();
  await page.keyboard.press("Tab");
  const link = page.getByRole("link", {
    name: "status page (opens in a new tab)",
  });
  await expect(link).toBeFocused();
  expect(await hasFocusRing(link)).toBe(true);
  expect(await sentence.boundingBox()).toEqual(before);
});
