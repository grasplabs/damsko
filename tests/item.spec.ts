import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

/** Whether a row's press has the keyboard's focus and its ring shows round the row it covers. */
const ringsItsRow = async (press: Locator): Promise<boolean> =>
  await press.evaluate((node) => {
    let box = node.parentElement;
    while (box !== null && box.tagName !== "LI") {
      const style = getComputedStyle(box);
      if (style.outlineStyle !== "none" && style.outlineWidth !== "0px") {
        return node.matches(":focus-visible");
      }
      box = box.parentElement;
    }
    return false;
  });

for (const theme of ["light", "dark"] as const) {
  test(`a group is a list, each row a list item, the hairlines not counted, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "item", "links", { theme });
    const list = page.getByRole("list", { name: "Settings" });
    await expect(list.getByRole("listitem")).toHaveCount(3);
    await expect(list.getByRole("link")).toHaveText([
      /^Profile/u,
      /^Notifications/u,
      /^Billing/u,
    ]);
  });
}

test("a row with href is one link", async ({ page }) => {
  await openExample(page, "item", "links");
  await page.keyboard.press("Tab");
  const profile = page.getByRole("link", { name: /^Profile/u });
  await expect(profile).toBeFocused();
  await expect(profile).toHaveAttribute("href", "#profile");
});

test("a link row is named by its title, described by its line, and its ring goes round the row", async ({
  page,
}) => {
  await openExample(page, "item", "links");
  await page.keyboard.press("Tab");
  const profile = page.getByRole("link", { name: "Profile", exact: true });
  await expect(profile).toBeFocused();
  await expect(profile).toHaveAccessibleDescription(
    "Name, photo and time zone"
  );
  expect(await ringsItsRow(profile)).toBe(true);
});

test("a row that is one button is named by its title and described by its description", async ({
  page,
}) => {
  await openExample(page, "item", "choice");
  const anthropic = page.getByRole("button", {
    name: "Anthropic",
    exact: true,
  });
  await expect(anthropic).toHaveAccessibleDescription("European Union");
  await anthropic.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Chosen: Anthropic")).toBeVisible();
  await page.getByRole("button", { name: "OpenAI", exact: true }).click();
  await expect(page.getByText("Chosen: OpenAI")).toBeVisible();
});

test("a router's link drawn as the row says which one is open", async ({
  page,
}) => {
  await openExample(page, "item", "router");
  const supplier = page.getByRole("link", { name: /^Supplier list/u });
  await expect(supplier).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: /^Office move plan/u }).click();
  await expect(
    page.getByRole("link", { name: /^Office move plan/u })
  ).toHaveAttribute("aria-current", "page");
  await expect(supplier).not.toHaveAttribute("aria-current", "page");
});

test("a row's actions are its own buttons, after its words", async ({
  page,
}) => {
  await openExample(page, "item", "actions");
  await page.getByRole("button", { name: "Turn on" }).click();
  await expect(
    page.getByText("On. A code from your phone each time you sign in.")
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Turn off" })).toBeVisible();
});

test("while it loads, each row says it is busy and keeps its boxes", async ({
  page,
}) => {
  await openExample(page, "item", "loading");
  const rows = page
    .getByRole("list", { name: "Projects" })
    .getByRole("listitem");
  await expect(rows).toHaveCount(3);
  const heights = await rows.evaluateAll((elements) =>
    elements.map((element) =>
      Math.round(element.getBoundingClientRect().height)
    )
  );
  // As tall as a row with its data (a hairline's room aside, which the old list kept in its rows).
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(5);
  expect(Math.min(...heights)).toBeGreaterThan(40);
});

test("tiles are a list of links, read row by row", async ({ page }) => {
  await openExample(page, "item", "grid");
  const apps = page.getByRole("list", { name: "Apps" });
  await expect(apps.getByRole("link")).toHaveText([
    /^Slack/u,
    /^Notion/u,
    /^Google Workspace/u,
    /^Stripe/u,
    /^Trello/u,
  ]);
});

test("a link or a button row keeps its actions reachable: each a stop of its own", async ({
  page,
}) => {
  await openExample(page, "item", "link-actions");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Q3 report" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Copy the link to Q3 report" })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Supplier list", exact: true })
  ).toBeFocused();
  await page.keyboard.press("Tab");
  const share = page.getByRole("button", { name: "Share" });
  await expect(share).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Shared Supplier list")).toBeVisible();
  // The row's own press covers the row: a press on its description opens it.
  // Playwright sees the press over the words; a pointer lands on it there.
  await page.getByText("Edited on 4 November").click({ force: true });
  await expect(page.getByText("Opened Supplier list")).toBeVisible();
});

test("a router's link or a link whose parts come in a fragment keeps its actions out of the link", async ({
  page,
}) => {
  await openExample(page, "item", "link-actions");
  const budget = page.getByRole("link", { name: "Budget", exact: true });
  await expect(budget).toHaveAccessibleDescription("Shared with you");
  await expect(budget.getByRole("button")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByText("Removed Budget")).toBeVisible();
  await budget.click();
  await expect(page.getByText("Opened budget")).toBeVisible();
  const archive = page.getByRole("link", { name: "Archive 2025" });
  await expect(archive.getByRole("button")).toHaveCount(0);
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Restored Archive 2025")).toBeVisible();
  await expect(page).not.toHaveURL(/#archive$/u);
});

test("actions shown on hover are always there for the keyboard, and the add row adds one", async ({
  page,
}) => {
  await openExample(page, "item", "tools");
  const remove = page.getByRole("button", { name: "Remove Search the web" });
  await page.keyboard.press("Tab");
  await expect(remove).toBeFocused();
  expect(await hasFocusRing(remove)).toBe(true);
  await expect(remove).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Search the web")).toHaveCount(0);
  const add = page.getByRole("button", { name: "Add send email" });
  await page.keyboard.press("Tab");
  await expect(add).toBeFocused();
  expect(await ringsItsRow(add)).toBe(true);
  await add.click();
  await expect(
    page.getByRole("button", { name: "Remove Send email" })
  ).toBeAttached();
  await expect(
    page.getByRole("img", { name: "Cannot be removed" })
  ).toBeVisible();
});

for (const theme of ["light", "dark"] as const) {
  test(`in a side panel's card an xs row is 44px of the panel's words, its icon in the accent and its detail at the row's end, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "item", "tools", { theme });
    const list = page.getByRole("list", { name: "Tools" });
    const rows = list.getByRole("listitem");
    const first = await rows.nth(0).boundingBox();
    const second = await rows.nth(1).boundingBox();
    // Flush rows: the hairline between two is the top pixel of the second.
    expect(first?.height).toBe(44);
    expect((second?.y ?? 0) - (first?.y ?? 0)).toBe(44);
    const name = rows.nth(0).getByText("Customer records");
    await expect(name).toHaveCSS("font-size", "13px");
    await expect(name).toHaveCSS("line-height", "18px");
    const detail = rows.nth(0).getByText("Read only");
    const detailBox = await detail.boundingBox();
    const bin = await rows
      .nth(1)
      .getByRole("button", { name: "Remove Search the web" })
      .boundingBox();
    // The detail ends where a row's action begins, less their gap, on every row.
    expect(Math.round((detailBox?.x ?? 0) + (detailBox?.width ?? 0))).toBe(
      Math.round((bin?.x ?? 0) - 8)
    );
    const accent = await rows.nth(0).evaluate((row) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--damsko-mint-deep)";
      row.append(probe);
      const want = getComputedStyle(probe).color;
      probe.remove();
      const icon = row.querySelector("svg");
      return icon !== null && getComputedStyle(icon).color === want;
    });
    expect(accent).toBe(true);
  });
}

