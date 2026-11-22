// A figure typed or pasted into Data grid is read strictly in the grid's locale: "1.234,50" in
// German is 1234.5, and what is not a figure there ("1,234.50" in German, "1/2") is refused, as an
// invalid edit, never read as some other figure. Figures are copied in the locale too, so they
// read back; words that start like a formula are copied as text. Pure, so tested without a page.
//
//   pnpm test scripts/data-grid-values.test.ts
import { describe, expect, test } from "vitest";

import type { DataGridColumn } from "../src/components/data-grid/model.ts";
import {
  copiedOf,
  plainOf,
  valueFrom,
} from "../src/components/data-grid/model.ts";

const figures: DataGridColumn<{ amount: number }> = {
  key: "amount",
  header: "Amount",
  type: "number",
  value: (row) => row.amount,
};
const words: DataGridColumn<{ name: string }> = {
  key: "name",
  header: "Name",
  type: "text",
  value: (row) => row.name,
};

describe("a figure typed into Data grid", () => {
  test.each([
    ["1,234.50", "en", 1234.5],
    ["1234.5", "en", 1234.5],
    ["1.5", "en", 1.5],
    ["€ 12", "en", 12],
    ["-3", "en", -3],
    ["", "en", null],
    ["1.234,50", "de", 1234.5],
    ["1,5", "de", 1.5],
    ["1 234,5 €", "de", 1234.5],
    // French groups by a narrow space.
    ["1 234,5", "fr", 1234.5],
  ])("%j in %s reads as %j", (typed, locale, expected) => {
    expect(valueFrom(figures, typed, locale)).toBe(expected);
  });

  test.each([
    ["abc", "en"],
    ["1/2", "en"],
    ["12,34", "en"],
    ["1 2", "en"],
    ["1,234.50", "de"],
    ["1e5", "en"],
  ])("%j in %s is not a figure", (typed, locale) => {
    expect(valueFrom(figures, typed, locale)).toBeUndefined();
  });

  test.each([
    [1234.5, "en"],
    [1234.5, "de"],
    [1.234, "de"],
    [-0.5, "fr"],
  ])("%j is copied in %s so it reads back", (value, locale) => {
    expect(valueFrom(figures, plainOf(value, locale), locale)).toBe(value);
  });
});

describe("a cell copied from Data grid", () => {
  test("keeps words that start like a formula as text, and they paste back as they were", () => {
    for (const formula of ["=SUM(A1)", "+1", "-2+3", "@here"]) {
      const copied = copiedOf(formula, "en");
      expect(copied).toBe(`'${formula}`);
      expect(valueFrom(words, copied, "en")).toBe(formula);
    }
  });

  test("leaves figures and plain words alone", () => {
    expect(copiedOf(-3, "en")).toBe("-3");
    expect(copiedOf("Ada", "en")).toBe("Ada");
    expect(copiedOf(true, "en")).toBe("TRUE");
  });
});
