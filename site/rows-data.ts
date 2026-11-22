// The data behind a closed row (site/blocks/rows.tsx) and its Markdown form: a row's value is
// written with the tokens it comes from in braces, "{text-sm} / {text-sm-line}, {font-weight-medium}",
// and reads "14px / 20px, 500". So a page never types a value; it names the token and the value
// comes from the token data. Plain TypeScript, so the Markdown twin can use it at build time.
import { tokenEntries } from "./system/token-file.ts";
import type { TokenEntry } from "./system/token-file.ts";

export interface Row {
  /** What the row is about: "Height", "Press", "Keyboard". */
  key: string;
  /** What you read first. Tokens in braces become their values; `code` in backticks. */
  value?: string;
  /** Tokens named beside the value, besides those in its braces. */
  tokens?: string[];
  /** A few words, only for a rule the value cannot show: "capped at half the height". */
  note?: string;
  /** The group the row stands in ("Size", "Colour"). Rows of a group stand together. */
  group?: string;
}

export type { TokenEntry } from "./system/token-file.ts";

const entries = tokenEntries;

export const tokenEntry = (name: string): TokenEntry => {
  const entry = entries.get(name);
  if (!entry) {
    throw new Error(`Rows: no token "${name}".`);
  }
  return entry;
};

export const isColour = (entry: TokenEntry) => entry.value.startsWith("oklch(");

const braces = /\{([a-z0-9-]+)\}/gu;

/**
 * The row's words with each {token} replaced by its value. Braces that name no token are left as
 * written, so code in a row (`autoResize={false}`) is not taken for one.
 */
export const resolve = (text: string) =>
  text.replaceAll(
    braces,
    (whole, name: string) => entries.get(name)?.value ?? whole
  );

/** Every token a row names: those in its value and note, then its own list, each once. */
export const tokensOf = (row: Row): string[] => {
  const named = [...`${row.value ?? ""} ${row.note ?? ""}`.matchAll(braces)]
    .map((match) => match[1] ?? "")
    .filter((name) => entries.has(name));
  return [...new Set([...named, ...(row.tokens ?? [])])].filter(Boolean);
};

/** The rows in their groups, in the order the groups first appear. */
export const grouped = (rows: Row[]): { title?: string; rows: Row[] }[] => {
  const groups: { title?: string; rows: Row[] }[] = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (last && last.title === row.group) {
      last.rows.push(row);
    } else {
      groups.push({ title: row.group, rows: [row] });
    }
  }
  return groups;
};

const cell = (text: string) =>
  text.replaceAll("|", "\\|").replaceAll("\n", " ");

/** A token as Markdown: its CSS name and its value, with the dark value when it has one. */
const tokenCell = (name: string) => {
  const entry = tokenEntry(name);
  return `\`${entry.cssVar}\` \`${entry.value}\`${entry.dark ? ` (dark \`${entry.dark}\`)` : ""}`;
};

/** A row with no value of its own (a colour): its tokens' values, light and dark, stand as the value. */
const tokenValues = (names: string[]) =>
  names
    .map((name) => {
      const entry = tokenEntry(name);
      const light = entry.hex ?? entry.value;
      const dark = entry.darkHex ?? entry.dark;
      return `${name} \`${light}\`${dark ? `, dark \`${dark}\`` : ""}`;
    })
    .join("; ");

/**
 * <Rows title rows /> as Markdown: its title in bold, then a table per group with every row's value,
 * its tokens by CSS name with their values, and its note. Nothing a person sees is left out.
 */
export const rowsMarkdown = (props: Record<string, unknown>): string | null => {
  if (typeof props.title !== "string" || !Array.isArray(props.rows)) {
    return null;
  }
  const rows = props.rows as Row[];
  const withTokens = rows.some((row) => tokensOf(row).length > 0);
  const head = withTokens
    ? ["Name", "Value", "Tokens", "Note"]
    : ["Name", "What happens"];
  const table = (group: Row[]) =>
    [
      `| ${head.join(" | ")} |`,
      `| ${head.map(() => "---").join(" | ")} |`,
      ...group.map((row) => {
        // Every row has a value in the twin: its own, else its tokens' values, else its note.
        const value =
          resolve(row.value ?? "") ||
          tokenValues(tokensOf(row)) ||
          resolve(row.note ?? "");
        const cells = withTokens
          ? [
              `**${row.key}**`,
              value,
              tokensOf(row).map(tokenCell).join(", "),
              row.value || tokensOf(row).length ? resolve(row.note ?? "") : "",
            ]
          : [
              `**${row.key}**`,
              [value, row.value ? resolve(row.note ?? "") : ""]
                .filter(Boolean)
                .join(" "),
            ];
        return `| ${cells.map(cell).join(" | ")} |`;
      }),
    ].join("\n");
  return [
    `**${props.title}**`,
    ...grouped(rows).flatMap((group) =>
      [group.title ? `*${group.title}*` : "", table(group.rows)].filter(Boolean)
    ),
  ].join("\n\n");
};
