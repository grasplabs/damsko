import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { listenToLiveRegions, openExample } from "./example.ts";

const holdsFocus = async (element: Locator): Promise<boolean> =>
  await element.evaluate((node) => node.contains(document.activeElement));

const focusedName = async (page: Page): Promise<string> =>
  await page.evaluate(() =>
    document.activeElement === document.body
      ? "the page"
      : (document.activeElement?.textContent ?? "").trim()
  );

test("its trigger opens it as an alertdialog, named by its title and described by its text", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "basic");
  await page.getByRole("button", { name: "Delete workspace" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAccessibleDescription(
    "Its 12 projects, 340 files and every member's access are deleted for everyone. This cannot be undone."
  );
  // No close button: the safe answer or Escape is the way out.
  await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(0);
});

test("focus starts on the safe answer, and Tab and Shift+Tab keep it inside", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "basic");
  await page.getByRole("button", { name: "Delete workspace" }).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect(dialog.getByRole("button", { name: "Keep it" })).toBeFocused();
  const stops = await dialog.getByRole("button").count();
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step <= stops; step += 1) {
      // oxlint-disable-next-line no-await-in-loop -- one key after the other
      await page.keyboard.press(key);
      // oxlint-disable-next-line no-await-in-loop -- see above
      expect(await holdsFocus(dialog)).toBe(true);
    }
  }
});

