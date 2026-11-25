// Writes scripts/fixtures/markdown-parity.json: what Streamdown draws, by role
// (scripts/markdown-roles.ts), for our sample answers at a sample of their prefixes while they
// stream and whole, and for every CommonMark and GFM example whole. scripts/markdown-parity.test.tsx
// holds Markdown to it, without Streamdown. Streamdown is no dependency of this repository: install
// the version below in a folder of its own and point STREAMDOWN_DIR at it, then run this.
//
//   mkdir /tmp/sd && cd /tmp/sd && npm init -y && npm install streamdown@2.8.1 react@19.3.1 react-dom@19.3.1
//   STREAMDOWN_DIR=/tmp/sd node scripts/markdown-parity.ts
//
// While streaming, Streamdown is drawn as a chat draws it (`mode="streaming"`, `isAnimating`, its
// remend repair), with its link prompt off so a link shows its address; whole, as a finished
// document (`mode="static"`), so the specs' examples read as CommonMark has them.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import type * as React from "react";
import type * as ReactServer from "react-dom/server";

import { isRecord, readJson } from "./json.ts";
import { rolesOf } from "./markdown-roles.ts";

export const STREAMDOWN = "2.8.1";
const here = (file: string) => fileURLToPath(new URL(file, import.meta.url));
const lines = (file: string, key: string, field: string) => {
  const value = readJson(here(file));
  const list = isRecord(value) ? value[key] : undefined;
  return (Array.isArray(list) ? list : []).flatMap((item: unknown) => {
    const text = isRecord(item) ? item[field] : undefined;
    const name = isRecord(item) ? String(item.example ?? item.name) : "";
    const joined = Array.isArray(text) ? text.join("\n") : text;
    return typeof joined === "string" ? [{ name, text: joined }] : [];
  });
};

/** The prefixes held: every 89th character, at most twelve, and the whole. */
export const prefixesOf = (text: string) => {
  const step = Math.max(89, Math.ceil(text.length / 12));
  const ats = [];
  for (let at = step; at < text.length; at += step) {
    ats.push(at);
  }
  return [...ats, text.length];
};

const main = async () => {
  const dir = process.env.STREAMDOWN_DIR ?? "";
  const require = createRequire(`${dir}/package.json`);
  // SAFETY: STREAMDOWN_DIR holds Streamdown and the React it is drawn with (above).
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- outside this repository's types
  const react = require("react") as typeof React;
  // SAFETY: as above.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- outside this repository's types
  const server = require("react-dom/server") as typeof ReactServer;
  // SAFETY: as above; its component takes the props below and the text.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- outside this repository's types
  const { Streamdown } = (await import(
    `${dir}/node_modules/streamdown/dist/index.js`
  )) as { Streamdown: React.FC<Record<string, unknown>> };
  const draw = (text: string, streaming: boolean) =>
    rolesOf(
      server.renderToString(
        react.createElement(
          Streamdown,
          streaming
            ? {
                mode: "streaming",
                isAnimating: true,
                animated: true,
                linkSafety: { enabled: false },
              }
            : { mode: "static", linkSafety: { enabled: false } },
          text
        )
      ),
      (cell) =>
        /text-align:\s*(?<side>center|right)/u
          .exec(cell.getAttribute("style") ?? "")
          ?.groups?.side?.charAt(0) ?? ""
    );
  const answers = lines("fixtures/markdown-answers.json", "answers", "lines");
  const examples = [
    ...lines("fixtures/commonmark-spec.json", "examples", "markdown").map(
      (example) => ({ ...example, name: `commonmark ${example.name}` })
    ),
    ...lines("fixtures/gfm-spec.json", "examples", "markdown").map(
      (example) => ({ ...example, name: `gfm ${example.name}` })
    ),
  ];
  const entries = [
    ...answers.flatMap(({ name, text }) =>
      prefixesOf(text).map((at) => ({
        name,
        at,
        roles: draw(text.slice(0, at), at < text.length),
      }))
    ),
    ...examples.map(({ name, text }) => ({
      name,
      at: text.length,
      roles: draw(text, false),
    })),
  ];
  writeFileSync(
    here("fixtures/markdown-parity.json"),
    `${JSON.stringify({ about: `What Streamdown ${STREAMDOWN} draws, by role (scripts/markdown-parity.ts).`, entries }, null, 1)}\n`
  );
};

if (process.argv[1] === import.meta.filename) {
  await main();
}
