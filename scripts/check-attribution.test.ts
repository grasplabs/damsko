// What counts as crediting an AI tool or a bot in a commit or a pull request
// (scripts/check-attribution.ts), which the commit-msg hook and CI both run.
//
//   pnpm test scripts/check-attribution.test.ts
import { describe, expect, test } from "vitest";

import { findAiAttribution } from "./check-attribution.ts";

describe(findAiAttribution, () => {
  test.each([
    "Co-authored-by: capy-ai[bot] <230910855+capy-ai[bot]@users.noreply.github.com>",
    "Co-authored-by: Capy <agent@capy.ai>",
    "Co-authored-by: Claude <noreply@anthropic.com>",
    "Co-authored-by: copilot-swe-agent[bot] <198982749+Copilot@users.noreply.github.com>",
    "Co-authored-by: Cursor Agent <cursoragent@cursor.com>",
    "Co-authored-by: some-new-agent[bot] <1+some-new-agent[bot]@users.noreply.github.com>",
    "co-authored-by: capy-ai[bot] <230910855+capy-ai[bot]@users.noreply.github.com> 1794491466 +0100",
    "🤖 Generated with [Claude Code](https://claude.com/claude-code)",
    "https://claude.ai/code/session_01AbC",
  ])("refuses %s", (line) => {
    expect(findAiAttribution(`fix: a thing\n\n${line}\n`)).toStrictEqual([
      { line: 3, text: line },
    ]);
  });

  test.each([
    "Co-authored-by: Ruben Altena <ruben@joingrasp.com>",
    "Co-authored-by: Nick <12345+nick@users.noreply.github.com>",
    "Co-authored-by: GitHub <noreply@github.com>",
    "Co-authored-by: renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>",
    "Co-authored-by: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>",
    "The capybara example keeps its name.",
    'Remove the "Generated with Claude Code" footer from the template.',
  ])("lets %s through", (line) => {
    expect(findAiAttribution(`fix: a thing\n\n${line}\n`)).toStrictEqual([]);
  });
});
