import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

const REQUEST = "Move 3 reports into the Archive folder.";

/** The words of what has the focus. */
const focused = async (page: Page) =>
  await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

test("it says the request and offers Approve and Decline", async ({ page }) => {
  await openExample(page, "confirmation", "basic");
  await expect(page.getByText(REQUEST)).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
});

test("Approve answers it: the decision is said where the answers were, and focus lands on it", async ({
  page,
}) => {
  await openExample(page, "confirmation", "basic");
  await page.getByRole("button", { name: "Approve" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page
      .getByText(/^Approved/u)
      .filter({ visible: true })
      .first()
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Decline" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Approve" })).toHaveCount(0);
  await expect.poll(async () => await focused(page)).toMatch(/^Approved/u);
});

test("a settled yes can hold its own Undo, which asks again with focus on the request", async ({
  page,
}) => {
  await openExample(page, "confirmation", "basic");
  await page.getByRole("button", { name: "Approve" }).click();
  const undo = page.getByRole("button", { name: "Undo" });
  await undo.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();
  await expect(undo).toHaveCount(0);
  await expect.poll(async () => await focused(page)).toBe(REQUEST);
});

test("the answers are named buttons described by the request, in a group named by it", async ({
  page,
}) => {
  await openExample(page, "confirmation", "basic");
  const group = page.getByRole("group", { name: REQUEST });
  await expect(group).toBeVisible();
  for (const name of ["Approve", "Decline"]) {
    // oxlint-disable-next-line no-await-in-loop -- one answer after the other
    await expect(
      group.getByRole("button", { name })
    ).toHaveAccessibleDescription(REQUEST);
  }
});

test("Decline answers it too, and the group says the decision", async ({
  page,
}) => {
  await openExample(page, "confirmation", "basic");
  await page.getByRole("button", { name: "Decline" }).focus();
  await page.keyboard.press("Enter");
  const decided = "Declined: the reports stay where they are.";
  await expect(page.getByRole("group", { name: decided })).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
  await expect.poll(async () => await focused(page)).toBe(decided);
});

test("an answer that fails says so on its own button, and the request still waits", async ({
  page,
}) => {
  await openExample(page, "confirmation", "failed");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("button", { name: "Failed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
  await expect(
    page.getByText(/^Approved/u).filter({ visible: true })
  ).toHaveCount(0);
});

test("a held answer that fails says so on its own button, and the request still waits", async ({
  page,
}) => {
  await openExample(page, "confirmation", "held-failed");
  await page.getByRole("button", { name: "Hold to refund £86" }).click();
  await page
    .getByRole("dialog", { name: "Refund £86?" })
    .getByRole("button", { name: "Refund £86" })
    .click();
  await expect(page.getByRole("button", { name: /failed/iu })).toBeVisible();
  await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
  await expect(page.getByText(/^Refunded/u)).toHaveCount(0);
});

test("after a failure the next press goes through", async ({ page }) => {
  await openExample(page, "confirmation", "failed");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("button", { name: "Failed" })).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Approved: the offer goes out.")).toBeVisible();
});

test("each state draws its own: the answers while it waits, the decision once answered, nothing while the input comes", async ({
  page,
}) => {
  await openExample(page, "confirmation", "states");
  const waiting = page.getByRole("group", {
    name: "Invite 4 people to the workspace",
  });
  await expect(waiting.getByRole("button")).toHaveCount(2);
  const approved = page.getByRole("group", {
    name: "Approved: Move 3 reports into the Archive folder",
  });
  await expect(approved).toBeVisible();
  await expect(approved.getByRole("button")).toHaveCount(0);
  await expect(
    page.getByRole("group", {
      name: "Declined: Email the draft to the whole team",
    })
  ).toBeVisible();
  await expect(page.getByText("Book the large meeting room")).toHaveCount(0);
});

test("a grave yes is held, and a tap asks once more first", async ({
  page,
}) => {
  await openExample(page, "confirmation", "grave");
  await page.getByRole("button", { name: "Hold to pay £1,240" }).click();
  const ask = page.getByRole("dialog", { name: "Pay £1,240?" });
  await expect(ask).toBeVisible();
  await expect(page.getByText(/^Paid/u)).toHaveCount(0);
  await ask.getByRole("button", { name: "Pay £1,240" }).click();
  await expect(
    page.getByText("Paid: £1,240 to Northwind Supplies.")
  ).toBeVisible();
});

test("its yes is drawn as the original's approve, in the success fill", async ({
  page,
}) => {
  await openExample(page, "confirmation", "basic");
  const approve = page.getByRole("button", { name: "Approve" });
  await expect(approve).toHaveAttribute("data-variant", "success");
  const same = await approve.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.color = "var(--damsko-success-fill)";
    element.append(probe);
    const fill = getComputedStyle(probe).color;
    probe.remove();
    return getComputedStyle(element).backgroundColor === fill;
  });
  expect(same).toBe(true);
});
