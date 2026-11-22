// The brand book's words and facts: one source for the rooms at
// /brand and, later, the one-file download. Every rule comes from Grasp's brand kit, as the
// website applies it, or its copy; what is a draft for review says so. No misuse and no do and don't: each rule is said once, as
// what to do.

export type RoomId =
  | "grasp"
  | "names"
  | "logo"
  | "colour"
  | "type"
  | "voice"
  | "visual-language"
  | "motion"
  | "icons"
  | "layout"
  | "product"
  | "applications"
  | "downloads";

export interface Room {
  id: RoomId;
  number: string;
  title: string;
  /** Open to visitors: built and linked. The others show on the floor plan, closed. */
  open: boolean;
}

/** The rooms in the order of the table of contents. */
export const rooms: Room[] = [
  { id: "grasp", number: "01", title: "Grasp", open: true },
  { id: "names", number: "02", title: "Names", open: true },
  { id: "logo", number: "03", title: "Logo and mark", open: true },
  { id: "colour", number: "04", title: "Colour", open: true },
  { id: "type", number: "05", title: "Type", open: true },
  { id: "voice", number: "06", title: "Voice and tone", open: true },
  {
    id: "visual-language",
    number: "07",
    title: "The visual language",
    open: true,
  },
  { id: "motion", number: "08", title: "Motion", open: true },
  { id: "icons", number: "09", title: "Icons and marks", open: true },
  { id: "layout", number: "10", title: "Layout", open: true },
  {
    id: "product",
    number: "11",
    title: "The brand in the product",
    open: true,
  },
  { id: "applications", number: "12", title: "Applications", open: true },
  { id: "downloads", number: "13", title: "Downloads", open: true },
];

export const roomOf = (id: RoomId): Room =>
  rooms.find((room) => room.id === id) ?? rooms[0]!;
export const openRooms = rooms.filter((room) => room.open);
export const roomHref = (id: RoomId) => `/brand/${id}`;

/** The rooms either side of one, among those open. */
export const neighbours = (id: RoomId) => {
  const index = openRooms.findIndex((room) => room.id === id);
  return { previous: openRooms[index - 1], next: openRooms[index + 1] };
};

export const frameWords = {
  book: "Brand book",
  home: "Brand book home",
  plan: "Floor plan",
  planTitle: "Floor plan",
  planLine: "Thirteen rooms. Choose one to go there.",
  closed: "Not open yet",
  here: "You are here",
  entrance: "Entrance",
  next: "Next room",
  previous: "Previous room",
  docs: "Docs",
  rooms: "Rooms",
  /** Out of the book, back to the docs (or to the page the reader came from). */
  back: "Back to Damsko",
  backHref: "/get-started/",
  /** In the one-file book: back to its cover, and to its contents. */
  backToCover: "Back to the cover",
  coverId: "cover",
  contentsId: "contents",
};

export const entranceWords = {
  title: "Brand book",
  line: "How Grasp looks, sounds and moves, in thirteen rooms.",
  enter: "Enter",
  plan: "Floor plan",
  download: "Download the brand book",
  bookHref: "/brand/grasp-brand-book.html",
  bookFile: "grasp-brand-book.html",
};

/** The one-file book's own words (/brand/book, and the file made from it after the build). */
export const bookWords = {
  title: "Grasp brand book",
  /** The cover's name, set as the entrance sets it. */
  cover: "Brand book",
  line: "How Grasp looks, sounds and moves, in thirteen rooms.",
  contents: "Contents",
  from: "Made from damsko.joingrasp.com/brand, with the same words and rules as the site.",
};

/** The logo's geometry, in the logo file's own units (viewBox 0 0 118 28). */
export const logoBox = {
  width: 118,
  height: 28,
  bar: 4.55,
  markWidth: 29.2,
  markHeight: 24.7,
} as const;

