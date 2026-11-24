// Markdown drawn as Streamdown draws it, by role (scripts/markdown-roles.ts): every entry of
// scripts/fixtures/markdown-parity.json, written from Streamdown by scripts/markdown-parity.ts.
//
//   pnpm exec vp test scripts/markdown-parity.test.tsx
import { fileURLToPath } from "node:url";

import type { Element } from "happy-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Markdown } from "../src/components/markdown/index.ts";
import { isRecord, readJson } from "./json.ts";
import { rolesOf } from "./markdown-roles.ts";

const here = (file: string) => fileURLToPath(new URL(file, import.meta.url));
const texts = (file: string, key: string, field: string) => {
  const value = readJson(here(file));
  const list = isRecord(value) ? value[key] : undefined;
  return new Map(
    (Array.isArray(list) ? list : []).flatMap((item: unknown) => {
      const text = isRecord(item) ? item[field] : undefined;
      const name = isRecord(item) ? String(item.example ?? item.name) : "";
      const joined = Array.isArray(text) ? text.join("\n") : text;
      return typeof joined === "string" ? [[name, joined] as const] : [];
    })
  );
};
const answers = texts("fixtures/markdown-answers.json", "answers", "lines");
const specs = new Map<string, string>([
  ...[...texts("fixtures/commonmark-spec.json", "examples", "markdown")].map(
    ([name, text]) => [`commonmark ${name}`, text] as const
  ),
  ...[...texts("fixtures/gfm-spec.json", "examples", "markdown")].map(
    ([name, text]) => [`gfm ${name}`, text] as const
  ),
]);
const fixture = readJson(here("fixtures/markdown-parity.json"));
const entries = (
  isRecord(fixture) && Array.isArray(fixture.entries) ? fixture.entries : []
).flatMap((entry: unknown) =>
  isRecord(entry) &&
  typeof entry.name === "string" &&
  typeof entry.at === "number" &&
  typeof entry.roles === "string"
    ? [{ name: entry.name, at: entry.at, roles: entry.roles }]
    : []
);

// The classes a cell takes for each side, read from a table Markdown draws.
const sides = (() => {
  const html = renderToStaticMarkup(
    <Markdown>{"| a | b | c |\n| :- | :-: | -: |\n| 1 | 2 | 3 |"}</Markdown>
  );
  const cells = [...html.matchAll(/<td[^>]*class="(?<classes>[^"]*)"/gu)].map(
    (found) => new Set((found.groups?.classes ?? "").split(" "))
  );
  const [
    start = new Set<string>(),
    centre = new Set<string>(),
    end = new Set<string>(),
  ] = cells;
  const only = (side: Set<string>) =>
    [...side].filter((name) => !start.has(name));
  return { c: only(centre), r: only(end) };
})();
const alignOf = (cell: Element) => {
  const classes = new Set(cell.className.split(" "));
  const has = (names: string[]) =>
    names.length > 0 && names.every((name) => classes.has(name));
  const side = has(sides.r) ? "r" : "";
  return has(sides.c) ? "c" : side;
};

