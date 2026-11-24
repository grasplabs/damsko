// The gate on what an answer costs Markdown (scripts/markdown-cost-*.test.ts*). Markdown reads
// untrusted text, a model's or one it was handed, and every fix of a slow path has opened another,
// so the gate does not trust review: it generates hostile answers from one table and runs each
// through every entry point a render uses, holding four things:
//
//   - growth: at four times the size, under eight times the time on the processor (in step is
//     four, the square sixteen), the best of up to five runs;
//   - what is drawn: at the larger size, under 200 characters of HTML for each it reads (an
//     answer draws under 100), so a rule whose output grows faster than what it reads fails long
//     before it grows (a table's head as wide as its rows are many drew 7,000 a character at
//     3.5 KB). Its growth from size to size is no measure: past a budget a block is drawn as
//     plain lines, a few times as many characters as before, in step all the same;
//   - a hard cap at 2 KB, which a path that grows exponentially passes by long before it grows;
//   - a ceiling per character at the larger size, which a path that is in step but costly for
//     each character (a line nested 199 deep) passes by.
//
// The families: each mark the grammar knows, repeated alone, with words, a line each and a block
// each; each alternated with every other, with and without blank lines between; each container
// nested line by line, on one line, and just under and over the deepest a line opens; definitions
// and their uses by the thousand; tables wide and long, short rows and ragged ones; and random
// text from the marks. Adding a mark to MARKS adds all of its families.

/** What a family is made of, which says which entry points weigh it (see each test). */
export type Kind = "single" | "pair" | "structure" | "random";

/** A family: a name, and the answer of about `length` characters it makes, of many blocks or not. */
export interface Family {
  name: string;
  kind: Kind;
  blocks: boolean;
  make: (length: number) => string;
}

/** Every opening and closing mark the grammar knows, and the characters round them. */
export const MARKS: readonly string[] = [
  "*",
  "_",
  "**",
  "~~",
  "`",
  "``",
  "```",
  "````",
  "[",
  "]",
  "[^",
  "![",
  "](",
  "[[[",
  "<",
  "<!--",
  "&",
  "|",
  ">",
  "> ",
  "- ",
  "1. ",
  "https://",
  "\0\u0001*\u0007[\u001F",
];

/** The containers a line can open, nested to any depth. */
const CONTAINERS: readonly string[] = [
  "> ",
  ">",
  "- ",
  "* ",
  "1. ",
  "- > ",
  "> - ",
];

/** `unit` again and again, cut at `length` characters. */
const repeated = (unit: string) => (length: number) =>
  unit.repeat(Math.ceil(length / unit.length)).slice(0, length);

/** Lines of `make(at)`, one after another, to `length` characters. */
const lined =
  (make: (at: number) => string, between = "\n") =>
  (length: number) => {
    const lines: string[] = [];
    let size = 0;
    for (let at = 0; size < length; at += 1) {
      const line = make(at);
      lines.push(line);
      size += line.length + between.length;
    }
    return lines.join(between);
  };

/** Park and Miller's numbers below `below`, the same on every run. */
const randomFrom = (start: number) => {
  let seed = start;
  return (below: number) => {
    seed = (seed * 16_807) % 2_147_483_647;
    return Math.floor((seed / 2_147_483_647) * below);
  };
};

const PIECES = [
  ...MARKS,
  " ",
  " ",
  "a",
  "word",
  "\n",
  "\n\n",
  "[a]: ",
  "[^1]: ",
  "[^1]",
  "](a",
  '<a href="',
  '"',
  ")",
  "(",
  "\t",
  "\r\n",
  "\uD800",
  "#",
  "    ",
  "-->",
  "a@b.c",
];

/** Text of `length` characters made at random from the marks and the words round them. */
const random = (seed: number) => (length: number) => {
  const below = randomFrom(seed);
  let text = "";
  while (text.length < length) {
    const piece = below(PIECES.length);
    text += PIECES[piece] ?? "";
  }
  return text.slice(0, length);
};

/** `use(at)` for as many names as fill half of `length`, then each name defined. */
const uses =
  (use: (at: number) => string, define: (at: number) => string) =>
  (length: number) => {
    let text = "";
    let count = 0;
    while (text.length < length / 2) {
      text += use(count);
      count += 1;
    }
    const definitions = Array.from({ length: count }, (_, at) => define(at));
    return { text, definitions: definitions.join("\n") };
  };

const familyOf = (
  name: string,
  kind: Kind,
  make: (length: number) => string,
  blocks = false
): Family => ({ name, kind, blocks, make });