export interface LogoFile {
  id: "logo-ink" | "logo-white" | "mark-ink" | "mark-white";
  name: string;
  src: string;
  kind: "logo" | "mark";
}

/**
 * The four files, served from /brand/ (the library's copy, whose "a" is drawn correctly), drawn as
 * they are. The logo's ink is #04251B (decided): the files, the logo room, the colour
 * room's note and the downloads all name it. #062d22 is the brand's Ink, the darkest colour for
 * text, and is never called the logo's ink.
 */
export const logoFiles: LogoFile[] = [
  {
    id: "logo-white",
    name: "Logo, white",
    src: "/brand/grasp-logo-white.svg",
    kind: "logo",
  },
  {
    id: "logo-ink",
    name: "Logo, ink",
    src: "/brand/grasp-logo-ink.svg",
    kind: "logo",
  },
  {
    id: "mark-white",
    name: "Mark, white",
    src: "/brand/grasp-mark-white.svg",
    kind: "mark",
  },
  {
    id: "mark-ink",
    name: "Mark, ink",
    src: "/brand/grasp-mark-ink.svg",
    kind: "mark",
  },
];

export const fileOf = (id: LogoFile["id"]): LogoFile =>
  logoFiles.find((file) => file.id === id) ?? logoFiles[0]!;

export const logoWords = {
  alt: "The Grasp logo",
  markAlt: "The Grasp mark",
  glass:
    "The ink logo on light backgrounds, the white logo on dark ones. No other colours.",
  clear:
    "Keep empty space round the logo, two bars of the mark wide, on every side.",
  clearUnit: "One bar",
  sizes: "The logo from 72px wide. Below that the mark, down to 16px.",
  sizeLabel: "Width in pixels",
  sizeLogo: "The logo",
  sizeMark: "The mark",
  sizeNone: "Too small",
  mark: "Where the word will not fit, the mark alone.",
  /** The logo's own ink, said on the first wall. */
  ink: "The logo's ink is #04251B. Use the files here as they are.",
  /** The website's copies of the files are older. */
  olderA:
    "The website's logo files still carry an older \u201Ca\u201D; the files here have the correct one.",
  download: "Download",
  copySvg: "Copy SVG",
  copied: "Copied",
  copyFailed: "Could not copy",
};

export interface Stop {
  id: "paper" | "lime" | "sea" | "mint" | "pine" | "ink" | "night";
  name: string;
  role: string;
  token: string;
  /** Words on it are light. */
  dark: boolean;
}

/** The seven stops of the light, from the edge of the glass to its centre (tokens.ts, light). */
export const stops: Stop[] = [
  {
    id: "paper",
    name: "Paper",
    role: "Light pages",
    token: "brand-paper",
    dark: false,
  },
  {
    id: "lime",
    name: "Lime",
    role: "Highlight",
    token: "brand-lime",
    dark: false,
  },
  {
    id: "sea",
    name: "Sea",
    role: "Soft accent",
    token: "brand-sea",
    dark: false,
  },
  {
    id: "mint",
    name: "Mint",
    role: "Accent",
    token: "brand-mint",
    dark: false,
  },
  { id: "pine", name: "Pine", role: "Depth", token: "brand-pine", dark: true },
  { id: "ink", name: "Ink", role: "Text", token: "brand-ink", dark: true },
  {
    id: "night",
    name: "Night",
    role: "Dark pages",
    token: "brand-night",
    dark: true,
  },
];

export interface Pair {
  text: Stop["id"];
  on: Stop["id"];
}

/** The pairs that carry words, measured where they are drawn. */
export const pairs: Pair[] = [
  { text: "ink", on: "paper" },
  { text: "paper", on: "night" },
  { text: "lime", on: "night" },
  { text: "mint", on: "night" },
  { text: "ink", on: "mint" },
  { text: "ink", on: "lime" },
  { text: "paper", on: "pine" },
  { text: "pine", on: "paper" },
];

