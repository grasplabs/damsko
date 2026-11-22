import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// The long pages the table of contents examples sit beside, and their look: a page that scrolls in a box of
// its own, so the table of contents follows it inside the example's frame. Each example gives its sections a
// prefix of its own, so two examples on one docs page never share an id.

/** One section of an example page: its heading, its place in the table of contents and its paragraphs. */
export interface Section {
  id: string;
  label: string;
  level?: 2 | 3;
  group?: string;
  collapsed?: boolean;
  text: string[];
}

type Draft = Omit<Section, "id"> & { slug: string };

const workspace: Draft[] = [
  {
    slug: "overview",
    label: "Overview",
    text: [
      "A workspace holds your team's projects, the people who work on them and the data they read from. Most teams need one; a company with separate departments may want one for each.",
      "This guide walks through setting one up, from the first project to closing it when you no longer need it.",
    ],
  },
  {
    slug: "create",
    label: "Create a workspace",
    text: [
      "Choose New workspace from the menu at the top left and give it a name your team will recognise. You can change the name later; the address stays the same.",
      "The person who creates a workspace is its first admin. Add a second admin early, so nobody is locked out when someone is away.",
    ],
  },
  {
    slug: "invite",
    label: "Invite your team",
    text: [
      "Invite people by email from Settings, under People. Each invitation is good for seven days, and you can send it again from the same list.",
      "People who sign in with your company's single sign-on join without an invitation, as members.",
    ],
  },
  {
    slug: "roles",
    label: "Roles",
    level: 3,
    text: [
      "Admins manage people, billing and connections. Members create and edit projects. Viewers read everything they are given, and change nothing.",
    ],
  },
  {
    slug: "guests",
    label: "Guests from outside the company",
    level: 3,
    text: [
      "A guest sees only the projects they are invited to. Guests do not count towards your plan's seats, and an admin can remove them at any time.",
    ],
  },
  {
    slug: "data",
    label: "Connect your data",
    text: [
      "Connections let projects read from the tools you already use: a database, a shared drive, a ticket tracker. Each connection is added once and shared with the projects that need it.",
      "A connection reads with the permissions of the account that added it. Use a service account where you can, not a person's.",
    ],
  },
  {
    slug: "notifications",
    label: "Notifications",
    text: [
      "Each person chooses what they hear about, from a project's activity to a weekly summary. Admins can set the defaults for new members.",
      "Notifications arrive in the app and by email; nothing is sent outside working hours unless someone asks for it.",
    ],
  },
  {
    slug: "billing",
    label: "Billing",
    text: [
      "Your plan is billed by the month or the year, for the number of members. Viewers are free on every plan.",
      "Invoices are sent to the billing contact and kept under Settings, in Billing, for as long as the workspace exists.",
    ],
  },
  {
    slug: "close",
    label: "Close a workspace",
    text: [
      "Closing a workspace removes its projects and connections after thirty days. Until then, an admin can open it again with everything in place.",
      "Export what you want to keep first: each project can be downloaded as a folder of files.",
    ],
  },
];

