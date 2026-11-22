import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample, ringCut } from "./example.ts";

test("it is a region named by its label, with Previous, Next and a mark per page", async ({
  page,
}) => {
  await openExample(page, "carousel", "basic");
  const carousel = page.getByRole("region", { name: "Featured stories" });
  await expect(carousel).toBeVisible();
  await expect(
    carousel.getByRole("button", { name: "Previous" })
  ).toBeVisible();
  await expect(carousel.getByRole("button", { name: "Next" })).toBeVisible();
  const marks = carousel.getByRole("tablist", {
    name: "Pages of Featured stories",
  });
  await expect(marks.getByRole("tab")).toHaveCount(4);
  await expect(marks.getByRole("tab", { name: "Page 1" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("Previous is disabled on the first page and Next on the last", async ({
  page,
}) => {
  await openExample(page, "carousel", "basic");
  const previous = page.getByRole("button", { name: "Previous" });
  const next = page.getByRole("button", { name: "Next" });
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(next).not.toHaveAttribute("aria-disabled", "true");
  await next.click();
  await expect(page.getByRole("tab", { name: "Page 2" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await next.click();
  await expect(page.getByRole("tab", { name: "Page 3" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await next.click();
  await expect(page.getByRole("tab", { name: "Page 4" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(next).toHaveAttribute("aria-disabled", "true");
  await expect(previous).not.toHaveAttribute("aria-disabled", "true");
  // At the end it stays focusable, and a press does nothing.
  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "Page 4" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("Enter on Next pages on, and an arrow key in the slides goes back", async ({
  page,
}) => {
  await openExample(page, "carousel", "basic");
  await page.getByRole("button", { name: "Next" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "Page 2" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  // The slides' window is the first stop in the carousel.
  await page.getByRole("tab", { name: "Page 2" }).focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Page 1" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("a mark shows its page", async ({ page }) => {
  await openExample(page, "carousel", "basic");
  await page.getByRole("tab", { name: "Page 3" }).click();
  await expect(page.getByRole("tab", { name: "Page 3" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await expect(page.getByRole("group", { name: "3 of 4" })).toBeInViewport();
});

test("several a view: one mark per page, and Next goes round", async ({
  page,
}) => {
  await openExample(page, "carousel", "several");
  const carousel = page.getByRole("region", { name: "Rooms to book" });
  await expect(carousel.getByRole("tab")).toHaveCount(3);
  const next = carousel.getByRole("button", { name: "Next" });
  await next.click();
  await expect(carousel.getByRole("tab", { name: "Page 2" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await next.click();
  await expect(carousel.getByRole("tab", { name: "Page 3" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await next.click();
  await expect(carousel.getByRole("tab", { name: "Page 1" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("every word it says comes from the product's catalogue", async ({
  page,
}) => {
  await openExample(page, "carousel", "labels");
  const carousel = page.getByRole("region", { name: "Uitgelichte verhalen" });
  await expect(carousel.getByRole("button", { name: "Vorige" })).toBeVisible();
  await expect(
    carousel.getByRole("button", { name: "Volgende" })
  ).toBeVisible();
  await expect(
    carousel.getByRole("tablist", {
      name: "Pagina's van Uitgelichte verhalen",
    })
  ).toBeVisible();
  await expect(carousel.getByRole("tab", { name: "Pagina 2" })).toBeVisible();
  await expect(carousel.getByRole("button", { name: "Next" })).toHaveCount(0);
});

test("in another language it calls itself and its slides in that language, each slide named by its place", async ({
  page,
}) => {
  await openExample(page, "carousel", "labels");
  const carousel = page.getByRole("region", { name: "Uitgelichte verhalen" });
  await expect(carousel).toHaveAttribute("aria-roledescription", "carrousel");
  const first = carousel.getByRole("group", { name: "1 van 3" });
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute("aria-roledescription", "dia");
});

test("running down, the up and down arrows page it", async ({ page }) => {
  await openExample(page, "carousel", "vertical");
  const carousel = page.getByRole("region", { name: "The day's notes" });
  await carousel.getByRole("button", { name: "Next" }).click();
  await expect(carousel.getByRole("tab", { name: "Page 2" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await carousel.getByRole("tab", { name: "Page 2" }).focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("ArrowDown");
  await expect(carousel.getByRole("tab", { name: "Page 3" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.keyboard.press("ArrowUp");
  await expect(carousel.getByRole("tab", { name: "Page 2" })).toHaveAttribute(
    "aria-selected",
    "true"
  );
});

test("a slide that is a link keeps its whole focus ring inside the slides' window, on the first page and the last", async ({
  page,
}) => {
  await openExample(page, "carousel", "links");
  const first = page.getByRole("link", { name: "Studio A" });
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  expect(await hasFocusRing(first)).toBe(true);
  expect(await ringCut(first)).toBeLessThanOrEqual(0);
  await page.getByRole("tab", { name: "Page 2" }).click();
  const last = page.getByRole("link", { name: "Workshop" });
  await expect(last).toBeInViewport({ ratio: 1 });
  await page.getByRole("tab", { name: "Page 2" }).press("Shift+Tab");
  await expect(last).toBeFocused();
  expect(await hasFocusRing(last)).toBe(true);
  expect(await ringCut(last)).toBeLessThanOrEqual(0);
});

test("a page mark's ring is drawn inside its own target, so it never lies on the mark beside it", async ({
  page,
}) => {
  await openExample(page, "carousel", "basic");
  const mark = page.getByRole("tab", { name: "Page 1" });
  await mark.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(mark).toBeFocused();
  expect(await hasFocusRing(mark)).toBe(true);
  const reach = await mark.evaluate((node) => {
    const style = getComputedStyle(node);
    return (
      Number(style.outlineWidth.replace(/px$/u, "")) +
      Number(style.outlineOffset.replace(/px$/u, ""))
    );
  });
  expect(reach).toBeLessThanOrEqual(0);
});
