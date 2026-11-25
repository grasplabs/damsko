import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

/** Where an element stands on the screen; nothing, at the origin. */
const boxOf = async (
  element: Locator
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const box = await element.boundingBox();
  return box ?? { x: 0, y: 0, width: 0, height: 0 };
};

const widthOf = async (element: Locator): Promise<number> => {
  const box = await boxOf(element);
  return box.width;
};
const topOf = async (element: Locator): Promise<number> => {
  const box = await boxOf(element);
  return box.y;
};
const leftOf = async (element: Locator): Promise<number> => {
  const box = await boxOf(element);
  return box.x;
};

/** The vertical middle of an element on the screen. */
const middle = async (element: Locator): Promise<number> => {
  const box = await boxOf(element);
  return box.y + box.height / 2;
};

/** Scrolls the panel by the wheel, over its middle, to its end. */
const scrollToEnd = async (page: Page, panel: Locator): Promise<void> => {
  const box = await panel.boundingBox();
  await page.mouse.move(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) + (box?.height ?? 0) * 0.75
  );
  await page.mouse.wheel(0, 3000);
};

test("it is a complementary landmark named by its label, headed by its title", async ({
  page,
}) => {
  await openExample(page, "side-panel", "basic");
  const panel = page.getByRole("complementary", { name: "Report details" });
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("heading", { level: 2, name: "Quarterly delivery review" })
  ).toBeVisible();
  await expect(panel.getByRole("button", { name: "Close" })).toBeVisible();
});

test("its views are tabs: one tab stop, the arrow keys between them, each showing its content", async ({
  page,
}) => {
  await openExample(page, "side-panel", "basic");
  const panel = page.getByRole("complementary", { name: "Report details" });
  const details = panel.getByRole("tab", { name: "Details" });
  const activity = panel.getByRole("tab", { name: "Activity" });
  await expect(details).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("tabpanel")).toContainText("Owner");
  await details.focus();
  await page.keyboard.press("ArrowRight");
  await expect(activity).toBeFocused();
  await expect(activity).toHaveAttribute("aria-selected", "true");
  await expect(panel.getByRole("tabpanel")).toContainText("This week");
  expect(await hasFocusRing(activity)).toBe(true);
});

test("scrolled, the views fold into the bar as icons, on the line of its buttons, and keep their names", async ({
  page,
}) => {
  for (const width of [768, 1440]) {
    // oxlint-disable-next-line no-await-in-loop -- one width after the other
    await page.setViewportSize({ width, height: 900 });
    // oxlint-disable-next-line no-await-in-loop -- see above
    await openExample(page, "side-panel", "basic");
    const panel = page.getByRole("complementary", { name: "Report details" });
    const views = panel.getByRole("tablist");
    const open = panel.getByRole("button", { name: "Open" });
    // oxlint-disable-next-line no-await-in-loop -- see above
    const before = await widthOf(views);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await scrollToEnd(page, panel);
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(async () => {
      expect(
        Math.abs((await middle(views)) - (await middle(open)))
      ).toBeLessThan(1.5);
      expect(await widthOf(views)).toBeLessThan(before);
    }).toPass();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(panel.getByRole("tab", { name: "Details" })).toBeVisible();
    // oxlint-disable-next-line no-await-in-loop -- see above
    await expect(panel.getByRole("tab", { name: "Activity" })).toBeVisible();
  }
});

test("with no title, its views stand alone at its top with their words, and stay as it scrolls", async ({
  page,
}) => {
  await openExample(page, "side-panel", "views-only");
  const panel = page.getByRole("complementary", { name: "About this note" });
  await expect(panel.getByRole("heading", { level: 2 })).toHaveCount(0);
  const views = panel.getByRole("tablist", { name: "About this note" });
  await expect(views).toBeVisible();
  const links = panel.getByRole("tab", { name: "Links" });
  const top = await topOf(views);
  const wide = await widthOf(links);
  await scrollToEnd(page, panel);
  await expect(views).toBeInViewport();
  expect(Math.round(await topOf(views))).toBe(Math.round(top));
  expect(await widthOf(links)).toBe(wide);
});

