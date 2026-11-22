import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

const about = "Leads research. Owns the brief and the interview notes.";

test("resting on the link shows the card, and leaving closes it", async ({
  page,
}) => {
  await openExample(page, "hover-card", "person");
  const link = page.getByRole("link", { name: "Amara Okafor" });
  await link.hover();
  const card = page.getByText(about);
  await expect(card).toBeVisible();
  await expect(link).not.toBeFocused();
  await page.mouse.move(0, 0);
  await expect(card).toBeHidden();
});

test("the pointer can cross into the card", async ({ page }) => {
  await openExample(page, "hover-card", "person");
  await page.getByRole("link", { name: "Amara Okafor" }).hover();
  const card = page.getByText(about);
  await expect(card).toBeVisible();
  await card.hover();
  await expect(card).toBeVisible();
});

test("keyboard focus shows it, and Escape closes it with focus kept", async ({
  page,
}) => {
  await openExample(page, "hover-card", "person");
  const link = page.getByRole("link", { name: "Amara Okafor" });
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  const card = page.getByText(about);
  await expect(card).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card).toBeHidden();
  await expect(link).toBeFocused();
});

test("the trigger stays a link to its page", async ({ page }) => {
  await openExample(page, "hover-card", "router");
  await expect(
    page.getByRole("link", { name: "Amara Okafor" })
  ).toHaveAttribute("href", "#amara-okafor");
});

test("on a control, the control opens the card", async ({ page }) => {
  await openExample(page, "hover-card", "control");
  await page.getByRole("button", { name: "3 of 5 in use" }).hover();
  await expect(page.getByText("3 of 5 seats in use")).toBeVisible();
});

test("opened from outside, Escape closes it", async ({ page }) => {
  await openExample(page, "hover-card", "controlled");
  await page.getByRole("button", { name: "Show who changed it" }).click();
  const card = page.getByText(about);
  await expect(card).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card).toBeHidden();
});
