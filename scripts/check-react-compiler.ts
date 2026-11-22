import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { availableParallelism } from "node:os";
import nodePath from "node:path";
import { text } from "node:stream/consumers";
import { parseArgs } from "node:util";

// Every component compiles under the React Compiler as the product builds it: babel-plugin-react-compiler
// 1.0.0 at `panicThreshold: "all_errors"`, no opt-outs. The product's
// build fails on any function the compiler cannot compile, so this check does too.
//
// It runs the plugin over every .ts and .tsx file in src/, which a project installs byte for byte.
// Each failure is listed with its file, line and the compiler's reason, then a count per item.
// Needs no server.
//
//   node scripts/check-react-compiler.ts
//   node scripts/check-react-compiler.ts -- --only button             one component (a comma-separated list)
//   node scripts/check-react-compiler.ts -- --only button,popover
//   node scripts/check-react-compiler.ts -- --only button --with-deps  and every item of ours it installs with it
//   node scripts/check-react-compiler.ts -- --jobs 1                  in one process (default: one per core)
//
// How a file is judged: the plugin runs on it twice. At "all_errors", as the product runs it, which
// throws at the first function it cannot compile: that decides whether the file passes. At "none",
// with a logger, which goes on past the first failure: that lists every function that fails, so one
// run shows everything to fix. When the two disagree the stricter one wins and the line says so.
//
// Each src/ file is also compiled by StyleX as the product does (scripts/stylex-picks.ts): a style the
// code still picks but StyleX's compiler dropped fails it, as "StyleX drops a pick".
import { transformSync } from "@babel/core";

import { itemOf } from "./build-registry.ts";
import { withDependencies } from "./registry-deps.ts";
import { prunedPicks } from "./stylex-picks.ts";

const { values } = parseArgs({
  options: {
    only: { type: "string" },
    "with-deps": { type: "boolean", default: false },
    jobs: { type: "string" },
    shard: { type: "string" },
  },
});

const root = new URL("..", import.meta.url).pathname;
const require = createRequire(import.meta.url);
const compiler = require.resolve("babel-plugin-react-compiler");
const named = (values.only ?? "")
  .split(",")
  .map((word) => word.trim().toLowerCase())
  .filter(Boolean);
// With --with-deps, the items they install with them too (registryDependencies, followed through ours).
const only =
  values["with-deps"] && named.length > 0 ? withDependencies(named) : named;
if (values["with-deps"] && named.length > 0) {
  console.log(`with their dependencies: ${only.join(", ")}\n`);
}

interface Failure {
  line: number;
  reason: string;
  message: string;
}
interface Unit {
  component: string;
  file: string;
  code: string;
}

const walk = (folder: string): string[] =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = nodePath.join(folder, entry.name);
    if (entry.isDirectory()) {
      return walk(path);
    }
    return /\.tsx?$/u.test(entry.name) &&
      !/\.(?:test|spec)\.tsx?$/u.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
      ? [path]
      : [];
  });

const units: Unit[] = walk(nodePath.join(root, "src")).map((file) => {
  const path = nodePath.relative(root, file);
  return {
    component: itemOf(path) ?? "src",
    file: path,
    code: readFileSync(file, "utf-8"),
  };
});

const chosen = only.length
  ? units.filter((unit) => only.includes(unit.component.toLowerCase()))
  : units;
if (only.length && chosen.length === 0) {
  console.error(`--only ${values.only}: no file belongs to that component`);
  process.exit(1);
}

interface LoggedDetail {
  reason?: string;
  description?: string;
  loc?: { start?: { line?: number } } | symbol | null;
  details?: {
    kind?: string;
    message?: string;
    loc?: { start?: { line?: number } };
  }[];
}
interface LoggedEvent {
  kind: string;
  fnLoc?: { start?: { line?: number } } | null;
  detail?: { options?: LoggedDetail } & LoggedDetail;
  data?: string;
}

const lineOf = (loc: unknown): number | undefined => {
  const start =
    typeof loc === "object" && loc !== null && "start" in loc
      ? loc.start
      : undefined;
  return typeof start === "object" &&
    start !== null &&
    "line" in start &&
    typeof start.line === "number"
    ? start.line
    : undefined;
};

// The product's own options (its React Compiler at panicThreshold "all_errors"); the listing run
// only lowers the threshold, so it goes on past the first failure.
const productOptions: Record<string, unknown> = {
  panicThreshold: "all_errors",
};

const compile = (unit: Unit, panicThreshold: "all_errors" | "none") => {
  const events: LoggedEvent[] = [];
  let thrown: string | undefined;
  try {
    transformSync(unit.code, {
      filename: unit.file,
      babelrc: false,
      configFile: false,
      parserOpts: { plugins: ["typescript", "jsx"] },
      plugins: [
        [
          compiler,
          {
            ...productOptions,
            panicThreshold,
            logger: {
              logEvent: (_file: string, event: LoggedEvent) => {
                events.push(event);
              },
            },
          },
        ],
      ],
    });
  } catch (error) {
    thrown = error instanceof Error ? error.message : String(error);
  }
  return { events, thrown };
};

