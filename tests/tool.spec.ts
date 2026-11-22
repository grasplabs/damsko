import { expect, test } from "@playwright/test";

import { hasFocusRing, listenToLiveRegions, openExample } from "./example.ts";

test("its header opens and closes the call, and says so with aria-expanded", async ({
  page,
}) => {
  await openExample(page, "tool", "basic");
  const header = page.getByRole("button", { name: /Searched the web/u });
  const input = page.getByRole("region", { name: "Input" });
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeHidden();

  await header.click();
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(input).toBeVisible();
  await expect(input).toContainText("competitor pricing pages");
  await expect(page.getByRole("region", { name: "Output" })).toContainText(
    "Northwind"
  );

  await header.click();
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeHidden();
});

test("the keyboard reaches the header with a ring; Enter opens and Space closes", async ({
  page,
}) => {
  await openExample(page, "tool", "basic");
  const header = page.getByRole("button", { name: /Searched the web/u });
  await page.keyboard.press("Tab");
  await expect(header).toBeFocused();
  expect(await hasFocusRing(header)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Space");
  await expect(header).toHaveAttribute("aria-expanded", "false");
});

test("each state is said on its header: its status, and in words where the status cannot say it", async ({
  page,
}) => {
  await openExample(page, "tool", "states");
  // Its words in order, the commas between them as a screen reader has them.
  const header = (...words: string[]) =>
    page.getByRole("button", {
      name: new RegExp(`^${words.join(String.raw`\s*, `)}$`, "u"),
    });
  await expect(header("Writing the search", "Working")).toBeVisible();
  await expect(header("Searching the web", "Working")).toBeVisible();
  await expect(
    header("Send the summary", "Awaiting approval", "Waiting")
  ).toBeVisible();
  await expect(
    header("Send the summary", "Responded", "Working")
  ).toBeVisible();
  await expect(header("Searched the web")).toBeVisible();
  await expect(header(String.raw`Read pricing\.xlsx`, "Failed")).toBeVisible();
  await expect(header("Delete the drafts", "Denied")).toBeVisible();
});

test("a failed call says why in a region named Error, in the output's place", async ({
  page,
}) => {
  await openExample(page, "tool", "error");
  const header = page.getByRole("button", { name: /Read pricing\.xlsx/u });
  await expect(header).toHaveAttribute("aria-expanded", "true");
  await expect(header).toContainText("Failed");
  await expect(page.getByRole("region", { name: "Error" })).toContainText(
    "The file is locked"
  );
  await expect(page.getByRole("region", { name: "Output" })).toHaveCount(0);
});

test("a call is said once, when it finishes, not as it starts or works", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "tool", "live");
  await expect(
    page.getByRole("button", { name: /^Searching the web\s*, Working$/u })
  ).toBeVisible();
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(page.getByRole("region", { name: "Input" })).toContainText(
    "competitor pricing pages"
  );
  await next.click();
  await expect(page.getByRole("region", { name: "Output" })).toContainText(
    "4 pricing pages found"
  );
  await expect.poll(said).toStrictEqual(["Searched the web"]);
});

test("a closed call's code is there to find before it opens, as code once it opens", async ({
  page,
}) => {
  await openExample(page, "tool", "detail");
  await expect(page.getByRole("region", { name: "Output" })).toHaveCount(0);
  const query = page.getByRole("button", { name: /Queried the warehouse/u });
  await query.click();
  await expect(page.getByRole("region", { name: "Output" })).toContainText(
    "North,412,19"
  );
  await expect(
    page.getByRole("button", { name: /Copy/u }).first()
  ).toBeVisible();
});

test("a call opens to what went in and what came back, or why it failed", async ({
  page,
}) => {
  await openExample(page, "tool", "detail");
  const query = page.getByRole("button", { name: /Queried the warehouse/u });
  await query.click();
  await expect(query).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: "Input" })).toContainText(
    "select region, count"
  );
  await expect(page.getByRole("region", { name: "Output" })).toContainText(
    "North,412,19"
  );

  const crm = page.getByRole("button", { name: /Looked up the CRM/u });
  await crm.click();
  await expect(crm).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: "Error" })).toContainText(
    "The CRM did not answer in 5 seconds. Nothing was changed."
  );
});