const publishing: Draft[] = [
  {
    slug: "start",
    label: "Before you start",
    text: [
      "Posts are written as drafts, read by a reviewer and published on the date you choose. Anyone in the team can write; only editors publish.",
    ],
  },
  {
    slug: "draft",
    label: "Write a draft",
    group: "Using it",
    text: [
      "Start a draft from the New post button. It saves as you type, and only you can see it until you ask for a review.",
      "Add a summary of a sentence or two: it is what readers see in the list and in a link's preview.",
    ],
  },
  {
    slug: "review",
    label: "Ask for a review",
    group: "Using it",
    text: [
      "Choose a reviewer from your team. They can comment on any line and suggest changes, which you accept or turn down one at a time.",
    ],
  },
  {
    slug: "publish",
    label: "Publish",
    group: "Using it",
    text: [
      "Once a reviewer approves the draft, an editor can publish it at once. A published post can still be changed; readers see the change straight away.",
    ],
  },
  {
    slug: "schedule",
    label: "Schedule a post",
    level: 3,
    group: "Using it",
    text: [
      "Pick a date and a time instead, and the post goes out then, in the time zone of the workspace.",
    ],
  },
  {
    slug: "settings",
    label: "Settings",
    group: "Reference",
    collapsed: true,
    text: [
      "Who may publish, the default reviewer, and the time zone posts are scheduled in.",
    ],
  },
  {
    slug: "shortcuts",
    label: "Keyboard shortcuts",
    group: "Reference",
    collapsed: true,
    text: [
      "Save with Command S, ask for a review with Command Enter, and publish with Command Shift P.",
    ],
  },
  {
    slug: "limits",
    label: "Limits",
    group: "Reference",
    collapsed: true,
    text: [
      "A post holds up to 50,000 words and 200 pictures. A workspace keeps every version of a post for a year.",
    ],
  },
];

const policy: Draft[] = [
  {
    slug: "who",
    label: "Who we are",
    text: [
      "We make software for teams. This policy says what we collect when you use it, why, and what you can ask us to do with it.",
    ],
  },
  {
    slug: "collect",
    label: "What we collect",
    text: [
      "Your name, your email address and the workspaces you belong to. What you write and upload stays yours; we keep it only to show it to the people you share it with.",
      "We also keep a record of when you sign in and from which device, so we can tell you when something looks wrong.",
    ],
  },
  {
    slug: "use",
    label: "How we use it",
    text: [
      "To run the service, to keep your account safe and to send you the messages you asked for. We never sell it, and we never use what you write to train anything.",
    ],
  },
  {
    slug: "share",
    label: "Who we share it with",
    text: [
      "The companies that host and support the service for us, each bound to the same rules. A list of them, and of the countries they work in, is on our website.",
    ],
  },
  {
    slug: "keep",
    label: "How long we keep it",
    text: [
      "As long as your account is open. When you close it, we delete what is yours within thirty days, and our backups forget it within ninety.",
    ],
  },
  {
    slug: "rights",
    label: "Your rights",
    text: [
      "You can ask for a copy of what we hold about you, ask us to correct it or to delete it, and object to how we use it. We answer within a month.",
    ],
  },
  {
    slug: "contact",
    label: "Contact us",
    text: [
      "Write to our privacy team from the Help menu. If you are not happy with our answer, you can complain to your country's data protection authority.",
    ],
  },
];

const prefixed = (prefix: string, drafts: Draft[]): Section[] =>
  drafts.map(({ slug, ...section }) => ({
    id: `${prefix}-${slug}`,
    ...section,
  }));

/** The guide to setting up a workspace: sections and two inside one. */
export const workspaceGuide = (prefix: string) => prefixed(prefix, workspace);

/** The guide to publishing: a part with no name, then "Using it" and a collapsed "Reference". */
export const publishingGuide = (prefix: string) => prefixed(prefix, publishing);

/** A privacy policy: plain sections, under a header that stays in view. */
export const privacyPolicy = (prefix: string) => prefixed(prefix, policy);

/** The table of contents' items for a page's sections: what it lists, not the paragraphs. */
export const itemsOf = (sections: Section[]) =>
  sections.map(({ text: _text, ...item }) => item);

