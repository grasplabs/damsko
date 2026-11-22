// Conventions that hold across src/, so they cannot drift. Reads files only.
//
//   node scripts/check-conventions.ts
//
// 1. A folder component (src/components/<name>/) has an index.ts: a product imports it by its folder.
// 2. No default export, so a part keeps one name everywhere.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import nodePath from "node:path";

const root = nodePath.join(import.meta.dirname, "..");
const src = nodePath.join(root, "src");
const components = nodePath.join(src, "components");

const failures: string[] = [];
let checks = 0;
const check = (ok: boolean, message: string) => {
  checks += 1;
  if (!ok) {
    failures.push(message);
  }
};

for (const name of readdirSync(components).toSorted()) {
  if (!statSync(nodePath.join(components, name)).isDirectory()) {
    continue;
  }
  check(
    existsSync(nodePath.join(components, name, "index.ts")),
    `${name}: no index.ts`
  );
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = nodePath.join(dir, entry);
    if (statSync(path).isDirectory()) {
      return walk(path);
    }
    return /\.tsx?$/u.test(entry) ? [path] : [];
  });
for (const path of walk(src)) {
  const file = nodePath.relative(root, path).split("\\").join("/");
  const text = readFileSync(path, "utf-8");
  check(
    !/^export default\b/mu.test(text),
    `${file}: a default export; export it by name`
  );
}

for (const failure of failures) {
  console.log(`FAIL  ${failure}`);
}
console.log(
  failures.length === 0
    ? `conventions: ${checks} checks passed`
    : `conventions: ${failures.length} problem(s) in ${checks} checks`
);
process.exit(failures.length === 0 ? 0 : 1);