/** Each mark alone, with words, a line each and a block each; each pair alternated, without and with blank lines. */
const ofMarks = (): Family[] => [
  ...MARKS.flatMap((mark) => {
    const shown = JSON.stringify(mark);
    return [
      familyOf(`${shown} repeated`, "single", repeated(mark)),
      familyOf(`${shown} with words`, "single", repeated(`${mark}a `)),
      familyOf(`${shown} a line each`, "single", repeated(`${mark}a\n`)),
      familyOf(
        `${shown} a block each`,
        "single",
        repeated(`${mark}a\n\n`),
        true
      ),
    ];
  }),
  ...MARKS.flatMap((one, index) =>
    MARKS.slice(index + 1).flatMap((other) => {
      const shown = `${JSON.stringify(one)} and ${JSON.stringify(other)}`;
      return [
        familyOf(`${shown} alternated`, "pair", repeated(`${one}a ${other}b `)),
        familyOf(
          `${shown} alternated, a block each`,
          "pair",
          repeated(`${one}a\n\n${other}b\n\n`),
          true
        ),
      ];
    })
  ),
];

/** Each container nested line by line, on one line, and just under and over the deepest a line opens. */
const ofContainers = (): Family[] =>
  CONTAINERS.flatMap((container) => {
    const shown = JSON.stringify(container);
    return [
      familyOf(
        `${shown} nested 0 to 199 deep, line by line`,
        "structure",
        lined((at) => `${container.repeat(at % 200)}a`)
      ),
      familyOf(
        `${shown} nested on one line`,
        "structure",
        (length) => `${repeated(container)(length)}a`
      ),
      ...[24, 33].flatMap((depth) => [
        familyOf(
          `${shown} ${depth} deep, a block each`,
          "structure",
          lined(() => `${container.repeat(depth)}a`, "\n\n"),
          true
        ),
        familyOf(
          `${shown} ${depth} deep, then a list's greater-than`,
          "structure",
          lined(() => `${container.repeat(depth)}- > 25`, "\n\n"),
          true
        ),
      ]),
    ];
  });

/** A table: a head `cells` wide, its row of dashes, then `rows`. */
const tableOf = (cells: number, rows: readonly string[]) =>
  `${"|a".repeat(cells)}|\n${"|-".repeat(cells)}|\n${rows.map((row) => `${row}\n`).join("")}`;

/** Definitions and their uses by the thousand, lists and tasks, tables, and random text from the marks. */
const ofStructure = (): Family[] => [
  familyOf(
    "a list indented 0 to 59 deep, line by line",
    "structure",
    lined((at) => `${"  ".repeat(at % 60)}- a *b`)
  ),
  familyOf("greater-than items", "structure", repeated("- > 25: a\n")),
  familyOf("task boxes", "structure", repeated("- [x] a\n")),
  familyOf(
    "references, then their definitions",
    "structure",
    (length) => {
      const { text, definitions } = uses(
        (at) => `[x${at}] [y][x${at}] `,
        (at) => `[x${at}]: https://a.example/${at}`
      )(length);
      return `${text}\n\n${definitions}`;
    },
    true
  ),
  familyOf(
    "notes, then their definitions",
    "structure",
    (length) => {
      const { text, definitions } = uses(
        (at) => `a[^${at}] `,
        (at) => `[^${at}]: note ${at}`
      )(length);
      return `${text}\n\n${definitions}`;
    },
    true
  ),
  familyOf(
    "definitions, then their uses",
    "structure",
    (length) => {
      const { text, definitions } = uses(
        (at) => `[x${at}] `,
        (at) => `[x${at}]: https://a.example/${at}`
      )(length);
      return `${definitions}\n\n${text}`;
    },
    true
  ),
  familyOf(
    "one name defined again and again",
    "structure",
    repeated("[a]: https://a.example\n")
  ),
  familyOf(
    "references and notes never defined",
    "structure",
    lined((at) => `a[b][c${at}] [d${at}][] [^e${at}]`, " ")
  ),
  familyOf(
    "notes defined as they are used",
    "structure",
    repeated("a[^1]\n\n[^1]: b\n\n"),
    true
  ),
  familyOf(
    "a table's head as wide as its rows are many, each row one cell",
    "structure",
    (length) => {
      const cells = Math.floor(length / 7);
      return tableOf(
        cells,
        Array.from({ length: cells }, () => "|b")
      );
    }
  ),
  familyOf("a wide head over many short rows", "structure", (length) =>
    tableOf(
      Math.floor(length / 20),
      Array.from({ length: Math.floor(length / 4) }, () => "|b")
    )
  ),
  // Tables of their own, each under 8,000 characters, so each is read as one (MAX_INLINE).
  familyOf(
    "many columns, few rows",
    "structure",
    (length) => {
      const cells = Math.floor(length / 40);
      const row = `${"|c".repeat(cells)}|`;
      return repeated(`${tableOf(cells, [row, row])}\n`)(length);
    },
    true
  ),
  familyOf(
    "ragged rows",
    "structure",
    repeated(
      `${tableOf(
        16,
        Array.from({ length: 20 }, (_, at) => `${"|c".repeat(at * 2)}|`)
      )}\n`
    ),
    true
  ),
  ...Array.from({ length: 8 }, (_, seed) =>
    familyOf(`random ${seed + 1}`, "random", random((seed + 1) * 7919))
  ),
];

