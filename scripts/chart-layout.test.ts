// The chart's layout sums (src/components/chart-math.ts): pure, so tested here without a page.
//
//   pnpm test scripts/chart-layout.test.ts
import { describe, expect, test } from "vitest";

import {
  arcPath,
  arcsOf,
  barPath,
  barTooltipLeft,
  columnsOf,
  crossings,
  ditherEdges,
  extentOf,
  layoutSankey,
  linePath,
  markOf,
  nearestOf,
  orderRows,
  pathThrough,
  restOf,
  ribbonPath,
  spanOf,
  sparkShape,
  spread,
  tooltipTop,
  valueOf,
} from "../src/components/chart-math.ts";
import { DITHER_LEVELS } from "../src/lib/utils.ts";

/** The value, or a failed test when there is none. */
const must = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error("expected a value");
  }
  return value;
};

describe("bar list", () => {
  const rows = [
    { name: "b", v: 20 },
    { name: "a", v: 50 },
    { name: "c", v: -10 },
  ];

  test("largest first, or as given, never changing the data", () => {
    expect(
      orderRows(rows, "v", "descending").map((row) => row.name)
    ).toStrictEqual(["a", "b", "c"]);
    expect(orderRows(rows, "v", "none").map((row) => row.name)).toStrictEqual([
      "b",
      "a",
      "c",
    ]);
    expect(rows.map((row) => row.name)).toStrictEqual(["b", "a", "c"]);
  });

  test("zero is always inside the extent", () => {
    expect(extentOf([{ v: 5 }, { v: 9 }], ["v"])).toStrictEqual({
      min: 0,
      max: 9,
    });
    expect(extentOf(rows, ["v"])).toStrictEqual({ min: -10, max: 50 });
  });

  test("a value that is not a number is nothing", () => {
    expect(valueOf({ v: "x" }, "v")).toBe(0);
    expect(valueOf({}, "v")).toBe(0);
  });

  test("spans start at zero and run either way", () => {
    const extent = { min: -10, max: 50 };
    expect(spanOf(50, extent, 600)).toStrictEqual({
      x: 100,
      width: 500,
      zero: 100,
      rightward: true,
    });
    expect(spanOf(-10, extent, 600)).toStrictEqual({
      x: 0,
      width: 100,
      zero: 100,
      rightward: false,
    });
    expect(spanOf(5, { min: 0, max: 0 }, 600).width).toBe(0);
  });

  test("a bar's corner never exceeds half its thickness or its length", () => {
    expect(
      barPath({ x: 0, width: 1, zero: 0, rightward: true }, 0, 10, 4)
    ).toContain("A1,1");
    expect(
      barPath({ x: 0, width: 100, zero: 0, rightward: true }, 0, 6, 4)
    ).toContain("A3,3");
  });
});

describe("dither edges", () => {
  test("from the value to the floor, either way round, on the pitch inside", () => {
    const down = ditherEdges(10, 90, 2);
    expect(down).toHaveLength(DITHER_LEVELS + 1);
    expect(down[0]).toBe(10);
    expect(down.at(-1)).toBe(90);
    expect(down.slice(1, -1).every((edge) => edge % 2 === 0)).toBeTruthy();
  });

  test("the other way round, from the floor to the value", () => {
    const left = ditherEdges(300, 0, 3);
    expect(left[0]).toBe(300);
    expect(left.at(-1)).toBe(0);
    expect(
      left.every(
        (edge, index) => index === 0 || edge <= (left[index - 1] ?? Infinity)
      )
    ).toBeTruthy();
  });
});

describe("names spread apart", () => {
  test("names that do not touch stay where they want", () => {
    expect(spread([10, 50, 90], 18, 0, 200)).toStrictEqual([10, 50, 90]);
  });

  test("names that would touch are pushed apart, in order, in the given order back", () => {
    const placed = spread([100, 90, 95], 18, 0, 200);
    const sorted = placed.toSorted((a, b) => a - b);
    expect(must(sorted[1]) - must(sorted[0])).toBeGreaterThanOrEqual(18);
    expect(must(sorted[2]) - must(sorted[1])).toBeGreaterThanOrEqual(18);
    expect(placed[1]).toBeLessThan(must(placed[2]));
    expect(placed[2]).toBeLessThan(must(placed[0]));
  });

  test("names at the floor step up inside the room", () => {
    const placed = spread([200, 200], 18, 0, 200);
    expect(Math.max(...placed)).toBe(200);
    expect(Math.min(...placed)).toBe(182);
  });

  test("too many for the room share it from the start", () => {
    expect(spread([5, 5, 5], 18, 0, 20)).toStrictEqual([0, 18, 36]);
  });
});