const failuresOf = (events: LoggedEvent[]): Failure[] =>
  events.flatMap((event) => {
    if (event.kind === "PipelineError") {
      return [
        {
          line: lineOf(event.fnLoc) ?? 0,
          reason: "Pipeline error",
          message: event.data ?? "",
        },
      ];
    }
    if (event.kind !== "CompileError") {
      return [];
    }
    const detail = event.detail?.options ?? event.detail ?? {};
    const reason = detail.reason ?? "Cannot compile";
    const marks = (detail.details ?? []).filter(
      (mark) => mark.kind === "error"
    );
    if (marks.length === 0) {
      return [
        {
          line: lineOf(detail.loc) ?? lineOf(event.fnLoc) ?? 0,
          reason,
          message: detail.description ?? "",
        },
      ];
    }
    return marks.map((mark) => ({
      line: lineOf(mark.loc) ?? lineOf(event.fnLoc) ?? 0,
      reason,
      message: mark.message ?? detail.description ?? "",
    }));
  });

// One file's result. The work is split across processes (--jobs, default every core): each
// child compiles every nth file (--shard i/n) and prints its results as JSON; the parent keeps
// the files' order, so the output reads the same however many ran.
interface Result {
  index: number;
  failures: Failure[];
  disagreement: string;
}
const resultOf = (unit: Unit, index: number): Result => {
  const strict = compile(unit, "all_errors");
  const listed = failuresOf(compile(unit, "none").events);
  const failures = listed.length > 0 ? listed : failuresOf(strict.events);
  if (strict.thrown !== undefined && failures.length === 0) {
    failures.push({
      line: 0,
      reason: "Cannot compile",
      message:
        strict.thrown.split("\n").find((line) => line.trim()) ?? strict.thrown,
    });
  }
  const disagreement =
    strict.thrown === undefined && failures.length > 0
      ? "  (passes at all_errors, fails at none: counted as failing)"
      : "";
  failures.push(
    ...prunedPicks(unit.code, nodePath.join(root, unit.file), root).map(
      (pick) => ({
        ...pick,
        reason: "StyleX drops a pick",
      })
    )
  );
  return { index, failures, disagreement };
};

/** Whether a shard's line holds results, as resultOf makes them. */
const isResults = (value: unknown): value is Result[] =>
  Array.isArray(value) &&
  value.every(
    (result: unknown) =>
      typeof result === "object" &&
      result !== null &&
      "index" in result &&
      typeof result.index === "number" &&
      "failures" in result &&
      Array.isArray(result.failures) &&
      "disagreement" in result &&
      typeof result.disagreement === "string"
  );
const marker = "@@compiler-shard@@";
if (values.shard !== undefined) {
  const [part = 0, parts = 1] = values.shard.split("/").map(Number);
  const mine = chosen.flatMap((unit, index) =>
    index % parts === part ? [resultOf(unit, index)] : []
  );
  console.log(`${marker}${JSON.stringify(mine)}`);
  process.exit(0);
}
const jobs = Math.max(
  1,
  Math.min(chosen.length, Number(values.jobs ?? availableParallelism()))
);
const runShard = async (part: number): Promise<Result[]> => {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--jobs"));
  const child = spawn(
    "node",
    [import.meta.filename, ...args, "--shard", `${part}/${jobs}`],
    { stdio: ["ignore", "pipe", "inherit"] }
  );
  const out = await text(child.stdout);
  const line = out.split("\n").find((each) => each.startsWith(marker));
  if (line === undefined) {
    throw new Error(`compiler shard ${part}/${jobs} gave no result:\n${out}`);
  }
  const parsed: unknown = JSON.parse(line.slice(marker.length));
  if (!isResults(parsed)) {
    throw new Error(`compiler shard ${part}/${jobs} gave no results:\n${line}`);
  }
  return parsed;
};
const shards =
  jobs === 1
    ? [chosen.map(resultOf)]
    : await Promise.all(
        Array.from({ length: jobs }, async (_, part) => await runShard(part))
      );
const results = shards.flat().toSorted((a, b) => a.index - b.index);

const counts = new Map<string, number>();
let failedFiles = 0;
for (const { index, failures, disagreement } of results) {
  const unit = chosen[index];
  if (unit === undefined) {
    continue;
  }
  counts.set(
    unit.component,
    (counts.get(unit.component) ?? 0) + failures.length
  );
  if (failures.length === 0) {
    continue;
  }
  failedFiles += 1;
  console.log(`FAIL  ${unit.file}${disagreement}`);
  const unique = [
    ...new Map(
      failures.map((failure) => [
        `${failure.line} ${failure.reason} ${failure.message}`,
        failure,
      ])
    ).values(),
  ];
  for (const failure of unique.toSorted((a, b) => a.line - b.line)) {
    console.log(
      `        ${unit.file}:${failure.line}  ${failure.reason}${failure.message ? `: ${failure.message}` : ""}`
    );
  }
}

const failing = [...counts.entries()]
  .filter(([, count]) => count > 0)
  .toSorted(([a], [b]) => a.localeCompare(b));
if (failing.length) {
  console.log("\nper item:");
  for (const [component, count] of failing) {
    console.log(`  ${component.padEnd(24)} ${String(count).padStart(3)}`);
  }
}
const total = failing.reduce((sum, [, count]) => sum + count, 0);
const components = new Set(chosen.map((unit) => unit.component)).size;
console.log(
  `\ncompiler: ${components - failing.length} of ${components} items passed (${chosen.length - failedFiles} of ${chosen.length} files; ${total} failures)`
);
process.exit(failing.length ? 1 : 0);