// What Markdown deliberately draws otherwise than Streamdown, each with why (the PR description has
// the list): an entry may differ from Streamdown's only in one of these ways, and how many entries
// differ in each is held, so a new difference fails here.
const MARK_AT_END =
  /(?:\*\*|__|~~|[*_`]|^\s*p (?:\d+|[-=#<]+)|\[[^\]]*\]|\])(?: ↩)?$|[-=#<] ?$/u;
/** A line with each link drawn as its words. */
const unlinked = (line: string) =>
  line.replaceAll(/\[(?<words>[^\]]*)\]\([^)]*\)/gu, "$<words>");
const deliberate: [string, (streamdown: string, ours: string) => boolean][] = [
  // Raw HTML is never set as HTML (only `<details>` with its summary is read).
  ["raw HTML shown as text", (_, ours) => /<[a-z/!?]/iu.test(ours)],
  // A link of Markdown's own leads only where safeHref allows: Streamdown blocks some ours draws
  // (a path on this site) and draws some ours leaves as words (other schemes).
  [
    "addresses by safeHref",
    (streamdown) =>
      /\[blocked\]|Image blocked|\]\((?:irc|made-up|localhost|\/target)/u.test(
        streamdown
      ),
  ],
  // A picture is never loaded.
  [
    "pictures never loaded",
    (streamdown, ours) => streamdown.includes("![") && !ours.includes("!["),
  ],
  // While written, no address still being written is drawn: a half link, or a bare address in
  // the word still being written, is its words.
  [
    "addresses still being written are words",
    (streamdown, ours) =>
      streamdown.includes("streamdown:incomplete") ||
      (streamdown.includes("](") && unlinked(streamdown) === ours),
  ],
  // While written, a raw mark or a line's start that the next characters decide waits for them;
  // so does a definition, until its line is whole.
  [
    "raw marks wait",
    (streamdown, ours) =>
      MARK_AT_END.test(streamdown.trim()) ||
      /\[\^[\w-]+\]|^p \[[^\]]+\]: |^\s*ol$/mu.test(streamdown) ||
      /\[\^[\w-]+\]/u.test(ours),
  ],
  // A table's row draws the cells written, no empty ones after them (a wide head over many rows).
  [
    "no empty cells added",
    (streamdown) => /\| (?:[rc]:)? ?\|/u.test(streamdown),
  ],
  // `20~25°C` is a tilde: strike-through is two.
  [
    "one tilde is a tilde",
    (streamdown, ours) => streamdown.includes("~~") && !ours.includes("~~"),
  ],
  // While written, a table's head shows once its row of dashes has come, never as pipes.
  ["a table's head waits", (streamdown) => /^\s*p \|/mu.test(streamdown)],
  // A section shows once its summary line is whole; a list item once its words begin.
  [
    "a section and an item wait",
    (streamdown) => /^\s*(?:details|li)\b/mu.test(streamdown),
  ],
  // `- > 25` is a quote in an item, as CommonMark reads it, also while written.
  [
    "a quote in an item",
    (streamdown, ours) =>
      /^\s*p > /mu.test(streamdown) && ours.includes("quote"),
  ],
  // A note's mark in a link's words stays in them.
  [
    "a mark in a link",
    (streamdown) => /\]\(#user-content-fn-/u.test(streamdown),
  ],
];

/** The lines of `lines` that `other` lacks, as many times as it lacks them. */
const lacking = (lines: string[], other: string[]) => {
  const left = [...other];
  return lines
    .filter((line) => {
      const at = left.indexOf(line);
      if (at === -1) {
        return true;
      }
      left.splice(at, 1);
      return false;
    })
    .join("\n");
};
/** The lines of each that the other lacks. */
const differenceOf = (streamdown: string, ours: string) => {
  const a = streamdown.split("\n");
  const b = ours.split("\n");
  return [lacking(a, b), lacking(b, a)] as const;
};

describe("drawn as Streamdown draws it", () => {
  test("every sampled prefix of the sample answers and every spec example, by role", () => {
    const kinds: Record<string, number> = {};
    for (const { name, at, roles } of entries) {
      const spec = specs.has(name);
      const text = (spec ? specs.get(name) : answers.get(name)) ?? "";
      const streaming = !spec && at < text.length;
      const ours = rolesOf(
        renderToStaticMarkup(
          <Markdown streaming={streaming}>{text.slice(0, at)}</Markdown>
        ),
        alignOf
      );
      if (ours !== roles) {
        const [streamdown, mine] = differenceOf(roles, ours);
        const kind =
          deliberate.find(([, is]) => is(streamdown, mine))?.[0] ??
          `${name} @${at}: ${streamdown} | ${mine}`;
        kinds[kind] = (kinds[kind] ?? 0) + 1;
        if (process.env.SHOW === kind) {
          process.stderr.write(
            `S ${name} @${at}\n${streamdown}\n---\n${mine}\n\n`
          );
        }
      }
    }
    expect(kinds).toStrictEqual({
      "a mark in a link": 3,
      "a quote in an item": 4,
      "a section and an item wait": 4,
      "a table's head waits": 7,
      "addresses by safeHref": 51,
      "addresses still being written are words": 20,
      "no empty cells added": 20,
      "one tilde is a tilde": 2,
      "pictures never loaded": 17,
      "raw HTML shown as text": 82,
      "raw marks wait": 11,
    });
    expect(entries.length).toBeGreaterThan(1000);
  }, 600_000);
});
