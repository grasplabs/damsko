import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("a card's title is a heading, h3 unless set", async ({ page }) => {
  await openExample(page, "card", "basic");
  await expect(
    page.getByRole("heading", { name: "Quarterly review", level: 3 })
  ).toBeVisible();
});

test("cards in a list are a list of items, each with its heading", async ({
  page,
}) => {
  await openExample(page, "card", "list");
  const items = page.getByRole("list").getByRole("listitem");
  await expect(items).toHaveCount(3);
  await expect(
    items.nth(1).getByRole("heading", {
      name: "Onboarding guide for the new regional teams in Noord-Holland",
    })
  ).toBeVisible();
});

test("cards in one grid row stand at one height, a long name's too", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "card", "list");
  const boxes = await page
    .getByRole("listitem")
    .evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().height)
    );
  expect(new Set(boxes).size).toBe(1);
});

test("with forced colours, every card draws a 1px border", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await openExample(page, "card", "grounds");
  const widths = await page
    .getByRole("heading")
    .evaluateAll((titles) =>
      titles.map(
        (title) => getComputedStyle(title.parentElement ?? title).borderTopWidth
      )
    );
  expect(widths).toEqual(["1px", "1px"]);
});

test("a card that is one link goes where it says and shows the keyboard's ring", async ({
  page,
}) => {
  await openExample(page, "card", "link");
  const link = page.getByRole("link", { name: /^Pricing/u });
  await expect(link).toHaveAttribute("href", "#pricing");
  await expect(link.getByRole("heading", { name: "Pricing" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  expect(await hasFocusRing(link)).toBe(true);
});

test("the header's action stands at its end, beside the title", async ({
  page,
}) => {
  await openExample(page, "card", "parts");
  const title = await page
    .getByRole("heading", { name: "Storage" })
    .boundingBox();
  const action = await page
    .getByRole("button", { name: "Manage" })
    .boundingBox();
  expect(action?.x ?? 0).toBeGreaterThan((title?.x ?? 0) + (title?.width ?? 0));
  expect(Math.abs((action?.y ?? 0) - (title?.y ?? 0))).toBeLessThan(16);
});

test("a part of a page is a region named by its title, its foot after what it holds", async ({
  page,
}) => {
  await openExample(page, "card", "section");
  const region = page.getByRole("region", { name: "Usage" });
  await expect(region).toBeVisible();
  await expect(
    region.getByRole("heading", { name: "Usage", level: 2 })
  ).toBeVisible();
  await expect(region.getByRole("button", { name: "Export" })).toBeVisible();
  const facts = await region.getByText("42 GB").boundingBox();
  const foot = await region.getByText("Updated 10 minutes ago").boundingBox();
  expect(foot?.y ?? 0).toBeGreaterThan(facts?.y ?? 0);
});

test("a flush table runs edge to edge, the header and foot on its first column", async ({
  page,
}) => {
  await openExample(page, "card", "flush");
  const region = page.getByRole("region", { name: "Members" });
  const card = await region.boundingBox();
  const row = await region.getByRole("row").first().boundingBox();
  expect(row?.x).toBe(card?.x);
  expect(row?.width).toBe(card?.width);
  // Where words start: the title's, the first column's and the foot's.
  const start = async (words: string) =>
    await region.getByText(words, { exact: true }).evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return Math.round(range.getBoundingClientRect().left);
    });
  const column = await start("Amara Okafor");
  expect(await start("Members")).toBe(column);
  expect(await start("3 of 25 seats used")).toBe(column);
});

for (const width of [320, 390]) {
  test(`in a narrow card the header's actions go under the title, never past its edge, ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "card", "members");
    const region = page.getByRole("region", { name: "Members" });
    const card = await region.boundingBox();
    const title = await region
      .getByRole("heading", { name: "Members" })
      .boundingBox();
    const invite = await region
      .getByRole("button", { name: "Invite" })
      .boundingBox();
    const search = await region
      .getByRole("searchbox", { name: "Search members" })
      .boundingBox();
    expect(invite?.y ?? 0).toBeGreaterThan(
      (title?.y ?? 0) + (title?.height ?? 0)
    );
    for (const box of [invite, search]) {
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        (card?.x ?? 0) + (card?.width ?? 0)
      );
    }
  });
}

test("a small card leaves the same room above its first row, with a sentence or without", async ({
  page,
}) => {
  await openExample(page, "card", "compact");
  const room = async (name: string, row: string) => {
    const region = page.getByRole("region", { name });
    const head = await region.getByRole("heading", { name }).boundingBox();
    const words = await region.getByText(row, { exact: true }).boundingBox();
    const last =
      name === "Sign-in"
        ? await region.getByText("ask Grasp", { exact: false }).boundingBox()
        : head;
    return (words?.y ?? 0) - ((last?.y ?? 0) + (last?.height ?? 0));
  };
  const plain = await room("Organization", "Name");
  const described = await room("Sign-in", "Microsoft 365");
  expect(Math.abs(plain - described)).toBeLessThanOrEqual(1);
  const size = await page
    .getByRole("heading", { name: "Organization" })
    .evaluate((title) => getComputedStyle(title).fontSize);
  expect(size).toBe("14px");
});

test("a card with no title is named by its label", async ({ page }) => {
  await openExample(page, "card", "no-title");
  const region = page.getByRole("region", { name: "Profile" });
  await expect(region.getByRole("textbox", { name: "Name" })).toBeVisible();
  await expect(region.getByRole("heading")).toHaveCount(0);
});

test("a group's title stands over its card and names the group", async ({
  page,
}) => {
  await openExample(page, "card", "grouped");
  const plan = page.getByRole("region", { name: "Plan" });
  const title = await plan.getByRole("heading", { name: "Plan" }).boundingBox();
  const row = await plan.getByText("12 of 15 in use").boundingBox();
  expect(row?.y ?? 0).toBeGreaterThan((title?.y ?? 0) + (title?.height ?? 0));
  await expect(
    page.getByRole("region", { name: "Billing emails" })
  ).toBeVisible();
});

test("in a small card a value that cannot be changed starts where the field above it starts", async ({
  page,
}) => {
  await openExample(page, "card", "compact");
  const field = await page.getByRole("textbox", { name: "Name" }).boundingBox();
  const value = await page
    .getByText("On the sign-in page", { exact: true })
    .boundingBox();
  // The field's words stand a field's padding in from its edge; the value from the same edge.
  expect(Math.abs((value?.x ?? 0) - (field?.x ?? 0))).toBeLessThanOrEqual(1);
});

test("a description breaks its lines as the browser does, as the original's: no pretty wrap", async ({
  page,
}) => {
  await openExample(page, "card", "basic");
  const style = await page
    .locator("[data-slot=card-description]")
    .first()
    .evaluate((node) => getComputedStyle(node).textWrapStyle);
  expect(style).toBe("auto");
});
