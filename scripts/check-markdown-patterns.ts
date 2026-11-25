// Markdown reads untrusted text, so none of its patterns may take more than time in step with what
// it reads. Every regular expression in src/components/markdown/ is given to recheck, a ReDoS
// checker that reads a pattern as an automaton and proves it safe, or finds the input that makes it
// backtrack beyond its length (an exponential or a polynomial one). Anything but safe fails: a
// pattern it cannot read (a backreference, most lookarounds) as well, and one built at run time
// (`new RegExp(…)`), which cannot be read here at all. Such a pattern is written as a scanner.
//
// The cost of every entry point is weighed too, on generated hostile answers
// (scripts/markdown-cost*.test.ts*); this check catches a shape before any answer has to find it.
//
//   node scripts/check-markdown-patterns.ts
import { readdirSync, readFileSync } from "node:fs";
import nodePath from "node:path";

import { checkSync } from "recheck";
import ts from "typescript6";

/**
 * What is wrong with the pattern `/source/flags`, or null when recheck proves it safe within
 * `timeout` milliseconds (its own default): one it cannot decide in that time fails too.
 */
export const unsafe = (
  source: string,
  flags: string,
  timeout = 10_000
): string | null => {
  const found = checkSync(source, flags, { checker: "automaton", timeout });
  if (found.status === "safe") {
    return null;
  }
  return found.status === "vulnerable"
    ? `${found.complexity.type} backtracking, on ${JSON.stringify(found.attack.string)}`
    : `cannot be proven safe (${found.error.kind})`;
};

/** What is wrong with each pattern in the files of `folder`, one line each. */
export const problemsIn = (folder: string): string[] => {
  const problems: string[] = [];
  for (const name of readdirSync(folder).filter((file) =>
    /\.tsx?$/u.test(file)
  )) {
    const file = nodePath.join(folder, name);
    const tree = ts.createSourceFile(
      file,
      readFileSync(file, "utf-8"),
      ts.ScriptTarget.Latest,
      true
    );
    const visit = (node: ts.Node) => {
      const where = `${name}:${tree.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
      if (ts.isRegularExpressionLiteral(node)) {
        const end = node.text.lastIndexOf("/");
        const wrong = unsafe(node.text.slice(1, end), node.text.slice(end + 1));
        if (wrong !== null) {
          problems.push(`${where}: ${node.text}: ${wrong}`);
        }
      } else if (
        (ts.isNewExpression(node) || ts.isCallExpression(node)) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "RegExp"
      ) {
        problems.push(`${where}: built at run time: ${node.getText()}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(tree);
  }
  return problems;
};

if (import.meta.main) {
  const problems = problemsIn(
    nodePath.join(import.meta.dirname, "../src/components/markdown")
  );
  if (problems.length > 0) {
    console.error(
      `check-markdown-patterns: ${problems.length} pattern(s) in src/components/markdown may cost more than their input; write each as a scanner:\n${problems.map((problem) => `  ${problem}`).join("\n")}`
    );
  } else {
    console.log(
      "check-markdown-patterns: every pattern in src/components/markdown is proven linear"
    );
  }
  // recheck's worker would keep the process open.
  process.exit(problems.length === 0 ? 0 : 1);
}
