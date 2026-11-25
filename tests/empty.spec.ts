import { expect, test } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

test("an empty state is read where it stands, never said aloud", async ({
  page,
}) => {
  await openExample(page, "empty", "basic");
  await expect(page.getByText("No projects yet")).toBeVisible();
  await expect(
    page.getByText("Projects appear here once someone in the workspace")
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  // The icon is decoration: the words say it.
  await expect(page.getByRole("img")).toHaveCount(0);
});

test("a destructive state says its title and sentence, never its way on", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "empty-and-error", "did-not-load");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect
    .poll(said)
    .toEqual([
      "The projects did not load. Nothing is lost. Check your connection, then try again.",
    ]);
  // Said at once, yet no alert of the page's own: the state is read where it stands.
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("a destructive state with no title says it did not load", async ({
  page,
}) => {
  await openExample(page, "empty", "error");
  await expect(
    page.getByText("This did not load", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("This section is unavailable", { exact: true })
  ).toBeVisible();
});

test("the title can be the page's h1, and a route's error page is not said", async ({
  page,
}) => {
  await openExample(page, "empty", "page-title");
  await expect(
    page.getByRole("heading", { name: "No page at this address", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "This page did not load", level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  // Drawn as any Empty title is: a heading's level never changes its look.
  const look = async (name: string) =>
    await page
      .getByRole("heading", { name })
      .evaluate((node) => getComputedStyle(node).font);
  expect(await look("No page at this address")).toBe(
    await look("This page did not load")
  );
});

test("each size stands as tall as the place it is for", async ({ page }) => {
  await openExample(page, "empty", "sizes");
  const height = async (words: string) =>
    await page
      .getByText(words)
      .evaluate(
        (node) =>
          node.closest("[data-slot=empty]")?.getBoundingClientRect().height ?? 0
      );
  expect(await height("Reports appear here")).toBeGreaterThanOrEqual(400);
  expect(await height("Files shared in this project")).toBeGreaterThanOrEqual(
    150
  );
  expect(await height("Nothing pinned.")).toBeLessThan(150);
});

for (const theme of ["light", "dark"] as const) {
  test(`its words keep to a short measure, ${theme}`, async ({ page }) => {
    await openExample(page, "empty", "clearing", { theme });
    const widths = await page
      .getByText(/Check the spelling|None yet\./u)
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().width)
      );
    expect(widths.length).toBeGreaterThan(0);
    for (const width of widths) {
      expect(width).toBeLessThanOrEqual(310);
    }
  });
}

test("round its words the place draws what will stand there, hidden from a screen reader and clear of the words", async ({
  page,
}) => {
  await openExample(page, "empty", "action");
  const sentence = page.getByText("Projects appear here once someone");
  const found = await sentence.evaluate((node) => {
    const place = node.closest("[data-slot=empty]")?.parentElement;
    const words = node
      .closest("[data-slot=empty-header]")
      ?.getBoundingClientRect();
    const bands = [
      ...(place?.querySelectorAll(":scope > [aria-hidden=true]") ?? []),
    ];
    // Every piece of a band that is in view: none of them over the words.
    const pieces = bands.flatMap((band) => {
      const room = band.getBoundingClientRect();
      return [...band.children]
        .map((piece) => piece.getBoundingClientRect())
        .filter(
          (box) =>
            box.height > 0 &&
            box.top >= room.top - 1 &&
            box.bottom <= room.bottom + 1
        );
    });
    const over = pieces.filter(
      (box) =>
        words !== undefined && box.bottom > words.top && box.top < words.bottom
    );
    return { bands: bands.length, pieces: pieces.length, over: over.length };
  });
  expect(found.bands).toBe(2);
  expect(found.pieces).toBeGreaterThanOrEqual(4);
  expect(found.over).toBe(0);
});

test("the way on stands under the sentence and works", async ({ page }) => {
  await openExample(page, "empty", "action");
  const sentence = page.getByText("Projects appear here once someone");
  const action = page.getByRole("button", { name: "New project" });
  const [said, way] = await Promise.all([
    sentence.boundingBox(),
    action.boundingBox(),
  ]);
  expect(way?.y ?? 0).toBeGreaterThan((said?.y ?? 0) + (said?.height ?? 0));
  await action.click();
  await expect(page.getByRole("button", { name: "Start over" })).toBeVisible();
  await page.getByRole("button", { name: "Start over" }).click();
  await expect(action).toBeVisible();
});

test("a part in the icon's place keeps the icon's box, centred over the title", async ({
  page,
}) => {
  await openExample(page, "empty", "setting-up");
  const title = page.getByText("Setting up your workspace");
  const boxes = await title.evaluate((node) => {
    const holder = node.closest("[data-slot=empty]");
    const media = holder?.querySelector("[data-slot=empty-media]");
    const box = media?.getBoundingClientRect();
    const words = node.getBoundingClientRect();
    return {
      width: box?.width ?? 0,
      height: box?.height ?? 0,
      centre: (box?.left ?? 0) + (box?.width ?? 0) / 2,
      titleCentre: words.left + words.width / 2,
    };
  });
  expect(boxes.width).toBe(boxes.height);
  expect(boxes.width).toBeGreaterThan(0);
  expect(Math.abs(boxes.centre - boxes.titleCentre)).toBeLessThanOrEqual(1);
});

test("a cleared search gives the list back and the focus to the search", async ({
  page,
}) => {
  await openExample(page, "empty-and-error", "no-results");
  await expect(page.getByText("No projects match “invoices”")).toBeVisible();
  await page.getByRole("button", { name: "Clear the search" }).click();
  const search = page.getByRole("searchbox", { name: "Search projects" });
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(search).toHaveAttribute("placeholder", "Search projects");
  await expect(page.getByText(/No projects match/u)).toHaveCount(0);
});

test("every shape of what will stand in the place is drawn whole: no dither left at no size", async ({
  page,
}) => {
  await openExample(page, "empty", "clearing");
  const found = await page
    .getByText("None yet.")
    .first()
    .evaluate(() => {
      const fills = [
        ...document.querySelectorAll(
          "[data-slot=empty] ~ [aria-hidden=true] *"
        ),
        ...document.querySelectorAll(
          "[aria-hidden=true]:has(~ [data-slot=empty]) *"
        ),
      ].filter((part) => getComputedStyle(part).backgroundImage !== "none");
      return {
        fills: fills.length,
        empty: fills.filter((part) => {
          const box = part.getBoundingClientRect();
          return box.width === 0 || box.height === 0;
        }).length,
      };
    });
  expect(found.fills).toBeGreaterThan(20);
  expect(found.empty).toBe(0);
});
