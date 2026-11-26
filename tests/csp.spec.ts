// The product's Content Security Policy, across the library, as Damsko needs it: `img-src 'self'
// data:`, so a picture from a `blob:` URL breaks there while it works on this site; scripts only
// from the site and its own inline ones, by their hashes, with 'wasm-unsafe-eval' for CodeBlock's
// lexers (as Get started says); and no workers at all. Every component example is served here
// with those directives, and none may be broken by them; an image upload's new picture still
// shows, its preview being a data: URL; and CodeBlock's code is coloured under it, and plain,
// refused once and nothing said, under a policy without 'wasm-unsafe-eval'.
import { createHash } from "node:crypto";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { componentExamples, openExample, pickerFrom } from "./example.ts";

/** The product's policy: WebAssembly allowed, no eval, no worker. */
const productPolicy =
  "img-src 'self' data:; script-src 'self' 'wasm-unsafe-eval'; worker-src 'none'";

/** The hashes of a page's inline scripts, for its policy's script-src: the site's own, allowed. */
const inlineHashes = (html: string) =>
  [...html.matchAll(/<script>(?<body>[\s\S]*?)<\/script>/gu)].map(
    (found) =>
      `'sha256-${createHash("sha256")
        .update(found.groups?.body ?? "")
        .digest("base64")}'`
  );

/**
 * Serves every page with `policy` (the product's), its script-src allowing the page's own inline
 * scripts by their hashes, and records what it refuses.
 */
const underPolicy = async (page: Page, policy = productPolicy) => {
  await page.route(
    (url) => url.pathname.startsWith("/examples/"),
    async (route) => {
      if (route.request().resourceType() !== "document") {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      const hashes = inlineHashes(await response.text()).join(" ");
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy": policy.replace(
            "script-src 'self'",
            `script-src 'self' ${hashes}`
          ),
        },
      });
    }
  );
  await page.addInitScript(() => {
    window.refused = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.refused?.push(`${event.effectiveDirective} ${event.blockedURI}`);
    });
  });
};

declare global {
  interface Window {
    refused?: string[];
  }
}

const byComponent = Map.groupBy(
  componentExamples(),
  (path) => path.split("/")[0] ?? path
);

test("a diagram downloads as a PNG under the product's policy, drawn from a data: picture", async ({
  page,
}) => {
  await underPolicy(page);
  await openExample(page, "markdown", "diagram");
  const drawn = page.locator("[data-slot=markdown-diagram]").first();
  await expect(
    drawn.locator("[data-slot=markdown-diagram-drawing] svg")
  ).toHaveCount(1);
  await drawn.getByRole("button", { name: "Download diagram" }).click();
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("menuitem", { name: "PNG" }).click(),
  ]);
  expect(file.suggestedFilename()).toBe("diagram.png");
  expect(await page.evaluate(() => window.refused ?? [])).toStrictEqual([]);
});

test("a diagram is drawn under a policy that allows no frame: Mermaid's is about:blank, never fetched", async ({
  page,
}) => {
  await underPolicy(
    page,
    `${productPolicy}; frame-src 'none'; child-src 'none'`
  );
  await openExample(page, "markdown", "diagram");
  await expect(
    page.locator("[data-slot=markdown-diagram-drawing] svg")
  ).toHaveCount(1);
  expect(await page.evaluate(() => window.refused ?? [])).toStrictEqual([]);
});

for (const [component, paths] of byComponent) {
  test(`${component}: nothing is refused under the product's policy`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await underPolicy(page);
    const refused: string[] = [];
    for (const path of paths) {
      const [, name = ""] = path.split("/");
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      await openExample(page, component, name);
      // oxlint-disable-next-line no-await-in-loop -- one example after the other
      const found = await page.evaluate(() => window.refused ?? []);
      refused.push(...found.map((each) => `${path}: ${each}`));
    }
    expect(refused).toStrictEqual([]);
  });
}

test("an image upload's new picture shows under the product's policy", async ({
  page,
}) => {
  await underPolicy(page);
  await openExample(page, "image-upload", "basic");
  const chooser = await pickerFrom(page, async () => {
    await page.getByRole("button", { name: /^Change/u }).click();
  });
  // A 1px PNG.
  await chooser.setFiles({
    name: "face.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    ),
  });
  await expect
    .poll(
      async () =>
        await page.evaluate(() =>
          [...document.querySelectorAll("damsko-island img")].some(
            (image) =>
              image instanceof HTMLImageElement &&
              image.src.startsWith("data:") &&
              image.naturalWidth > 0
          )
        )
    )
    .toBe(true);
  expect(await page.evaluate(() => window.refused ?? [])).toStrictEqual([]);
});

/** Whether a run of a block's code is drawn in a colour other than its line's. */
const coloured = async (page: Page) =>
  await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "[data-slot=code-block-line] > span:nth-child(2) > span"
      ),
    ].some(
      (run) =>
        run.parentElement !== null &&
        getComputedStyle(run).color !==
          getComputedStyle(run.parentElement).color
    )
  );

test("CodeBlock's code is coloured under the product's policy: 'wasm-unsafe-eval', and no worker", async ({
  page,
}) => {
  await underPolicy(page);
  await openExample(page, "code-block", "basic");
  await expect.poll(async () => await coloured(page)).toBe(true);
  expect(await page.evaluate(() => window.refused ?? [])).toStrictEqual([]);
});

test("DiffViewer's code is coloured under the product's policy, by CodeBlock's lexers", async ({
  page,
}) => {
  await underPolicy(page);
  await openExample(page, "diff-viewer", "unified");
  await expect
    .poll(
      async () =>
        await page.evaluate(() =>
          [...document.querySelectorAll("[data-diff-code] span")].some(
            (run) =>
              run.closest("[data-diff-code]") !== null &&
              getComputedStyle(run).color !==
                getComputedStyle(run.closest("[data-diff-code]") ?? run).color
          )
        )
    )
    .toBe(true);
  expect(await page.evaluate(() => window.refused ?? [])).toStrictEqual([]);
});

test("where a policy refuses WebAssembly, every block is plain and whole, refused once, and CodeBlock says nothing", async ({
  page,
}) => {
  await underPolicy(page, "script-src 'self'; worker-src 'none'");
  const said: string[] = [];
  page.on("console", (message) => {
    said.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    said.push(`thrown: ${error.message}`);
  });
  await openExample(page, "code-block", "any");
  for (const code of ["export const total = 1;", "export const sum = 2;"]) {
    // oxlint-disable-next-line no-await-in-loop -- one block after the other
    await page.getByLabel("Code").fill(code);
    // oxlint-disable-next-line no-await-in-loop -- one block after the other
    await page.getByRole("button", { name: "Show", exact: true }).click();
    // oxlint-disable-next-line no-await-in-loop -- one block after the other
    await expect(
      page.getByRole("region", { name: "TSX" }).getByText(code, { exact: true })
    ).toBeVisible();
  }
  await expect
    .poll(async () => await page.evaluate(() => window.refused ?? []))
    .toHaveLength(1);
  // A second more, for anything that would try again.
  await page.waitForTimeout(1000);
  const refused = await page.evaluate(() => window.refused ?? []);
  expect(refused).toHaveLength(1);
  expect(refused[0]).toMatch(/^script-src/u);
  // Nothing thrown and nothing from CodeBlock: at most the browser's own note of the refusal, once
  // (Chromium says nothing at all).
  expect(
    said.filter((each) => !/Content[- ]Security[- ]Policy/iu.test(each))
  ).toStrictEqual([]);
  expect(said.length).toBeLessThanOrEqual(1);
  expect(await coloured(page)).toBe(false);
});