describe("the tooltip's place", () => {
  const plot = { x: 40, y: 10, width: 400, height: 200 };

  test("above the highest mark when there is room, else below the lowest, a gap clear", () => {
    expect(tooltipTop([150, 180], plot, 60, 16)).toBe(74);
    expect(tooltipTop([40, 60], plot, 60, 16)).toBe(76);
  });

  test("with no room clear of the marks, the taller side, inside the plot", () => {
    const top = tooltipTop([60, 150], plot, 120, 16) ?? 0;
    expect(top).toBeGreaterThanOrEqual(10);
    expect(top + 120).toBeLessThanOrEqual(210);
  });

  test("over bars: centred above, or beside the band on the side with room", () => {
    expect(barTooltipLeft(200, 60, 100, plot, 16, true)).toBe(150);
    expect(barTooltipLeft(200, 60, 100, plot, 16, false)).toBe(246);
    expect(barTooltipLeft(420, 60, 100, plot, 16, false)).toBe(274);
  });
});

describe("ring", () => {
  test("arcs share the turn in order, a gap between each, starting at twelve", () => {
    const arcs = arcsOf([2, 1, 1], 0.1);
    expect(arcs.map((arc) => arc.share)).toStrictEqual([0.5, 0.25, 0.25]);
    expect(must(arcs[0]).from).toBeCloseTo(0.05);
    expect(must(arcs[0]).to).toBeCloseTo(Math.PI - 0.05);
    expect(must(arcs[1]).from - must(arcs[0]).to).toBeCloseTo(0.1);
  });

  test("one share of a larger whole leaves an empty track after it", () => {
    const arcs = arcsOf([62], 0.1, 100);
    expect(must(arcs[0]).share).toBeCloseTo(0.62);
    const rest = restOf(arcs, 0.1);
    expect(rest).not.toBeNull();
    expect(must(rest).to).toBeCloseTo(Math.PI * 2 - 0.05);
  });

  test("a whole turn is drawn, not lost to an arc that starts where it ends", () => {
    expect(arcPath(100, 100, 90, 70, 0, Math.PI * 2)).toContain("A90,90");
    expect(arcPath(100, 100, 90, 70, 1, 1)).toBe("");
  });
});

describe("sankey", () => {
  const nodes = [
    { id: "received", label: "Received" },
    { id: "auto", label: "Matched automatically" },
    { id: "person", label: "Needs a person" },
    { id: "approved", label: "Approved" },
    { id: "disputed", label: "Disputed", muted: true },
    { id: "paid", label: "Paid" },
    { id: "waiting", label: "Waiting", muted: true },
  ];
  const links = [
    { source: "received", target: "person", value: 405 },
    { source: "received", target: "auto", value: 812 },
    { source: "auto", target: "disputed", value: 14 },
    { source: "auto", target: "approved", value: 798 },
    { source: "person", target: "disputed", value: 47 },
    { source: "person", target: "approved", value: 358 },
    { source: "approved", target: "waiting", value: 135 },
    { source: "approved", target: "paid", value: 1021 },
  ];
  const box = {
    left: 100,
    right: 700,
    top: 0,
    bottom: 360,
    nodeWidth: 12,
    padding: 40,
  };

  test("columns by the longest path, an end where it is reached", () => {
    const columns = columnsOf(nodes, links);
    expect(columns.get("received")).toBe(0);
    expect(columns.get("approved")).toBe(2);
    expect(columns.get("disputed")).toBe(2);
    expect(columns.get("paid")).toBe(3);
  });

  test("a node is as tall as what passes through it, every column fits the box", () => {
    const layout = layoutSankey(nodes, links, box);
    const received = must(layout.nodes.find((node) => node.id === "received"));
    const approved = must(layout.nodes.find((node) => node.id === "approved"));
    expect(received.value).toBe(1217);
    expect(approved.value).toBe(1156);
    expect(approved.height / received.height).toBeCloseTo(1156 / 1217);
    for (const node of layout.nodes) {
      expect(node.y).toBeGreaterThanOrEqual(-0.01);
      expect(node.y + node.height).toBeLessThanOrEqual(360.01);
    }
  });

  test("nodes in a column never overlap and keep their padding", () => {
    const layout = layoutSankey(nodes, links, box);
    for (const column of [0, 1, 2, 3]) {
      const stacked = layout.nodes
        .filter((node) => node.column === column)
        .toSorted((a, b) => a.y - b.y);
      const gaps = stacked
        .slice(1)
        .map(
          (next, index) =>
            next.y - (must(stacked[index]).y + must(stacked[index]).height)
        );
      for (const gap of gaps) {
        expect(gap).toBeGreaterThanOrEqual(39.99);
      }
    }
  });

  test("ordering leaves only the one crossing these flows force, the thinner pair", () => {
    const layout = layoutSankey(nodes, links, box);
    const rank = new Map(layout.nodes.map((node) => [node.id, node.y]));
    const column = new Map(layout.nodes.map((node) => [node.id, node.column]));
    expect(crossings(layout.links, rank, column)).toBe(1);
    // Disputed stands under approved, so the thin flow crosses, not the 798.
    expect(must(rank.get("disputed"))).toBeGreaterThan(
      must(rank.get("approved"))
    );
  });

  test("links leave and reach their nodes in the order of their far ends, filling each node exactly", () => {
    const layout = layoutSankey(nodes, links, box);
    const received = must(layout.nodes.find((node) => node.id === "received"));
    const out = layout.links
      .filter((link) => link.source === "received")
      .toSorted((a, b) => a.sy - b.sy);
    expect(must(out[0]).sy).toBeCloseTo(received.y);
    expect(must(out.at(-1)).sy + must(out.at(-1)).width).toBeCloseTo(
      received.y + received.height
    );
    const targets = out.map(
      (link) => must(layout.nodes.find((node) => node.id === link.target)).y
    );
    expect(targets).toStrictEqual(targets.toSorted((a, b) => a - b));
  });

  test("a ribbon keeps its thickness at both ends", () => {
    const path = ribbonPath({
      source: "a",
      target: "b",
      value: 1,
      index: 0,
      sy: 10,
      ty: 50,
      width: 20,
      x0: 0,
      x1: 100,
    });
    expect(path).toBe("M0,10C50,10 50,50 100,50L100,70C50,70 50,30 0,30Z");
  });

  test("the path through a flow: all that flows into its source and on from its target", () => {
    const lit = pathThrough(links, { source: "auto", target: "approved" });
    const named = [...lit]
      .map(
        (index) => `${must(links[index]).source}-${must(links[index]).target}`
      )
      .toSorted();
    expect(named).toStrictEqual([
      "approved-paid",
      "approved-waiting",
      "auto-approved",
      "received-auto",
    ]);
  });
});

