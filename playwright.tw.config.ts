// The Tailwind experiment: the components' own specs, pointed at the Tailwind copies of their
// examples (examples/<component>-tw), against a build that holds them.
import config from "./playwright.config.ts";

export default {
  ...config,
  testDir: "tests-tw",
  globalSetup: "./tests/setup.ts",
};
