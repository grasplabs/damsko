import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

// Pastes as a person does: Firefox gives a page's own paste event no clipboard data, so there the
// text goes through the clipboard and the keys; the others take the event.
const paste = async (page: Page, browserName: string, text: string) => {
  if (browserName === "firefox") {
    await page.evaluate(async (value) => {
      await navigator.clipboard.writeText(value);
    }, text);
    await page.keyboard.press("ControlOrMeta+V");
    return;
  }
  await page.evaluate((value) => {
    const data = new DataTransfer();
    data.setData("text/plain", value);
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  }, text);
};

test("typing fills the squares in turn, and Backspace empties the last", async ({
  page,
}) => {
  await openExample(page, "input-otp", "basic");
  const code = page.getByRole("textbox", { name: "Verification code" });
  await code.focus();
  await page.keyboard.type("48");
  await expect(code).toHaveValue("48");
  await expect(page.getByText("4", { exact: true })).toBeVisible();
  await expect(page.getByText("8", { exact: true })).toBeVisible();
  await page.keyboard.press("Backspace");
  await expect(code).toHaveValue("4");
  await expect(page.getByText("8", { exact: true })).toHaveCount(0);
  await page.keyboard.press("Backspace");
  await expect(code).toHaveValue("");
});

test("it takes only what its pattern allows", async ({ page }) => {
  await openExample(page, "input-otp", "basic");
  const code = page.getByRole("textbox", { name: "Verification code" });
  await code.focus();
  await page.keyboard.type("4a-2");
  await expect(code).toHaveValue("42");
});

test("a pasted code fills every square, its dash left out", async ({
  page,
  browserName,
}) => {
  await openExample(page, "input-otp", "basic");
  const code = page.getByRole("textbox", { name: "Verification code" });
  await code.focus();
  await paste(page, browserName, "123-456");
  await expect(code).toHaveValue("123456");
  await Promise.all(
    ["1", "2", "3", "4", "5", "6"].map(async (digit) => {
      await expect(page.getByText(digit, { exact: true })).toBeVisible();
    })
  );
});

test("a whole code is sent with its form, under its name", async ({ page }) => {
  await openExample(page, "input-otp", "agent");
  const code = page.getByRole("textbox", { name: "Verification code" });
  await code.focus();
  await page.keyboard.type("482913");
  await expect(code).toHaveValue("482913");
  const sent = await code.evaluate((input) =>
    input instanceof HTMLInputElement && input.form !== null
      ? new FormData(input.form).get("code")
      : null
  );
  expect(sent).toBe("482913");
});

test("it says when the code is whole, and only then", async ({ page }) => {
  await openExample(page, "input-otp", "agent");
  const code = page.getByRole("textbox", { name: "Verification code" });
  await code.focus();
  await page.keyboard.type("48291");
  await expect(page.getByText(/^Checking/u)).toHaveCount(0);
  await page.keyboard.type("3");
  await expect(page.getByText("Checking 482913")).toBeVisible();
});

test("an agent finds the code by its label and fills it", async ({ page }) => {
  await openExample(page, "input-otp", "agent");
  await page.waitForFunction(() => "damskoAgent" in window);
  const ok = await page.evaluate(async () => {
    const filled = await window.damskoAgent?.act({
      steps: [
        { ref: "Verification code", action: "setValue", args: ["482913"] },
      ],
    });
    return filled?.ok;
  });
  expect(ok).toBe(true);
  await expect(
    page.getByRole("textbox", { name: "Verification code" })
  ).toHaveValue("482913");
});

test("wrong, read only and out of use, it says so", async ({ page }) => {
  await openExample(page, "input-otp", "states");
  const wrong = page.getByRole("textbox", { name: "Verification code" });
  await expect(wrong).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByText("That code has expired. Ask for a new one.")
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Pairing code" })
  ).not.toBeEditable();
  await expect(
    page.getByRole("textbox", { name: "Backup code" })
  ).toBeDisabled();
});
