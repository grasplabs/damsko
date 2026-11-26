// Audit B4: words a person typed that start like a formula are exported as text, so a spreadsheet
// opening the CSV does not run them. Figures, numbers or words written as one, stay figures. The file starts with UTF-8's byte-order
// mark, so Excel reads its letters right. A TSV copy (a Markdown table's) keeps them text alike.
//
//   pnpm test scripts/data-table-csv.test.ts
import { describe, expect, test } from "vitest";

import { toCsv } from "../src/components/data-table/features.ts";
import { tsvOf } from "../src/lib/utils.ts";

describe("a CSV export", () => {
  test("writes a cell that starts like a formula as text", () => {
    const csv = toCsv(
      ["Name"],
      [['=HYPERLINK("http://x")'], ["+1+1"], ["-2+3"], ["@SUM(A1)"], ["\tTAB"]]
    );
    const lines = csv.split("\r\n").slice(1);
    expect(lines).toStrictEqual([
      '"\'=HYPERLINK(""http://x"")"',
      "'+1+1",
      "'-2+3",
      "'@SUM(A1)",
      "'\tTAB",
    ]);
  });

  test("leaves figures and plain words unchanged", () => {
    expect(
      toCsv(
        ["A", "B"],
        [
          [-3, "Ada"],
          [1.5, "a, b"],
          ["-12", "+3.5%"],
          ["+1", "1,200"],
        ]
      )
    ).toBe('\uFEFFA,B\r\n-3,Ada\r\n1.5,"a, b"\r\n-12,+3.5%\r\n+1,"1,200"');
  });

  test("starts with UTF-8's byte-order mark, so a spreadsheet reads letters past ASCII", () => {
    const bytes = new TextEncoder().encode(
      toCsv(["Name"], [["Zoë"], ["東京"]])
    );
    expect(bytes.slice(0, 3)).toStrictEqual(new Uint8Array([0xef, 0xbb, 0xbf]));
    expect(new TextDecoder().decode(bytes)).toBe("Name\r\nZoë\r\n東京");
  });
});

describe("a TSV copy", () => {
  test("keeps a cell that starts like a formula text, and figures and tabs as they are", () => {
    expect(
      tsvOf([
        ["Name", "Change"],
        ["=SUM(A1)", "-12"],
        ["@here", "+3.5%"],
        ["a\tb", "1,200"],
      ])
    ).toBe("Name\tChange\n'=SUM(A1)\t-12\n'@here\t+3.5%\na\\tb\t1,200");
  });
});