export const colourWords = {
  light: "Seven colours, one gradient, always in this order.",
  pairs:
    "Text needs a contrast of at least 4.5:1. Each pair here is measured on screen.",
  /** The logo's ink is its own, not one of the seven. */
  logoInk:
    "The logo has its own ink, #04251B. Ink, #062d22, is the darkest colour for text, not the logo's.",
  css: "Download as CSS",
  cssHref: "/brand/grasp-colours.css",
  copy: "Copy",
  sample: "Aa",
  on: "on",
};

export interface StatementPart {
  text: string;
  /** The sentence that turns to full ink last. Key words start with `*`. */
  lead: boolean;
}

/** The homepage's problem, in two sentences. */
export const statement: StatementPart[] = [
  { text: "You've invested in *AI.", lead: false },
  { text: "Your *operations haven't changed.", lead: true },
];

export interface Principle {
  title: string;
  example: string;
}

/** A draft of the voice in four principles, read from the website's copy. */
export const principles: Principle[] = [
  {
    title: "Say what happens",
    example: "Supplier invoices are matched to orders by hand, every week.",
  },
  {
    title: "People keep the decisions",
    example: "AI takes the repetitive steps; your people keep the decisions.",
  },
  {
    title: "Short, turned on a contrast",
    example: "We start with the work, not with the tools.",
  },
  {
    title: "Answer first",
    example: "Keep it. Copilot helps each person with their own tasks.",
  },
];

/** The website's correction, from the brand's record of decisions. */
export const rewrite = {
  before: "Tested on last week's work by the people who run it.",
  after:
    "We rebuild one of your most time-consuming processes, chosen with you.",
};

export interface HouseRule {
  pattern: RegExp;
  says: string;
}

/** The website's house rules for words, as the checker reads them. */
export const houseRules: HouseRule[] = [
  { pattern: /—/u, says: "An em dash: a comma, a colon or a full stop." },
  { pattern: /\benterprise\b/iu, says: '"Enterprise": say who you mean.' },
  { pattern: /\breally\b/iu, says: '"Really": cut it.' },
  { pattern: /\bactually\b/iu, says: '"Actually": cut it.' },
  {
    pattern: /how the work gets done/iu,
    says: '"How the work gets done": say which work.',
  },
  {
    pattern: /\bcompany brain\b|\bCompany brain\b|\bcompany Brain\b/u,
    says: '"Company Brain" takes two capitals.',
  },
  {
    pattern: /\bhet Company Brain\b/iu,
    says: 'In Dutch, "Company Brain" takes no article.',
  },
  {
    pattern:
      /\b(?:organiz|optimiz|analyz|prioritiz|recogniz|customiz)\w*|\b(?:color|behavior|center|favorite|program)s?\b/iu,
    says: "American spelling: write it the British way.",
  },
];

export const voiceWords = {
  statement: "Plain, measured, and on the reader's side.",
  principles: "Four principles, read from the website's copy.",
  principlesDraft: "A draft for review.",
  sheets: "Be straight: say what happens.",
  before: "Before",
  after: "After",
  checker:
    "The house rules, checked by a test on every word the website shows.",
  checkerLabel: "Try a sentence",
  checkerStart:
    "Our platform really helps enterprise teams optimize how the work gets done.",
  checkerClean: "Nothing against the house rules.",
};

/** Room 01: what Grasp is, as the website says it. */
export const graspWords = {
  promise: ["Make your company", "AI-native."],
  promiseRule: "One promise, said the same way everywhere.",
  method: "The method is three verbs, always in this order.",
  meadow: "Transformation starts small, and grows.",
  about: "One paragraph about Grasp, to use as it is.",
  aboutText:
    "Grasp is an AI transformation company based in Amsterdam. It makes companies AI-native: it maps how a company works, rebuilds the processes that cost the most so AI does the repetitive steps and people keep the decisions, and measures each change in hours and euros.",
  copy: "Copy the paragraph",
  meadowLabel: "A meadow growing from one seed",
};

