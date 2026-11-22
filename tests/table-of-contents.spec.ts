import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

// WebKit on a Mac moves Tab only between fields unless Option is held.
const tab = (browserName: string) =>
  browserName === "webkit" ? "Alt+Tab" : "Tab";

test("it is a navigation named by its title, a link per section", async ({
  page,
}) => {
  await openExample(page, "table-of-contents", "basic");
  const nav = page.getByRole("navigation", { name: "On this page" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(9);
  await expect(
    nav.getByRole("link", { name: "Invite your team" })
  ).toHaveAttribute("href", /#basic-/u);
});

test("it marks the section being read as the page scrolls", async ({
  page,
}) => {
  await openExample(page, "table-of-contents", "basic");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const box = page.getByRole("region", { name: "Setting up a workspace" });
  // At the very top nothing is being read yet.
  await expect(nav.locator("[aria-current]")).toHaveCount(0);

  await page
    .getByRole("heading", { name: "Roles", exact: true })
    .evaluate((heading) => {
      heading.scrollIntoView({ block: "start" });
    });
  await expect(nav.getByRole("link", { name: "Roles" })).toHaveAttribute(
    "aria-current",
    "location"
  );

  // At the end of the box the last section is the one being read.
  await box.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(
    nav.getByRole("link", { name: "Close a workspace" })
  ).toHaveAttribute("aria-current", "location");
  await expect(nav.locator("[aria-current]")).toHaveCount(1);
});

test("following a link scrolls to its section and marks it", async ({
  page,
}) => {
  await openExample(page, "table-of-contents", "basic");
  const nav = page.getByRole("navigation", { name: "On this page" });
  await nav.getByRole("link", { name: "Notifications" }).click();
  await expect(
    page.getByRole("heading", { name: "Notifications", exact: true })
  ).toBeInViewport();
  await expect(
    nav.getByRole("link", { name: "Notifications" })
  ).toHaveAttribute("aria-current", "location");
});

test("the list is one Tab stop, and the arrows, Home and End move focus in it", async ({
  page,
  browserName,
}) => {
  await openExample(page, "table-of-contents", "basic");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const link = (name: string) => nav.getByRole("link", { name });
  // The page's box takes the first stop, the list the next: its first link.
  await page.getByRole("region", { name: "Setting up a workspace" }).focus();
  await page.keyboard.press(tab(browserName));
  await expect(link("Overview")).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(link("Create a workspace")).toBeFocused();
  await page.keyboard.press("End");
  await expect(link("Close a workspace")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(link("Billing")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(link("Overview")).toBeFocused();

  // One stop: Tab goes on past the list, and Shift+Tab comes back into it.
  const inList = async () =>
    await page.evaluate(
      () =>
        document.activeElement instanceof HTMLAnchorElement &&
        document.activeElement.closest("nav") !== null
    );
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(tab(browserName));
  await expect.poll(inList).toBe(false);
  await page.keyboard.press(
    browserName === "webkit" ? "Alt+Shift+Tab" : "Shift+Tab"
  );
  await expect.poll(inList).toBe(true);
});

test("groups name their lists, and a collapsed section says so", async ({
  page,
}) => {
  await openExample(page, "table-of-contents", "parts");
  const nav = page.getByRole("navigation", { name: "On this page" });
  const reference = nav.getByRole("list", { name: "Reference" });
  await expect(reference.getByRole("link")).toHaveCount(3);
  await expect(
    nav.getByRole("list", { name: "Using it" }).getByRole("link")
  ).toHaveCount(4);
  await expect(
    reference.getByRole("link", { name: /^Settings\s*, folded$/u })
  ).toBeVisible();
  // Its footer holds the page's own actions.
  await expect(nav.getByRole("button", { name: /Copy/u })).toBeVisible();
});

test("the compact variant is one button that opens the sections on focus, and Escape closes them", async ({
  page,
  browserName,
}) => {
  await openExample(page, "table-of-contents", "compact");
  const button = page.getByRole("button", {
    name: "On this page: Show the sections",
  });
  await page.getByRole("region", { name: "Setting up a workspace" }).focus();
  await page.keyboard.press(tab(browserName));
  await expect(button).toBeFocused();
  const list = page.getByRole("navigation", { name: "On this page" });
  await expect(list).toBeVisible();
  await expect(list.getByRole("link")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await expect(list).toBeHidden();
});

test("the compact variant opens under the pointer, and following a link closes it", async ({
  page,
}) => {
  await openExample(page, "table-of-contents", "compact");
  await page
    .getByRole("button", { name: "On this page: Show the sections" })
    .hover();
  const list = page.getByRole("navigation", { name: "On this page" });
  await expect(list).toBeVisible();
  await list.getByRole("link", { name: "Roles" }).click();
  await expect(list).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Roles", exact: true })
  ).toBeInViewport();
});
