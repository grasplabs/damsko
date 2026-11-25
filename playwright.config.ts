// The browser specs (tests/*.spec.ts): Playwright Test against the built
// site, served by tests/setup.ts. Build once, then run them:
//
//   vp run build && vp run test:browser             Chromium, every spec
//   vp run test:browser tests/button.spec.ts        one spec
//   vp exec playwright test --project=firefox --project=webkit
//                                                   the other engines (nightly in CI)
import { defineConfig, devices } from "@playwright/test";

const ci = process.env.CI === "true";

export default defineConfig({
  testDir: "tests",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/setup.ts",
  forbidOnly: ci,
  // One retry in CI, for its trace; a test that passes only on the retry
  // still fails the run: flaky is a fault, never retried away.
  retries: ci ? 1 : 0,
  failOnFlakyTests: ci,
  reporter: ci ? "github" : "list",
  use: {
    locale: "en-GB",
    timezoneId: "UTC",
    reducedMotion: "reduce",
    trace: "on-first-retry",
  },
  // A spec that cannot run in an engine is left out of that engine's project
  // here, with the reason, never skipped inside the spec: the first visit is
  // read and a page pinch-zoomed through Chromium's protocol, Firefox has no
  // phone mode, and WebKit's wheel is not a person's.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: ["first-visit.spec.ts", "touch-targets.spec.ts"],
      grepInvert: /under a pinch zoom/u,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: "first-visit.spec.ts",
      grepInvert: /: a wheel reaches the end$|under a pinch zoom/u,
    },
  ],
});
