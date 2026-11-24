// The page has one pair of live regions, UI SDK's, there from the start, neither a status nor an
// alert;
// every part speaks through them (lib/utils `announce`), and UI SDK's own parts (a toast, a
// field's error) too. Messages that come at once are each said once, none lost.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { openExample } from "./example.ts";

declare global {
  interface Window {
    /** Every message a live region took, with the politeness of the region that took it. */
    regionsSaid?: string[];
  }
}

/** Records, from before the page opens, every text any live region on the page takes. */
const recordRegions = async (page: Page) => {
  await page.addInitScript(() => {
    const said: string[] = [];
    window.regionsSaid = said;
    new MutationObserver((changes) => {
      const regions = new Set(
        changes
          .map((change) =>
            change.target instanceof Element
              ? change.target
              : change.target.parentElement
          )
          .map((node) => node?.closest("[aria-live]"))
          .filter((node) => node !== null && node !== undefined)
      );
      for (const region of regions) {
        const text = region.textContent.trim();
        if (text !== "") {
          said.push(`${region.getAttribute("aria-live")}: ${text}`);
        }
      }
    }).observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
};

/** Adds an example of the site, live, after the page's own (as the docs draw several on one page). */
const addExample = async (
  page: Page,
  example: string,
  props: Record<string, unknown> = {}
) => {
  await page.evaluate(
    ({ path, data }) => {
      const island = document.createElement("damsko-island");
      island.setAttribute("ssr", "");
      island.dataset.example = path;
      island.dataset.props = JSON.stringify(data);
      island.dataset.prefix = `${path.replaceAll("/", "-")}-`;
      document.body.append(island);
      document.dispatchEvent(new Event("astro:page-load"));
    },
    { path: example, data: props }
  );
};

test("the page's two live regions are there from the start, empty, and neither is a status or an alert", async ({
  page,
}) => {
  await openExample(page, "empty", "basic");
  const regions = page.locator("[data-ui-sdk-announcer]");
  await expect(regions).toHaveCount(2);
  await expect(regions).toHaveText(["", ""]);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.locator("[aria-live=assertive]")).toHaveCount(1);
});

test("an Empty's error, a toast's error and a form's error at once: each said once, in one region", async ({
  page,
}) => {
  await recordRegions(page);
  await openExample(page, "toast", "types");
  // A form's setting that fails to save, 1200ms after it is flipped (switch/save).
  await addExample(page, "switch/save");
  const reminders = page.getByRole("switch", {
    name: "Reminders before a deadline",
  });
  await expect(reminders).toBeVisible();
  // Its code loaded first, so the error state below draws at once.
  await addExample(page, "empty/states");
  await expect(page.getByText("Nothing pinned.")).toBeVisible();
  await reminders.click();
  await page.waitForTimeout(1150);
  // At once, as the setting fails: the error state appears and the toast comes.
  await page.evaluate(() => {
    const island = document.createElement("damsko-island");
    island.setAttribute("ssr", "");
    island.dataset.example = "empty/states";
    island.dataset.props = JSON.stringify({
      kind: "error",
      title: "The projects did not load",
      words: "Check your connection.",
    });
    island.dataset.prefix = "error-";
    document.body.append(island);
    document.dispatchEvent(new Event("astro:page-load"));
    for (const button of document.querySelectorAll("button")) {
      if (button.textContent === "Error") {
        button.click();
      }
    }
  });
  const expected = [
    "assertive: Could not save. Check your connection and try again.",
    "assertive: The projects did not load. Check your connection.",
    "polite: Could not save",
  ];
  const said = async () => {
    const all = await page.evaluate(() => window.regionsSaid ?? []);
    return all.toSorted();
  };
  await expect.poll(said).toEqual(expected);
  // Still once each, a while later.
  await page.waitForTimeout(1500);
  expect(await said()).toEqual(expected);
  await expect(
    page.locator("[aria-live]:not([data-slot=toast-region])")
  ).toHaveCount(2);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("a region UI SDK makes anew, once the page lost its own, is neither a status nor an alert, and says its message", async ({
  page,
}) => {
  await recordRegions(page);
  await openExample(page, "toast", "types");
  const regions = page.locator("[data-ui-sdk-announcer]");
  await expect(regions).toHaveCount(2);
  // The page loses them (a framework that redraws the body, say).
  await regions.evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
  await page.getByRole("button", { name: "Error" }).click();
  await expect
    .poll(async () => await page.evaluate(() => window.regionsSaid ?? []))
    .toEqual([
      "assertive: Could not save. Check your connection and try again.",
    ]);
  await expect(regions).not.toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveCount(0);
});
