import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("it is a navigation landmark named by its label, with named steps", async ({
  page,
}) => {
  await openExample(page, "pagination", "page");
  const nav = page.getByRole("navigation", { name: "Results" });
  await expect(nav).toBeVisible();
  await expect(
    nav.getByRole("button", { name: "Previous page" })
  ).toBeVisible();
  await expect(nav.getByRole("button", { name: "Next page" })).toBeVisible();
});

test("on page 1 Previous is disabled and does nothing; Next moves on and says where it is", async ({
  page,
}) => {
  await openExample(page, "pagination", "page");
  const previous = page.getByRole("button", { name: "Previous page" });
  const next = page.getByRole("button", { name: "Next page" });
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByText("Page 1 of 5")).toBeAttached();
  // A step at its end is disabled but stays focusable: a press does nothing.
  await previous.click({ force: true });
  await expect(page.getByText("Page 1 of 5")).toBeAttached();
  await next.click();
  await expect(page.getByText("Page 2 of 5")).toBeAttached();
  await expect(previous).not.toHaveAttribute("aria-disabled", "true");
  // The page between the steps is drawn as 2 / 5, read as the line above.
  await expect(page.getByRole("navigation")).toContainText("2 / 5");
});

test("each step is 24px square and keeps the keyboard's focus ring", async ({
  page,
}) => {
  await openExample(page, "pagination", "arrows");
  const next = page.getByRole("button", { name: "Next page" });
  const box = await next.boundingBox();
  expect(Math.round(box?.width ?? 0)).toBe(24);
  expect(Math.round(box?.height ?? 0)).toBe(24);
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(next).toBeFocused();
});

for (const theme of ["light", "dark"] as const) {
  test(`a step is drawn as the quiet button with a low lift, and flat on the soft ground at its end, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "pagination", "arrows", { theme });
    const looks = await page
      .getByRole("button", { name: /page/u })
      .evaluateAll((steps) =>
        steps.map((step) => {
          const probe = document.createElement("span");
          const off = step.getAttribute("aria-disabled") === "true";
          probe.style.backgroundColor = off
            ? "var(--damsko-muted)"
            : "var(--damsko-control)";
          probe.style.boxShadow = off ? "none" : "var(--damsko-shadow-sm)";
          step.after(probe);
          const want = getComputedStyle(probe);
          const got = getComputedStyle(step);
          const same =
            got.backgroundColor === want.backgroundColor &&
            got.boxShadow === want.boxShadow;
          probe.remove();
          return same;
        })
      );
    expect(looks).toEqual([true, true]);
  });
}

test("the range calls the items by their unit and moves with the steps", async ({
  page,
}) => {
  await openExample(page, "pagination", "range");
  await expect(page.getByText("Showing 21 – 30 of 100 projects")).toBeVisible();
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(page.getByText("Showing 11 – 20 of 100 projects")).toBeVisible();
});

test("while loading Next does nothing and says so; with no items both steps are disabled", async ({
  page,
}) => {
  await openExample(page, "pagination", "states");
  const loading = page.getByRole("navigation", {
    name: "Projects",
    exact: true,
  });
  const range = loading.getByText(/Showing 11 – 20 of 100 projects/u);
  await expect(range).toBeVisible();
  await expect(range).toContainText("Loading the page");
  await loading
    .getByRole("button", { name: "Next page" })
    .click({ force: true });
  await expect(range).toContainText("Showing 11 – 20");
  const empty = page.getByRole("navigation", { name: "Archived projects" });
  await expect(empty.getByText("No projects")).toBeVisible();
  await expect(
    empty.getByRole("button", { name: "Previous page" })
  ).toHaveAttribute("aria-disabled", "true");
  await expect(
    empty.getByRole("button", { name: "Next page" })
  ).toHaveAttribute("aria-disabled", "true");
});

test("with addresses the steps are links: Next to page 2, and Previous at its end has none", async ({
  page,
}) => {
  await openExample(page, "pagination", "links");
  const next = page.getByRole("link", { name: "Next page" });
  await expect(next).toHaveAttribute("href", "#page-2");
  const previous = page.getByRole("link", { name: "Previous page" });
  await expect(previous).toHaveAttribute("aria-disabled", "true");
  await expect(previous).not.toHaveAttribute("href", /./u);
  await next.click();
  await expect(page).toHaveURL(/#page-2$/u);
  await expect(page.getByText("Page 2 of 10")).toBeAttached();
});

test("right to left the steps change sides and the page still reads 2 / 5", async ({
  page,
}) => {
  await openExample(page, "pagination", "page");
  await page.getByRole("button", { name: "Next page" }).click();
  await page.evaluate(() => {
    document.documentElement.setAttribute("dir", "rtl");
  });
  const previous = await page
    .getByRole("button", { name: "Previous page" })
    .boundingBox();
  const next = await page
    .getByRole("button", { name: "Next page" })
    .boundingBox();
  expect(previous?.x ?? 0).toBeGreaterThan(next?.x ?? 0);
  await expect(page.getByRole("navigation")).toContainText("2 / 5");
});

test.describe("on a touch screen", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("each step has a 44px target, and the targets do not overlap", async ({
    page,
  }) => {
    await openExample(page, "pagination", "arrows");
    const targets = await page
      .getByRole("button", { name: /page$/u })
      .evaluateAll((steps) =>
        steps.map((step) => {
          const target = step.firstElementChild?.getBoundingClientRect();
          return target === undefined
            ? { left: 0, right: 0, height: 0 }
            : {
                left: target.left,
                right: target.right,
                height: target.height,
              };
        })
      );
    expect(targets).toHaveLength(2);
    expect(targets.every((target) => target.height >= 44)).toBe(true);
    const [first, second] = targets;
    expect((first?.right ?? 0) <= (second?.left ?? 0) + 0.5).toBe(true);
  });
});

test("page links mark the current page, and a press on one goes there", async ({
  page,
}) => {
  await openExample(page, "pagination", "numbers");
  const nav = page.getByRole("navigation", { name: "Search results" });
  const current = nav.getByRole("button", { name: "6" });
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("button", { name: "1", exact: true })
  ).toBeVisible();
  await expect(nav.getByRole("button", { name: "20" })).toBeVisible();
  await nav.getByRole("button", { name: "7" }).click();
  await expect(nav.getByRole("button", { name: "7" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(current).not.toHaveAttribute("aria-current", "page");
});