/** The meadow's four chapters, one line each, as the website's footer says them. */
export const meadowLines = [
  "Transformation starts small.",
  "First, a single flower.",
  "Then it grows, one small step at a time.",
  "Until it reaches your whole organisation.",
];

export interface Step {
  verb: string;
  line: string;
}

/** The method (the overview's three steps). */
export const method: Step[] = [
  { verb: "Map", line: "Map how your organisation operates" },
  { verb: "Rebuild", line: "Rebuild your costliest processes" },
  { verb: "Prove", line: "Prove what each change is worth" },
];

export interface Name {
  name: string;
  line: string;
}

/** Room 02: the names, as the website writes them. */
export const names: Name[] = [
  { name: "Grasp", line: "The company. One word, one capital." },
  { name: "Grasp Work", line: "The platform where rebuilt processes run." },
  { name: "Company Brain", line: "Two capitals. In Dutch, no article." },
  { name: "Stephen", line: "Our AI interviewer." },
];

export const namesWords = {
  names: "Each name is written one way, in every language.",
  stephen: "Stephen, the agent, is always drawn as the same grid of greens.",
  stephenAlt: "Stephen, drawn as a field of greens in a circle",
  dutch: "Dutch is written as Dutch: je, and never word for word.",
  english: "English",
  dutchName: "Nederlands",
};

export interface Translation {
  en: string;
  nl: string;
}

/** The same words in both languages, as the website has them. */
export const translations: Translation[] = [
  {
    en: "Map how your organisation operates",
    nl: "Map hoe je organisatie werkt",
  },
  {
    en: "Rebuild your costliest processes",
    nl: "Herbouw de duurste processen",
  },
  {
    en: "Prove what each change is worth",
    nl: "Meet wat elke wijziging oplevert",
  },
];

/** Room 05: type (tokens.ts type sizes; the lines are the website's). */
export const typeWords = {
  faces: "The serif for titles and names; Geist for everything else.",
  serif: "Geist Serif",
  sans: "Geist",
  sample: "Aa",
  scale: "Two weights, 400 and 500. Nothing under 13px.",
  statement:
    "A statement: the first half in full ink, the second half in a quieter colour.",
  lead: "Every company will become AI\u2011native.",
  quiet: "The AI-native company is being built now.",
  foundations: "Foundations, Type",
  foundationsHref: "/foundations/type",
};

export interface TypeLine {
  token: string;
  serif: boolean;
  line: string;
}

/** The scale, largest first, each with a line from the website. */
export const typeScale: TypeLine[] = [
  // A non-breaking hyphen (U+2011): "AI-native" never splits across two lines.
  {
    token: "heading-xl",
    serif: true,
    line: "Make your company AI\u2011native.",
  },
  {
    token: "heading-lg",
    serif: true,
    line: "Every industry runs on processes.",
  },
  {
    token: "heading-md",
    serif: true,
    line: "We start with the work, not with the tools.",
  },
  {
    token: "heading-sm",
    serif: true,
    line: "What teams ask before the first call.",
  },
  {
    token: "text-lg",
    serif: false,
    line: "We interview every team before we build anything.",
  },
  {
    token: "text-base",
    serif: false,
    line: "We time each process the same way, before and after.",
  },
  {
    token: "text-sm",
    serif: false,
    line: "Grasp Work connects to the tools your team already uses.",
  },
  {
    token: "text-xs",
    serif: false,
    line: "One price for your company, however many people use it.",
  },
];

/** Room 07: the visual language. */
export const visualWords = {
  drawn:
    "Pictures are drawn, not photographed: exact pixels and dithered shading.",
  dots: "Fine square dots: white, one in nine mint, each twinkling at its own pace.",
  dotsLabel: "The Grasp mark drawn in fine square dots",
  sketches: [
    "button",
    "switch",
    "dialog",
    "calendar",
    "chart",
    "tabs",
    "select",
    "slider",
    "toast",
  ],
};

