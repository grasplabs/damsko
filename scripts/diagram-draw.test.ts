// A `mermaid` fence drawn by Pele (src/components/markdown/diagram.tsx), through drawDiagram: every
// diagram type is drawn; a fence the source check refuses, one past a limit, or one Pele cannot
// read is its code and says why, front matter that does not read too; and with the check off,
// what Pele draws still holds no link, picture or address.
//
//   pnpm exec vp test scripts/diagram-draw.test.ts
import { Window } from "happy-dom";
import { describe, expect, test } from "vitest";

import { types } from "../examples/markdown/diagram-sources.ts";
import { fences } from "../examples/markdown/diagram-unchecked.tsx";
import { drawDiagram } from "../src/components/markdown/diagram.tsx";

const window = new Window();
for (const name of ["DOMParser", "XMLSerializer"]) {
  Reflect.set(globalThis, name, Reflect.get(window, name));
}

/** Forty nodes joined by `&`: `a0 & a1 & … & a39`. */
const run = (name: string) =>
  Array.from({ length: 40 }, (_, at) => `${name}${at}`).join(" & ");

describe(drawDiagram, () => {
  test.each(types)("draws a %s", async (_, code) => {
    const drawing = await drawDiagram(code, "diagram-1");
    expect(drawing).toHaveProperty("svg");
  });

  test("says why a fence is its code: past a bound, a way to an address, or words Pele cannot read", async () => {
    await expect(
      drawDiagram(`flowchart TD${"\n  A --> B".repeat(41)}`, "d")
    ).resolves.toStrictEqual({ reason: "skipped:limit" });
    await expect(
      drawDiagram("flowchart LR\n  A --> B\n  style A fill:url(//x)", "d")
    ).resolves.toStrictEqual({ reason: "skipped:source" });
    await expect(
      drawDiagram("flowchart LR\n  A --> -->", "d")
    ).resolves.toStrictEqual({
      reason: "failed:syntax",
    });
    await expect(drawDiagram("not a diagram", "d")).resolves.toStrictEqual({
      reason: "failed:syntax",
    });
  });

  test.each([
    '---\ntitle: "Order flow\n---\nflowchart LR\n  A --> B',
    "---\nconfig: [\n---\nflowchart LR\n  A --> B",
  ])(
    "front matter that does not read is a reason, never a throw: %j",
    async (code) => {
      await expect(drawDiagram(code, "d")).resolves.toStrictEqual({
        reason: "failed:syntax",
      });
    }
  );

  test("a fence that fans out or asks for a huge drawing is too large: refused by its parts, else stopped by Pele's own limits", async () => {
    const fan = `flowchart LR\n  ${run("a")} --"${"lbl ".repeat(55).trim()}"--> ${run("b")}`;
    await expect(drawDiagram(fan, "d")).resolves.toStrictEqual({
      reason: "skipped:limit",
    });
    await expect(
      drawDiagram(fan, "d", { check: false })
    ).resolves.toStrictEqual({
      reason: "skipped:limit",
    });
    await expect(
      drawDiagram('packet-beta\n0-999999999: "x"', "d")
    ).resolves.toStrictEqual({ reason: "skipped:limit" });
  });

  test("with the source check off, a drawing holds no link, picture or address but its own", async () => {
    const drawings = await Promise.all(
      fences.map(
        async (code, at) =>
          await drawDiagram(code, `unchecked-${at}`, { check: false })
      )
    );
    const roots = drawings.flatMap((drawing) =>
      "svg" in drawing ? [drawing.svg] : []
    );
    expect(roots).toHaveLength(fences.length);
    for (const root of roots) {
      const elements = [root, ...root.querySelectorAll("*")];
      expect(
        elements.filter((element) =>
          /^(?:a|image|img|foreignObject|script)$/iu.test(element.localName)
        )
      ).toStrictEqual([]);
      // Every attribute but the namespaces: no address, no `url()` but the drawing's own.
      const values = elements.flatMap((element) =>
        element
          .getAttributeNames()
          .filter((name) => !name.startsWith("xmlns"))
          .map((name) => element.getAttribute(name) ?? "")
      );
      expect(
        values.filter((value) => /\/\/|url\(\s*(?!['"]?#)/iu.test(value))
      ).toStrictEqual([]);
    }
  });
});
