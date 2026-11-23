// A first visit, on every component page: loaded once with an empty cache, every request it makes
// is counted with the bytes it took. It makes at most 26 requests besides its fonts, takes at most
// 600KB, and at most 150KB of fonts. Read through Chromium's own network protocol, so Chromium only
// (playwright.config.ts). The figures mean something for a build alone, which is what the specs
// serve, compressed as the host serves it (scripts/serve.ts).
//
// A page takes the same requests and the same bytes on every visit, and each test notes them in
// the report ("first visit"). It is read once the page has settled: its fonts are in, every example
// within a screen of view is live (site/system/island.ts), and the network is quiet. The fonts are
// the three common files every page preloads, and a family's full file only on a page that shows a
// character of it (src/styles/fonts/geist.css).
//
// It was not always so: a page with a hyphenated block (`hyphens: auto`) laid out before the
// preloaded common file had arrived asked the family for the hyphen U+2010, which only the full
// file's range named, and fetched that file (29KB) on some visits. The common file now answers
// for every character first, so nothing is asked of the full file while it loads.
//
// What keeps a page light: an example is drawn on the server and its code is fetched only when it
// comes within a screen of view, each example a file of its own with the components it draws
// (site/system/vite.ts, exampleChunk), so a page takes the code of its first screens and no more.
// The two tests at the end hold that: an example far down the page sleeps until it is near, wakes
// in the place it was drawn in, and is woken by an address that names its section.
//
// The page below needs more requests, for what it loads, said beside it: what the page takes, plus
// a request. No page needs more bytes: the heaviest, the data table's, takes 542KB.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { docsPages, settled } from "./example.ts";

/** The bytes a list of requests took. */
const sum = (list: { bytes: number }[]) => {
  let total = 0;
  for (const request of list) {
    total += request.bytes;
  }
  return total;
};

const limits = { requests: 26, bytes: 600 * 1024, fonts: 150 * 1024 };

const over: Record<string, { requests?: number; bytes?: number }> = {
  // Its one example on the first screen is a whole settings page: a Data table (TanStack Table,
  // Table, Pagination, Checkbox, Select) under a Page header, with a Card, a Switch, an Avatar
  // and the Alert dialog and Toast its rows answer with, each component a file. It takes 30.
  "/components/container": { requests: 31 },
};

for (const path of docsPages().filter((each) =>
  each.startsWith("/components/")
)) {
  test(`${path}: a first visit stays light`, async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    const requests = new Map<string, { font: boolean; bytes: number }>();
    cdp.on("Network.requestWillBeSent", (event) => {
      if (!event.request.url.startsWith("data:")) {
        requests.set(event.requestId, {
          font: event.type === "Font",
          bytes: 0,
        });
      }
    });
    cdp.on("Network.loadingFinished", (event) => {
      const request = requests.get(event.requestId);
      if (request !== undefined) {
        request.bytes = event.encodedDataLength;
      }
    });
    await page.goto(new URL(path, process.env.BASE_URL).href);
    // Fonts in and two frames on, the examples within a screen of view have begun to wake; then
    // each of them live, and whatever they load in.
    await settled(page);
    await page.waitForFunction(
      () =>
        document.querySelector("damsko-island[data-island-live][ssr]") === null
    );
    await page.waitForLoadState("networkidle");
    const list = [...requests.values()];
    const fonts = sum(list.filter((request) => request.font));
    const others = list.filter((request) => !request.font).length;
    const bytes = sum(list);
    test.info().annotations.push({
      type: "first visit",
      description: `${others} requests besides fonts, ${bytes} bytes, ${fonts} of them fonts`,
    });
    expect(fonts).toBeLessThanOrEqual(limits.fonts);
    expect(others).toBeLessThanOrEqual(over[path]?.requests ?? limits.requests);
    expect(bytes).toBeLessThanOrEqual(over[path]?.bytes ?? limits.bytes);
  });
}

/** The scroller's height and where an example stands in it, to the pixel. */
const placeOf = async (page: Page, example: string) =>
  await page.evaluate((path) => {
    const island = document.querySelector(
      `damsko-island[data-example="${path}"]`
    );
    const scroller = island?.closest("[data-site-scroller]");
    const box = island?.firstElementChild?.getBoundingClientRect();
    return {
      asleep: island?.matches(":not([data-island-live])") === true,
      pageHeight: scroller?.scrollHeight,
      top: (box?.top ?? 0) + (scroller?.scrollTop ?? 0),
      height: box?.height,
    };
  }, example);

/** Waits until an example on a docs page is live (site/system/island.ts drops `ssr`). */
const awake = async (page: Page, example: string) => {
  await page.waitForFunction(
    (path) =>
      document
        .querySelector(`damsko-island[data-example="${path}"]`)
        ?.hasAttribute("ssr") === false,
    example
  );
};

test("an example far down a page sleeps until it is near, and wakes in its place", async ({
  page,
}) => {
  await page.goto(new URL("/components/button", process.env.BASE_URL).href);
  await settled(page);
  await page.waitForLoadState("networkidle");
  const before = await placeOf(page, "button/truncate");
  expect(before.asleep).toBe(true);
  await page
    .getByRole("heading", { name: "A long name in a narrow head" })
    .scrollIntoViewIfNeeded();
  await awake(page, "button/truncate");
  expect(await placeOf(page, "button/truncate")).toEqual({
    ...before,
    asleep: false,
  });
});

test("an address that names a section wakes the example under it", async ({
  page,
}) => {
  await page.goto(
    new URL(
      "/components/button#a-long-name-in-a-narrow-head",
      process.env.BASE_URL
    ).href
  );
  await awake(page, "button/truncate");
  await expect(
    page.getByRole("heading", { name: "A long name in a narrow head" })
  ).toBeInViewport();
});
