// Markdown is a folder, not one file, because its pure half earns its own: parse.ts reads the
// answer (the tree, the safe links) and repair.ts makes a half-written one whole, with no React, so
// they are tested as plain functions, and markdown.tsx draws what they read; pace.ts lets a
// streamed answer's words out at a steady pace (its pace is plain functions too), reveal.tsx fades
// them in.
export { Markdown, MarkdownLinkProvider } from "./markdown";
export type {
  MarkdownComponents,
  MarkdownLink,
  MarkdownLinkRenderer,
  MarkdownProps,
  MarkdownSoftBreaks,
} from "./markdown";
export { parseMarkdown } from "./parse";
export type { MarkdownNode, MarkdownRoot } from "./parse";
