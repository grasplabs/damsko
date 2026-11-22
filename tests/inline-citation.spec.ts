import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("each chip is a button named by where its source lives", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "basic");
  await expect(
    page.getByRole("button", { name: "docs.example.com", exact: true })
  ).toBeVisible();
  // www. is not part of the host shown.
  await expect(
    page.getByRole("button", { name: "example.net", exact: true })
  ).toBeVisible();
});

test("resting on a chip opens its source: title, line, and a link by its host in a new tab", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "basic");
  await page.getByRole("button", { name: "guide.example.org" }).hover();
  await expect(page.getByText("Loading fallbacks")).toBeVisible();
  await expect(
    page.getByText("Show a placeholder until a slow part has loaded.")
  ).toBeVisible();
  const link = page.getByRole("link", { name: /^guide\.example\.org/u });
  await expect(link).toHaveAttribute(
    "href",
    "https://guide.example.org/loading/fallbacks"
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAccessibleName(
    "guide.example.org (opens in a new tab)"
  );
});

test("the keyboard reaches a chip with its ring, opens the card, and Tab moves into it", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "basic");
  await page.keyboard.press("Tab");
  const chip = page.getByRole("button", { name: "docs.example.com" });
  await expect(chip).toBeFocused();
  expect(await hasFocusRing(chip)).toBe(true);
  await expect(page.getByText("Streaming a page")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /^docs\.example\.com/u })
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Streaming a page")).toBeHidden();
});

test("several sources: the chip counts the rest, and the card pages through them", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "several");
  const chip = page.getByRole("button", { name: "research.example.com +2" });
  await chip.hover();
  const carousel = page.getByRole("region", { name: "Sources" });
  await expect(carousel.getByText("1/3")).toBeVisible();
  await expect(page.getByText("Remote teams, a year on")).toBeInViewport();
  await expect(
    page.getByText("Teams that plan on Mondays ship more by Friday.")
  ).toBeVisible();
  await carousel.getByRole("button", { name: "Next" }).click();
  await expect(carousel.getByText("2/3")).toBeVisible();
  await expect(page.getByText("A weekly rhythm")).toBeInViewport();
});

test("an address that leads nowhere safe is words, not a link, and the chip says Source", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "untrusted");
  await page.getByRole("button", { name: "Source", exact: true }).hover();
  await expect(page.getByText("Annual report")).toBeVisible();
  await expect(page.getByText(/^javascript:alert/u)).toBeVisible();
  await expect(page.getByRole("link")).toHaveCount(0);
});

test("when the sources shrink under the open card, it stands on the last one left, never past it", async ({
  page,
}) => {
  await openExample(page, "inline-citation", "script");
  await page.getByRole("button", { name: "research.example.com +2" }).hover();
  const carousel = page.getByRole("region", { name: "Sources" });
  await carousel.getByRole("button", { name: "Next" }).click();
  await carousel.getByRole("button", { name: "Next" }).click();
  await expect(carousel.getByText("3/3")).toBeVisible();
  await page.evaluate(() => {
    window.inlineCitationScript?.drop();
  });
  await expect(carousel.getByText("2/2")).toBeVisible();
  await expect(page.getByText("A weekly rhythm")).toBeInViewport();
});