describe("spark", () => {
  test("highest at the top, lowest at the bottom, inside the padding", () => {
    const shape = sparkShape([0, 10, 5], 20, 3);
    expect(shape.points.map((point) => point.y)).toStrictEqual([17, 3, 10]);
    expect(shape.points.map((point) => point.x)).toStrictEqual([0, 50, 100]);
  });

  test("flat and one point draw a straight line across the middle, never an error", () => {
    expect(
      new Set(sparkShape([8, 8, 8], 20, 3).points.map((point) => point.y))
    ).toStrictEqual(new Set([10]));
    expect(sparkShape([7], 20, 3).points).toStrictEqual([
      { x: 0, y: 10 },
      { x: 100, y: 10 },
    ]);
    expect(sparkShape([], 20, 3).points).toStrictEqual([]);
    expect(linePath(sparkShape([], 20, 3).points)).toBe("");
  });

  test("an area fills to the drawing's foot under every segment, fading from the highest point", () => {
    const shape = sparkShape([5, 1, 9], 44, 5);
    expect(shape.floor).toBe(44);
    expect(shape.top).toBe(5);
    expect(sparkShape([-2, 1, 3], 44, 5).floor).toBe(44);
  });

  test("a wobble of a few per cent stays nearly flat", () => {
    const ys = sparkShape([31, 32, 31, 32], 20, 3).points.map(
      (point) => point.y
    );
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(4);
  });

  test("a zero line only when the series crosses zero, on a whole pixel and a half", () => {
    expect(sparkShape([1, 2, 3], 20, 3).zero).toBeNull();
    const { zero } = sparkShape([-2, 1, 3], 20, 3);
    expect(zero).not.toBeNull();
    expect((zero ?? 0) % 1).toBe(0.5);
  });

  test("one mark: the last, the lowest or the highest, the first of equals", () => {
    expect(markOf([3, 1, 4, 1], "last")).toBe(3);
    expect(markOf([3, 1, 4, 1], "min")).toBe(1);
    expect(markOf([3, 1, 4, 1], "max")).toBe(2);
    expect(markOf([3, 1], "none")).toBeNull();
  });

  test("the nearest point to a place along the line", () => {
    expect(nearestOf(12, 0.5)).toBe(6);
    expect(nearestOf(1, 0.9)).toBe(0);
  });
});
