// Every public part has its API on a page: each exported `…Props` type of a part a component
// exports (src/components/<name>.tsx, or a folder component's index.ts) is read by a
// <Props source type /> on some page in docs/components (a part may stand on its owner's page:
// Field on Input's). The tables themselves are read from the source (site/props-data.ts;
// `node scripts/check-props.ts` proves each can be read), so a table that is there cannot be
// wrong; this proves none is missing. Needs no server.
//
//   node scripts/check-api.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import nodePath from "node:path";

const root = new URL("..", import.meta.url).pathname;

const pages = readdirSync(nodePath.join(root, "docs/components"))
  .map((name) =>
    readFileSync(nodePath.join(root, "docs/components", name), "utf-8")
  )
  .join("\n");
const shown = new Set(
  [
    ...pages.matchAll(
      /<Props\s+source="(?<source>[^"]+)"\s+type="(?<type>[^"]+)"/gu
    ),
  ].map((found) => `${found.groups?.source}#${found.groups?.type}`)
);

const problems: string[] = [];
let types = 0;
/** Each `…Props` type in a file whose part `exported` says is public must be on a page. */
const hold = (
  name: string,
  source: string,
  exported: (part: string) => boolean
) => {
  const text = readFileSync(nodePath.join(root, source), "utf-8");
  for (const found of text.matchAll(
    /^export (?:interface|type) (?<type>\w+Props)\b/gmu
  )) {
    const type = found.groups?.type ?? "";
    if (!exported(type.replace(/Props$/u, ""))) {
      continue;
    }
    types += 1;
    if (!shown.has(`${source}#${type}`)) {
      problems.push(`${name}: ${type} (${source}) is on no page`);
    }
  }
};

for (const name of readdirSync(nodePath.join(root, "src/components"))) {
  const source = `src/components/${name}`;
  if (name.endsWith(".tsx")) {
    const text = readFileSync(nodePath.join(root, source), "utf-8");
    hold(name, source, (part) =>
      new RegExp(`^export const ${part}\\b`, "mu").test(text)
    );
  } else if (statSync(nodePath.join(root, source)).isDirectory()) {
    // A folder component: the parts its index.ts exports, from any of its files.
    const index = readFileSync(
      nodePath.join(root, source, "index.ts"),
      "utf-8"
    );
    for (const file of readdirSync(nodePath.join(root, source))) {
      if (/\.tsx?$/u.test(file) && file !== "index.ts") {
        hold(name, `${source}/${file}`, (part) =>
          new RegExp(`\\b${part}\\b`, "u").test(index)
        );
      }
    }
  }
}

// Paging and what a table says with no rows are said in figures and words, not left to a guess.
{
  const text = readFileSync(
    nodePath.join(root, "src/components/data-table/data-table.tsx"),
    "utf-8"
  );
  const doc = (prop: string) =>
    new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*${prop}\\?:`, "u").exec(
      text
    )?.[1] ?? "";
  if (!/always has a name/u.test(doc("caption"))) {
    problems.push(
      "DataTableProps.caption does not say a table always has a name: its caption, or its label"
    );
  }
  if (
    !/@default/u.test(doc("pageSize")) ||
    !/more rows/u.test(doc("pageSize"))
  ) {
    problems.push(
      "DataTableProps.pageSize does not say its default and when the pages appear"
    );
  }
}

for (const problem of problems) {
  console.log(`FAIL  ${problem}`);
}
console.log(
  `\napi: ${types - problems.length} of ${types} public props types have a table on a page; ${problems.length} missing`
);
process.exit(problems.length > 0 ? 1 : 0);
