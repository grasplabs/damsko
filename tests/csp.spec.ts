// The product's Content Security Policy, across the library: the product serves its pages with
// `img-src 'self' data:` and `worker-src 'none'`, so a picture from a `blob:` URL or a Worker
// breaks there while it works on this site. Every component example is served here with those
// directives, and none may be broken by them; an image upload's new picture still shows, its
// preview being a data: URL.
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { componentExamples, openExample, pickerFrom } from "./example.ts";

const policy = "img-src 'self' data:; worker-src 'none'";

/** Serves every page with the product's policy and records what it refuses. */
const underPolicy = async (page: Page) => {
  await page.route(
    (url) => url.pathname.startsWith("/examples/"),
    async (route) => {
      if (route.request().resourceType() !== "document") {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "content-security-policy": policy },
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
  await openExample(page, "file-upload", "image-upload");
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
