// The home page (site/pages/index.astro): the showcase. Its name, its one way into the docs (by
// pointer and by keyboard), the pieces a person can use doing what they show, the drift and the
// living ground standing still with reduced motion and moving without it, and no sideways scroll
// on a phone.
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const open = async (page: Page): Promise<void> => {
  await page.goto(new URL("/", process.env.BASE_URL).href);
};

/** The piece holding `inside`, scrolled to and live (its island hydrated). */
const live = async (page: Page, inside: Locator): Promise<void> => {
  await inside.scrollIntoViewIfNeeded();
  await expect(
    page.locator("astro-island:not([ssr])").filter({ has: inside })
  ).toHaveCount(1);
};

/** A control's fill and edge, as drawn. */
const look = async (
  element: Locator
): Promise<{ fill: string; edge: string }> =>
  await element.evaluate((node) => {
    const style = getComputedStyle(node);
    return { fill: style.backgroundColor, edge: style.boxShadow };
  });

test("the page names the library and has no docs sidebar or header", async ({
  page,
}) => {
  await open(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Damsko");
  await expect(page.getByRole("navigation")).toHaveCount(1);
  await expect(page.getByRole("banner")).toHaveCount(0);
});

test("Open the docs leads to Get started", async ({ page }) => {
  await open(page);
  await page.getByRole("link", { name: "Open the docs" }).click();
  await expect(page).toHaveURL(/\/get-started$/u);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the keyboard reaches Open the docs", async ({ page }) => {
  await open(page);
  const door = page.getByRole("link", { name: "Open the docs" });
  // The skip link first, then the docs: the showcase's pieces are pictures, out of the order.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(door).toBeFocused();
});

test("the weekly summary switch turns off when pressed", async ({ page }) => {
  await open(page);
  const setting = page.getByRole("switch", { name: "Weekly summary" });
  await live(page, setting);
  await expect(setting).toBeChecked();
  await setting.click();
  await expect(setting).not.toBeChecked();
});

test("the invite form at the end takes an email and a role, and sends", async ({
  page,
}) => {
  await open(page);
  const send = page.getByRole("button", { name: "Send invite" });
  await live(page, send);
  await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
  await page.getByRole("combobox", { name: "Role" }).click();
  await page.getByRole("option", { name: "Viewer" }).click();
  await expect(page.getByRole("combobox", { name: "Role" })).toHaveText(
    "Viewer"
  );
  await send.click();
  await expect(page.getByRole("button", { name: "Sent" })).toBeVisible();
});

test("the still dialog's Cancel stands as a field does, beside Archive's fill", async ({
  page,
}) => {
  await open(page);
  // The dialog is a picture, hidden from the accessibility tree: found by role all the same.
  const button = (name: string): Locator =>
    page.getByRole("button", { name, exact: true, includeHidden: true });
  const cancel = await look(button("Cancel"));
  // The ordinary button wears a field's fill, edge and lift, so it reads as the same height.
  expect(cancel).toEqual(
    await look(page.getByRole("textbox", { name: "Email" }))
  );
  const archive = await look(button("Archive"));
  expect(archive.fill).not.toBe(cancel.fill);
  expect(archive.fill).not.toBe("rgba(0, 0, 0, 0)");
});

test("with reduced motion nothing drifts and the ground stands still", async ({
  page,
}) => {
  await open(page);
  const field = page.locator("[data-showcase]");
  await expect(field).not.toHaveAttribute("data-drift");
  const running = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === "running" &&
            animation instanceof CSSAnimation &&
            animation.animationName.includes("drift")
        ).length
  );
  expect(running).toBe(0);
  // The still stays and the living canvas never comes in over it.
  await expect(page.locator(".sc-ground-still")).toHaveCSS("opacity", "1");
  await expect(page.locator("[data-slot='ground-canvas']")).toHaveCSS(
    "opacity",
    "0"
  );
});

test("with motion wanted the pieces drift and the ground comes alive", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "no-preference" });
  const page = await context.newPage();
  await open(page);
  await expect(page.locator("[data-showcase]")).toHaveAttribute(
    "data-drift",
    ""
  );
  await expect(page.locator(".sc-ground")).toHaveAttribute("data-lit", "");
  await expect(page.locator(".sc-ground-still")).toHaveCSS("opacity", "0");
  await context.close();
});

test("on a phone the page never scrolls sideways", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const send = page.getByRole("button", { name: "Send invite" });
  await live(page, send);
  const wider = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth
  );
  expect(wider).toBe(0);
});
