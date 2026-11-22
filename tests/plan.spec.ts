import { expect, test } from "@playwright/test";

import {
  drawnEdges,
  hasFocusRing,
  listenToLiveRegions,
  openExample,
  panelOf,
} from "./example.ts";

test("its line names the goal and the progress, says it is working while it streams, and opens on the steps", async ({
  page,
}) => {
  await openExample(page, "plan", "basic");
  const header = page.getByRole("button", {
    name: /^Plan: move the dialogs to the new primitives\s*, 2 of 5 done.*Working$/u,
  });
  const step = page.getByText("Run the type checker", { exact: true });
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(step).toBeVisible();
  await header.click();
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(step).toBeHidden();
});

test("the keyboard reaches the line with a ring, then the action beside it", async ({
  page,
}) => {
  await openExample(page, "plan", "action");
  const header = page.getByRole("button", {
    name: /^Plan: move the mailing list/u,
  });
  await page.keyboard.press("Tab");
  await expect(header).toBeFocused();
  expect(await hasFocusRing(header)).toBe(true);
  await page.keyboard.press("Space");
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Edit" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Start the plan" })
  ).toBeFocused();
});

test("starting the plan makes its line run", async ({ page }) => {
  await openExample(page, "plan", "action");
  await page.getByRole("button", { name: "Start the plan" }).click();
  await expect(
    page.getByRole("button", {
      name: /^Plan: move the mailing list.*Working$/u,
    })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit" })).toBeDisabled();
});

test("each step that finishes is said once, and the line stops running when the last is done", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "plan", "live");
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await next.click();
  await next.click();
  await next.click();
  await expect(
    page.getByRole("button", {
      name: "Plan: move the dialogs to the new primitives , 4 of 4 done",
    })
  ).toBeVisible();
  await expect
    .poll(said)
    .toStrictEqual([
      "Install the new primitives",
      "Replace the old imports",
      "Rename asChild to render",
      "Plan: move the dialogs to the new primitives, 4 of 4 done. Run the type checker",
    ]);
});

test("what opens under the line starts on the line's own start edge, its mark's", async ({
  page,
}) => {
  await openExample(page, "plan", "basic");
  const line = page.getByRole("button", { name: /^Plan: move the dialogs/u });
  if ((await line.getAttribute("aria-expanded")) === "false") {
    await line.press("Enter");
  }
  const panel = await panelOf(line);
  await expect(panel).toBeVisible();
  const header = await drawnEdges(line);
  const body = await drawnEdges(panel);
  expect(Math.abs(body.start - header.start)).toBeLessThanOrEqual(1);
});
