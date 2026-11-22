// The kind of every component: one plain list, read by the sidebar, the phone menu, Previous and
// Next (site/system/content.ts) and the components overview. A component page sits in the kind
// that names its file (docs/components/<name>.mdx); within a kind the pages stand in the order
// written here. A page not named in any kind goes into the last group, "More", by name, so a page
// added on another branch still shows up everywhere before anyone files it here.
//
// Plain data, no imports: a Node script can read it too.

export interface Kind {
  /**
   * A short id: "choice". Also the overview's heading id, so never one the page already uses:
   * "content" is the skip link's target (<main id="content">), and a group called that made the
   * rail mark it at every scroll position.
   */
  id: string;
  /** What the sidebar's tag says: "Forms". */
  label: string;
  /** Component file names, in the order the sidebar shows them. */
  members: string[];
  /** One sentence under the kind's heading on the overview, where the kind needs saying. */
  says?: string;
}

/** What a block is, in one sentence: the overview and each block's page say it. */
export const blockSays =
  "A block is a ready-made composition of components that a product installs, then owns and edits. It is not a primitive.";

/** The blocks (src/blocks/<name>/): last in the sidebar, apart from the components. */
export const blocksKind: Kind = {
  id: "blocks",
  label: "Blocks",
  members: [
    "app-shell-01",
    "inspector-01",
    "share-dialog-01",
    "connect-api-key-01",
  ],
  says: blockSays,
};

/** Whether a page's file name is a block's. */
export const isBlock = (name: string): boolean =>
  blocksKind.members.includes(name);

export const kinds: Kind[] = [
  {
    id: "actions",
    label: "Actions",
    members: [
      "button",
      "button-group",
      "copy-button",
      "hold-button",
      "link",
      "toggle",
      "theme-toggle",
      "snippet",
    ],
  },
  {
    id: "text-input",
    label: "Text input",
    members: [
      "input",
      "input-group",
      "input-otp",
      "number-field",
      "textarea",
      "tags-input",
      "inline-edit",
      "file-upload",
      "field",
      "label",
      "form",
    ],
  },
  {
    id: "choice",
    label: "Choice",
    members: [
      "checkbox",
      "switch",
      "radio-group",
      "select",
      "combobox",
      "slider",
      "calendar",
      "date-picker",
    ],
  },
  {
    id: "layers",
    label: "Layers",
    members: [
      "dialog",
      "alert-dialog",
      "drawer",
      "sheet",
      "popover",
      "hover-card",
      "tooltip",
      "dropdown-menu",
      "context-menu",
      "command",
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    members: [
      "tabs",
      "breadcrumb",
      "table-of-contents",
      "pagination",
      "stepper",
      "sidebar",
      "page-header",
      "navigation-menu",
      "menubar",
      "tree-view",
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    members: [
      "alert",
      "toast",
      "progress",
      "spinner",
      "agent-indicator",
      "shimmer",
      "skeleton",
      "empty",
      "badge",
    ],
  },
  {
    id: "tables-and-lists",
    label: "Tables and lists",
    members: ["table", "data-table", "data-grid", "item", "key-value"],
  },
  {
    id: "surfaces",
    label: "Surfaces and layout",
    members: [
      "card",
      "section-header",
      "side-panel",
      "accordion",
      "collapsible",
      "carousel",
      "aspect-ratio",
      "container",
      "scroll-area",
      "resizable",
      "separator",
    ],
  },
  {
    id: "content-parts",
    label: "Content",
    members: [
      "text",
      "heading",
      "avatar",
      "audio-player",
      "tag",
      "kbd",
      "icon-tile",
      "brand-icon",
      "code-block",
      "markdown",
      "diff-viewer",
      "stat",
      "chart",
    ],
  },
  {
    id: "agent",
    label: "Agent",
    members: [
      "prompt-input",
      "suggestion",
      "context",
      "attachment",
      "message",
      "message-scroller",
      "chat",
      "bubble",
      "marker",
      "sources",
      "inline-citation",
      "confirmation",
      "questionnaire",
      "model-selector",
      "trace",
      "chain-of-thought",
      "queue",
      "subagent",
      "reasoning",
      "tool",
      "terminal",
      "stack-trace",
      "test-results",
    ],
  },
  blocksKind,
];

/** Where a component not named above goes. */
export const otherKind: Kind = { id: "more", label: "More", members: [] };

/** The kind a component's file name belongs to. */
export const kindOf = (name: string): Kind =>
  kinds.find((kind) => kind.members.includes(name)) ?? otherKind;

/**
 * Sorts component file names as the sidebar shows them: by kind, then in the kind's order; the
 * ones no kind names last, by name.
 */
export const byKind = (a: string, b: string): number => {
  const rank = (name: string) => {
    const at = kinds.findIndex((kind) => kind.members.includes(name));
    return at === -1
      ? [kinds.length, 0]
      : [at, kinds[at]?.members.indexOf(name) ?? 0];
  };
  const [ka, ia] = rank(a);
  const [kb, ib] = rank(b);
  return (ka ?? 0) - (kb ?? 0) || (ia ?? 0) - (ib ?? 0) || a.localeCompare(b);
};
