import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { hasFocusRing, openExample } from "../tests/example.ts";

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts) lists
// every field by its label with its value, and sets a value by that name.
const valuesOf = async (page: Page) =>
  await page.evaluate(() =>
    Object.fromEntries(
      (window.damskoAgent?.snapshot() ?? [])
        .filter((entry) => entry.component === "input")
        .map((entry): [string, unknown] => [entry.label ?? "", entry.value])
    )
  );

test("an agent reads and fills fields by their names, and never reads a secret back", async ({
  page,
}) => {
  await openExample(page, "input-tw", "agent");
  const before = await valuesOf(page);
  expect(before["Work email"]).toBe("anna@acme.example");
  expect(before["API key"]).toBe("[redacted]");
  expect(before.Password).toBe("[redacted]");

  const ok = await page.evaluate(async () => {
    const result = await window.damskoAgent?.act({
      steps: [
        { ref: "Project name", action: "setValue", args: ["Atlas"] },
        { ref: "API key", action: "setValue", args: ["sk_live_99Zz"] },
        { ref: "Password", action: "setValue", args: ["new horse"] },
      ],
    });
    return result?.ok === true;
  });
  expect(ok).toBe(true);
  await expect(page.getByRole("textbox", { name: "Project name" })).toHaveValue(
    "Atlas"
  );
  await expect(page.getByLabel("API key")).toHaveValue("sk_live_99Zz");
  await expect(page.getByLabel("Password")).toHaveValue("new horse");
  const after = await valuesOf(page);
  expect(after["Project name"]).toBe("Atlas");
  expect(after["API key"]).toBe("[redacted]");
  expect(after.Password).toBe("[redacted]");
});

test("the three sizes are Button's heights: 32, 36 and 44px", async ({
  page,
}) => {
  await openExample(page, "input-tw", "sizes");
  const heights = await Promise.all(
    ["Filter rows", "Project name", "Work email"].map(async (name) => {
      const box = await page.getByRole("textbox", { name }).boundingBox();
      return box?.height;
    })
  );
  expect(heights).toEqual([32, 36, 44]);
});

test("a Field names its input, describes it, and marks it wrong with its error", async ({
  page,
}) => {
  await openExample(page, "input-tw", "field-states");
  const email = page.getByRole("textbox", { name: "Work email" });
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription(
    "Use your work address, not a personal one."
  );
  const workspace = page.getByRole("textbox", { name: "Workspace" });
  await expect(workspace).toBeDisabled();
  await expect(workspace).toHaveAccessibleDescription(
    "Only an owner can rename the workspace."
  );
  await expect(
    page.getByRole("textbox", { name: "Project name" })
  ).not.toHaveAttribute("aria-invalid", "true");
});

test("a read-only field takes focus and its words can be selected, with no caret and no ring", async ({
  page,
}) => {
  await openExample(page, "input-tw", "field-states");
  const id = page.getByRole("textbox", { name: "Project ID" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(id).toBeFocused();
  await expect(id).toHaveAttribute("readonly", "");
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.type("changed");
  await expect(id).toHaveValue("prj_4f81c2");
  expect(await id.evaluate((input) => getComputedStyle(input).caretColor)).toBe(
    "rgba(0, 0, 0, 0)"
  );
  expect(
    await id.evaluate((input) => getComputedStyle(input).outlineStyle)
  ).toBe("none");
});

test("the type brings its own role: a search field is a searchbox, the others textboxes", async ({
  page,
}) => {
  await openExample(page, "input-tw", "icons");
  await expect(
    page.getByRole("searchbox", { name: "Search projects" })
  ).toBeVisible();
  await openExample(page, "input-tw", "kinds");
  await expect(page.getByRole("textbox", { name: "Work email" })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Company website" })
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Phone" })).toBeVisible();
});

test("a value that fits shows every letter; a longer one fades at its end until focused", async ({
  page,
}) => {
  await openExample(page, "input-tw", "kinds");
  const fill = async (name: string) =>
    await page
      .getByRole("textbox", { name })
      .evaluate((input) => getComputedStyle(input).webkitTextFillColor);
  expect(await fill("Shared folder")).toBe("rgba(0, 0, 0, 0)");
  await page.getByRole("textbox", { name: "Shared folder" }).focus();
  expect(await fill("Shared folder")).not.toBe("rgba(0, 0, 0, 0)");

  await openExample(page, "input-tw", "field-states");
  expect(await fill("Project name")).not.toBe("rgba(0, 0, 0, 0)");
});

test("the password's button shows and hides it, keeps its name in step, and its ring stays inside the field", async ({
  page,
}) => {
  await openExample(page, "input-tw", "icons");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("correct horse");
  await expect(password).toHaveAttribute("type", "password");
  await password.focus();
  await page.keyboard.press("Tab");
  const show = page.getByRole("button", { name: "Show password" });
  await expect(show).toBeFocused();
  expect(await hasFocusRing(show)).toBe(true);
  const field = await password.boundingBox();
  const button = await show.boundingBox();
  expect(button?.x ?? 0).toBeGreaterThan(field?.x ?? 0);
  expect((button?.x ?? 0) + (button?.width ?? 0)).toBeLessThan(
    (field?.x ?? 0) + (field?.width ?? 0)
  );
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await expect(
    page.getByRole("button", { name: "Hide password" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("correct horse");
});

test("a secret is masked, offered to no password manager, and pasted whole", async ({
  page,
}) => {
  await openExample(page, "input-tw", "secret");
  const key = page.getByLabel("Key", { exact: true });
  await expect(key).toHaveAttribute("type", "password");
  await expect(key).toHaveAttribute("autocomplete", "off");
  await expect(key).toHaveAttribute("dir", "ltr");
  await expect(key).toHaveAccessibleDescription(
    "Only its last four characters are shown again."
  );
  await key.focus();
  await key.evaluate((input) => {
    const data = new DataTransfer();
    data.setData("text", "  sk-ant-123\n");
    input.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  });
  await expect(key).toHaveValue("sk-ant-123");
});

test("a saved secret shows only its last four, and Replace empties the field for a new one", async ({
  page,
}) => {
  await openExample(page, "input-tw", "secret");
  const saved = page.getByRole("textbox", { name: "Saved key" });
  await expect(saved).toHaveValue("…9c1e");
  await expect(saved).toHaveAttribute("readonly", "");
  await page.getByRole("button", { name: "Replace" }).click();
  const fresh = page.getByLabel("Saved key");
  await expect(fresh).toHaveAttribute("type", "password");
  await expect(fresh).toHaveValue("");
  await expect(page.getByRole("button", { name: "Replace" })).toHaveCount(0);
});

test("Replace puts the caret in the new, empty field", async ({ page }) => {
  await openExample(page, "input-tw", "secret");
  await page.getByRole("button", { name: "Replace" }).click();
  const fresh = page.getByLabel("Saved key");
  await expect(fresh).toHaveValue("");
  await expect(fresh).toBeFocused();
});

test("on a touch screen the words are 16px and a press just above a small field focuses it", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await openExample(page, "input-tw", "sizes");
  const small = page.getByRole("textbox", { name: "Filter rows" });
  expect(
    await small.evaluate((input) => getComputedStyle(input).fontSize)
  ).toBe("16px");
  const box = await small.boundingBox();
  await page.touchscreen.tap(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) - 4
  );
  await expect(small).toBeFocused();
  await context.close();
});
