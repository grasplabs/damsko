// Every props table can be read: each exported `…Props` type in every file under src/components/,
// and each <Props source type /> on a page in docs/, through the same reader the site uses
// (site/props-data.ts). Fails with the file, the type and the prop when a prop is documented twice
// in one type, when a prop's name cannot be read (a computed key; plain and quoted names, such as
// "aria-label", are read), or when a page names a file or type that does not exist. The site itself never
// stops on these: it shows "Props could not be read" in the table. Needs no server.
//
//   node scripts/check-props.ts
import { readdirSync, readFileSync } from "node:fs";
import nodePath from "node:path";

import { propsTypesIn, readPropsResult } from "../site/props-data.ts";

const root = new URL("..", import.meta.url).pathname;

const walk = (folder: string, test: (name: string) => boolean): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = nodePath.join(folder, entry.name);
    if (entry.isDirectory()) {
      return walk(path, test);
    }
    return test(entry.name) ? [nodePath.relative(root, path)] : [];
  });

const targets = new Map<
  string,
  { source: string; type: string; from: string }
>();
for (const source of walk(
  nodePath.join(root, "src/components"),
  (name) => /\.tsx?$/u.test(name) && !name.endsWith(".stylex.ts")
)) {
  for (const type of propsTypesIn(source)) {
    targets.set(`${source}#${type}`, { source, type, from: source });
  }
}
for (const page of walk(nodePath.join(root, "docs"), (name) =>
  name.endsWith(".mdx")
)) {
  const text = readFileSync(nodePath.join(root, page), "utf-8");
  for (const match of text.matchAll(
    /<Props\b[^>]*?\bsource="(?<source>[^"]+)"[^>]*?\btype="(?<type>[^"]+)"/gu
  )) {
    const { source = "", type = "" } = match.groups ?? {};
    targets.set(`${source}#${type}`, { source, type, from: page });
  }
}

let failed = 0;
for (const { source, type, from } of targets.values()) {
  const { rows, problems } = readPropsResult(source, type);
  if (problems.length === 0) {
    console.log(`ok    ${source} ${type} (${rows.length} props)`);
    continue;
  }
  failed += 1;
  console.log(
    `FAIL  ${source} ${type}${from === source ? "" : `, named in ${from}`}`
  );
  for (const problem of problems) {
    console.log(`        ${problem}`);
  }
}
console.log(`\nprops: ${targets.size - failed} of ${targets.size} passed`);
process.exit(failed ? 1 : 0);
