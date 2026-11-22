// What Tool shows as code (src/components/tool-code.ts): a value JSON cannot hold falls back to
// text instead of breaking the page.
import { describe, expect, test } from "vitest";

import { codeOf } from "../src/components/tool-code.ts";

describe("a tool call's value as code", () => {
  test("text stays as it is, anything else is JSON", () => {
    expect(codeOf("SELECT 1")).toBe("SELECT 1");
    expect(codeOf({ query: "weather" })).toBe('{\n  "query": "weather"\n}');
  });

  test("a BigInt or a value that holds itself falls back to text", () => {
    expect(codeOf(12n)).toBe("12");
    const loop: Record<string, unknown> = {};
    loop.self = loop;
    expect(codeOf(loop)).toBe("[object Object]");
  });

  test("a value JSON leaves out is said as text", () => {
    expect(codeOf(Symbol.iterator)).toBe("Symbol(Symbol.iterator)");
  });
});