export const look = stylex.create({
  // The page and the table of contents beside it; on a narrow window, the table of contents under the page.
  frame: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: "minmax(0, 1fr) 13rem",
    },
    columnGap: space["10"],
    rowGap: space["6"],
    alignItems: "start",
    width: "100%",
    maxWidth: "52rem",
  },
  // The compact form needs only the ticks' width beside the page, at any width.
  frameCompact: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    columnGap: space["4"],
    alignItems: "start",
    width: "100%",
    maxWidth: "48rem",
  },
  // The box that scrolls: the page, on its own raised ground.
  page: {
    boxSizing: "border-box",
    height: "26rem",
    overflowY: "auto",
    paddingBlock: space["6"],
    paddingInline: { default: space["5"], [media.sm]: space["8"] },
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: size.borderStrong,
    // Edges drawn as a shadow vanish in forced colours: a real one there.
    borderWidth: { default: 0, [media.forcedColors]: 1 },
    borderStyle: "solid",
    borderColor: "CanvasText",
    fontFamily: font.sans,
  },
  // A page under a header that stays in view at its top.
  pageWithHeader: {
    paddingBlockStart: 0,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    marginInline: `calc(-1 * ${space["5"]})`,
    paddingInline: space["5"],
    paddingBlock: space["4"],
    marginBlockEnd: space["2"],
    backgroundColor: colors.card,
    boxShadow: `0 ${size.hairline} 0 ${colors.border}`,
  },
  headerWide: {
    marginInline: {
      default: `calc(-1 * ${space["5"]})`,
      [media.sm]: `calc(-1 * ${space["8"]})`,
    },
    paddingInline: { default: space["5"], [media.sm]: space["8"] },
  },
  headerTitle: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  headerNote: {
    margin: 0,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  // The page's own title and a line under it, before its first section.
  title: {
    margin: 0,
    fontSize: font.textLg,
    lineHeight: font.textLgLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
  },
  lead: {
    margin: 0,
    marginBlockStart: space["2"],
    maxWidth: "38rem",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textWrap: "pretty",
  },
  part: {
    margin: 0,
    marginBlockStart: space["8"],
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  heading: {
    margin: 0,
    marginBlockStart: space["8"],
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    // Followed from the table of contents, a heading stands clear of the box's top.
    scrollMarginTop: space["6"],
  },
  // Under a header that stays in view, a followed heading stands clear of the header.
  headingUnder: {
    scrollMarginTop: space["24"],
  },
  sub: {
    marginBlockStart: space["6"],
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  first: {
    marginBlockStart: 0,
  },
  // The first heading under a part's name: close under it, so the name labels it.
  afterPart: {
    marginBlockStart: space["2"],
  },
  paragraph: {
    margin: 0,
    marginBlockStart: space["2"],
    maxWidth: "38rem",
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    textWrap: "pretty",
  },
  // A collapsed section: its heading shows, its words open under it.
  fold: {
    marginBlockStart: space["8"],
  },
  // A little wider than its words, its words on the page's edge: its ring keeps off the letters.
  summary: {
    width: "fit-content",
    cursor: "pointer",
    listStyle: "none",
    paddingInline: space["1"],
    marginInline: `calc(-1 * ${space["1"]})`,
    borderRadius: radius.mark,
  },
  foldHeading: {
    marginBlockStart: 0,
  },
  // Room under the last section, so the page reads to its end.
  end: {
    height: space["16"],
  },
  // The table of contents beside the page; stacked under it on a narrow window, its words on the page's text
  // edge (the table of contents' words stand space-3 in from its own box).
  side: {
    minWidth: 0,
    paddingInlineStart: {
      default: `calc(${space["5"]} - ${space["3"]})`,
      [media.sm]: `calc(${space["8"]} - ${space["3"]})`,
      [media.md]: 0,
    },
  },
  // The ticks a little below the page's top, so the list they open does not sit on its corner.
  beside: {
    marginBlockStart: space["8"],
  },
  // The page's own actions in the table of contents' footer: quiet words with an icon.
  actions: {
    display: "grid",
    justifyItems: "start",
    rowGap: space["2"],
  },
  // As tall as a tap on a touch screen.
  action: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: space["2"],
    minHeight: { default: null, [media.pointerCoarse]: size.tapTarget },
    marginBlock: 0,
    marginInline: `calc(-1 * ${space["1"]})`,
    paddingBlock: 0,
    paddingInline: space["1"],
    borderWidth: 0,
    borderRadius: radius.mark,
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
    },
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    textDecoration: "none",
    cursor: "pointer",
  },
});
