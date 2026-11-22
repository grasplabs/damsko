import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the path is a navigation landmark of links, and only the page you are on is the current page", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "basic");
  const nav = page.getByRole("navigation", { name: "Breadcrumb" });
  // The separators are not steps: a screen reader hears three items.
  await expect(nav.getByRole("listitem")).toHaveCount(3);
  await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
    "href",
    "#projects"
  );
  await expect(nav.getByRole("link", { name: "Atlas" })).not.toHaveAttribute(
    "aria-current"
  );
  const here = nav.getByText("Settings").filter({ visible: true });
  await expect(here).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Settings" })).toHaveCount(0);
});

test("a file's path has no links and no current page", async ({ page }) => {
  await openExample(page, "breadcrumb", "path");
  const nav = page.getByRole("navigation", { name: "Where the file is" });
  await expect(nav.getByText("march-northwind.pdf").first()).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(0);
  await expect(nav.locator("[aria-current]")).toHaveCount(0);
});

test("a file's path ends in the ink at the medium weight, its other steps quiet", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "path");
  const end = page.getByText("march-northwind.pdf").first();
  const step = page.getByText("Invoices 2026").first();
  await expect(end).toHaveCSS("font-weight", "500");
  await expect(step).toHaveCSS("font-weight", "400");
  const [ink, quiet] = await end.evaluate((element) => {
    const probe = document.createElement("span");
    element.after(probe);
    probe.style.color = "var(--damsko-foreground)";
    const foreground = getComputedStyle(probe).color;
    probe.style.color = "var(--damsko-muted-foreground)";
    const muted = getComputedStyle(probe).color;
    probe.remove();
    return [foreground, muted];
  });
  await expect(end).toHaveCSS("color", ink);
  await expect(step).toHaveCSS("color", quiet);
});

test("the levels between open from the “…” button as links, in the path's order", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "long");
  const nav = page.getByRole("navigation", { name: "Breadcrumb" });
  await nav.getByRole("link", { name: "Workspace" }).focus();
  await page.keyboard.press("Tab");
  const more = nav.getByRole("button", { name: "Show hidden levels" });
  await expect(more).toBeFocused();
  await page.keyboard.press("Enter");
  const levels = page.getByRole("menuitem");
  await expect(levels.first()).toBeFocused();
  await expect(levels.first()).toHaveText("Customers in the north region");
  await expect(
    page.getByRole("menuitem", { name: "Customers in the north region" })
  ).toHaveAttribute("href", "#customers");
  await page.keyboard.press("Escape");
  await expect(levels).toHaveCount(0);
  await expect(more).toBeFocused();
});

test("the path holds one line, however long it is", async ({ page }) => {
  for (const example of ["long", "long-page", "basic"]) {
    // oxlint-disable-next-line no-await-in-loop -- one example after the other
    await openExample(page, "breadcrumb", example);
    const list = page.getByRole("navigation").getByRole("list");
    // oxlint-disable-next-line no-await-in-loop -- one example after the other
    const height = await list.evaluate(
      (element) => element.getBoundingClientRect().height
    );
    // oxlint-disable-next-line no-await-in-loop -- one example after the other
    const line = await list.evaluate((element) =>
      Number(getComputedStyle(element).lineHeight.replace("px", ""))
    );
    expect(height).toBeLessThanOrEqual(line * 1.5);
  }
});

test("a page name cut off takes keyboard focus, keeps its whole name, and its tooltip shows it", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "long-page");
  const name =
    "Revenue by product line, second quarter, compared with the year before";
  // The first is the page itself; the second, the words of its tooltip, kept in the page.
  const here = page.getByRole("navigation").getByText(name).first();
  await expect(here).toHaveAttribute("aria-current", "page");
  await expect(here).toHaveAttribute("tabindex", "0");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Quarterly reports" })
    .focus();
  await page.keyboard.press("Tab");
  await expect(here).toBeFocused();
  await expect(page.getByRole("tooltip")).toHaveText(name);
});

test("a short page name takes no Tab stop and has no tooltip", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "basic");
  await expect(
    page.getByText("Settings").filter({ visible: true })
  ).toHaveAttribute("tabindex", "-1");
});

test("the back form shows only the parent, as a back link", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "phone");
  const nav = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(
    nav.getByRole("link", { name: "Quarterly reports" })
  ).toBeVisible();
  await expect(nav.getByRole("link", { name: "Workspace" })).toBeHidden();
  await expect(
    nav.getByText("Revenue by product line, second quarter").first()
  ).toBeHidden();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("only the parent shows, as a back link; a path of one shows the page", async ({
    page,
  }) => {
    await openExample(page, "breadcrumb", "short");
    const trails = page.getByRole("navigation");
    await expect(
      trails.nth(0).getByText("Projects").filter({ visible: true })
    ).toHaveCount(1);
    await expect(
      trails.nth(1).getByRole("link", { name: "Projects" })
    ).toBeVisible();
    await expect(trails.nth(1).getByText("Atlas").first()).toBeHidden();
    await expect(
      trails.nth(2).getByRole("link", { name: "Atlas" })
    ).toBeVisible();
    await expect(
      trails.nth(2).getByRole("link", { name: "Projects" })
    ).toBeHidden();
  });
});

test("a step drawn as a button is pressed by the keyboard, and the page it opens takes focus", async ({
  page,
}) => {
  await openExample(page, "breadcrumb", "folders");
  const nav = page.getByRole("navigation", { name: "Folder" });
  const sharePoint = nav.getByRole("button", { name: "SharePoint" });
  await nav.getByRole("button", { name: "Places" }).focus();
  await page.keyboard.press("Tab");
  await expect(sharePoint).toBeFocused();
  await page.keyboard.press("Enter");
  const here = nav.getByText("SharePoint").filter({ visible: true });
  await expect(here).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("button", { name: "SharePoint" })).toHaveCount(0);
  await expect(here).toBeFocused();
  await expect(nav.getByText("Policies")).toHaveCount(0);
});
