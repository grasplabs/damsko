import { expect, test } from "@playwright/test";
import type { Locator } from "@playwright/test";

import { openExample } from "./example.ts";

// These tests read what an avatar does, not whom it shows.

/** Whether an avatar shows a picture that has loaded. */
const showsPicture = async (avatar: Locator): Promise<boolean> =>
  await avatar.evaluate((node) => {
    const image = node.querySelector("img");
    return (
      image !== null &&
      image.complete &&
      image.naturalWidth > 0 &&
      getComputedStyle(image).display !== "none"
    );
  });

for (const theme of ["light", "dark"] as const) {
  test(`an avatar is one image named by its person, picture or initials, ${theme}`, async ({
    page,
  }) => {
    await openExample(page, "avatar", "image", { theme });
    const avatars = page.getByRole("img");
    await expect(avatars).toHaveCount(3);
    await expect(avatars.nth(0)).toHaveAccessibleName(/\S/u);
    await expect(avatars.nth(1)).toHaveAccessibleName(/\S/u);
    await expect(avatars.nth(2)).toHaveAccessibleName(/\S/u);
    // A picture once it loads; without one, initials.
    await expect
      .poll(async () => await showsPicture(avatars.nth(0)))
      .toBe(true);
    await expect(avatars.nth(1)).toHaveText(/^\p{Lu}{1,2}$/u);
  });
}

test("a picture that fails gives way to the initials", async ({ page }) => {
  await openExample(page, "avatar", "image");
  const failed = page.getByRole("img").nth(2);
  await expect(failed).toHaveText(/^\p{Lu}{1,2}$/u);
  expect(await showsPicture(failed)).toBe(false);
});

test("the initials are the first letters of the first and last words", async ({
  page,
}) => {
  await openExample(page, "avatar", "initials");
  const avatars = await page.getByRole("img").evaluateAll((all) =>
    all.map((avatar) => ({
      name: avatar.getAttribute("aria-label") ?? "",
      text: (avatar.textContent ?? "").trim(),
      size: Math.round(avatar.getBoundingClientRect().width),
    }))
  );
  expect(avatars).toHaveLength(6);
  for (const { name, text, size } of avatars) {
    const words = name.trim().split(/\s+/u);
    const initials = `${words[0]?.[0] ?? ""}${words.length > 1 ? (words.at(-1)?.[0] ?? "") : ""}`;
    // At 2xs, in a control's own line, one letter.
    expect(text).toBe(size === 16 ? initials.slice(0, 1) : initials);
  }
});

test("the initials keep one share of the circle, xs no fuller than sm", async ({
  page,
}) => {
  await openExample(page, "avatar", "initials");
  const shares = await page.getByRole("img").evaluateAll((avatars) =>
    avatars.map((avatar) => {
      const circle = avatar.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(avatar);
      return {
        size: Math.round(circle.width),
        share: range.getBoundingClientRect().width / circle.width,
      };
    })
  );
  const xs = shares.find((one) => one.size === 24)?.share ?? 1;
  const sm = shares.find((one) => one.size === 32)?.share ?? 0;
  expect(xs).toBeLessThanOrEqual(sm + 0.03);
});

test("six sizes, from 64px to 16px circles", async ({ page }) => {
  await openExample(page, "avatar", "sizes");
  const boxes = await page.getByRole("img").evaluateAll((avatars) =>
    avatars.map((avatar) => {
      const box = avatar.getBoundingClientRect();
      return [Math.round(box.width), Math.round(box.height)];
    })
  );
  expect(boxes).toEqual([
    [64, 64],
    [48, 48],
    [40, 40],
    [32, 32],
    [24, 24],
    [16, 16],
  ]);
});

test("beside its own name an avatar is hidden, so the name is said once", async ({
  page,
}) => {
  await openExample(page, "avatar", "beside-a-name");
  const list = page.getByRole("list", { name: "Reviewers" });
  await expect(list.getByRole("listitem")).toHaveCount(4);
  await expect(list.getByRole("img")).toHaveCount(0);
  // Each row says its name once, as its words.
  await expect(list.getByRole("listitem")).toHaveText(
    Array.from({ length: 4 }, () => /^\s*\p{Lu}\p{Ll}+\s*$/u)
  );
});

test("a picture far below the window waits until it is scrolled near", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await openExample(page, "avatar", "far-below");
  const far = page.getByRole("img").last();
  // Lazy: the browser fetches it only as it nears the window.
  await expect(far.locator("img")).toHaveAttribute("loading", "lazy");
  await far.scrollIntoViewIfNeeded();
  await expect.poll(async () => await showsPicture(far)).toBe(true);
});

test("a group is one picture, named once, with +N for the rest", async ({
  page,
}) => {
  await openExample(page, "avatar", "group");
  const groups = page.getByRole("img");
  await expect(groups).toHaveCount(6);
  await expect(groups.nth(0)).toHaveAccessibleName(/^\S.* and \S.*$/u);
  await expect(groups.nth(1)).not.toHaveAccessibleName(/other/u);
  await expect(groups.nth(2)).toHaveAccessibleName(/ and 2 others$/u);
  await expect(groups.nth(2)).toContainText("+2");
  await expect(groups.nth(4)).toHaveAccessibleName(/ and 1 other$/u);
  await expect(groups.nth(4)).toContainText("+1");
  // Faces in a stack show one letter each, so the next face never cuts a second.
  const letters = await groups
    .nth(4)
    .evaluate((group) =>
      [...group.children]
        .slice(0, -1)
        .map((face) => (face.textContent ?? "").trim())
    );
  for (const letter of letters) {
    expect(letter).toMatch(/^\p{Lu}$/u);
  }
});

test("a badge sits on the avatar's lower end corner", async ({ page }) => {
  await openExample(page, "avatar", "badge");
  await expect(page.getByText("Lars, online")).toBeVisible();
  await expect(page.getByRole("img")).toHaveCount(0);
  const corner = await page.getByText("Lars, online").evaluate((words) => {
    const avatar = words.previousElementSibling;
    const badge = avatar?.querySelector("[aria-hidden=true]:empty");
    const box = avatar?.getBoundingClientRect();
    const mark = badge?.getBoundingClientRect();
    return {
      right: Math.round((box?.right ?? 0) - (mark?.right ?? -1)),
      bottom: Math.round((box?.bottom ?? 0) - (mark?.bottom ?? -1)),
    };
  });
  expect(corner).toEqual({ right: 0, bottom: 0 });
});
