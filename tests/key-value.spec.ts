import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

const clipboard = async (page: Page) =>
  await page.evaluate(async () => await navigator.clipboard.readText());

// A part's corner: its radius and its shape.
const corner = async (part: Locator) =>
  await part.evaluate((node) => {
    const style = getComputedStyle(node);
    return [style.borderRadius, style.getPropertyValue("corner-shape")];
  });

test("the facts are a description list: each name, then its value, in order", async ({
  page,
}) => {
  await openExample(page, "key-value", "basic");
  await expect(page.getByRole("term")).toHaveText([
    "Owner",
    "Created",
    "Daily allowance",
  ]);
  await expect(page.getByRole("definition")).toHaveText([
    "Anna de Vries",
    "3 November 2026",
    "38 of 50 requests left today",
  ]);
});

test.describe("copying", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("Tab reaches each copy button; Enter copies the value and says Copied", async ({
    page,
  }) => {
    const said = await listenToLiveRegions(page);
    await openExample(page, "key-value", "divided");
    const copies = page.getByRole("button", { name: /^Copy/u });
    await expect(copies).toHaveCount(2);
    await page.keyboard.press("Tab");
    await expect(copies.first()).toBeFocused();
    expect(await hasFocusRing(copies.first())).toBe(true);
    await page.keyboard.press("Tab");
    await expect(copies.nth(1)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect
      .poll(async () => await clipboard(page))
      .toBe("usr_01J9X4F81C2QK7M3");
    await expect.poll(said).toContain("Copied");
    // A second time would come a message's hold (400ms) after the first.
    await page.waitForTimeout(600);
    expect(await said()).toStrictEqual(["Copied"]);
  });

  test("a copy button stands in its value's row, at the end", async ({
    page,
  }) => {
    await openExample(page, "key-value", "divided");
    const value = page.getByText("usr_01J9X4F81C2QK7M3");
    const copy = page.getByRole("button", { name: /^Copy/u }).nth(1);
    const v = await value.boundingBox();
    const c = await copy.boundingBox();
    expect(c?.x ?? 0).toBeGreaterThan((v?.x ?? 0) + (v?.width ?? 0));
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    const vr = await value.boundingBox();
    const cr = await copy.boundingBox();
    expect((cr?.x ?? 0) + (cr?.width ?? 0)).toBeLessThan(vr?.x ?? 0);
  });
});

test("its words come from the page's language", async ({ page }) => {
  await openExample(page, "key-value", "labels");
  await expect(page.getByRole("button", { name: /^Kopieer/u })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Copy/u })).toHaveCount(0);
});

test("horizontal, a fact with a detail opens in place, one at a time", async ({
  page,
}) => {
  await openExample(page, "key-value", "rail");
  // Knows is only read; Model and Runs open.
  await expect(page.getByRole("button", { name: "Knows" })).toHaveCount(0);
  const model = page.getByRole("button", { name: "Model" });
  const runs = page.getByRole("button", { name: "Runs" });
  await expect(model).toHaveAttribute("aria-expanded", "false");
  // Nothing above it moves: Knows keeps its place over Model as Model opens.
  const gap = async () => {
    const knows = await page.getByText("4 sources").boundingBox();
    const opens = await model.boundingBox();
    return (opens?.y ?? 0) - (knows?.y ?? 0);
  };
  const before = await gap();
  await model.click();
  await expect(model).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Claude Sonnet, faster")).toBeVisible();
  // Once the panel has opened: the page centres the example, so both move while it does.
  await expect.poll(gap).toBe(before);
  await runs.click();
  await expect(runs).toHaveAttribute("aria-expanded", "true");
  await expect(model).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Claude Sonnet, faster")).toBeHidden();
  await expect(page.getByText(/never runs on its own/u)).toBeVisible();
});

test("a fact's button controls the panel that holds its detail, a definition", async ({
  page,
}) => {
  await openExample(page, "key-value", "rail");
  const runs = page.getByRole("button", { name: "Runs" });
  const words = page.getByText(/never runs on its own/u);
  // A closed detail stays in the page, hidden until found, as a Collapsible's panel does.
  await expect(words).toBeAttached();
  await expect(words).toBeHidden();
  expect(
    await words.evaluate((node) =>
      node.closest("[hidden]")?.getAttribute("hidden")
    )
  ).toBe("until-found");
  const detail = page
    .getByRole("definition")
    .filter({ hasText: /never runs on its own/u });
  await runs.click();
  await expect(detail).toBeVisible();
  const controls = await runs.getAttribute("aria-controls");
  expect(
    await detail.evaluate(
      (node, id) => node.closest(`[id="${id}"]`) !== null,
      controls
    )
  ).toBe(true);
});

test("a press on the row opens it and leaves no ring; the keyboard's ring follows the row's corner", async ({
  page,
}) => {
  await openExample(page, "key-value", "rail");
  const model = page.getByRole("button", { name: "Model" });
  await model.click();
  await expect(model).toHaveAttribute("aria-expanded", "true");
  await expect(model).toBeFocused();
  expect(await hasFocusRing(model)).toBe(false);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect(await hasFocusRing(model)).toBe(true);
  // The corner every row takes: the row corner, capped at half the row, in the system's shape,
  // which the detail under it has too.
  const [radius, shape] = await corner(model);
  expect(radius).toBe("16px");
  expect(await corner(page.getByRole("definition").nth(2))).toEqual([
    "20px",
    shape,
  ]);
  expect(shape).not.toBe("round");
});

test("the keys open and close a fact", async ({ page }) => {
  await openExample(page, "key-value", "rail");
  const model = page.getByRole("button", { name: "Model" });
  await page.keyboard.press("Tab");
  await expect(model).toBeFocused();
  expect(await hasFocusRing(model)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(model).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(model).toHaveAttribute("aria-expanded", "false");
});

test("a value on its way waits, and its fact opens only once it lands", async ({
  page,
}) => {
  await openExample(page, "key-value", "rail-start");
  // Model waits: no button until its value lands, then one.
  await expect(page.getByRole("button", { name: "Model" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Model" })).toHaveCount(1, {
    timeout: 5000,
  });
});

test("an icon alone names its row, in a tooltip on keyboard focus", async ({
  page,
}) => {
  await openExample(page, "key-value", "icons");
  // Answers in has no detail: its icon is named by the row's name and takes focus for its tooltip.
  const icon = page.getByRole("img", { name: "Answers in" });
  await expect(icon).toHaveCount(1);
  // By the keys, as a person reaches it: from the tight rail's Model, the next stop.
  await page.getByRole("button", { name: "Model" }).last().focus();
  await page.keyboard.press("Tab");
  await expect(icon).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText("Answers in");
});
