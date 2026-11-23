import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("each level is a heading of that level, in outline order", async ({
  page,
}) => {
  await openExample(page, "heading", "outline");
  const outline = [
    ["Reports", 1],
    ["Waiting for review", 2],
    ["Supplier review", 3],
    ["Notes from the meeting", 4],
  ] as const;
  await Promise.all(
    outline.map(async ([name, level]) => {
      await expect(page.getByRole("heading", { name, level })).toBeVisible();
    })
  );
});

for (const theme of ["light", "dark"] as const) {
  test(`the size changes the look, never the level, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "heading", "sizes", { theme });
    const size = async (name: string) =>
      await page
        .getByRole("heading", { name })
        .evaluate((node) =>
          Number(getComputedStyle(node).fontSize.replace("px", ""))
        );
    // The last three are all level 4: a card's in the serif, then two in the sans.
    await Promise.all(
      ["Supplier review", "Team members", "Notifications"].map(async (name) => {
        await expect(
          page.getByRole("heading", { name, level: 4 })
        ).toBeVisible();
      })
    );
    const sizes = await Promise.all(
      [
        "Welcome to the workspace",
        "Reports",
        "This quarter",
        "Supplier review",
        "Team members",
        "Notifications",
      ].map(size)
    );
    expect(sizes).toEqual(sizes.toSorted((a, b) => b - a));
    expect(new Set(sizes).size).toBe(sizes.length);
    const family = async (name: string) =>
      await page
        .getByRole("heading", { name })
        .evaluate((node) => getComputedStyle(node).fontFamily);
    expect(await family("Supplier review")).not.toBe(
      await family("Team members")
    );
    expect(await family("Team members")).toBe(await family("Notifications"));
  });
}

test("a heading with tabIndex -1 takes focus from code when the control that had it goes, and is no Tab stop", async ({
  page,
}) => {
  await openExample(page, "heading", "focus");
  const heading = page.getByRole("heading", { name: "Your data", level: 2 });
  await page.keyboard.press("Tab");
  await expect(heading).not.toBeFocused();
  const request = page.getByRole("button", { name: "Request an export" });
  await expect(request).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(request).toBeHidden();
  await expect(heading).toBeFocused();
});
