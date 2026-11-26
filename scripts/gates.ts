/**
 * The static gates beside `vp check`: generated files are current (the tokens, CodeBlock's lexers), the
 * registry agrees with the source, every component compiles under the
 * React Compiler, as the product builds it, and every component is
 * its target API, has a spec, an example and a page under its own name, and
 * knows nothing of the product, every rounded corner is the squircle, every
 * file compiles against ES2023's library, the diff engine gives jsdiff's answers, and no
 * pattern in Markdown can backtrack without bound. Each runs
 * in its own process; all run, then any failure fails the whole.
 *
 * usage: node scripts/gates.ts
 */
import { spawnSync } from "node:child_process";

const gates: readonly (readonly string[])[] = [
  ["tokens/generate.ts", "--check"],
  ["scripts/highlight-lexers.ts", "--check"],
  ["scripts/check-registry.ts"],
  ["scripts/check-react-compiler.ts"],
  ["scripts/check-no-memo.ts"],
  ["scripts/check-words.ts", "--quiet"],
  ["scripts/check-props.ts"],
  ["scripts/check-api.ts"],
  ["scripts/check-conventions.ts"],
  ["scripts/check-labels.ts"],
  ["scripts/check-target-api.ts"],
  ["scripts/check-coverage.ts"],
  ["scripts/check-product-knowledge.ts"],
  ["scripts/check-corners.ts"],
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
