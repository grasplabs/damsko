// Writes src/components/code-block-lexers.ts from @pierre/highlights' own language modules: every
// language it ships a lexer for, by its name and each alias the lexer answers to, each loaded by
// an import of its own, so a bundler makes each a script of its own and a page fetches only the
// languages it shows. Run by `pnpm run generate`, so the list moves with the package.
//
//   pnpm run generate                       write it
//   node scripts/highlight-lexers.ts --check  fail when it is out of date
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import nodePath from "node:path";
import { pathToFileURL } from "node:url";

const root = nodePath.join(import.meta.dirname, "..");
const langs = nodePath.join(root, "node_modules/@pierre/highlights/dist/langs");
const target = "src/components/code-block-lexers.ts";

// Plain text and a terminal's output are not coloured: the lexers take escapes out of the text.
const uncoloured = new Set(["plain", "plaintext", "text", "txt", "ansi"]);

const isLanguage = (
  value: unknown
): value is { name: string; aliases: Record<string, number> } =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string" &&
  "aliases" in value &&
  typeof value.aliases === "object" &&
  value.aliases !== null;

// Each module the package ships under its language's own name (`ts.js` only names
// `typescript.js` again), and the names and aliases it answers to.
const modules: { name: string; aliases: string[] }[] = [];
for (const file of readdirSync(langs).toSorted()) {
  if (!file.endsWith(".js") || file.endsWith(".workerd.js")) {
    continue;
  }
  // oxlint-disable-next-line no-await-in-loop -- one module after the other, in order
  const found: unknown = await import(
    pathToFileURL(nodePath.join(langs, file)).href
  );
  const language =
    typeof found === "object" && found !== null && "default" in found
      ? found.default
      : undefined;
  if (isLanguage(language) && file === `${language.name}.js`) {
    modules.push({
      name: language.name,
      aliases: Object.keys(language.aliases).map((alias) =>
        alias.toLowerCase()
      ),
    });
  }
}

// A name answers to its own module first, then to the first module, by name, that lists it.
const owner = new Map<string, string>();
for (const { name } of modules) {
  owner.set(name, name);
}
for (const { name, aliases } of modules) {
  for (const alias of aliases) {
    if (!owner.has(alias)) {
      owner.set(alias, name);
    }
  }
}
for (const name of uncoloured) {
  owner.delete(name);
}

const identifier = (name: string) =>
  `${name.replaceAll(/[^a-z0-9]+(?<next>.)/gu, (_, next: string) => next.toUpperCase())}Lexer`;
const key = (name: string) =>
  /^[a-z_$][a-z0-9_$]*$/u.test(name) ? name : JSON.stringify(name);

const source = [
  "// Every language @pierre/highlights ships a lexer for, by its name and each alias the lexer",
  "// answers to, each loaded by an import of its own the first time a block in it is drawn: a",
  "// bundler makes each a script of its own, and a page fetches only the languages it shows.",
  "// Written by scripts/highlight-lexers.ts (`pnpm run generate`) from the package's langs/: do",
  "// not edit.",
  'import type { Language } from "@pierre/highlights/core";',
  "",
  "/** Loads one language's lexer. */",
  "export type Lexer = () => Promise<{ default: Language }>;",
  "",
  ...modules.map(
    ({ name }) =>
      `const ${identifier(name)}: Lexer = async () => await import("@pierre/highlights/langs/${name}");`
  ),
  "",
  "/** Each language's lexer, by its name and each alias, in lower case. */",
  "export const lexers: Record<string, Lexer> = {",
  ...[...owner]
    .toSorted(([one], [other]) => one.localeCompare(other))
    .map(([name, module]) => `${key(name)}: ${identifier(module)},`),
  "};",
  "",
].join("\n");

// Formatted as `vp check` formats it.
const formatted = spawnSync(
  nodePath.join(root, "node_modules/.bin/vp"),
  ["fmt", `--stdin-filepath=${target}`],
  { cwd: root, input: source, encoding: "utf-8" }
);
if (formatted.status !== 0) {
  console.error(formatted.stderr);
  process.exit(1);
}

const path = nodePath.join(root, target);
if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(path, "utf-8");
  } catch {
    // Not written yet.
  }
  if (current !== formatted.stdout) {
    console.error(`Out of date: ${target}. Run pnpm run generate.`);
    process.exit(1);
  }
  console.log(
    `lexers: ${target} is current, ${modules.length} languages by ${owner.size} names.`
  );
} else {
  writeFileSync(path, formatted.stdout);
  console.log(
    `lexers: wrote ${target}, ${modules.length} languages by ${owner.size} names.`
  );
}