/** Room 08: motion (tokens.ts motion; the brand's motion rules). */
export const motionWords = {
  ease: "One ease-out for everything that moves: fast at the start, gentle at the end. Never ease-in.",
  easeValue: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeLabel: "A dot crossing on the brand's ease, and its curve",
  times: "Inside a component, 300ms or less. A page's opening, once, 600ms.",
  arrive:
    "When a page loads, its parts fade in and rise 8px, once, 90ms apart.",
  arriveTitle: "How we work",
  arriveLine: "We map, rebuild and prove, in that order.",
  arriveAction: "Talk to us",
  panel:
    "A side panel opens in 250ms on the brand's ease, and closes faster, in 160ms.",
  panelLabel: "A window whose side panel arrives, leaves, and arrives again",
  working:
    "While an agent works, a band of light moves through its status text, and only then.",
  stepper:
    "A stepper's light travels the line only while an agent works on the step; waiting, it stands still.",
  stepperLabel: "The way of an audit",
  steps: ["Map", "Rebuild", "Prove"],
  workingLabel: "Mapping the quote process",
  thinking: "Thinking",
  replay: "Replay",
  press: "A pressed button shrinks to 97% for 160ms, then says what happened.",
  pressAction: "Save the plan",
  pressWorking: "Saving",
  pressDone: "Saved",
  pressFailed: "Could not save",
};

export interface Time {
  name: string;
  token: string;
}

/** The times, shortest first, each as a dot crossing in its own time. */
export const times: Time[] = [
  { name: "Hover", token: "duration-hover" },
  { name: "Press", token: "duration-press" },
  { name: "A popup", token: "duration-popup" },
  { name: "A panel", token: "duration-ui" },
  { name: "A page's opening", token: "duration-arrive" },
];

/** Room 09: icons and marks. */
export const iconWords = {
  icons: "Hugeicons only, one stroke, named for what they mean.",
  brain:
    "The Company Brain has its own icon: a brain, in the same stroke as the other icons.",
  brainName: "Company Brain",
  foundations: "Foundations, Icons",
  foundationsHref: "/foundations/icons",
};

/** Room 10: layout (the website's pages). */
export const layoutWords = {
  rhythm:
    "A page starts and ends on the dark night colour; the sections that explain are on paper.",
  rhythmLabel:
    "A page drawn small: a night opening, three paper sections, a night close",
  column:
    "One column, at most 75rem, centred; the gutters grow with the window.",
  columnLabel: "A wide window and a phone, each with its column and gutters",
};

/** Room 11: the brand in the product (live components from the library). */
export const productWords = {
  screen:
    "In the product the brand stays quiet: ink and paper, one mint, and the moving light only where an agent is working.",
  night:
    "The same screen in dark mode: every colour is a token, so dark mode is one setting.",
  screenLabel:
    "The product: the sidebar beside a conversation, an agent at work",
  question: "Which of our processes take the most hours each week?",
  answer: "Sure, let me map that from the interviews.",
  thoughts:
    "**Reading the question**\nThey want the processes that cost the most hours, so I should rank them, not list them.\n\n**Where the hours are**\nThe interviews name the quote process most, then onboarding and the monthly close.",
  message: "Message",
  followUp: "Ask a follow-up",
  rows: ["Chat", "Brain", "Projects", "Apps", "Workflows"],
  mapping: "Mapping the quote process",
  asks: "An agent asks before it acts: one sentence, what it touches, and the answer.",
  agent: "Stephen",
  askTitle: "Rebuild the quote process in Grasp Work.",
  askApproved: "Approved: the quote process moves into Grasp Work.",
  askDeclined: "Declined: the quote process stays in email.",
  approve: "Approve",
  decline: "Decline",
  affects: [
    {
      kind: "file" as const,
      label: "Quote request form",
      detail: "Moves into Grasp Work",
    },
    { kind: "file" as const, label: "Price list", detail: "Read only" },
  ],
  components: "Components",
  componentsHref: "/components",
};

