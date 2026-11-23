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
// character of it (src/styles/fonts.css).
//
// It was not always so: a page with a hyphenated block (`hyphens: auto`) laid out before the
// preloaded common file had arrived asked the family for the hyphen U+2010, which only the full
// file's range named, and fetched that file (29KB) on some visits. The common file now answers
// for every character first, so nothing is asked of the full file while it loads.
//
// The pages below need more, each for what it loads, said beside it: what the page takes, plus a
// request and about 10KB.
import { expect, test } from "@playwright/test";

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
  // Markdown (micromark and GFM, with Code block) in its bubble-with-Markdown example.
  "/components/bubble": { bytes: 620 * 1024 },
  // The chart library, drawn on the page.
  "/components/chart": { bytes: 710 * 1024 },
  // The settings example holds a Data table (TanStack Table, Pagination, Checkbox).
  "/components/container": { requests: 34, bytes: 650 * 1024 },
  // TanStack Table and every part a data table draws.
  "/components/data-table": { requests: 30, bytes: 680 * 1024 },
  // A field round every control: date picker, calendar, combobox, number field, tags and OTP.
  "/components/field": { requests: 30, bytes: 620 * 1024 },
  // The row example sets the tile in a Data table (TanStack Table, Pagination, Checkbox).
  "/components/icon-tile": { requests: 29, bytes: 630 * 1024 },
  // Markdown with Code block and Prism, its own subject.
  "/components/markdown": { requests: 29, bytes: 630 * 1024 },
  // MessageResponse's Markdown, once its answers draw, Message scroller, and Reasoning in a turn.
  "/components/message": { requests: 32, bytes: 630 * 1024 },
  // Prompt input and the parts its examples compose: the page stood 152 bytes under the limit,
  // and the docs' own Sidebar and Snippet, on every page, then grew by under 1KB.
  "/components/prompt-input": { bytes: 610 * 1024 },
  // Reasoning, which loads Markdown with it for its thoughts.
  "/components/reasoning": { requests: 29, bytes: 620 * 1024 },
  // Prism, for the commit example's diffs: it is the row that opens, in view on the first screen.
  "/components/trace": { requests: 27 },
  // Tool, which loads Code block and Prism with it for its input and output.
  "/components/tool": { requests: 28 },
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
