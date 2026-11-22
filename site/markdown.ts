// The Markdown form of each building block, for the `.md` twin of every page, llms-full.txt and
// the JSON API: what an agent reads in place of what a person sees. The build runs
// these (site/system/markdown-twin.ts) with each component's props as plain data.
import { readFileSync } from "node:fs";

import { readIcons } from "./blocks/icon-data.ts";
import { groupNamed, groupsOf } from "./choosing.ts";
import { chooseMarkdown } from "./guidance.ts";
import { alsoAdd } from "./lib/install-extra.ts";
import { findRoot } from "./lib/root.ts";
import { readProps } from "./props-data.ts";
import { resolve, rowsMarkdown } from "./rows-data.ts";
import type { ComponentMarkdown } from "./system/markdown-twin.ts";
import {
  tokenContrast,
  tokenSets as allTokenSets,
} from "./system/token-file.ts";

// Found from the working folder, not from this file: a build may bundle this file elsewhere.
const root = `${findRoot()}/`;

const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const table = (head: string[], rows: string[][]) =>
  [
    `| ${head.join(" | ")} |`,
    `| ${head.map(() => "---").join(" | ")} |`,
    ...rows.map(
      (row) =>
        `| ${row.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`
    ),
  ].join("\n");

const tokenSets = () => allTokenSets;

/** An example's real source, as a fenced block. */
const exampleSource = (path: string) => {
  for (const ext of ["tsx", "jsx", "astro"]) {
    try {
      const source = readFileSync(
        `${root}examples/${path}.${ext}`,
        "utf-8"
      ).trimEnd();
      return `\`\`\`${ext} title="examples/${path}.${ext}"\n${source}\n\`\`\``;
    } catch {
      // Try the next extension.
    }
  }
  return null;
};

/** An example's source as it is, or null. */
const exampleRaw = (path: string) => {
  for (const ext of ["tsx", "jsx", "astro"]) {
    try {
      return readFileSync(`${root}examples/${path}.${ext}`, "utf-8");
    } catch {
      // Try the next extension.
    }
  }
  return null;
};

/** <Stage path="button/basic" />: the example's real source, as a fenced block. */
const stage: ComponentMarkdown = ({ props }) => {
  const path = typeof props.path === "string" ? props.path : null;
  const code = typeof props.code === "string" ? props.code : path;
  const source = code ? exampleSource(code) : null;
  if (!source) {
    return null;
  }
  const caption = typeof props.caption === "string" ? props.caption : "";
  if (props.row) {
    // The same example as a stage before it, so its source is not repeated.
    return [
      caption,
      `\`examples/${path}\`, shown on the Paper, Soft and Night grounds side by side.`,
    ]
      .filter(Boolean)
      .join("\n\n");
  }
  // What the example imports that its page's install line does not bring (the page is the example's
  // folder: examples/<page>/…), as the Code view says it.
  const raw = code ? exampleRaw(code) : null;
  const extra = code && raw ? alsoAdd(code.split("/")[0] ?? "", raw) : null;
  const also = extra
    ? `This example also uses ${extra.items.map((item) => `\`${item}\``).join(", ")}, which the install line does not bring:\n\n\`\`\`sh\n${extra.command}\n\`\`\``
    : "";
  return [caption, source, also].filter(Boolean).join("\n\n");
};

interface StateCellData {
  label?: unknown;
  force?: unknown;
  props?: unknown;
}

