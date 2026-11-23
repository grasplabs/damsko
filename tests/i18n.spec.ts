// The components' words from a runtime catalogue (a translation library whose words exist once a
// language is active): the I18nProvider is fed while rendering, and every component inside it
// speaks the active language.
import { expect, test } from "@playwright/test";

import { openExample } from "./example.ts";

test("the components' words follow the language of a runtime catalogue", async ({
  page,
}) => {
  await openExample(page, "guidelines", "writing-runtime-words");
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
  await page.getByRole("button", { name: "Nederlands" }).click();
  await expect(page.getByRole("button", { name: "Kopiëren" })).toBeVisible();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("button", { name: "Copy" })).toBeVisible();
});
