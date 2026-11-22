// Every component and block in scripts/target-api.json has, under its own name, a spec
// (tests/<name>.spec.ts), at least one example (examples/<name>/) and a docs page
// (docs/components/<name>.mdx). Fails with each name and what it lacks.
//
//   node scripts/check-coverage.ts
import { existsSync, readdirSync } from "node:fs";
import nodePath from "node:path";

import { isRecord, readJson } from "./json.ts";

const root = new URL("..", import.meta.url).pathname;
const at = (path: string) => nodePath.join(root, path);

const target = readJson(at("scripts/target-api.json"));
const names = isRecord(target) ? Object.keys(target) : [];
if (names.length === 0) {
  console.error("check-coverage: scripts/target-api.json lists no component");
  process.exit(1);
}

const examples = (name: string) =>
  existsSync(at(`examples/${name}`))
    ? readdirSync(at(`examples/${name}`)).filter((file) =>
        file.endsWith(".tsx")
      ).length
    : 0;

const problems = names.flatMap((name) => {
  const lacks = [
    existsSync(at(`tests/${name}.spec.ts`)) ? "" : `tests/${name}.spec.ts`,
    examples(name) > 0 ? "" : `an example in examples/${name}/`,
    existsSync(at(`docs/components/${name}.mdx`))
      ? ""
      : `docs/components/${name}.mdx`,
  ].filter((each) => each !== "");
  return lacks.length > 0 ? [`${name}: no ${lacks.join(", no ")}`] : [];
});

if (problems.length > 0) {
  console.error(`check-coverage:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `check-coverage: ${names.length} components and blocks each have a spec, an example and a page`
);