/** <States path cells choose />: the cells as a table (how each state is reached), then the source. */
const states: ComponentMarkdown = ({ props }) => {
  const path = typeof props.path === "string" ? props.path : null;
  const code = typeof props.code === "string" ? props.code : path;
  const cells = Array.isArray(props.cells)
    ? (props.cells as StateCellData[])
    : [];
  const source = code ? exampleSource(code) : null;
  if (!(source && cells.length > 0)) {
    return null;
  }
  const how = (cell: StateCellData) => {
    if (typeof cell.force === "string") {
      return `the \`:${cell.force}\` rule of the component's own CSS`;
    }
    if (cell.props && typeof cell.props === "object") {
      return Object.entries(cell.props)
        .map(([key, value]) => `\`${key}={${JSON.stringify(value)}}\``)
        .join(", ");
    }
    return "no props: at rest";
  };
  const choose = props.choose as
    | { prop?: string; options?: { id: string }[] }
    | undefined;
  const each =
    choose?.prop && Array.isArray(choose.options)
      ? `\n\nShown for each \`${choose.prop}\`: ${choose.options.map((option) => `\`${option.id}\``).join(", ")}.`
      : "";
  return `${table(
    ["State", "Shown with"],
    cells.map((cell) => [String(cell.label ?? ""), how(cell)])
  )}${each}\n\n${source}`;
};

/** <Props source type />: the component's own props, read from its source. */
const propsTable: ComponentMarkdown = ({ props }) => {
  if (typeof props.source !== "string" || typeof props.type !== "string") {
    return null;
  }
  // Named for the part it belongs to, so a page with several tables under one heading still says
  // whose each is: "Props of `FormActions`".
  const part =
    typeof props.label === "string" && props.label !== ""
      ? props.label
      : props.type.replace(/Props$/u, "");
  const rows = readProps(props.source, props.type);
  return `Props of \`${part}\`:\n\n${table(
    ["Prop", "Type", "Default", "What it does"],
    rows.map((row) => [
      // "Required", or when: "required when icon only", "required with state".
      `\`${row.name}\`${row.required ? ` (${row.required.toLowerCase()})` : ""}`,
      // A union of strings has its members, not a type.
      row.members.length
        ? row.members.map((member) => `\`"${member}"\``).join(" or ")
        : `\`${row.type}\``,
      row.default ? `\`${row.default}\`` : "",
      // A token named in the sentence ({duration-press-and-hold}) reads as its value.
      `${row.deprecated === undefined ? "" : `Deprecated: ${row.deprecated} `}${resolve(row.description)}`,
    ])
  )}`;
};

/** <Rules always never />: two short lists. */
const rules: ComponentMarkdown = ({ props }) => {
  const always = strings(props.always);
  const never = strings(props.never);
  return [
    always.length > 0
      ? `**Always**\n\n${always.map((rule) => `- ${rule}`).join("\n")}`
      : "",
    never.length > 0
      ? `**Never**\n\n${never.map((rule) => `- ${rule}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

/**
 * <Intent of always never />: the page's own rules, every line (the page draws them as one Do /
 * Don't block, at most four lines a side), then the Choosing groups the component is in.
 */
const intent: ComponentMarkdown = (tag) => {
  const { props } = tag;
  if (typeof props.of !== "string") {
    return "";
  }
  const { of } = props;
  const groups = groupsOf(of).flatMap((group) => {
    const table = chooseMarkdown(group.of, of);
    return table === null
      ? []
      : [
          `**Could be taken for: ${group.title.replace(/^./u, (letter) => letter.toLowerCase())}**\n\n${table}`,
        ];
  });
  return [rules(tag) ?? "", ...groups].filter(Boolean).join("\n\n");
};

/** <Choose of />: components that could do the same job, as one table from their pages. */
const choose: ComponentMarkdown = ({ props }) => {
  const names = Array.isArray(props.of)
    ? props.of.map(String)
    : typeof props.group === "string"
      ? groupNamed(props.group)?.of
      : undefined;
  return (names ? chooseMarkdown(names) : null) ?? "";
};

/** <LightStrip />: the seven stops in order. */
const lightStrip: ComponentMarkdown = () => {
  const light = tokenSets().find((candidate) => candidate.id === "light");
  if (!light) {
    return null;
  }
  return table(
    ["Stop", "CSS", "Value", "Hex"],
    light.tokens.map((entry, index) => [
      String(index + 1),
      `\`${entry.cssVar}\``,
      `\`${entry.value}\``,
      "hex" in entry && entry.hex ? `\`${entry.hex}\`` : "",
    ])
  );
};

/** "First sentence. The rest." as one paragraph: the two inks are a look, not a meaning. */
const lead = (value: unknown) => (typeof value === "string" ? value : "");

/** <Head lead install use />: the lead and the commands. */
const head: ComponentMarkdown = ({ props }) => {
  const parts = [lead(props.lead)];
  const fence = "```";
  if (typeof props.install === "string") {
    parts.push(`${fence}sh\n${props.install}\n${fence}`);
  }
  if (typeof props.use === "string") {
    parts.push(`${fence}tsx\n${props.use}\n${fence}`);
  }
  return parts.filter(Boolean).join("\n\n");
};

/** <Statement text />: the opening line. */
const statement: ComponentMarkdown = ({ props }) => lead(props.text) || null;

/** <Ways items />: a numbered list of links. */
const ways: ComponentMarkdown = ({ props }) => {
  const items = Array.isArray(props.items)
    ? (props.items as { name?: string; line?: string; href?: string }[])
    : [];
  return (
    items
      .map(
        (item, index) =>
          `${index + 1}. [${item.name}](${item.href}): ${item.line}`
      )
      .join("\n") || null
  );
};

/** <Rows title rows />: a table per group, every row with its value, its tokens by CSS name with
 * their light and dark values, and its note (site/rows-data.ts, rowsMarkdown). */
const rowsTable: ComponentMarkdown = ({ props }) => rowsMarkdown(props);

