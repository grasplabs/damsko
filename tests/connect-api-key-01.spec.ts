import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the providers are tiles, each one button named by its name", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await Promise.all(
    ["Anthropic", "OpenAI", "Google Gemini", "Mistral AI, La Plateforme"].map(
      async (name) => {
        await expect(
          page.getByRole("button", { name, exact: true })
        ).toBeVisible();
      }
    )
  );
});

test("in a settings column the four providers stand in one row, and an endpoint of your own is a line under them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openExample(page, "connect-api-key-01", "basic");
  const tiles = page
    .getByRole("list", { name: "AI provider" })
    .getByRole("listitem");
  await expect(tiles).toHaveCount(4);
  const boxes = await tiles.evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    })
  );
  expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
  const own = await page
    .getByRole("button", { name: "Use an endpoint of your own" })
    .boundingBox();
  expect(own?.y ?? 0).toBeGreaterThan(boxes[0]?.bottom ?? 0);
});

test("choosing a provider gives its key field the focus, a secret kept from password managers", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  const key = page.getByLabel("Key", { exact: true });
  await expect(key).toBeFocused();
  await expect(key).toHaveAttribute("type", "password");
  await expect(key).toHaveAttribute("autocomplete", "off");
  await expect(key).toHaveAttribute("data-1p-ignore", "");
});

test("the key typed is never written into the page's markup", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  const key = page.getByLabel("Key", { exact: true });
  await key.fill("sk-ant-api03-abcdefghijk9c1e");
  await expect(key).toHaveValue("sk-ant-api03-abcdefghijk9c1e");
  await expect(key).not.toHaveAttribute("value");
});

test("an empty key is not sent: the field says what is missing", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Paste the key.")).toBeVisible();
});

test("a refused key: the reason under the field, the key cleared and focused; put right, it connects", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  const key = page.getByLabel("Key", { exact: true });
  await key.fill("sk-ant-wrong");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(
    page
      .getByRole("form", { name: "Connect Anthropic" })
      .getByText("The provider refused this key: it is not a valid API key.")
  ).toBeVisible();
  await expect(key).toHaveValue("");
  await expect(key).toBeFocused();
  // Retry: the right key connects, and the card says so with the key's last four.
  await key.fill("sk-ant-api03-abcdefghijk9c1e");
  await expect(
    page.getByRole("button", { name: "Connect", exact: true })
  ).toBeEnabled();
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Key …9c1e · United States")).toBeVisible();
  // The focus goes on to the row that says so, never to the page.
  await expect(page.getByRole("button", { name: "Replace key" })).toBeFocused();
});

test("Change goes back to the tiles, the focus on the tile it came from", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "OpenAI", exact: true }).click();
  await page.getByRole("button", { name: "Change" }).click();
  await expect(
    page.getByRole("button", { name: "OpenAI", exact: true })
  ).toBeFocused();
});

test("an endpoint of your own asks for its address first", async ({ page }) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page
    .getByRole("button", { name: "Use an endpoint of your own" })
    .click();
  await expect(page.getByLabel("Address")).toBeFocused();
});

test("Disconnect stands in the row's menu and asks first: Keep it keeps it, Disconnect brings the tiles back", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  await page
    .getByLabel("Key", { exact: true })
    .fill("sk-ant-api03-abcdefghijk9c1e");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Key …9c1e · United States")).toBeVisible();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Disconnect" }).click();
  const question = page.getByRole("alertdialog", {
    name: "Disconnect Anthropic?",
  });
  await expect(question).toBeVisible();
  await question.getByRole("button", { name: "Keep it" }).click();
  await expect(question).toBeHidden();
  await expect(page.getByText("Key …9c1e · United States")).toBeVisible();

  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: "Disconnect" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Disconnect" })
    .click();
  await expect(
    page.getByRole("button", { name: "Anthropic", exact: true })
  ).toBeFocused();
  await expect(page.getByText("Key …9c1e")).toBeHidden();
});

test("Replace key opens the form with the key focused; Change goes back to Replace key", async ({
  page,
}) => {
  await openExample(page, "connect-api-key-01", "basic");
  await page.getByRole("button", { name: "Anthropic", exact: true }).click();
  await page
    .getByLabel("Key", { exact: true })
    .fill("sk-ant-api03-abcdefghijk9c1e");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Replace key" }).click();
  await expect(page.getByLabel("Key", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Change" }).click();
  await expect(page.getByRole("button", { name: "Replace key" })).toBeFocused();
});
