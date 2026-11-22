// The pages that could not be drawn, collected while the site renders, so a build can finish every
// other page and then name the broken ones (astro.config.ts, astro:build:done) and fail.
//
// Kept on globalThis: the pages are rendered by a bundle of this file, the build's hooks by the
// config's own import of it, and both run in the one Node process.
export interface Problem {
  /** The page's file, from the root: "docs/components/button.mdx". */
  file: string;
  message: string;
  /** The line in that file, when known. */
  line?: number;
}

declare global {
  var __damskoBrokenPages: Map<string, Problem> | undefined;
}

export const recordProblem = (problem: Problem) => {
  globalThis.__damskoBrokenPages ??= new Map();
  globalThis.__damskoBrokenPages.set(problem.file, problem);
};

export const brokenPages = (): Problem[] => [
  ...(globalThis.__damskoBrokenPages?.values() ?? []),
];

/** "docs/x.mdx:12: message" */
export const describe = (problem: Problem) =>
  `${problem.file}${problem.line ? `:${problem.line}` : ""}: ${problem.message}`;

/**
 * The line of a page that an error most likely came from: the first line holding one of the
 * quoted values in its message (`<Stage path="nope/missing">` names "nope/missing").
 */
export const lineOf = (source: string, message: string): number | undefined => {
  for (const [, quoted = ""] of message.matchAll(/"([^"\n]{2,})"/gu)) {
    const index = source.indexOf(quoted);
    if (index !== -1) {
      return source.slice(0, index).split("\n").length;
    }
  }
  return undefined;
};
