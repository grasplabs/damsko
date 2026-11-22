// The docs site is never listed by a search engine (site/system/indexing.ts): every page says
// noindex in its head and in a header, and robots.txt lets the engines that honour it read that.
//
//   pnpm exec vp test scripts/indexing.test.ts
import { describe, expect, test } from "vitest";

import {
  headersFile,
  indexable,
  robotsMeta,
  robotsTxt,
} from "../site/system/indexing.ts";

describe("the docs site's indexing", () => {
  test("the site is not listed", () => {
    expect(indexable).toBeFalsy();
  });

  test("every page says noindex, whatever it would say for itself", () => {
    expect(robotsMeta()).toBe("noindex, nofollow");
    expect(robotsMeta("noindex")).toBe("noindex, nofollow");
  });

  test("every address answers with the noindex header", () => {
    expect(
      headersFile.startsWith("/*\n  X-Robots-Tag: noindex, nofollow\n")
    ).toBeTruthy();
  });

  test("the search engines may read the noindex; every other crawler stays out", () => {
    expect(robotsTxt).toContain("User-agent: Googlebot\n");
    expect(robotsTxt).toContain("Allow: /\n\nUser-agent: *\nDisallow: /\n");
    expect(robotsTxt).not.toContain("Sitemap");
  });
});