test("a section is named by its title; its description is a tooltip on the title, reached by Tab with its ring", async ({
  page,
}) => {
  await openExample(page, "side-panel", "section");
  await expect(page.getByRole("region", { name: "Triggers" })).toBeVisible();
  const title = page.getByRole("button", { name: "Triggers" });
  await page.keyboard.press("Tab");
  await expect(title).toBeFocused();
  expect(await hasFocusRing(title)).toBe(true);
  await expect(page.getByRole("tooltip")).toHaveText(
    "What starts the agent: a schedule, an event or a person."
  );
  // The ring stands off the title's words: its box reaches past them on every side.
  const box = await title.boundingBox();
  const words = await title.evaluate((node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const rect = range.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  expect(box?.x ?? 0).toBeLessThan(words.x);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(
    words.y + words.height
  );
});

test("an empty section is one button that adds the first", async ({ page }) => {
  await openExample(page, "side-panel", "section");
  const section = page.getByRole("region", { name: "Context" });
  await expect(
    section.getByRole("button", { name: "Add context" })
  ).toBeVisible();
});

test("its close button is named by the I18nProvider, in the bar after the actions", async ({
  page,
}) => {
  await openExample(page, "side-panel", "basic");
  const panel = page.getByRole("complementary", { name: "Report details" });
  const close = panel.getByRole("button", { name: "Close" });
  const more = panel.getByRole("button", { name: "More actions" });
  expect(await leftOf(close)).toBeGreaterThan(await leftOf(more));
  expect(Math.abs((await middle(close)) - (await middle(more)))).toBeLessThan(
    1
  );
});

test("a cover stands behind its head and leaves its words and their reading as they are", async ({
  page,
}) => {
  await openExample(page, "side-panel", "cover");
  const panel = page.getByRole("complementary", { name: "Report details" });
  const title = panel.getByRole("heading", {
    name: "Quarterly delivery review",
  });
  await expect(title).toBeVisible();
  // Nothing in front of the title: a press on it reaches its words.
  const box = await title.boundingBox();
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.textContent ?? "",
    [(box?.x ?? 0) + 4, (box?.y ?? 0) + (box?.height ?? 0) / 2] as const
  );
  expect(hit).toContain("Quarterly delivery review");
  await expect(panel.getByRole("img")).toHaveCount(0);
});

test("a long text opens to its full height by its corner button, which says whether it is open", async ({
  page,
}) => {
  await openExample(page, "side-panel", "text");
  const panel = page.getByRole("complementary", { name: "Agent details" });
  const button = panel.getByRole("button", { name: "Show all" });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  const last = panel.getByText("Send it to the sales channel");
  const shut = await topOf(last);
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(last).toBeVisible();
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  expect(await topOf(last)).toBe(shut);
});

test("a cover can be the system's faint dither, and a section's action is muted at rest", async ({
  page,
}) => {
  await openExample(page, "side-panel", "cover");
  const dither = await page
    .getByRole("complementary", { name: "Report details" })
    .evaluate((panel) => {
      const cover = panel.querySelector("[data-slot=side-panel-cover] > *");
      return cover === null ? "" : getComputedStyle(cover).maskImage;
    });
  expect(dither).not.toBe("none");
  // Under a cover the sections stand straight in the panel: a row runs its width.
  const panel = await page
    .getByRole("complementary", { name: "Report details" })
    .boundingBox();
  const row = await page
    .getByText("Delivery lead", { exact: true })
    .evaluate(
      (name) =>
        name.closest("[data-slot=item]")?.getBoundingClientRect().width ?? 0
    );
  expect(row).toBeCloseTo(panel?.width ?? 0, 0);
  await openExample(page, "side-panel", "basic");
  const add = page.getByRole("button", { name: "Add", exact: true });
  // The muted token's colour, read from a probe; the action's ink is then awaited until it is
  // that colour, as under load it was once read still easing to it (a colour between the two)
  // when the page was live. A failure says both colours.
  const muted = await add.evaluate((button) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--damsko-muted-foreground)";
    button.append(probe);
    const { color } = getComputedStyle(probe);
    probe.remove();
    return color;
  });
  await expect(add).toHaveCSS("color", muted);
});

test("in a list with no actions a row's detail ends at the card's inset; where rows have them, the room is kept", async ({
  page,
}) => {
  await openExample(page, "side-panel", "basic");
  const endOf = async (words: string) =>
    await page.getByText(words, { exact: true }).evaluate((detail) => {
      const row = detail.closest("[data-slot=item]")?.getBoundingClientRect();
      return row === undefined
        ? -1
        : Math.round(row.right - detail.getBoundingClientRect().right);
    });
  // No row of the Owner list has an action: its detail ends at the panel's 12px inset.
  expect(await endOf("Delivery lead")).toBe(12);
  // Every source has its action; the detail stands before it.
  expect(await endOf("Document")).toBeGreaterThan(12);
});

test("a cover's dither is the original's: the light through a grid of fine round dots, 3px apart", async ({
  page,
}) => {
  await openExample(page, "side-panel", "cover");
  const mask = await page
    .getByRole("complementary", { name: "Report details" })
    .evaluate((panel) => {
      const cover = panel.querySelector("[data-slot=side-panel-cover] > *");
      if (cover === null) {
        return { image: "", size: "" };
      }
      const style = getComputedStyle(cover);
      return { image: style.maskImage, size: style.maskSize };
    });
  expect(mask.image).toMatch(/^radial-gradient\(circle/u);
  expect(mask.size).toBe("3px 3px");
});
