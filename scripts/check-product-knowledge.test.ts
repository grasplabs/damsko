// The product knowledge check on one file at a time.
//   pnpm test scripts/check-product-knowledge.test.ts
import nodePath from "node:path";

import { describe, expect, test } from "vitest";

import { productKnowledge, readRules } from "./check-product-knowledge.ts";

const root = nodePath.join(import.meta.dirname, "..");
const rules = readRules(nodePath.join(root, "scripts/product-knowledge.json"));
const check = (text: string): string[] =>
  productKnowledge(root, "src/components/kbd.tsx", text, rules, [
    "react",
    "@ui-sdk/react",
  ]);

describe("the product knowledge check", () => {
  test("passes a part that knows nothing of the product", () => {
    expect(
      check(
        'import { useState } from "react";\nimport { Popover } from "@ui-sdk/react/popover";\nimport { focusRing } from "../lib/styles.ts";\n// Built for Grasp\'s apps, which is a comment.\nexport const label = "Press a key";\n'
      )
    ).toStrictEqual([]);
  });

  test("names Lingui, a router, the product's packages and imports from outside", () => {
    expect(
      check(
        'import { t } from "@lingui/core/macro";\nimport { Link } from "@tanstack/react-router";\nimport { x } from "@grasp-os/shared";\nimport y from "../../../work/apps/web/a.ts";\nimport z from "@grasp-os/ui/components/button";\n'
      )
    ).toStrictEqual([
      "src/components/kbd.tsx: imports @lingui/core/macro: Lingui: a primitive's words come from the I18nProvider",
      "src/components/kbd.tsx: imports @tanstack/react-router: a router: a link takes its href or a render prop",
      "src/components/kbd.tsx: imports @grasp-os/shared: the product's own packages",
      "src/components/kbd.tsx: imports ../../../work/apps/web/a.ts, outside the repository",
      "src/components/kbd.tsx: imports @grasp-os/ui/components/button: Damsko's own path, as a product imports it: imports inside src/ are relative",
    ]);
  });

  test("names product words, Grasp only where it is shown", () => {
    expect(
      check(
        "export const a = <p>Ask Grasp anything</p>;\nexport const b = 'Grasp';\n// Stephen reads the Brain after each workflow run, through Composio.\n"
      )
    ).toStrictEqual([
      'src/components/kbd.tsx: "Grasp" ×2: Grasp as a product name',
      'src/components/kbd.tsx: "Stephen" ×1: the product\'s agent',
      'src/components/kbd.tsx: "Brain" ×1: the Brain, a product noun',
      'src/components/kbd.tsx: "workflow run" ×1: workflow runs, product data',
      'src/components/kbd.tsx: "Composio" ×1: the product\'s connector service',
    ]);
  });
});
