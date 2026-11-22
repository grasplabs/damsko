// A first visit, on every component page: loaded once with an empty cache, every request it makes
// is counted with the bytes it took. It makes at most 26 requests besides its fonts, takes at most
// 600KB, and at most 150KB of fonts (a page's fonts differ by a file from run to run, as a block
// that uses one comes into view or not, so they are counted by their bytes alone). Read through Chromium's own network protocol, so
// Chromium only (playwright.config.ts). The figures mean something for a build alone, which is what the specs serve,
// compressed as the host serves it (scripts/serve.ts).
//
// The pages below need more, each for what it loads, said beside it: what the page takes, its
// heavier font set included, plus a request and about 10KB.
import { expect, test } from "@playwright/test";

import { docsPages } from "./example.ts";

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
  "/components/message": { requests: 32, bytes: 620 * 1024 },
  // The Model selector among its tools (Command, Listbox and Toggle group with it), in its model
  // example; and what its states draw with: Agent indicator and Shimmer on the band under the
  // card, Skeleton while the page loads, and a Queue (Trace) above the card.
  "/components/prompt-input": { requests: 32, bytes: 630 * 1024 },
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
    await page.waitForLoadState("networkidle");
    const list = [...requests.values()];
    expect(sum(list.filter((request) => request.font))).toBeLessThanOrEqual(
      limits.fonts
    );
    expect(list.filter((request) => !request.font).length).toBeLessThanOrEqual(
      over[path]?.requests ?? limits.requests
    );
    expect(sum(list)).toBeLessThanOrEqual(over[path]?.bytes ?? limits.bytes);
  });
}
