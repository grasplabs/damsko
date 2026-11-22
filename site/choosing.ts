// The Choosing groups: components that could be taken for each other, in the order of the
// Choosing guideline (docs/guidelines/choosing.mdx, which draws each with <Choose group />). A
// component's page shows the groups it is in under "When to use it" (site/blocks/Intent.astro),
// its own row marked. One list, so the guideline and the pages never disagree.
export interface ChoosingGroup {
  title: string;
  of: string[];
}

export const choosingGroups: ChoosingGroup[] = [
  {
    title: "Something over the page",
    of: [
      "dialog",
      "alert-dialog",
      "sheet",
      "drawer",
      "popover",
      "hover-card",
      "tooltip",
    ],
  },
  {
    title: "Rows of things",
    of: ["table", "data-table", "data-grid", "item", "key-value"],
  },
  {
    title: "Saying that something happened",
    of: ["toast", "alert", "empty"],
  },
  { title: "How something stands", of: ["badge", "tag"] },
  {
    title: "Waiting",
    of: ["skeleton", "spinner", "progress", "agent-indicator", "shimmer"],
  },
  {
    title: "Asking before a step",
    of: ["alert-dialog", "confirmation", "questionnaire"],
  },
  {
    title: "One of several",
    of: [
      "radio-group",
      "select",
      "combobox",
      "checkbox",
      "switch",
      "toggle",
      "tabs",
    ],
  },
  {
    title: "A list of actions",
    of: ["dropdown-menu", "context-menu", "menubar", "command", "button-group"],
  },
  {
    title: "Something to press",
    of: ["button", "link", "toggle", "hold-button", "copy-button"],
  },
  { title: "Sections that open", of: ["accordion", "collapsible"] },
  { title: "A date", of: ["date-picker", "calendar"] },
  { title: "Where an answer came from", of: ["sources", "inline-citation"] },
  {
    title: "An assistant's work",
    of: [
      "trace",
      "reasoning",
      "chain-of-thought",
      "tool",
      "queue",
      "subagent",
      "confirmation",
      "terminal",
      "stack-trace",
      "test-results",
    ],
  },
  {
    title: "A conversation",
    of: [
      "chat",
      "message-scroller",
      "message",
      "bubble",
      "marker",
      "checkpoint",
      "sources",
      "inline-citation",
      "suggestion",
      "context",
      "attachment",
      "questionnaire",
      "prompt-input",
      "model-selector",
    ],
  },
  {
    title: "Typing",
    of: [
      "input",
      "textarea",
      "number-field",
      "input-otp",
      "tags-input",
      "prompt-input",
    ],
  },
  {
    title: "Steps and places",
    of: [
      "stepper",
      "tabs",
      "breadcrumb",
      "table-of-contents",
      "navigation-menu",
      "sidebar",
      "pagination",
    ],
  },
  {
    title: "A page's parts",
    of: ["page-header", "section-header", "card", "side-panel", "inspector-01"],
  },
];

/** The groups a component is in: none for most. */
export const groupsOf = (name: string): ChoosingGroup[] =>
  choosingGroups.filter((group) => group.of.includes(name));

/** A group by its title, as the guideline names it. */
export const groupNamed = (title: string): ChoosingGroup | undefined =>
  choosingGroups.find((group) => group.title === title);
