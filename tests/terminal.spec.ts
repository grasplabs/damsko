import { expect, test } from "@playwright/test";

import {
  drawnEdges,
  hasFocusRing,
  listenToLiveRegions,
  openExample,
  panelOf,
} from "./example.ts";

test("the command's line opens and closes its output, and says so with aria-expanded", async ({
  page,
}) => {
  await openExample(page, "terminal", "basic");
  const line = page.getByRole("button", { name: "Ran pnpm build" });
  const output = page.getByText("✓ built in 2.84s");
  await expect(line).toHaveAttribute("aria-expanded", "false");
  await expect(output).toBeHidden();
  await line.click();
  await expect(line).toHaveAttribute("aria-expanded", "true");
  await expect(output).toBeVisible();
  await line.click();
  await expect(output).toBeHidden();
});

test("the keyboard reaches the line with a ring; Enter opens it", async ({
  page,
}) => {
  await openExample(page, "terminal", "basic");
  const line = page.getByRole("button", { name: "Ran pnpm build" });
  await page.keyboard.press("Tab");
  await expect(line).toBeFocused();
  expect(await hasFocusRing(line)).toBe(true);
  await page.keyboard.press("Enter");
  await expect(line).toHaveAttribute("aria-expanded", "true");
});

test("a command that failed says so in words, and is open on why", async ({
  page,
}) => {
  await openExample(page, "terminal", "error");
  const failed = page.getByRole("button", {
    name: /^pnpm lint exited with code 1\s*, Failed$/u,
  });
  await expect(failed).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("✖ 2 problems (2 errors, 0 warnings)")
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ran pnpm install" })
  ).toHaveAttribute("aria-expanded", "false");
});

test("colours are text: the escape sequences are never shown, and copy leaves them out", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openExample(page, "terminal", "colours");
  const failing = page.getByText("expected 'hello' to be 'hello world'");
  await expect(failing).toBeVisible();
  await expect(page.getByText("AssertionError:")).toHaveCSS(
    "font-weight",
    /^[6-9]00$/u
  );
  await expect(page.getByText(/\[3\dm/u)).toHaveCount(0);
  await page.getByRole("button", { name: "Copy the output" }).click();
  const copied = await page.evaluate(
    async () => await navigator.clipboard.readText()
  );
  expect(copied).toContain("✗ src/stream.test.ts (3 tests | 1 failed)");
  expect(copied).not.toContain("\u001B");
});

test("Clear empties the output and says so once", async ({ page }) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "terminal", "colours");
  await expect(page.getByText("$ pnpm test")).toBeVisible();
  await page.getByRole("button", { name: "Clear the output" }).click();
  await expect(page.getByText("$ pnpm test")).toHaveCount(0);
  await expect.poll(said).toStrictEqual(["Output cleared"]);
});

test("while it runs the line opens on its output, follows its end, and is said once when done", async ({
  page,
}) => {
  const said = await listenToLiveRegions(page);
  await openExample(page, "terminal", "live");
  const running = page.getByRole("button", { name: /Running pnpm test/u });
  await expect(running).toHaveAttribute("aria-expanded", "false");
  const next = page.getByRole("button", { name: "Next" });
  await next.click();
  await expect(running).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("> vitest run")).toBeVisible();
  // Each press prints three more lines; five more print them all.
  await next.click();
  await next.click();
  await next.click();
  await next.click();
  await next.click();
  // The last lines in are in view: the output followed its end.
  await expect(page.getByText(" Test Files  10 passed (10)")).toBeInViewport();
  const scroller = page.getByRole("region", { name: "Terminal output" });
  await expect(scroller).toBeVisible();
  const ran = page.getByRole("button", { name: "Ran pnpm test" });
  await expect(ran).toHaveAttribute("aria-expanded", "true");
  await expect.poll(said).toStrictEqual(["Ran pnpm test"]);
});

test("what opens under the line starts on the line's own start edge, its mark's, and ends where the header's last button does", async ({
  page,
}) => {
  await openExample(page, "terminal", "colours");
  const line = page.getByRole("button", { name: "Terminal" });
  if ((await line.getAttribute("aria-expanded")) === "false") {
    await line.press("Enter");
  }
  const panel = await panelOf(line);
  await expect(panel).toBeVisible();
  const header = await drawnEdges(line);
  const body = await drawnEdges(panel);
  expect(Math.abs(body.start - header.start)).toBeLessThanOrEqual(1);
  const last = await drawnEdges(
    page.getByRole("button", { name: "Clear the output" })
  );
  expect(Math.abs(body.end - last.end)).toBeLessThanOrEqual(1);
});