test("a press on the shade does nothing; Escape cancels it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "basic");
  const trigger = page.getByRole("button", { name: "Delete workspace" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect.poll(async () => await holdsFocus(dialog)).toBe(true);
  await page.mouse.click(12, 450);
  await expect(dialog).toBeVisible();
  expect(await holdsFocus(dialog)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("as it leaves after its answer, the page takes the next press, though the shade was pressed before", async ({
  page,
}) => {
  // With motion, so it takes the time of its leave to go.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openExample(page, "alert-dialog", "basic");
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.textContent = "Corner";
    button.style.cssText = "position:fixed;top:0;left:0;width:40px;height:40px";
    button.addEventListener("click", () => {
      button.dataset.pressed = "";
    });
    document.body.append(button);
  });
  const trigger = page.getByRole("button", { name: "Delete workspace" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect(dialog).toBeVisible();
  await page.mouse.click(20, 20);
  await dialog.getByRole("button", { name: "Keep it" }).click();
  await expect(trigger).toBeFocused();
  await page.mouse.click(20, 20);
  await expect(page.getByRole("button", { name: "Corner" })).toHaveAttribute(
    "data-pressed"
  );
});

test("the safe answer closes it and gives focus back to its trigger", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "basic");
  const trigger = page.getByRole("button", { name: "Delete workspace" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await dialog.getByRole("button", { name: "Keep it" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  // No shade is left over the page: its trigger opens it again.
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test("AlertDialogCancel says Cancel, takes focus first, and closes it", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "cancel");
  const trigger = page.getByRole("button", { name: "Revoke access" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("alertdialog", {
    name: "Revoke Maya's access?",
  });
  const cancel = dialog.getByRole("button", { name: "Cancel" });
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("while its action works it stays open and Escape waits; a failure says so on the button", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "failed");
  await page.getByRole("button", { name: "Delete archive" }).click();
  const dialog = page.getByRole("alertdialog", {
    name: "Delete the 2025 archive?",
  });
  const action = dialog.getByRole("button", { name: "Delete", exact: true });
  await expect(action).toHaveAttribute(
    "data-agent-confirm",
    "Deletes the 2025 archive and its 1,180 reports"
  );
  await expect(
    dialog.getByRole("button", { name: "Keep it" })
  ).not.toHaveAttribute("data-agent-confirm");
  await action.click();
  // Working, it says so in its loading words, busy.
  await expect(
    dialog.getByRole("button", { name: "Deleting" })
  ).toHaveAttribute("aria-busy", "true");
  await page.keyboard.press("Escape");
  await page.mouse.click(12, 450);
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Could not delete" })
  ).toBeVisible();
  await expect(dialog).toBeVisible();
});

test("a failed check says the neutral words and keeps it open", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "alert-dialog", "check-failed");
  await page.getByRole("button", { name: "Test the connection" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Test the connection" });
  const check = dialog.getByRole("button", { name: "Test", exact: true });
  await check.click();
  // With no errorText, the alert stands on the button and the catalogue's words are said.
  await expect(check).toHaveAttribute("data-status", "error");
  await expect.poll(said).toContain("Could not finish");
  await expect(dialog).toBeVisible();
});

test("a long description is a region named by the title that the keys scroll, the answers still in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 300 });
  await openExample(page, "alert-dialog", "long-description");
  await page.getByRole("button", { name: "Delete organisation" }).click();
  const title = "Delete Northwind Trading and everything in it?";
  const dialog = page.getByRole("alertdialog", { name: title });
  const keep = dialog.getByRole("button", { name: "Keep it" });
  await expect(keep).toBeFocused();
  const region = dialog.getByRole("region", { name: title });
  await expect(region).toHaveAttribute("tabindex", "0");
  await page.keyboard.press("Shift+Tab");
  await expect(region).toBeFocused();
  await page.keyboard.press("PageDown");
  await expect
    .poll(async () => await region.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
  await expect(keep).toBeInViewport();
  const panel = await dialog.boundingBox();
  expect((panel?.y ?? 0) + (panel?.height ?? 0)).toBeLessThanOrEqual(300);
});

test("on a phone it is a sheet along the bottom, its answers sharing the line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "alert-dialog", "basic");
  await page.getByRole("button", { name: "Delete workspace" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect(dialog).toBeVisible();
  const panel = await dialog.boundingBox();
  expect(Math.round(panel?.x ?? -1)).toBe(0);
  expect(Math.round(panel?.width ?? 0)).toBe(390);
  expect(Math.round((panel?.y ?? 0) + (panel?.height ?? 0))).toBe(800);
  const keep = await dialog
    .getByRole("button", { name: "Keep it" })
    .boundingBox();
  const remove = await dialog
    .getByRole("button", { name: "Delete", exact: true })
    .boundingBox();
  expect(keep?.y).toBe(remove?.y);
  expect(Math.abs((keep?.width ?? 0) - (remove?.width ?? 0))).toBeLessThan(2);
  expect((keep?.width ?? 0) + (remove?.width ?? 0)).toBeGreaterThan(300);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390
  );
});

test("opened from an end-aligned cell, its words still start at the start", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "check-in-a-cell");
  await page.getByRole("button", { name: "Remove" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Remove Ana Ruiz?" });
  const panel = await dialog.boundingBox();
  const title = await dialog.getByRole("heading").boundingBox();
  // The title starts at the panel's padding, not pushed to its end.
  expect((title?.x ?? 0) - (panel?.x ?? 0)).toBeLessThan(40);
});

test("opened by `open` with no trigger, focus starts on the safe answer and goes back to the opener", async ({
  page,
}) => {
  for (const example of ["by-prop", "mounted"]) {
    // oxlint-disable-next-line no-await-in-loop -- one example after the other
    await openExample(page, "alert-dialog", example);
    const ask = page.getByRole("button", { name: "Ask" });
    for (const how of ["Escape", "Not yet"]) {
      // oxlint-disable-next-line no-await-in-loop -- one way of closing after the other
      await ask.focus();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("alertdialog", {
        name: "Send the report?",
      });
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(dialog).toHaveAccessibleDescription(
        "Everyone on the team gets it by email."
      );
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(
        dialog.getByRole("button", { name: "Not yet" })
      ).toBeFocused();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await page.keyboard.press(how === "Escape" ? "Escape" : "Enter");
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(dialog).toBeHidden();
      // oxlint-disable-next-line no-await-in-loop -- see above
      await expect(ask).toBeFocused();
    }
  }
});

test("when its yes removes the button that opened it, focus goes to a neighbour, never the page", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "removes");
  const remove = async (name: string) => {
    await page.getByRole("button", { name }).focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Delete", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
  };
  await remove("Delete Quarterly summary");
  await expect
    .poll(async () => await focusedName(page))
    .toBe("Delete Supplier list");
  await remove("Delete Team survey");
  await expect
    .poll(async () => await focusedName(page))
    .toBe("Delete Supplier list");
});

// The agent fixture: the page's one bridge (window.damskoAgent, site/behaviour/agent.ts).
const act = async (
  page: Page,
  steps: { ref: string; action: string; args?: string[] }[]
) =>
  await page.evaluate(async (list) => {
    const result = await window.damskoAgent?.act({ steps: list });
    return { ok: result?.ok === true, message: result?.error?.message ?? "" };
  }, steps);

const agentSees = async (page: Page): Promise<string[]> =>
  await page.evaluate(() =>
    (window.damskoAgent?.snapshot() ?? []).map((entry) => entry.label ?? "")
  );

const log = async (page: Page): Promise<string[]> =>
  await page.evaluate(() => window.alertDialogLog ?? []);

test("an agent opens it by its trigger and reads its title; the action waits for the person's yes", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "agent");
  await page.evaluate(() => {
    window.damskoAgentYes = false;
  });
  const opened = await act(page, [
    { ref: "Delete workspace", action: "press" },
  ]);
  expect(opened.ok).toBe(true);
  const dialog = page.getByRole("alertdialog", { name: "Delete Northwind?" });
  await expect(dialog).toBeVisible();
  await expect
    .poll(async () => await agentSees(page))
    .toContain("Delete Northwind?");
  const refused = await act(page, [
    { ref: "Delete Northwind?", action: "press", args: ["Delete"] },
  ]);
  expect(refused.ok).toBe(false);
  expect(await log(page)).not.toContain("deleted");
  await expect(dialog).toBeVisible();
  await page.evaluate(() => {
    window.damskoAgentYes = true;
  });
  const allowed = await act(page, [
    { ref: "Delete Northwind?", action: "press", args: ["Delete"] },
  ]);
  expect(allowed.ok).toBe(true);
  await expect.poll(async () => await log(page)).toContain("deleted");
  await expect(dialog).toBeHidden();
});

test("an agent hears a failed action in its words, and it stays open", async ({
  page,
}) => {
  await openExample(page, "alert-dialog", "agent");
  await page.evaluate(() => {
    window.damskoAgentYes = true;
  });
  const failed = await act(page, [
    { ref: "Clear history", action: "press" },
    {
      ref: "Clear the whole history?",
      action: "press",
      args: ["Clear everything"],
    },
  ]);
  expect(failed.ok).toBe(false);
  expect(failed.message).toContain("Could not clear");
  await expect(
    page.getByRole("alertdialog", { name: "Clear the whole history?" })
  ).toBeVisible();
});