/** <Tokens set label note />: the group's label as a heading, its note, and its sets as one table, with each colour's lowest contrast. */
const tokenRows: ComponentMarkdown = ({ props }) => {
  const ids = String(props.set ?? "")
    .split(/\s+/u)
    .filter(Boolean);
  const sets = tokenSets();
  const entries = ids.flatMap(
    (id) => sets.find((candidate) => candidate.id === id)?.tokens ?? []
  );
  if (entries.length === 0) {
    return null;
  }
  const lowest = (name: string) => {
    const pairs = tokenContrast.filter((pair) => pair.text === name);
    if (pairs.length === 0) {
      return "";
    }
    const worst = pairs.reduce((a, b) =>
      Math.min(a.light, a.dark) <= Math.min(b.light, b.dark) ? a : b
    );
    return `${Math.min(worst.light, worst.dark).toFixed(2)}:1 on \`${worst.on}\` (needs ${worst.floor}:1)`;
  };
  const head = [
    props.label ? `### ${props.label}` : "",
    props.note ? String(props.note) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const rows = table(
    ["CSS", "StyleX", "Light", "Dark", "Use", "Lowest contrast"],
    entries.map((entry) => [
      `\`${entry.cssVar}\``,
      `\`${entry.stylex}\``,
      `\`${entry.value}\``,
      "dark" in entry && entry.dark ? `\`${entry.dark}\`` : "same",
      entry.use,
      lowest(entry.name),
    ])
  );
  return head ? `${head}\n\n${rows}` : rows;
};

/** <TypeFaces />: the three families, serif first, as a table. */
const typeFaces: ComponentMarkdown = () => {
  const families =
    tokenSets().find((candidate) => candidate.id === "families")?.tokens ?? [];
  const order = ["font-serif", "font-sans", "font-mono"];
  return table(
    ["CSS", "StyleX", "Value", "Use"],
    [...families]
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
      .map((entry) => [
        `\`${entry.cssVar}\``,
        `\`${entry.stylex}\``,
        `\`${entry.value}\``,
        entry.use,
      ])
  );
};

/** <TypeRows set />: sizes with their line heights, largest first, or the weights and tracking, as a table. */
const typeRows: ComponentMarkdown = ({ props }) => {
  const tokens =
    tokenSets().find((candidate) => candidate.id === props.set)?.tokens ?? [];
  if (tokens.length === 0) {
    return null;
  }
  if (props.set !== "sizes") {
    return table(
      ["CSS", "StyleX", "Value", "Use"],
      tokens.map((entry) => [
        `\`${entry.cssVar}\``,
        `\`${entry.stylex}\``,
        `\`${entry.value}\``,
        entry.use,
      ])
    );
  }
  const sizes = tokens
    .filter((entry) => !entry.name.endsWith("-line"))
    .reverse();
  return table(
    ["CSS", "StyleX", "Size", "Line height", "Line height CSS", "Use"],
    sizes.map((size) => {
      const line = tokens.find((entry) => entry.name === `${size.name}-line`);
      return [
        `\`${size.cssVar}\``,
        `\`${size.stylex}\``,
        `\`${size.value}\``,
        line ? `\`${line.value}\`` : "",
        line ? `\`${line.cssVar}\`` : "",
        size.use,
      ];
    })
  );
};

/** <SampleRows set kind label note />: the group's label as a heading, its note, and its tokens as a table. */
const sampleRows: ComponentMarkdown = ({ props }) => {
  const ids = String(props.set ?? "")
    .split(/\s+/u)
    .filter(Boolean);
  const sets = tokenSets();
  const entries = ids.flatMap(
    (id) => sets.find((candidate) => candidate.id === id)?.tokens ?? []
  );
  if (entries.length === 0) {
    return null;
  }
  const head = [
    props.label ? `### ${props.label}` : "",
    props.note ? String(props.note) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const rows = table(
    ["CSS", "StyleX", "Light", "Dark", "Use"],
    entries.map((entry) => [
      `\`${entry.cssVar}\``,
      `\`${entry.stylex}\``,
      `\`${entry.value}\``,
      "dark" in entry && entry.dark ? `\`${entry.dark}\`` : "same",
      entry.use,
    ])
  );
  return head ? `${head}\n\n${rows}` : rows;
};

/** <IconList />: every icon, its import name, its Hugeicons drawing and its use, as a table. */
const iconList: ComponentMarkdown = () =>
  table(
    ["Import", "Hugeicons", "Use"],
    readIcons().map((entry) => [
      `\`${entry.name}\``,
      `\`${entry.source}\``,
      entry.use,
    ])
  );

/** <Scene title note />: the scene's title as a heading and its note; the picture is for people. */
const scene: ComponentMarkdown = ({ props }) => {
  const title = typeof props.title === "string" ? `### ${props.title}\n\n` : "";
  const note = typeof props.note === "string" ? props.note : "";
  return `${title}${note}`.trim() || null;
};

/** <AllTokens>: a heading, then the token groups inside it. */
const allTokens: ComponentMarkdown = ({ props, children }) =>
  `## ${typeof props.label === "string" ? props.label : "Every token"}\n\n${children}`;

/** <Reference>: its sections as they are, open; the folds are a look, not a meaning. */
const reference: ComponentMarkdown = ({ children }) => children;

export const markdownComponents: Record<string, ComponentMarkdown> = {
  Reference: reference,
  Part: () => "",
  Scene: scene,
  AllTokens: allTokens,
  Head: head,
  Statement: statement,
  Ways: ways,
  Rows: rowsTable,
  Tokens: tokenRows,
  TokenFilter: () => "",
  LightStrip: lightStrip,
  Props: propsTable,
  States: states,
  Intent: intent,
  Choose: choose,
  Rules: rules,
  Stage: stage,
  TypeFaces: typeFaces,
  TypeRows: typeRows,
  SampleRows: sampleRows,
  IconList: iconList,
};