test("an icon in its square stands in the middle of its row, on the title and its line", async ({
  page,
}) => {
  await openExample(page, "item", "icon");
  const title = page.getByText("Shared inbox");
  const middles = await title.evaluate((node) => {
    const row = node.closest("[data-slot=item]");
    const tile = row
      ?.querySelector("[data-slot=item-media]")
      ?.getBoundingClientRect();
    const words = row
      ?.querySelector("[data-slot=item-content]")
      ?.getBoundingClientRect();
    return {
      tile: (tile?.top ?? 0) + (tile?.height ?? 0) / 2,
      words: (words?.top ?? 0) + (words?.height ?? 0) / 2,
    };
  });
  expect(Math.abs(middles.tile - middles.words)).toBeLessThanOrEqual(0.5);
});

test("in a side panel's card an xs row's detail stays whole on one line, and its name gives way", async ({
  page,
}) => {
  await page.setViewportSize({ width: 240, height: 600 });
  await openExample(page, "item", "tools");
  const row = page
    .getByRole("list", { name: "Tools" })
    .getByRole("listitem")
    .nth(0);
  const detail = row.getByText("Read only", { exact: true });
  await expect(detail).toBeVisible();
  const whole = await detail.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const lines = new Set(
      [...range.getClientRects()].map((rect) => Math.round(rect.top))
    );
    return lines.size === 1 && element.scrollWidth <= element.clientWidth;
  });
  expect(whole).toBe(true);
  const name = row.getByText("Customer records", { exact: true });
  await expect(name).toBeVisible();
  const givesWay = await name.evaluate(
    (element) => element.scrollWidth > element.clientWidth
  );
  expect(givesWay).toBe(true);
});
