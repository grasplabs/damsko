/**
 * The static gates beside `vp check`: generated files are current, the
 * registry agrees with the source, every component compiles under the
 * React Compiler, as the product builds it, and every component is
 * its target API, has a spec, an example and a page under its own name, and
 * knows nothing of the product, every file compiles
 * against ES2023's library, and the diff engine gives jsdiff's answers. Each runs
 * in its own process; all run, then any failure fails the whole.
 *
 * usage: node scripts/gates.ts
 */
import { spawnSync } from "node:child_process";

const gates: readonly (readonly string[])[] = [
  ["tokens/generate.ts", "--check"],
  ["scripts/check-registry.ts"],
  ["scripts/check-react-compiler.ts"],
  ["scripts/check-no-memo.ts"],
  ["scripts/check-words.ts", "--quiet"],
  ["scripts/check-props.ts"],
  ["scripts/check-api.ts"],
  ["scripts/check-conventions.ts"],
  ["scripts/check-target-api.ts"],
  ["scripts/check-coverage.ts"],
  ["scripts/check-product-knowledge.ts"],
  ["scripts/check-es2023.ts"],
  ["scripts/check-diff-engine.ts"],
];

const failed = gates.filter(
  (gate) => spawnSync("node", gate, { stdio: "inherit" }).status !== 0
);

if (failed.length > 0) {
  console.error(
    `\ngates: ${failed.length} failed: ${failed.map((gate) => gate.join(" ")).join(", ")}`
  );
  process.exit(1);
}