/** Room 12: applications, as objects (the website's share card, og-image, and its words). */
export const applicationWords = {
  share:
    "The share card: a dark background, the reeded glass from the right, the page's title in the serif.",
  shareLabel: "The share card, 1200 by 630",
  shareTitle: ["Make your company", "AI-native."],
  shareLine:
    "We map your operations, rebuild what costs the most, and prove it.",
  shareHost: "joingrasp.com",
  slides: "A slide says one thing, in the serif, on paper or on night.",
  slidesLabel: "Two slides, one on paper and one on night",
  slidePaperTitle: "We start with the work, not with the tools.",
  slidePaperNumber: "04",
  slideNightTitle: "AI arrived through people, not through processes.",
  slideNightNumber: "05",
  proposal:
    "A proposal reads like the site: serif heads, plain words, the method in its order.",
  proposalLabel: "The first page of a proposal",
  proposalKind: "Proposal",
  proposalTitle: "Rebuilding your quote process",
  proposalLine:
    "How we would map it, rebuild it and prove what it is worth, before anything changes.",
};

/** Room 13: downloads, every file served from this site. */
export const downloadWords = {
  files: "Every file in the book, to download.",
  /** The ink files' colour. */
  filesInk: "The ink logo and mark are drawn in the logo's ink, #04251B.",
  css: "The seven colours as CSS custom properties, to use anywhere.",
  cssFile: "grasp-colours.css",
  download: "Download",
};

export interface DownloadFile {
  id: string;
  name: string;
  file: string;
  href: string;
  kind: string;
  shows:
    | "logo-ink"
    | "logo-white"
    | "mark-ink"
    | "mark-white"
    | "colours"
    | "book";
}

export const downloads: DownloadFile[] = [
  {
    id: "logo-ink",
    name: "Logo, ink",
    file: "grasp-logo-ink.svg",
    href: "/brand/grasp-logo-ink.svg",
    kind: "SVG",
    shows: "logo-ink",
  },
  {
    id: "logo-white",
    name: "Logo, white",
    file: "grasp-logo-white.svg",
    href: "/brand/grasp-logo-white.svg",
    kind: "SVG",
    shows: "logo-white",
  },
  {
    id: "mark-ink",
    name: "Mark, ink",
    file: "grasp-mark-ink.svg",
    href: "/brand/grasp-mark-ink.svg",
    kind: "SVG",
    shows: "mark-ink",
  },
  {
    id: "mark-white",
    name: "Mark, white",
    file: "grasp-mark-white.svg",
    href: "/brand/grasp-mark-white.svg",
    kind: "SVG",
    shows: "mark-white",
  },
  {
    id: "colours",
    name: "Colours",
    file: "grasp-colours.css",
    href: "/brand/grasp-colours.css",
    kind: "CSS",
    shows: "colours",
  },
  {
    id: "book",
    name: "The brand book",
    file: "grasp-brand-book.html",
    href: "/brand/grasp-brand-book.html",
    kind: "HTML",
    shows: "book",
  },
];

/** Room 07: the lab's light and the parts that wear its dither. */
export interface LightLook {
  id: string;
  name: string;
  /** Where it is used, in one line. */
  when: string;
  /** Its still: the look drawn under reduced motion. */
  still: string;
  alt: string;
}

