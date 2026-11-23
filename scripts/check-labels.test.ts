// The labels gate on one file at a time, and on the tree.
//   pnpm test scripts/check-labels.test.ts
import { describe, expect, test } from "vitest";

import { labelsIn, labelsInTree, problems } from "./check-labels.ts";

const file = "src/components/fixture.tsx";

describe("the labels gate", () => {
  test("keys an item's field apart from the props round it, so a list's label hides no prop", () => {
    expect(
      labelsIn(
        file,
        "export interface EffortProps {\n  label?: string;\n  levels: readonly { id: string; label: string }[];\n}\n"
      )
    ).toStrictEqual([
      `${file}#EffortProps.label`,
      `${file}#EffortProps.levels[].label`,
    ]);
  });

  test("reads the props an exported function writes inline", () => {
    expect(
      labelsIn(
        file,
        "export const Chip = ({ label }: { label: string }) => <span>{label}</span>;\nexport function Tag(props: { errorLabel?: string }) {\n  return null;\n}\n"
      )
    ).toStrictEqual([`${file}#Chip.label`, `${file}#Tag.errorLabel`]);
  });

  test("finds `labels`, and leaves a switch that shows labels alone", () => {
    expect(
      labelsIn(
        file,
        "export interface ListProps {\n  labels?: Partial<Record<string, string>>;\n  thumbLabels?: string[];\n  showLabels?: boolean;\n}\n"
      )
    ).toStrictEqual([
      `${file}#ListProps.labels`,
      `${file}#ListProps.thumbLabels`,
    ]);
  });

  test("leaves what a function does inside its body alone", () => {
    expect(
      labelsIn(
        file,
        "export const Row = () => {\n  const item: { label: string } = { label: 'A' };\n  return item.label;\n};\n"
      )
    ).toStrictEqual([]);
  });

  test("reads the hooks as well as the components and the blocks", () => {
    const found = labelsInTree();
    expect(found).toContain("src/hooks/use-action.ts#Action.label");
    expect(found).toContain(
      "src/components/model-selector.tsx#ModelSelectorEffortProps.levels[].label"
    );
  });

  test("fails a prop not listed, a listed one gone, and a reason that is none", () => {
    expect(
      problems(
        new Set([`${file}#ChipProps.label`, `${file}#ChipProps.items[].label`]),
        new Map([
          [`${file}#ChipProps.items[].label`, "because"],
          [`${file}#GoneProps.label`, "data"],
        ])
      ).map((failure) => failure.split(":")[0])
    ).toStrictEqual([
      `${file}#ChipProps.label`,
      `${file}#ChipProps.items[].label`,
      `${file}#GoneProps.label`,
    ]);
  });
});
