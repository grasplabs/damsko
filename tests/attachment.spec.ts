import { expect, test } from "@playwright/test";

import { hasFocusRing, openExample } from "./example.ts";

test("the files are a list named for what they are, a row per file by its name", async ({
  page,
}) => {
  await openExample(page, "attachment", "basic");
  const files = page.getByRole("list", { name: "Files to send" });
  await expect(files.getByRole("listitem")).toHaveCount(2);
  await expect(files.getByRole("listitem").first()).toContainText(
    "quarter-figures.xlsx"
  );
  await expect(files.getByRole("listitem").last()).toContainText(
    "supplier-contract-2027-final.pdf"
  );
});

test("each file says its size", async ({ page }) => {
  await openExample(page, "attachment", "basic");
  const files = page.getByRole("list", { name: "Files to send" });
  await expect(files.getByRole("listitem").first()).toContainText("48 kB");
  await expect(files.getByRole("listitem").last()).toContainText("1.4 MB");
});

test("each file's remove button is named for it, and takes that file off", async ({
  page,
}) => {
  await openExample(page, "attachment", "basic");
  const files = page.getByRole("list", { name: "Files to send" });
  await page
    .getByRole("button", { name: "Remove quarter-figures.xlsx" })
    .click();
  await expect(files.getByRole("listitem")).toHaveCount(1);
  await expect(files).not.toContainText("quarter-figures.xlsx");
  await expect(
    page.getByRole("button", {
      name: "Remove supplier-contract-2027-final.pdf",
    })
  ).toBeVisible();
});

test("Tab goes from one file's remove button to the next, with a ring; the row is no stop of its own", async ({
  page,
}) => {
  await openExample(page, "attachment", "basic");
  const first = page.getByRole("button", {
    name: "Remove quarter-figures.xlsx",
  });
  const second = page.getByRole("button", {
    name: "Remove supplier-contract-2027-final.pdf",
  });
  await first.focus();
  await page.keyboard.press("Tab");
  await expect(second).toBeFocused();
  expect(await hasFocusRing(second)).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await expect(first).toBeFocused();
});

test("removing a file from the keyboard puts focus on the next file's remove, then the one before, then the list", async ({
  page,
}) => {
  await openExample(page, "attachment", "parts");
  const budget = page.getByRole("button", {
    name: "Remove budget-2027.xlsx",
  });
  const export_ = page.getByRole("button", {
    name: "Remove customers-export.csv",
  });
  await budget.focus();
  await page.keyboard.press("Enter");
  await expect(budget).toHaveCount(0);
  await expect(export_).toBeFocused();
  await openExample(page, "attachment", "parts");
  await export_.focus();
  await page.keyboard.press("Enter");
  await expect(export_).toHaveCount(0);
  await expect(budget).toBeFocused();
  // The last one goes: focus stays with the list, never the page.
  await page.keyboard.press("Enter");
  await expect(budget).toHaveCount(0);
  await expect(page.getByRole("list", { name: "Files to send" })).toBeFocused();
});

test("a picture shows as itself; a file with none, or one that will not load, wears its media type's mark", async ({
  page,
}) => {
  await openExample(page, "attachment", "previews");
  const file = (name: string) =>
    page
      .getByRole("list", { name: "Files sent" })
      .getByRole("listitem")
      .filter({ hasText: name });

  const picture = file("quarter-chart.png").locator("img");
  await expect(picture).toBeVisible();
  expect(
    await picture.evaluate((node: HTMLImageElement) => node.naturalWidth)
  ).toBeGreaterThan(0);

  // The picture that will not load gives way to the mark.
  await expect(file("whiteboard.jpg").locator("img")).toHaveCount(0);
  // One mark each, and each media type its own: a picture, a video, a sound, a PDF, any file.
  const marks = await Promise.all(
    [
      "whiteboard.jpg",
      "kickoff-call.mp4",
      "voice-note.m4a",
      "brief.pdf",
      "notes.txt",
    ].map(async (name) => {
      const mark = file(name).locator("svg");
      await expect(mark).toHaveCount(1);
      return await mark.evaluate((node) => node.innerHTML);
    })
  );
  expect(new Set(marks).size).toBe(marks.length);
  // Files already sent: nothing takes them off.
  await expect(page.getByRole("button")).toHaveCount(0);
});

