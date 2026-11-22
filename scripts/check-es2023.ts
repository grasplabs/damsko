// Every component compiles against ES2023's library, the newest a Vite app's TypeScript template
// takes (a project installs our files into it as Get started says). An ES2024 API in our code
// (Map.groupBy, Object.groupBy, Promise.withResolvers, Array.fromAsync, the Set methods) fails a
// fresh install's tsc; this fails first. Needs no server.
//
//   node scripts/check-es2023.ts
import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import nodePath from "node:path";

const root = new URL("..", import.meta.url).pathname;
// Beside the project's own config, so its packages' types resolve as they do for tsc.
const config = nodePath.join(root, `.tsconfig.es2023.${process.pid}.json`);
writeFileSync(
  config,
  JSON.stringify({
    extends: nodePath.join(root, "tsconfig.json"),
    compilerOptions: {
      lib: ["ES2023", "DOM", "DOM.Iterable"],
      types: ["vite/client"],
      noEmit: true,
    },
    // Shared code, components and the examples a product copies from the pages.
    include: [
      nodePath.join(root, "src/**/*.ts"),
      nodePath.join(root, "src/**/*.tsx"),
      nodePath.join(root, "examples/**/*.ts"),
      nodePath.join(root, "examples/**/*.tsx"),
    ],
  })
);
const run = spawnSync("pnpm", ["exec", "tsc", "-p", config], {
  cwd: root,
  encoding: "utf-8",
});
rmSync(config, { force: true });
const output = run.stdout + run.stderr;
// Only what is newer than ES2023: a name the library does not know. Other type errors are tsc's
// own check's to report.
const newer = output
  .split("\n")
  .filter(
    (line) =>
      /error TS(?:2550|2339|2551|2583|2304)/u.test(line) &&
      (line.includes("src/") || line.includes("examples/"))
  );
// A config the compiler could not read reads nothing: that must fail too, not pass.
if (/error TS(?:5\d{3}|2688)/u.test(output)) {
  newer.push(`the check's own config failed: ${output.split("\n")[0]}`);
}
for (const line of newer) {
  console.log(`FAIL  ${line.replace(root, "")}`);
}
console.log(
  `\nes2023: ${newer.length === 0 ? "every component compiles against ES2023's library" : `${newer.length} uses of something newer`}`
);
process.exit(newer.length === 0 ? 0 : 1);
