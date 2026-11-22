// Data grid's spreadsheet rules, without a page: TSV read from the clipboard, where a pasted block
// lands, how the keys move the selection, and how undo and redo step through the edits.
//
//   pnpm test scripts/data-grid-model.test.ts
import { describe, expect, test } from "vitest";

import type { DataGridPatch } from "../src/components/data-grid/model.ts";
import {
  at,
  fromTsv,
  move,
  pasteTarget,
  record,
  stepHistory,
  toTsv,
} from "../src/components/data-grid/model.ts";

const extent = { rows: 6, cols: 4 };
const key = (name: string, held: { shift?: boolean; mod?: boolean } = {}) => ({
  key: name,
  shift: held.shift ?? false,
  mod: held.mod ?? false,
  rtl: false,
});

describe(fromTsv, () => {
  test.each([
    [
      "a\tb\nc\td",
      [
        ["a", "b"],
        ["c", "d"],
      ],
    ],
    ["a\tb\n", [["a", "b"]]],
    ["a\r\nb", [["a"], ["b"]]],
    ['"a\tb"\t"say ""hi"""', [["a\tb", 'say "hi"']]],
    ['"two\nlines"\tx', [["two\nlines", "x"]]],
    ["a\t\tc", [["a", "", "c"]]],
    ["a\t", [["a", ""]]],
    ["", []],
  ])("%j reads as %j", (text, block) => {
    expect(fromTsv(text)).toStrictEqual(block);
  });

  test("reads back what toTsv writes", () => {
    const block = [
      ["a\tb", 'say "hi"'],
      ["two\nlines", ""],
    ];
    expect(fromTsv(toTsv(block))).toStrictEqual(block);
  });
});

describe(pasteTarget, () => {
  test("a block lands at the active cell at its own size, cut at the grid's edge", () => {
    const target = pasteTarget(
      [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ],
      at({ row: 5, col: 2 }),
      extent
    );
    expect(target.rect).toStrictEqual({ top: 5, left: 2, bottom: 5, right: 3 });
    expect(target.value(5, 3)).toBe("b");
  });

  test("one value fills a range, and a block that divides a range tiles it", () => {
    const range = { anchor: { row: 0, col: 0 }, active: { row: 3, col: 1 } };
    const one = pasteTarget([["x"]], range, extent);
    expect(one.rect).toStrictEqual({ top: 0, left: 0, bottom: 3, right: 1 });
    expect(one.value(3, 1)).toBe("x");
    const tiles = pasteTarget([["a"], ["b"]], range, extent);
    expect([
      tiles.value(0, 0),
      tiles.value(1, 1),
      tiles.value(2, 0),
    ]).toStrictEqual(["a", "b", "a"]);
  });

  test("a block that does not divide a range lands at its corner", () => {
    const range = { anchor: { row: 0, col: 0 }, active: { row: 2, col: 0 } };
    expect(pasteTarget([["a"], ["b"]], range, extent).rect).toStrictEqual({
      top: 0,
      left: 0,
      bottom: 1,
      right: 0,
    });
  });

  test("takes a very large paste", () => {
    const block = Array.from({ length: 200_000 }, () => ["x"]);
    expect(
      pasteTarget(block, at({ row: 0, col: 0 }), { rows: 200_000, cols: 1 })
        .rect.bottom
    ).toBe(199_999);
  });
});

describe(move, () => {
  const from = at({ row: 2, col: 1 });

  test.each([
    ["ArrowDown", {}, { row: 3, col: 1 }],
    ["ArrowUp", {}, { row: 1, col: 1 }],
    ["ArrowRight", {}, { row: 2, col: 2 }],
    ["ArrowLeft", {}, { row: 2, col: 0 }],
    ["ArrowDown", { mod: true }, { row: 5, col: 1 }],
    ["Home", {}, { row: 2, col: 0 }],
    ["End", { mod: true }, { row: 5, col: 3 }],
    ["PageDown", {}, { row: 5, col: 1 }],
    ["PageUp", {}, { row: 0, col: 1 }],
    ["Enter", {}, { row: 3, col: 1 }],
    ["Enter", { shift: true }, { row: 1, col: 1 }],
    ["Tab", {}, { row: 2, col: 2 }],
  ])("%s %j goes to %j", (name, held, cell) => {
    expect(move(from, extent, key(name, held))).toStrictEqual(at(cell));
  });

  test("Tab wraps to the next row's start, and stops at the grid's last cell", () => {
    expect(move(at({ row: 0, col: 3 }), extent, key("Tab"))).toStrictEqual(
      at({ row: 1, col: 0 })
    );
    expect(move(at({ row: 5, col: 3 }), extent, key("Tab"))).toStrictEqual(
      at({ row: 5, col: 3 })
    );
  });

  test("Shift grows the range from its anchor", () => {
    expect(
      move(from, extent, key("ArrowRight", { shift: true }))
    ).toStrictEqual({ anchor: { row: 2, col: 1 }, active: { row: 2, col: 2 } });
  });

  test("right to left, the arrows swap sides", () => {
    expect(
      move(from, extent, { ...key("ArrowLeft"), rtl: true })
    ).toStrictEqual(at({ row: 2, col: 2 }));
  });

  test("a key that is not a move, or an empty grid, moves nothing", () => {
    expect(move(from, extent, key("a"))).toBeNull();
    expect(move(from, { rows: 0, cols: 4 }, key("ArrowDown"))).toBeNull();
  });
});

const edit = (from: string, to: string): DataGridPatch => ({
  kind: "edit",
  changes: [{ rowId: "r1", columnId: "name", from, to }],
});

describe(stepHistory, () => {
  test("undo gives the patch that takes the last edit back; redo puts it back", () => {
    const history = record(
      record({ done: [], undone: [] }, edit("a", "b")),
      edit("b", "c")
    );
    const undone = stepHistory(history, true);
    expect(undone?.patch).toStrictEqual(edit("c", "b"));
    const redone = undone && stepHistory(undone.state, false);
    expect(redone?.patch).toStrictEqual(edit("b", "c"));
    expect(redone?.state).toStrictEqual(history);
  });

  test("there is nothing to undo or redo at first, and a new edit drops what could be redone", () => {
    expect(stepHistory({ done: [], undone: [] }, true)).toBeNull();
    expect(stepHistory({ done: [], undone: [] }, false)).toBeNull();
    const undone = stepHistory(
      record({ done: [], undone: [] }, edit("a", "b")),
      true
    );
    expect(undone && record(undone.state, edit("a", "z")).undone).toStrictEqual(
      []
    );
  });
});