test("at 320px a name too long for the row is cut in the middle, its extension kept, never wider than the row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openExample(page, "attachment", "basic");
  const files = page.getByRole("list", { name: "Files to send" });
  const row = await files.boundingBox();
  const last = files
    .getByRole("listitem")
    .filter({ hasText: "supplier-contract" });
  await last.scrollIntoViewIfNeeded();
  const item = await last.boundingBox();
  expect(item?.width ?? 0).toBeLessThanOrEqual((row?.width ?? 0) + 1);
  await expect(last.getByText("nal.pdf", { exact: true })).toBeVisible();
});

test("the whole card opens its dialog, while its remove action stays its own press", async ({
  page,
}) => {
  await openExample(page, "attachment", "trigger");
  await page
    .getByRole("button", { name: "Remove research-summary.pdf" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Preview research-summary.pdf" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "research-summary.pdf" })
  ).toBeVisible();
});

test("an upright card's trigger is a link to its picture, which shows as itself", async ({
  page,
}) => {
  await openExample(page, "attachment", "trigger");
  await expect(
    page.getByRole("link", { name: "Open quarter-chart.png" })
  ).toHaveAttribute("href", "/media/quarter-chart.png");
  const picture = page.locator("img");
  await expect(picture).toBeVisible();
});

test("a failed file says why in words, and offers to try again", async ({
  page,
}) => {
  await openExample(page, "attachment", "states");
  await expect(page.getByText("Upload failed. Try again.")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Retry the upload of financial-model.xlsx",
    })
  ).toBeVisible();
});

test("a remote picture from a chat is never requested and an SVG never drawn; one written into the address shows", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("example.com")) {
      requested.push(request.url());
    }
  });
  await openExample(page, "attachment", "untrusted");
  const file = (name: string) =>
    page
      .getByRole("list", { name: "Files from the chat" })
      .getByRole("listitem")
      .filter({ hasText: name });
  const inline = file("swatch.png").locator("img");
  await expect(inline).toBeVisible();
  expect(
    await inline.evaluate((node: HTMLImageElement) => node.naturalWidth)
  ).toBeGreaterThan(0);
  await expect(file("photo-from-chat.jpg").locator("img")).toHaveCount(0);
  await expect(file("photo-from-chat.jpg").locator("svg")).toHaveCount(1);
  await expect(file("drawing.svg").locator("img")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(requested).toStrictEqual([]);
});

test("when the last file goes and the list with it, focus goes to what stands in its place, never the page", async ({
  page,
}) => {
  await openExample(page, "attachment", "basic");
  await page
    .getByRole("button", { name: "Remove supplier-contract-2027-final.pdf" })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove quarter-figures.xlsx" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Put the files back" })
  ).toBeFocused();
});

test("a row with more files than it shows fades at its end, never in forced colours, and one file alone neither fades nor scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openExample(page, "attachment", "basic");
  const files = page.getByRole("list", { name: "Files to send" });
  const mask = async () =>
    await files.evaluate((element) => getComputedStyle(element).maskImage);
  await expect.poll(mask).toContain("linear-gradient");
  await page.emulateMedia({ forcedColors: "active" });
  await expect.poll(mask).toBe("none");
  await page.emulateMedia({ forcedColors: "none" });
  await files.getByRole("button").last().click();
  await expect(files.getByRole("listitem")).toHaveCount(1);
  await expect.poll(mask).toBe("none");
  expect(
    await files.evaluate(
      (element) => element.scrollWidth <= element.clientWidth
    )
  ).toBe(true);
});