export const families: readonly Family[] = [
  ...ofMarks(),
  ...ofContainers(),
  ...ofStructure(),
];

/** This process's own time on the processor so far, in milliseconds. */
const now = () => {
  const { user, system } = process.cpuUsage();
  return (user + system) / 1000;
};

/** How long one measure runs at least, in milliseconds: past the timer's grain and a busy machine's jitter. */
const FLOOR = 10;

/** What `run` costs a call, in milliseconds of the processor: it is run again until FLOOR has passed. */
const costOf = (run: () => unknown) => {
  const start = now();
  let calls = 0;
  let spent = 0;
  do {
    run();
    calls += 1;
    spent = now() - start;
  } while (spent < FLOOR);
  return spent / calls;
};

/** Four times the size: in step is four, the square sixteen. */
const GROWTH = 8;
/**
 * The size the hard cap weighs at, and what one call may take there, in milliseconds: a path that
 * grows exponentially takes seconds there; the parse's own bound on a paragraph's marks (MAX_COST
 * in parse.ts) allows a tenth of that.
 */
const TINY = 2000;
const HARD_CAP = 200;
/**
 * What one call may take for each character at the larger size, in milliseconds (100 µs): what is
 * in step but costly for each character, as a line nested 199 deep was, takes more.
 */
const CEILING = 0.1;
/** What one call may draw for each character at the larger size, in characters of HTML. */
const DRAWN_CEILING = 200;

/** What is run: given an answer, a call that weighs one entry point on it, and gives what it draws, if any. */
export type Entry = (text: string) => () => unknown;

/** How much a call draws: the length of the text it gives, or 0 for none. */
const drawnBy = (call: () => unknown) => {
  const drawn = call();
  return typeof drawn === "string" ? drawn.length : 0;
};

/**
 * What is wrong with `entry` on `family`, or null: more than HARD_CAP at 2 KB; at four times
 * `small`, more than DRAWN_CEILING drawn a character; from `small` to four times it, time growing
 * GROWTH times or more, or more than CEILING a character at the larger size. Each time is the best
 * of up to five runs, each run only when the ones before are over: a busy machine slows one run,
 * not five.
 */
export const weighed = (
  family: Family,
  entry: Entry,
  small: number
): string | null => {
  const tiny = entry(family.make(TINY));
  let capped = Number.POSITIVE_INFINITY;
  for (let run = 0; run < 5 && capped > HARD_CAP; run += 1) {
    const start = now();
    tiny();
    capped = Math.min(capped, now() - start);
  }
  if (capped > HARD_CAP) {
    return `${capped.toFixed(0)} ms at 2 KB`;
  }
  const large = small * 4;
  const fewer = entry(family.make(small));
  const more = entry(family.make(large));
  const drawn = drawnBy(more);
  if (drawn > large * DRAWN_CEILING) {
    return `${drawn} characters drawn at ${large / 1000} KB`;
  }
  let fast = Number.POSITIVE_INFINITY;
  let slow = Number.POSITIVE_INFINITY;
  for (let run = 0; run < 5; run += 1) {
    fast = Math.min(fast, costOf(fewer));
    slow = Math.min(slow, costOf(more));
    if (slow < fast * GROWTH && slow < large * CEILING) {
      return null;
    }
  }
  return `${fast.toFixed(1)} ms at ${small / 1000} KB, ${slow.toFixed(1)} ms at ${large / 1000} KB`;
};

/** Every family `which` takes weighed through each of `entries` from `small`: what is wrong, one line each. */
export const weighAll = (
  entries: Record<string, Entry>,
  which: (family: Family) => boolean,
  small: number
): string[] => {
  const found: string[] = [];
  for (const family of families) {
    if (!which(family)) {
      continue;
    }
    for (const [name, entry] of Object.entries(entries)) {
      const wrong = weighed(family, entry, small);
      if (wrong !== null) {
        found.push(`${family.name}, ${name}: ${wrong}`);
      }
    }
  }
  return found;
};

/** How long a test of the gate may run by the clock: a busy machine makes its minute of processor several. */
export const GATE_TEST = 900_000;
