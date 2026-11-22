// The old way of holding back half-written Markdown, kept here for the comparison only: a line still
// being typed waited until it was whole, then came out as one lump. Markdown itself now repairs
// what is half-written instead (`repair` in src/components/markdown/parse.ts).
/** A line that may be a table's row: it holds a pipe that is not escaped. */
const isRow = (line: string) => /(?:^|[^\\])\|/u.test(line);
const isDelimiter = (line: string) =>
  /^\s*\|?\s*:?-{1,}:?\s*(?:\|\s*:?-{1,}:?\s*)*\|?\s*$/u.test(line);
const isFence = (line: string) => /^\s{0,3}(?:```|~~~)/u.test(line);

/** Whether `source` ends inside a fence that has not been closed. */
export const openFence = (source: string): boolean =>
  source.split("\n").filter(isFence).length % 2 === 1;

/** The text of a line still being typed, up to the first mark it opened and has not closed. */
const steadyLine = (line: string): string => {
  let end = line.length;
  // Code in a sentence and strike-through, waiting for their closing marks.
  for (const mark of ["`", "~~", "**", "__"]) {
    const count = line.split(mark).length - 1;
    if (count % 2 === 1) {
      end = Math.min(end, line.lastIndexOf(mark));
    }
  }
  // A link or a note: from its [ until its ) or ].
  const open = line.lastIndexOf("[");
  if (open !== -1) {
    const rest = line.slice(open);
    const closed = /^\[[^\]]*\](?<target>\([^)]*\))?/u.exec(rest);
    const whole =
      closed !== null &&
      (closed.groups?.target !== undefined ||
        !rest.slice(closed[0].length).startsWith("("));
    if (!whole) {
      end = Math.min(end, open);
    }
  }
  return line.slice(0, end);
};

/**
 * What of a source still being written can be drawn without flickering. Inside an open fence it
 * is all drawn, as code still coming in. Otherwise kept back until it is whole: a line still being
 * typed that opens a block (a fence, a heading, a list item, a quote, a table row), the marks of
 * that line not yet closed (bold, code, a link, a note), and a table whose row of dashes has not
 * arrived, which would otherwise show as a paragraph of pipes and then jump into a table.
 */
export const steadyPart = (source: string): string => {
  if (openFence(source)) {
    return source;
  }
  const cut = source.lastIndexOf("\n");
  const last = source.slice(cut + 1);
  let text = source.slice(0, cut + 1);
  if (
    !/^\s*(?:```|~~~|#{1,6}(?:\s|$)|\||>|[-*+](?:\s|$)|\d+[.)](?:\s|$))/u.test(
      last
    )
  ) {
    text += steadyLine(last);
  }
  // A table's head and rows waiting for the row of dashes: held until it comes.
  const lines = text.split("\n");
  let end = lines.length;
  while (end > 0 && lines[end - 1] === "") {
    end -= 1;
  }
  let start = end;
  const above = (at: number): string => lines.at(at - 1) ?? "";
  while (start > 0 && isRow(above(start)) && !isFence(above(start))) {
    start -= 1;
  }
  // Only lines that stand as their own paragraph: a blank line or the start before them.
  const own = start === 0 || lines[start - 1] === "";
  if (own && start < end && !lines.slice(start, end).some(isDelimiter)) {
    text = lines.slice(0, start).join("\n");
  }
  return text;
};