export const lightLooks: readonly LightLook[] = [
  {
    id: "silk",
    name: "Silk",
    when: "Behind the top of a page.",
    still: "/brand/looks/silk.jpg",
    alt: "Silk: broad folds of green light, dithered in square cells",
  },
  {
    id: "fine",
    name: "Folds",
    when: "Behind a card or a smaller area: the same pattern, finer.",
    still: "/brand/looks/fine.jpg",
    alt: "Folds: narrow folds of mint light in fine dots",
  },
  {
    id: "door",
    name: "Door",
    when: "The login page: a wave of light behind reeded glass that follows the pointer.",
    still: "/brand/looks/door.jpg",
    alt: "Door: a wave of light seen through upright reeds of glass",
  },
  {
    id: "sand",
    name: "Sand",
    when: "A chat background the person can choose: grains gather on the lines a sound vibration makes.",
    still: "/brand/looks/sand.jpg",
    alt: "Sand: pale grains gathered on curved lines over the night",
  },
  {
    id: "dunes",
    name: "Dunes",
    when: "A chat background: the grains drift into long ridges.",
    still: "/brand/looks/dunes.jpg",
    alt: "Dunes: grains drifted into long ridges",
  },
  {
    id: "rings",
    name: "Rings",
    when: "A chat background: the grains settle in rings round a centre.",
    still: "/brand/looks/rings.jpg",
    alt: "Rings: grains settled in rings",
  },
  {
    id: "pixels",
    name: "Pixels",
    when: "A chat background: the grains as square cells on a grid.",
    still: "/brand/looks/pixels.jpg",
    alt: "Pixels: square cells gathered on lines",
  },
];

export const lightWords = {
  light:
    "Animated backgrounds: drawn live, at most one per screen, with a still picture underneath.",
  dither:
    "Dithered shading in the component library: dots and cells in CSS and SVG, with no animation canvas.",
};

export const ditherWords = {
  skeleton: "Skeleton",
  skeletonWhen:
    "While text loads: a field of dots with a band of light passing over it.",
  chart: "Chart",
  chartWhen: "A bar or an area, filled in ordered dither.",
  chartLabel: "Hours saved by week",
  chartSummary: "From 6 hours in the first week to 21 in the fifth.",
  chartSeries: "Hours",
  chartData: [
    { day: "W1", runs: 6 },
    { day: "W2", runs: 9 },
    { day: "W3", runs: 14 },
    { day: "W4", runs: 17 },
    { day: "W5", runs: 21 },
  ],
  level: "Slider, by levels",
  levelWhen:
    "Choosing how much: a round track of dots, lit up to the level chosen.",
  levelLabel: "Effort",
  levels: [
    { id: "low", label: "Low" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
    { id: "extra", label: "Extra high" },
    { id: "max", label: "Max" },
  ],

  mark: "Working mark",
  markWhen:
    "Beside a status line while something works: a wave moves through nine dots.",
  markLabel: "Mapping the quote process",
};

/** Room 07: two of the website's drawn effects, each on a wall of its own (embers.tsx, pixel-icons.tsx). */
export const effectWords = {
  embers:
    "Embers: small square glyphs in the bottom corners of a dark section, swelling as if heat rises through them.",
  embersName: "Embers",
  embersWhen:
    "The bottom of a dark section, as on the Security page; the text sits in the middle, clear of them.",
  embersCost:
    "One canvas, a few thousand points drawn on the graphics card each frame, only on screen; one still frame on a phone and under reduced motion.",
  embersAlt:
    "Embers: tiny square glyphs gathered in the two bottom corners of a night band, larger and brighter near the corners",
  pixels:
    "Pixel icons: an icon builds up from tiny squares once, then twinkles.",
  pixelsName: "Pixel icons",
  pixelsWhen:
    "On a tile that states a fact, as on the Security and Work pages: one icon per fact, never as decoration.",
  pixelsCost:
    "One canvas for the whole row, one pass on the graphics card each frame, only on screen; laid down and still under reduced motion.",
  pixelsAlt:
    "Pixel icons: a key, a lock and a database drawn in tiny mint squares over a faint grid",
  stillEmbers: "/brand/looks/embers.jpg",
  stillPixels: "/brand/looks/pixels-icons.jpg",
};
