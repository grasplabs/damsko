// The tokens of Damsko: the one place a shared value is written. Plain data. `pnpm run generate`
// writes the token files from it (tokens/generate.ts), and `node tokens/generate.ts --check` fails
// when they are out of date, when a reference is broken, when a colour is not the brand's, or when a
// pair below drops under its contrast floor. Start here to change a value; never edit the generated
// files.
//
// Each token has a name, a category, a light value, a dark value where it differs, and one sentence
// on what it is for. The name is shadcn's where shadcn has one (`background`, `primary`,
// `muted-foreground`, `radius`). The CSS variable is `--damsko-<name>`: the prefix keeps Damsko's
// variables apart from another kit's unprefixed shadcn variables on the same page. The StyleX name
// is `<category>.<name in camel case>`, less the category's own word (`font-weight-normal` is
// `font.weightNormal`, `radius` is `radius.base`). Colours are oklch().
//
// A value can name another token in braces: `{brand-ink}` is written `var(--damsko-brand-ink)` in
// the CSS and read as that token's own value everywhere else. So a value that two tokens share is
// written once, and a shadow is put together from parts (`{bevel-ink-face}, 0 2px 4px ...`).

/** The StyleX objects the tokens are split into (src/lib/tokens.stylex.ts). */
export type Category =
  | "colors"
  | "space"
  | "radius"
  | "shadow"
  | "font"
  | "duration"
  | "size";

/** A token of Damsko's. */
export interface Token {
  /** Kebab case, unique: `muted-foreground` is `--damsko-muted-foreground`. */
  name: string;
  category: Category;
  /** The value, or the light value when `dark` is set. May name other tokens: `{brand-lime}`. */
  value: string;
  /** The value on a dark ground (`color-scheme: dark`). Colours and shadows only. */
  dark?: string;
  /** One plain sentence: what it is for. */
  use: string;
}

export interface TokenSet {
  id: string;
  title: string;
  tokens: Token[];
}

export interface TokenGroup {
  id: string;
  title: string;
  sets: TokenSet[];
}

/** A colour on a ground, measured in both schemes. */
export interface ContrastPair {
  text: string;
  on: string;
  /**
   * `text` must hold 4.5:1; `large` (text of 24px and up) and `ui` (a ring, a mark) 3:1; in light
   * and dark, or the check fails.
   */
  kind: "text" | "large" | "ui";
}

/** A width where the layout changes. Media queries cannot read a variable, so these are also
 * written into tokens.stylex.ts as media constants. */
export interface Breakpoint {
  /** Tailwind's name for the width: `--damsko-breakpoint-sm`, `media.sm` and `media.maxSm`. */
  name: string;
  value: string;
  use: string;
}

export const breakpoints: Breakpoint[] = [
  {
    name: "sm",
    value: "40rem",
    use: "Under 640px: one column, phone sizes, stacked rows.",
  },
  {
    name: "md",
    value: "48rem",
    use: "Under 768px: a stage's rows of cells fold in half.",
  },
  {
    name: "lg",
    value: "64rem",
    use: "From 1024px the sidebar stands beside the page; under it, a menu.",
  },
  {
    // Tailwind's xl is 80rem; Damsko's rail stays 84rem under the xl name.
    name: "xl",
    value: "84rem",
    use: "From 1344px the outline stands in its own rail at the right.",
  },
];

/** A band of hues, in oklch degrees. */
export interface HueBand {
  name: string;
  from: number;
  to: number;
}

/**
 * The brand list: what a colour in a token may be. Not in the brand book, not in Damsko, so the
 * generator fails on any other colour.
 *
 * - `colours`: the brand book's seven (Paper, Lime, Sea, Mint, Pine, Ink, Night), by token. Every
 *   colour of their hue family passes: the greens from the lowest of their hues to the highest,
 *   `tolerance` degrees either side, at any lightness, chroma and alpha.
 * - `neutralChroma`: a colour this grey (white, black, the grounds' near-greys) has no hue to judge.
 * - `status`: the hues the interface says status in (destructive, warning, info, and lavender, the
 *   second accent, for waiting, changed and new), which the brand book's greens cannot say.
 */
export const brand: {
  colours: readonly string[];
  tolerance: number;
  neutralChroma: number;
  status: readonly HueBand[];
} = {
  colours: [
    "brand-paper",
    "brand-lime",
    "brand-sea",
    "brand-mint",
    "brand-pine",
    "brand-ink",
    "brand-night",
  ],
  tolerance: 10,
  neutralChroma: 0.02,
  status: [
    { name: "destructive", from: 20, to: 35 },
    { name: "warning", from: 55, to: 95 },
    { name: "info", from: 250, to: 265 },
    { name: "lavender", from: 280, to: 300 },
  ],
};

export const groups: TokenGroup[] = [
  {
    id: "colour",
    title: "Colour",
    sets: [
      {
        id: "light",
        title: "The light",
        tokens: [
          {
            name: "brand-paper",
            category: "colors",
            value: "oklch(0.978 0.021 130.01)",
            use: "The first stop of the light, at the edge of the glass.",
          },
          {
            name: "brand-lime",
            category: "colors",
            value: "oklch(0.941 0.104 126.84)",
            use: "The second stop: the highlight.",
          },
          {
            name: "brand-sea",
            category: "colors",
            value: "oklch(0.882 0.094 160.99)",
            use: "The third stop: a soft accent between lime and mint.",
          },
          {
            name: "brand-mint",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25)",
            use: "The fourth stop: the accent at full strength.",
          },
          {
            name: "brand-pine",
            category: "colors",
            value: "oklch(0.4321 0.0778 175.187)",
            use: "The fifth stop: where the light turns deep.",
          },
          {
            name: "brand-ink",
            category: "colors",
            value: "oklch(0.267 0.048 169.88)",
            use: "The sixth stop: evergreen, almost dark. Also the words on mint and lime.",
          },
          {
            name: "brand-night",
            category: "colors",
            value: "oklch(0.173 0.028 169.36)",
            use: "The last stop: the dark at the centre of the glass.",
          },
        ],
      },
      {
        id: "grounds",
        title: "Grounds",
        tokens: [
          {
            name: "background",
            category: "colors",
            value: "oklch(0.992 0.002 165.08)",
            dark: "{brand-night}",
            use: "The page: the ground most things stand on.",
          },
          {
            name: "muted",
            category: "colors",
            value: "oklch(0.973 0.006 137.77)",
            dark: "oklch(0.205 0.03 168)",
            use: "A quiet band or panel that sets a group apart from the page.",
          },
          {
            name: "card",
            category: "colors",
            value: "oklch(1 0 none)",
            dark: "oklch(0.235 0.032 168)",
            use: "A surface above the page: a card, a menu, a dialog.",
          },
        ],
      },
      {
        id: "inks",
        title: "Inks",
        tokens: [
          {
            name: "foreground",
            category: "colors",
            value: "{brand-ink}",
            dark: "oklch(0.965 0.014 150)",
            use: "Titles, values and anything that must be read first.",
          },
          {
            name: "body-foreground",
            category: "colors",
            value: "oklch(0.36 0.04 160)",
            dark: "oklch(0.88 0.022 155)",
            use: "Running text: paragraphs, descriptions, table cells.",
          },
          {
            name: "muted-foreground",
            category: "colors",
            value: "oklch(0.5 0.03 160)",
            dark: "oklch(0.7 0.025 158)",
            use: "Secondary words: labels, hints, metadata.",
          },
          {
            name: "subtle-foreground",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.68)",
            dark: "oklch(0.96 0.02 150 / 0.54)",
            use: "The quietest text that still reads: counts, notes, a second sentence.",
          },
          {
            name: "border",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.1)",
            dark: "oklch(0.96 0.02 150 / 0.12)",
            use: "Hairlines and dividers. Never text.",
          },
        ],
      },
      {
        id: "accents",
        title: "Accents",
        tokens: [
          {
            name: "mint",
            category: "colors",
            value: "{brand-mint}",
            use: "The brand accent as a fill: live, done, you are here, approve. Words on it in light-ink.",
          },
          {
            name: "mint-deep",
            category: "colors",
            value: "oklch(0.5 0.12 167)",
            dark: "oklch(0.8 0.15 165)",
            use: "Mint that holds as text or a small mark: ticks, links, done states.",
          },
          {
            name: "pine",
            category: "colors",
            value: "{brand-pine}",
            dark: "oklch(0.74 0.09 175)",
            use: "Depth: a deep green for text or marks that should not shout.",
          },
          {
            name: "lavender",
            category: "colors",
            value: "oklch(0.48 0.13 290)",
            dark: "oklch(0.8 0.09 290)",
            use: "The second accent, as text or a mark: waiting, changed, new.",
          },
        ],
      },
      {
        id: "status",
        title: "Status",
        tokens: [
          {
            name: "success",
            category: "colors",
            value: "oklch(0.5 0.12 150)",
            dark: "oklch(0.79 0.14 152)",
            use: "Done, saved, passed: the words and the mark.",
          },
          {
            name: "success-subtle",
            category: "colors",
            value: "oklch(0.955 0.04 152)",
            dark: "oklch(0.26 0.05 152)",
            use: "The ground of a success message.",
          },
          {
            name: "warning",
            category: "colors",
            value: "oklch(0.53 0.12 65)",
            dark: "oklch(0.83 0.13 80)",
            use: "Needs a look but nothing is lost: the words and the mark.",
          },
          {
            name: "warning-subtle",
            category: "colors",
            value: "oklch(0.96 0.045 85)",
            dark: "oklch(0.27 0.045 75)",
            use: "The ground of an attention message.",
          },
          {
            name: "destructive",
            category: "colors",
            value: "oklch(0.53 0.18 28)",
            dark: "oklch(0.76 0.14 28)",
            use: "Failed, or about to delete: the words and the mark.",
          },
          {
            name: "destructive-subtle",
            category: "colors",
            value: "oklch(0.96 0.025 28)",
            dark: "oklch(0.27 0.06 28)",
            use: "The ground of a danger message.",
          },
          {
            name: "info",
            category: "colors",
            value: "oklch(0.5 0.13 255)",
            dark: "oklch(0.79 0.1 255)",
            use: "Neutral news: the words and the mark.",
          },
          {
            name: "info-subtle",
            category: "colors",
            value: "oklch(0.96 0.025 255)",
            dark: "oklch(0.26 0.05 255)",
            use: "The ground of an info message.",
          },
        ],
      },
      {
        id: "focus",
        title: "Focus",
        tokens: [
          {
            name: "ring",
            category: "colors",
            value: "oklch(0.45 0.03 165)",
            dark: "oklch(0.78 0.02 155)",
            use: "The keyboard focus ring on a control: a neutral ink, never colour. 3:1 on every ground, so the keyboard can find it.",
          },
          {
            name: "ring-on-color",
            category: "colors",
            value: "oklch(0.78 0.02 155)",
            dark: "oklch(0.45 0.03 165)",
            use: "The focus ring of what stands on action-fill (a link in a filled bubble): the other mode's ring, since that ground is the other mode's. 3:1 on action-fill.",
          },
          {
            name: "ring-halo-invalid",
            category: "colors",
            value: "oklch(0.52 0.175 28 / 0.08)",
            dark: "oklch(0.7 0.16 28 / 0.16)",
            use: "The halo round a wrong field in focus: the same faint halo, tinted danger.",
          },
          {
            name: "destructive-border",
            category: "colors",
            value: "oklch(0.52 0.175 28 / 0.3)",
            dark: "oklch(0.7 0.16 28 / 0.5)",
            use: "The edge of something wrong: the 1px ring tinted red, never a heavier line. Its message says what is wrong.",
          },
          {
            name: "destructive-shadow-color",
            category: "colors",
            value: "oklch(0.52 0.175 28 / 0.1)",
            dark: "oklch(0.52 0.175 28 / 0.2)",
            use: "The breath of shadow under something wrong, tinted red.",
          },
          {
            name: "shadow-sm-destructive",
            category: "shadow",
            value:
              "0 1px 2px {destructive-shadow-color}, 0 2px 4px {destructive-shadow-color}, 0 0 0 1px {destructive-border}",
            use: "Low lift for something wrong: the same shadow, tinted red.",
          },
        ],
      },
      {
        id: "code",
        title: "Code and chips",
        tokens: [
          {
            name: "code-bg",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.06)",
            dark: "oklch(0.96 0.02 150 / 0.09)",
            use: "The ground of code in a sentence and of a prop's name.",
          },
        ],
      },
    ],
  },
  {
    id: "type",
    title: "Type",
    sets: [
      {
        id: "families",
        title: "Families",
        tokens: [
          {
            name: "font-sans",
            category: "font",
            value:
              '"Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif',
            use: "Everything that is not a title: interface, body, labels.",
          },
          {
            name: "font-serif",
            category: "font",
            value: '"Geist Serif", Georgia, serif',
            use: "Titles, figures and names in a list, at weight 400 only.",
          },
          {
            name: "font-mono",
            category: "font",
            value: '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
            use: "Code, token names and anything typed exactly.",
          },
        ],
      },
      {
        id: "sizes",
        title: "Sizes",
        tokens: [
          {
            name: "text-xs",
            category: "font",
            value: "0.8125rem",
            use: "The smallest text there is: tags, labels, chips, code.",
          },
          {
            name: "text-xs-line",
            category: "font",
            value: "1.25rem",
            use: "The line height of text-xs.",
          },
          {
            name: "text-sm",
            category: "font",
            value: "0.875rem",
            use: "Controls, menus, navigation, dense tables.",
          },
          {
            name: "text-sm-line",
            category: "font",
            value: "1.25rem",
            use: "The line height of text-sm.",
          },
          {
            name: "text-base",
            category: "font",
            value: "0.9375rem",
            use: "Body text in the product: descriptions, forms, messages.",
          },
          {
            name: "text-base-line",
            category: "font",
            value: "1.5rem",
            use: "The line height of text-md.",
          },
          {
            name: "text-lg",
            category: "font",
            value: "1.0625rem",
            use: "A lead: the sentence under a page title.",
          },
          {
            name: "heading-xs",
            category: "font",
            value: "1.125rem",
            use: "A component's own title in the sans (a card's).",
          },
          {
            name: "heading-xs-line",
            category: "font",
            value: "1.5rem",
            use: "The line height of title-ui.",
          },
          {
            name: "text-base-tight-line",
            category: "font",
            value: "1.25rem",
            use: "text-md set tight, under a component's title.",
          },
          {
            name: "text-lg-line",
            category: "font",
            value: "1.75rem",
            use: "The line height of text-lg.",
          },
          {
            name: "heading-sm",
            category: "font",
            value: "1.25rem",
            use: "A card or panel title, in the serif.",
          },
          {
            name: "heading-sm-line",
            category: "font",
            value: "1.75rem",
            use: "The line height of title-sm.",
          },
          {
            name: "heading-md",
            category: "font",
            value: "1.5rem",
            use: "A section title, a figure, a name in a list, in the serif.",
          },
          {
            name: "heading-md-line",
            category: "font",
            value: "2rem",
            use: "The line height of title-md.",
          },
          {
            name: "heading-lg",
            category: "font",
            value: "2rem",
            use: "A page title in the product, and every page title on a phone, in the serif.",
          },
          {
            name: "heading-lg-line",
            category: "font",
            value: "2.5rem",
            use: "The line height of title-lg.",
          },
          {
            name: "heading-xl",
            category: "font",
            value: "2.75rem",
            use: "An opening title on a page that introduces something, in the serif.",
          },
          {
            name: "heading-xl-line",
            category: "font",
            value: "3rem",
            use: "The line height of title-xl.",
          },
        ],
      },
      {
        id: "weights",
        title: "Weights and tracking",
        tokens: [
          {
            name: "font-weight-normal",
            category: "font",
            value: "400",
            use: "Every serif title and all running text.",
          },
          {
            name: "font-weight-medium",
            category: "font",
            value: "500",
            use: "Labels, buttons and small titles in the sans. Nothing heavier but weight-semibold's one use.",
          },
          {
            name: "font-weight-semibold",
            category: "font",
            value: "600",
            use: "A group's name standing on the page's ground over its card of rows (a grouped Section card), so it reads apart from the rows' own labels. Nothing else until a second use is argued.",
          },
          {
            name: "tracking-title",
            category: "font",
            value: "-0.02em",
            use: "Serif titles from title-sm up.",
          },
          {
            name: "tracking-ui",
            category: "font",
            value: "normal",
            use: "A component's own words, its small titles included: set here, never inherited from the page around it.",
          },
          {
            name: "tracking-ui-title",
            category: "font",
            value: "-0.25px",
            use: "A component's title at title-ui, drawn a touch closer.",
          },
        ],
      },
    ],
  },
  {
    id: "space",
    title: "Space",
    sets: [
      {
        id: "scale",
        title: "Scale",
        tokens: [
          {
            name: "space-1",
            category: "space",
            value: "4px",
            use: "Between an icon and its label.",
          },
          {
            name: "space-2",
            category: "space",
            value: "8px",
            use: "Inside a tight group: chips, a label and its field.",
          },
          {
            name: "space-3",
            category: "space",
            value: "12px",
            use: "Padding inside a small control.",
          },
          {
            name: "space-4",
            category: "space",
            value: "16px",
            use: "Padding inside a control or a list row; the gutter on a phone.",
          },
          {
            name: "space-5",
            category: "space",
            value: "20px",
            use: "Padding inside a card on a phone.",
          },
          {
            name: "space-6",
            category: "space",
            value: "24px",
            use: "Between cards; padding inside a card.",
          },
          {
            name: "space-7",
            category: "space",
            value: "28px",
            use: "Between groups of a list.",
          },
          {
            name: "space-8",
            category: "space",
            value: "32px",
            use: "Between groups inside a section.",
          },
          {
            name: "space-10",
            category: "space",
            value: "40px",
            use: "Between a title and what it introduces.",
          },
          {
            name: "space-12",
            category: "space",
            value: "48px",
            use: "Between sections of a page; between columns.",
          },
          {
            name: "space-16",
            category: "space",
            value: "64px",
            use: "Between major sections.",
          },
          {
            name: "space-20",
            category: "space",
            value: "80px",
            use: "Above a page's opening title.",
          },
          {
            name: "space-24",
            category: "space",
            value: "96px",
            use: "Around a band that stands on its own.",
          },
        ],
      },
    ],
  },
  {
    id: "corner",
    title: "Corners",
    sets: [
      {
        id: "corners",
        title: "Corners",
        tokens: [
          {
            name: "radius",
            category: "radius",
            value: "20px",
            use: "The one corner: buttons, cards, menus, panels. Capped at half the height.",
          },
          {
            name: "radius-shape",
            category: "radius",
            value: "squircle",
            use: "Always written after corner, so the curve meets the edge without a seam.",
          },
          {
            name: "prompt-input-radius",
            category: "radius",
            value: "24px",
            use: "The Prompt input's card: a button's corner at its size (16px at 32px tall) plus the footer's inset (8px), so the card nests round its buttons.",
          },
          {
            name: "radius-row",
            category: "radius",
            value: "calc({radius} - {popup-padding})",
            use: "A row: a menu or list item, a tree or sidebar row, a trigger that runs the width. The one corner less the room a container keeps round its rows, capped at half the row's height.",
          },
          {
            name: "radius-hairline",
            category: "radius",
            value: "2px",
            use: "A thing too thin for the mark corner: a swatch 8px square, a highlight's edge.",
          },
          {
            name: "radius-mark",
            category: "radius",
            value: "6px",
            use: "Marks under 24px tall: a key, inline code.",
          },
          {
            name: "radius-full",
            category: "radius",
            value: "999px",
            use: "A pill: a chip, a tag, the track of a switch or a slider. Never a control that holds buttons.",
          },
          {
            name: "radius-circle",
            category: "radius",
            value: "50%",
            use: "A circle: an avatar, a dot.",
          },
        ],
      },
    ],
  },
  {
    id: "elevation",
    title: "Elevation",
    sets: [
      {
        id: "edges",
        title: "Edge and lifts",
        tokens: [
          {
            name: "border-strong-color",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.06)",
            dark: "oklch(0.96 0.02 150 / 0.1)",
            use: "The colour of every edge: night at 6%. A control reads by its fill and lift, not by a line.",
          },
          {
            name: "shadow-color-faint",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.02)",
            dark: "oklch(0 0 none / 0.2)",
            use: "The faintest shadow: the breath under a control, and the wide glow under a popup.",
          },
          {
            name: "shadow-color-soft",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.06)",
            dark: "oklch(0 0 none / 0.4)",
            use: "A soft shadow, one step deeper: the wide fall under a dialog.",
          },
          {
            name: "border-strong",
            category: "size",
            value: "0 0 0 1px {border-strong-color}",
            use: "The one edge: a 1px ring in edge-tone, drawn outside so it adds no size. Never a border line.",
          },
          {
            name: "shadow-sm",
            category: "shadow",
            value:
              "0 1px 2px {shadow-color-faint}, 0 2px 4px {shadow-color-faint}, {border-strong}",
            use: "Low lift, for controls and fields: the edge and a breath of shadow, so a white control stands off its ground.",
          },
          {
            name: "shadow-md",
            category: "shadow",
            value:
              "0 4px 4px {shadow-color-faint}, 0 4px 80px 8px {shadow-color-faint}, {border-strong}",
            use: "Medium lift, for popups: a select's list, a menu, a popover. A wide, faint glow.",
          },
          {
            name: "shadow-lg",
            category: "shadow",
            value:
              "0 4px 5px {shadow-color-faint}, 0 8px 32px {shadow-color-soft}, {border-strong}",
            use: "High lift, for dialogs: the edge and a soft, deeper fall.",
          },
        ],
      },
    ],
  },
  {
    id: "size",
    title: "Sizes",
    sets: [
      {
        id: "targets",
        title: "Targets and controls",
        tokens: [
          {
            name: "tap-target",
            category: "size",
            value: "44px",
            use: "The smallest thing a finger can hit.",
          },
          {
            name: "control-xs",
            category: "size",
            value: "28px",
            use: "A compact Button inside a card's footer or a prompt input, where no field stands: fields start at sm.",
          },
          {
            name: "control-sm",
            category: "size",
            value: "32px",
            use: "A small control in a dense toolbar or table, a setting row, or beside a section's heading: the field and its Button alike.",
          },
          {
            name: "control-default",
            category: "size",
            value: "36px",
            use: "The default control height with a pointer.",
          },
          {
            name: "control-lg",
            category: "size",
            value: "44px",
            use: "A control on a touch screen, or a main call.",
          },
          {
            name: "chip",
            category: "size",
            value: "24px",
            use: "The height of a chip: a value, a token, a prop's name.",
          },
          {
            name: "hairline",
            category: "size",
            value: "1px",
            use: "The weight of every rule and line in the system: a separator, a row's divider, the docs frame.",
          },
          {
            name: "line-strong",
            category: "size",
            value: "1.5px",
            use: "A line one step heavier than the hairline, for a mark that must be found: today's underline in a calendar, the active cell's edge in a grid, where a dragged column will land, and the system's focus line in forced colours (doubled for the keyboard).",
          },
          {
            name: "ring-width",
            category: "size",
            value: "2px",
            use: "The width of the focus ring: as thick as WCAG 2.4.13 asks, so focus is found at a glance.",
          },
          {
            name: "ring-offset",
            category: "size",
            value: "2px",
            use: "How far the focus ring stands off a control's edge, the ground showing between them, so it reads as a ring round the control and never as its border. It follows the control's shape.",
          },
          {
            name: "ring-offset-mark",
            category: "size",
            value: "2px",
            use: "How far the focus ring stands off a small mark whose own edge is a line (a checkbox, a radio, a switch), so focus is told from rest at a glance.",
          },
          {
            name: "ring-offset-text",
            category: "size",
            value: "2px",
            use: "How far the focus ring stands off words (a link, a row's name), so it never touches the letters.",
          },
        ],
      },
      {
        id: "icons",
        title: "Icons",
        tokens: [
          {
            name: "icon-sm",
            category: "size",
            value: "16px",
            use: "An icon beside words: in a button, a menu item, a field.",
          },
          {
            name: "icon-default",
            category: "size",
            value: "20px",
            use: "An icon that stands alone in a large control or a heading.",
          },
          {
            name: "icon-stroke",
            category: "size",
            value: "1.5",
            use: "The stroke of every icon, in the icon's own 24-unit grid: 1px at 16px.",
          },
        ],
      },
    ],
  },
  {
    id: "control",
    title: "Controls",
    sets: [
      {
        id: "buttons",
        title: "Buttons",
        tokens: [
          {
            name: "primary",
            category: "colors",
            value: "oklch(0.3231 0.0584 168.334)",
            dark: "{foreground}",
            use: "The main action's fill: evergreen on a light ground, near white on a dark one.",
          },
          {
            name: "primary-hover",
            category: "colors",
            value: "{primary}",
            dark: "oklch(1 0 none)",
            use: "action-fill under a pointer. On light the drop grows instead; on dark the fill brightens to white.",
          },
          {
            name: "primary-foreground-on-color",
            category: "colors",
            value: "oklch(0.99 0.004 160)",
            use: "Words and icons on a deep fill: ink on a light ground, danger on any.",
          },
          {
            name: "primary-foreground",
            category: "colors",
            value: "{primary-foreground-on-color}",
            dark: "{brand-ink}",
            use: "Words and icons on action-fill.",
          },
          {
            name: "primary-disabled",
            category: "colors",
            value: "oklch(0.3231 0.0584 168.334 / 0.5)",
            dark: "oklch(0.96 0.02 150 / 0.1)",
            use: "action-fill when the action cannot be taken: half its strength on paper; at night a quiet step above the ground, never the brightest thing on it.",
          },
          {
            name: "primary-foreground-disabled",
            category: "colors",
            value: "oklch(0.99 0.004 160 / 0.5)",
            dark: "{muted-foreground}",
            use: "Words and icons on action-fill-disabled: half strength on paper, muted at night (still 3:1 on the ground).",
          },
          {
            name: "secondary",
            category: "colors",
            value: "oklch(1 0 none)",
            dark: "oklch(0.96 0.02 150 / 0.08)",
            use: "The quiet fill of an outline Button and a field: white on a light ground, a veil of white on a dark one.",
          },
          {
            name: "secondary-hover",
            category: "colors",
            value: "{muted}",
            dark: "oklch(0.96 0.02 150 / 0.12)",
            use: "The quiet fill under a pointer: one step down to soft.",
          },
          {
            name: "secondary-active",
            category: "colors",
            value: "oklch(0.95 0.007 160)",
            dark: "oklch(0.96 0.02 150 / 0.16)",
            use: "The quiet fill while pressed: one step past hover.",
          },
          {
            name: "accent",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.06)",
            dark: "oklch(0.96 0.02 150 / 0.08)",
            use: "The fill a ghost control gains under a pointer.",
          },
          {
            name: "accent-active",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.1)",
            dark: "oklch(0.96 0.02 150 / 0.14)",
            use: "A ghost control's fill while pressed.",
          },
          {
            name: "button-secondary",
            category: "colors",
            value: "{accent-active}",
            use: "A secondary Button's flat fill: a veil of ink with no edge and no lift, so it reads on the page, a card and a soft band alike, a step quieter than an outline Button and a step firmer than a ghost one.",
          },
          {
            name: "button-secondary-hover",
            category: "colors",
            value: "{toggle-bg-pressed}",
            use: "button-secondary under a pointer: the veil one step deeper.",
          },
          {
            name: "button-secondary-active",
            category: "colors",
            value: "{toggle-bg-pressed-hover}",
            use: "button-secondary while pressed: one step past hover.",
          },
          {
            name: "destructive-fill",
            category: "colors",
            value: "oklch(0.52 0.175 28)",
            use: "The fill of an action that deletes or cannot be undone, on any ground.",
          },
          {
            name: "destructive-fill-foreground",
            category: "colors",
            value: "{primary-foreground-on-color}",
            use: "Words and icons on danger-fill.",
          },
          {
            name: "success-fill",
            category: "colors",
            value: "oklch(0.46 0.1 170)",
            use: "The fill of an action that approves or confirms: mint deepened towards pine. One per view, like ink. Under its light, for forced colours and as the fill's own colour.",
          },
          {
            name: "success-fill-foreground",
            category: "colors",
            value: "{primary-foreground-on-color}",
            use: "Words and icons on approve-fill: near-white, at least 4.5:1 on every part of its light, the sheen included.",
          },
          {
            name: "success-light",
            category: "colors",
            value:
              "linear-gradient(180deg, oklch(0.49 0.11 168) 0%, oklch(0.46 0.1 170) 45%, oklch(0.43 0.09 172) 70%, oklch(0.4 0.08 173) 100%)",
            use: "The light on an approving action: mint deepened towards pine, lighter at the top and deeper below. No lime.",
          },
          {
            name: "success-light-size",
            category: "size",
            value: "100% 160%",
            use: "How much taller the approve light is than its button, so it can move a step deeper.",
          },
          {
            name: "success-light-rest",
            category: "size",
            value: "0 0",
            use: "Where the approve light rests: its lightest part at the top.",
          },
          {
            name: "success-light-lean",
            category: "size",
            value: "0 50%",
            use: "Where the approve light moves under a pointer: a step deeper.",
          },
          {
            name: "success-glow",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.5)",
            dark: "oklch(0.85 0.15 150 / 0.36)",
            use: "The mint an approving action casts under itself at rest: its light spilling onto the ground.",
          },
          {
            name: "button-sheen",
            category: "colors",
            value: "oklch(1 0 0 / 0.1)",
            use: "The light over a filled control: white at the top edge, fading to nothing at the foot.",
          },
          {
            name: "button-press-scale",
            category: "size",
            value: "0.97",
            use: "How far a control gives under a press.",
          },
          {
            name: "opacity-disabled",
            category: "size",
            value: "0.5",
            use: "How strongly a disabled control is drawn: half.",
          },
        ],
      },
      {
        id: "bevels",
        title: "Bevels",
        tokens: [
          {
            name: "bevel-ink-face",
            category: "shadow",
            value:
              "inset 0 0.75px 0 oklch(1 0 0 / 0.14), inset 0 -0.75px 0 oklch(1 0 0 / 0.05), inset 0 0 0 1px {brand-night}, inset 0 -2px 4px oklch(0.12 0.03 162 / 0.12)",
            dark: "inset 0 0.75px 0 oklch(1 0 0 / 1), inset 0 -0.75px 0 oklch(1 0 0 / 0.5), inset 0 0 0 1px oklch(0 0 0 / 0.5), inset 0 -2px 4px oklch(0.29 0.05 162 / 0.03)",
            use: "The face of the ink bevel: a line of light along the top, a deeper outline and a soft shade at the foot, short and light, so the filled button reads no taller than a quiet one beside it.",
          },
          {
            name: "bevel-ink",
            category: "shadow",
            value: "{bevel-ink-face}, {input-shadow}",
            use: "The bevelled edge of the main action at rest.",
          },
          {
            name: "bevel-ink-hover",
            category: "shadow",
            value: "{bevel-ink-face}, {button-shadow-hover}",
            use: "bevel-ink under a pointer: the soft drop grows, as if the button rose a little.",
          },
          {
            name: "bevel-ink-press",
            category: "shadow",
            value: "{bevel-ink-face}, {button-shadow-active}",
            use: "bevel-ink while pressed: the drop tightens, as if the button went down.",
          },
          {
            name: "bevel-muted",
            category: "shadow",
            value: "inset 0 0 0 1px {bevel-muted-border}, {input-shadow}",
            use: "The edge of the second action: drawn as a field is (an inset hairline and the field's lift), so a quiet button and a field in one row are the same drawn height. Every bevel has the same 1px inset outline and the same lift, so buttons of one size read as one height side by side.",
          },
          {
            name: "bevel-muted-border",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.11)",
            dark: "oklch(0.96 0.02 150 / 0.16)",
            use: "The quiet bevel's outline, and every field's (field-edge): firm enough that a white button on a white card shows its top edge as a filled one does, so Cancel beside Connect does not read shorter, and a search beside it reads as the same kind of edge.",
          },
          {
            name: "button-shadow-hover",
            category: "shadow",
            value:
              "0 1px 2px {shadow-color-faint}, 0 3px 6px {shadow-color-faint}",
            use: "A filled button under a pointer: the field's lift, one small step deeper. Nothing dark is drawn far outside its box.",
          },
          {
            name: "button-shadow-active",
            category: "shadow",
            value: "0 1px 1px {shadow-color-faint}",
            use: "A filled button while pressed: the lift tightens to almost nothing, as if it went down.",
          },
          {
            name: "bevel-destructive-face",
            category: "shadow",
            value:
              "inset 0 0.75px 0 oklch(1 0 0 / 0.2), inset 0 -0.75px 0 oklch(1 0 0 / 0.06), inset 0 0 0 1px oklch(0.36 0.13 28), inset 0 -6px 12px oklch(0.3 0.12 28 / 0.4)",
            dark: "inset 0 0.75px 0 oklch(1 0 0 / 0.24), inset 0 -0.75px 0 oklch(1 0 0 / 0.08), inset 0 0 0 1px oklch(0 0 0 / 0.5), inset 0 -6px 12px oklch(0.3 0.12 28 / 0.4)",
            use: "The face of the danger bevel, drawn in deeper reds.",
          },
          {
            name: "bevel-destructive",
            category: "shadow",
            value: "{bevel-destructive-face}, {input-shadow}",
            use: "The bevelled edge of a destructive action at rest.",
          },
          {
            name: "bevel-destructive-hover",
            category: "shadow",
            value: "{bevel-destructive-face}, {button-shadow-hover}",
            use: "bevel-danger under a pointer.",
          },
          {
            name: "bevel-destructive-press",
            category: "shadow",
            value: "{bevel-destructive-face}, {button-shadow-active}",
            use: "bevel-danger while pressed.",
          },
          {
            name: "bevel-success-face",
            category: "shadow",
            value:
              "inset 0 0.75px 0 oklch(1 0 0 / 0.18), inset 0 -0.75px 0 oklch(1 0 0 / 0.06), inset 0 0 0 1px oklch(0.36 0.07 173 / 0.7), inset 0 -6px 12px oklch(0.3 0.06 173 / 0.3)",
            dark: "inset 0 0.75px 0 oklch(1 0 0 / 0.22), inset 0 -0.75px 0 oklch(1 0 0 / 0.06), inset 0 0 0 1px oklch(0.36 0.07 173 / 0.7), inset 0 -6px 12px oklch(0.3 0.06 173 / 0.3)",
            use: "The face of the approve bevel, as ink's: a line of light along the top, an edge a darker tone of its own green (never near-black), and a deeper shade at the foot.",
          },
          {
            name: "bevel-success",
            category: "shadow",
            value:
              "{bevel-success-face}, 0 1px 3px -3px {success-glow}, {input-shadow}",
            use: "The bevelled edge of an approving action at rest, with its glow: held inside the field's lift under it, so beside another button it draws no taller (tests/button.spec.ts, its test of one height per size).",
          },
        ],
      },
      {
        id: "press-and-failed",
        title: "Pressed and failed",
        tokens: [
          {
            name: "primary-active",
            category: "colors",
            value: "oklch(0.27 0.05 168)",
            dark: "oklch(0.88 0.02 152)",
            use: "action-fill while pressed: one step deeper than rest, so a press shows in the fill too.",
          },
          {
            name: "destructive-fill-active",
            category: "colors",
            value: "oklch(0.46 0.165 28)",
            use: "danger-fill while pressed: one step deeper than rest.",
          },
          {
            name: "destructive-hold",
            category: "colors",
            value: "{destructive-fill-active}",
            dark: "oklch(0.38 0.14 28)",
            use: "The fill that crosses a danger button while it is held: the pressed red, and on a dark ground clearly deeper, so the hold reads beside the rest red.",
          },
          {
            name: "error-border",
            category: "size",
            value: "inset 0 0 0 1px {destructive-border}, {input-shadow}",
            use: "The edge of a control while it says its action failed: a field's edge tinted danger, drawn inside, with the field's lift.",
          },
        ],
      },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    sets: [
      {
        id: "curves",
        title: "Curves and times",
        tokens: [
          {
            name: "ease",
            category: "duration",
            value: "cubic-bezier(0.22, 1, 0.36, 1)",
            use: "The one ease-out: everything that enters, leaves or responds. Never ease-in.",
          },
          {
            name: "ease-in-out",
            category: "duration",
            value: "cubic-bezier(0.45, 0, 0.25, 1)",
            use: "Something already on screen that moves from one place to another.",
          },
          {
            name: "duration-hover",
            category: "duration",
            value: "150ms",
            use: "Hover and colour changes.",
          },
          {
            name: "duration-press",
            category: "duration",
            value: "160ms",
            use: "The press: scale to 0.97 and back.",
          },
          {
            name: "duration-mark",
            category: "duration",
            value: "200ms",
            use: "A mark that moves to what is chosen: the sidebar's bar, a tab's line, a plus turning.",
          },
          {
            name: "duration-ui",
            category: "duration",
            value: "250ms",
            use: "Swaps, panels and dialogs opening. A menu or another popup takes duration-popup.",
          },
          {
            name: "duration-leave",
            category: "duration",
            value: "160ms",
            use: "Something leaving: faster than it came.",
          },
          {
            name: "duration-popup",
            category: "duration",
            value: "200ms",
            use: "A popup opening: a menu, a select's list, a popover, a date picker, a hover card. Quicker than a dialog, as menus are opened all day.",
          },
          {
            name: "duration-search-open",
            category: "duration",
            value: "150ms",
            use: "The command palette coming up: a fade at most this long.",
          },
          {
            name: "duration-search-close",
            category: "duration",
            value: "100ms",
            use: "The command palette going: faster than it came.",
          },
          {
            name: "duration-open",
            category: "duration",
            value: "300ms",
            use: "A row opening by its height.",
          },
          {
            name: "duration-close",
            category: "duration",
            value: "220ms",
            use: "A row closing: faster than it opened, so leaving never drags.",
          },
          {
            name: "duration-arrive",
            category: "duration",
            value: "600ms",
            use: "A page's opening, arriving once.",
          },
          {
            name: "duration-stagger",
            category: "duration",
            value: "90ms",
            use: "Between the parts of an opening that arrive one after another.",
          },
          {
            name: "duration-swap",
            category: "duration",
            value: "120ms",
            use: "A control's words changing in place: the old fade out as the new fade in.",
          },
          {
            name: "swap-blur",
            category: "size",
            value: "blur(2px)",
            use: "How soft words go as they swap out in place. Dropped with reduced motion.",
          },
          {
            name: "swap-scale",
            category: "size",
            value: "0.96",
            use: "How small words go as they swap out in place. Dropped with reduced motion.",
          },
          {
            name: "result-mark-from",
            category: "size",
            value: "0.6",
            use: "How small a button's check or alert starts as it is drawn in where the spinner was. Dropped with reduced motion.",
          },
          {
            name: "result-shift",
            category: "size",
            value: "4px",
            use: "How far a result's words slide in beside their mark. Dropped with reduced motion.",
          },
          {
            name: "result-shake",
            category: "size",
            value: "4px",
            use: "How far a failed button shakes, once. None with reduced motion.",
          },
          {
            name: "result-follow",
            category: "duration",
            value: "80ms",
            use: "How long a result's words wait after their mark appears, so the mark comes first.",
          },
          {
            name: "duration-work",
            category: "duration",
            value: "1200ms",
            use: "How long a demo of working lasts before it says how it went.",
          },
          {
            name: "duration-hold",
            category: "duration",
            value: "1600ms",
            use: "How long a result (Saved, Could not save) stays on a control before it returns.",
          },
          {
            name: "duration-spin",
            category: "duration",
            value: "1500ms",
            use: "One turn of a spinner: slow enough to read as calm. Constant motion, so linear.",
          },
          {
            name: "duration-press-and-hold",
            category: "duration",
            value: "1000ms",
            use: "How long a hold-to-confirm button is pressed and held before it acts: the fill crosses it in this time.",
          },
          {
            name: "duration-release-swallow",
            category: "duration",
            value: "600ms",
            use: "How long after a hold is cancelled the click its release may still cause is swallowed.",
          },
          {
            name: "duration-just-pressed",
            category: "duration",
            value: "1000ms",
            use: "How recent a press is for a popup that opens on it to grow from what was pressed.",
          },
          {
            name: "duration-leave-margin",
            category: "duration",
            value: "250ms",
            use: "The margin past a panel's leave time before whatever still runs in it is cancelled, so a close always ends.",
          },
        ],
      },
    ],
  },
  {
    id: "field",
    title: "Fields",
    sets: [
      {
        id: "fields",
        title: "Fields",
        tokens: [
          {
            name: "input-bg",
            category: "colors",
            value: "{secondary}",
            use: "The ground of a field you type in: the quiet button's fill, so a field and a button in one row match.",
          },
          {
            name: "input-bg-read",
            category: "colors",
            value: "{muted}",
            dark: "oklch(0.96 0.02 150 / 0.05)",
            use: "The ground of a read-only field: the soft ground (in dark a thinner veil than field-fill's, still above a disabled field's), a hairline and no lift. Settled, not greyed: quieter than a field open for typing, never as faint as a disabled one.",
          },
          {
            name: "input-ink-read",
            category: "colors",
            value: "{muted-foreground}",
            use: "The words of a read-only field: the muted step, still easy to read and copy. Disabled fields are weaker again (dim).",
          },
          {
            name: "input-invalid",
            category: "size",
            value: "inset 0 0 0 1px {input-border-invalid}, {input-shadow}",
            use: "A wrong field: its hairline tinted red, drawn inside like field-rest, so it is exactly as big as the fields beside it.",
          },
          {
            name: "input-selection",
            category: "colors",
            value: "oklch(0.9 0.06 165)",
            dark: "oklch(0.42 0.07 165)",
            use: "Words selected in a field: a mint tint in the palette's own tone, never the browser's blue. Ink on it reads 4.5:1.",
          },
          {
            name: "input",
            category: "colors",
            value: "{bevel-muted-border}",
            use: "The hairline round a field, drawn inside it: the quiet Button's own outline, so a field and the Button beside it share one edge, and a field reads by its white fill and its lift.",
          },
          {
            name: "input-border-hover",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.16)",
            dark: "oklch(0.96 0.02 150 / 0.22)",
            use: "field-edge under a pointer: one small step stronger.",
          },
          {
            name: "input-border-invalid",
            category: "colors",
            value: "{destructive}",
            use: "The hairline of a field whose value is wrong: the danger tone itself, 3:1 or more on every ground, drawn inside so the field is no bigger. Its message says what is wrong, never the colour alone.",
          },
          {
            name: "input-border-focus",
            category: "colors",
            value: "oklch(0.62 0.03 165)",
            dark: "oklch(0.6 0.025 158)",
            use: "The hairline of a field you are typing in: one step darker than field-edge, a quiet grey-green, never the ink. 3:1 or more on the page, the field's fill and every ground round it, so the keyboard finds it (2.4.7), and plainly apart from the resting hairline.",
          },
          {
            name: "input-focus-halo",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.14)",
            dark: "oklch(0.8 0.15 165 / 0.16)",
            use: "The faint halo round a field in focus: the brand's mint at a low alpha, 3px wide. It says which field is live; the edge carries the contrast.",
          },
          {
            name: "input-focus-halo-invalid",
            category: "colors",
            value: "oklch(0.52 0.175 28 / 0.1)",
            dark: "oklch(0.7 0.16 28 / 0.22)",
            use: "The halo round a wrong field in focus: the same faint 3px, tinted danger.",
          },
          {
            name: "input-focus",
            category: "size",
            value:
              "inset 0 0 0 1px {input-border-focus}, {input-shadow}, 0 0 0 3px {input-focus-halo}",
            use: "A field in focus, by a press or the keyboard alike: its hairline a step darker (field-edge-focus) and a faint mint halo round it. No ring and no dark fill: the caret says where the words go.",
          },
          {
            name: "prompt-input-border-focus",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.24)",
            dark: "oklch(0.96 0.02 150 / 0.26)",
            use: "The Prompt input's edge while you type in it: lighter than a field's (field-edge-focus), a hairline only a little stronger than rest, because the card is large, lifted and already the one place to type (\"still too dark … make it lighter, less visible\"). About 1.7:1 in light and 2.2:1 in dark; the halo and the caret carry the rest.",
          },
          {
            name: "input-focus-read",
            category: "size",
            value: "inset 0 0 0 1px {input-border-focus}",
            use: "A read-only field in focus: only the darker hairline, no halo and no lift, so it never looks open for typing.",
          },
          {
            name: "input-focus-invalid",
            category: "size",
            value:
              "inset 0 0 0 1px {input-border-invalid}, {input-shadow}, 0 0 0 3px {input-focus-halo-invalid}",
            use: "A wrong field in focus: its red hairline stays and the faint halo turns red, so it stays wrong while you type.",
          },
          {
            name: "input-text-touch",
            category: "size",
            value: "max(16px, 1rem)",
            use: "The size of the words in every field on a phone or a touch screen (media.typing), a Select's trigger too, so fields side by side stay one size: under 16px, Safari zooms the page in on focus. Never under 16px, and in rem above it, since words follow the reader's text size.",
          },
          {
            name: "input-shadow",
            category: "shadow",
            value:
              "0 1px 2px {shadow-color-faint}, 0 2px 4px {shadow-color-faint}",
            use: "The breath of lift under a field, beneath its hairline: lift-low's shadow without its edge.",
          },
        ],
      },
    ],
  },
  {
    id: "checkbox",
    title: "Checkbox",
    sets: [
      {
        id: "checkbox-parts",
        title: "Checkbox",
        tokens: [
          {
            name: "checkbox-box",
            category: "size",
            value: "16px",
            use: "The box of a checkbox: a mark under 24px, so it takes corner-mark.",
          },
          {
            name: "checkbox-mark",
            category: "size",
            value: "12px",
            use: "The tick or the dash inside a checked box.",
          },
          {
            name: "checkbox-mark-stroke",
            category: "size",
            value: "2.5",
            use: "The stroke of the tick and the dash, in the icon's 24-unit grid: about 1.5px at 14px, so it reads on the fill.",
          },
          {
            name: "checkbox-border-width",
            category: "size",
            value: "1px",
            use: "The edge of an empty box or circle, drawn inside it in choice-edge.",
          },
          {
            name: "checkbox-mark-from",
            category: "size",
            value: "0.6",
            use: "How small the tick starts as it grows into the box. Dropped with reduced motion.",
          },
          {
            name: "checkbox-bg-hover",
            category: "colors",
            value: "oklch(0.38 0.06 168)",
            dark: "{primary-hover}",
            use: "A checked box under a pointer: action-fill one step lighter, since a box has no bevel to lift.",
          },
        ],
      },
    ],
  },
  {
    id: "dialog",
    title: "Dialog",
    sets: [
      {
        id: "dialog-parts",
        title: "Dialog",
        tokens: [
          {
            name: "dialog-width",
            category: "size",
            value: "30rem",
            use: "The width of a dialog: room for a form's fields, and a short title on one line.",
          },
          {
            name: "dialog-width-full",
            category: "size",
            value: "64rem",
            use: "A full dialog: a chart or a table opened in full, as wide as a page's column.",
          },
          {
            name: "dialog-gutter",
            category: "size",
            value: "24px",
            use: "The least room between a dialog and the edges of the window; on a phone, above the sheet.",
          },
          {
            name: "dialog-scrim",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.32)",
            dark: "oklch(0 0 none / 0.56)",
            use: "The shade over the page behind a dialog: the page stays in view, out of reach.",
          },
          {
            name: "dialog-from-scale",
            category: "size",
            value: "0.92",
            use: "How small a dialog starts as it opens, and ends as it closes, growing from the trigger that opened it (or its own centre with none): 0.92 reads as coming from the button and stays calm; 0.96 was right but unreadable, 0.90 felt thrown. Dropped with reduced motion.",
          },
          {
            name: "dialog-from-shift",
            category: "size",
            value: "8px",
            use: "How far below its place a dialog with no trigger starts as it opens; one opened from a trigger grows from it with no drop, which would fight its origin. Dropped with reduced motion.",
          },
        ],
      },
    ],
  },
  {
    id: "popup",
    title: "Popups",
    sets: [
      {
        id: "popup-parts",
        title: "Popups and their items",
        tokens: [
          {
            name: "popover",
            category: "colors",
            value: "{card}",
            use: "The ground of what opens over the page from a control: a select's list, a menu, a popover.",
          },
          {
            name: "popup-shadow",
            category: "shadow",
            value: "{shadow-md}",
            use: "The edge and shadow of a popup: medium lift, so it floats over the page.",
          },
          {
            name: "popup-gap",
            category: "space",
            value: "{space-1}",
            use: "How far a popup stands off the control that opened it.",
          },
          {
            name: "popup-padding",
            category: "space",
            value: "{space-1}",
            use: "Room inside a popup, around its items.",
          },
          {
            name: "popup-height",
            category: "size",
            value: "20rem",
            use: "The tallest a popup grows before its items scroll; less when the window has less room.",
          },
          {
            name: "popup-width",
            category: "size",
            value: "20rem",
            use: "The widest a popup grows; never narrower than its control.",
          },
          {
            name: "popup-from-scale",
            category: "size",
            value: "0.98",
            use: "How small a popup starts as it opens from its control, and ends as it closes. Dropped with reduced motion.",
          },
          {
            name: "accent-highlight",
            category: "colors",
            value: "{accent}",
            use: "The fill of the item in a popup the keyboard or the pointer is on.",
          },
          {
            name: "popup-gutter",
            category: "space",
            value: "{space-4}",
            use: "The least room a popup keeps from the window's edges.",
          },
          {
            name: "popover-padding",
            category: "space",
            value: "{space-4}",
            use: "Room inside a popover, around its title, fields and actions.",
          },
          {
            name: "popover-gap",
            category: "space",
            value: "{space-2}",
            use: "How far a popover stands off its trigger: a little more than a list, as it is a panel.",
          },
          {
            name: "popover-width",
            category: "size",
            value: "20rem",
            use: "The width of a popover: a title, a sentence or two, and two actions that keep their width while they work.",
          },
          {
            name: "hover-card-min-width",
            category: "size",
            value: "12rem",
            use: "The least width of a hover card sized to what it holds: a name and a short line still read as a card, not a tooltip.",
          },
          {
            name: "hover-card-max-width",
            category: "size",
            value: "24rem",
            use: "The most width of a hover card sized to what it holds: past it a long line wraps, so the card stays a preview.",
          },
          {
            name: "tooltip",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.9)",
            dark: "oklch(0.37 0.03 168 / 0.9)",
            use: "The ground of a tooltip: night at 90% in light, a lighter raised night in dark, so it separates from either page.",
          },
          {
            name: "tooltip-foreground",
            category: "colors",
            value: "oklch(0.965 0.014 150)",
            use: "The words on a tooltip.",
          },
          {
            name: "tooltip-delay",
            category: "duration",
            value: "300ms",
            use: "How long the pointer rests on a control before its tooltip opens. The next one opens at once.",
          },
          {
            name: "tooltip-gap",
            category: "size",
            value: "8px",
            use: "How far a tooltip stands off its trigger: clear of the pointer resting on it.",
          },
          {
            name: "tooltip-padding",
            category: "size",
            value: "6px 10px",
            use: "Room inside a tooltip, around its words.",
          },
          {
            name: "tooltip-width",
            category: "size",
            value: "15rem",
            use: "The widest a tooltip grows, so a long hint wraps calmly onto two lines.",
          },
          {
            name: "tooltip-blur",
            category: "size",
            value: "blur(4px)",
            use: "The blur behind a tooltip's translucent fill.",
          },
          {
            name: "tooltip-rise",
            category: "size",
            value: "4px",
            use: "How far a tooltip travels from its trigger's side as it fades in. Dropped with reduced motion.",
          },
          {
            name: "tooltip-leave",
            category: "duration",
            value: "100ms",
            use: "A tooltip fading out: faster than it came.",
          },
          {
            name: "menu-gap",
            category: "size",
            value: "10px",
            use: "How far a dropdown menu stands off its trigger.",
          },
          {
            name: "menu-width",
            category: "size",
            value: "249px",
            use: "The narrowest a dropdown menu is, so a short list still reads as a menu.",
          },
          {
            name: "menu-shadow",
            category: "shadow",
            value: "{shadow-lg}",
            use: "The edge and shadow of a menu: high lift.",
          },
          {
            name: "menu-item-padding",
            category: "space",
            value: "{space-2}",
            use: "Room inside a menu item, round its icon, words and keys.",
          },
        ],
      },
    ],
  },
  {
    id: "switch",
    title: "Switch",
    sets: [
      {
        id: "switch-parts",
        title: "Switch",
        tokens: [
          {
            name: "switch-width",
            category: "size",
            value: "40px",
            use: "The track of a switch: Apple's proportion, about 63 to 28, so the thumb has room to travel.",
          },
          {
            name: "switch-height",
            category: "size",
            value: "18px",
            use: "The height of a switch's track, on the first line of its label.",
          },
          {
            name: "switch-thumb",
            category: "size",
            value: "14px",
            use: "The height of a switch's thumb: 2px inside its track all round.",
          },
          {
            name: "switch-thumb-width",
            category: "size",
            value: "22px",
            use: "The width of a switch's thumb: a pill, as Apple's (about 37 to 24). It travels 35% of the track.",
          },
          {
            name: "switch-stretch",
            category: "size",
            value: "4px",
            use: "How far a pressed thumb stretches towards the side it will travel to. It settles back on arrival.",
          },
          {
            name: "switch-thumb-shadow",
            category: "shadow",
            value:
              "drop-shadow(0 0 0.5px oklch(0.173 0.028 169.36 / 0.22)) drop-shadow(0 1px 1.5px oklch(0.173 0.028 169.36 / 0.14)) drop-shadow(0 2px 3px oklch(0.173 0.028 169.36 / 0.08))",
            dark: "drop-shadow(0 0 0.5px oklch(0 0 none / 0.5)) drop-shadow(0 1px 1.5px oklch(0 0 none / 0.4)) drop-shadow(0 2px 3px oklch(0 0 none / 0.3))",
            use: "The thumb's soft shadow, drawn round its whole shape, so a stretched thumb casts one shadow.",
          },
          {
            name: "switch-light",
            category: "colors",
            value:
              "radial-gradient(closest-side, {brand-lime} 0%, color-mix(in oklch, {brand-sea} 70%, transparent) 35%, transparent 62%)",
            use: "The light inside a switch that is on: it rests behind the thumb and leans after it, as Approve's light leans. It ends near the thumb's own edge, so only a rim of it shows beside the thumb, not a pale band.",
          },
          {
            name: "switch-spring",
            category: "duration",
            value:
              "linear(0, 0.081, 0.266, 0.484, 0.689, 0.856, 0.976, 1.05, 1.086, 1.095, 1.086, 1.067, 1.047, 1.028, 1.012, 1.001, 0.995, 0.992, 0.991, 0.992, 1)",
            use: "The thumb's spring: a damping ratio of 0.6 in 20 steps. It passes its end by a tenth and settles.",
          },
          {
            name: "switch-travel",
            category: "duration",
            value: "280ms",
            use: "The thumb travelling to its side on the spring, and the green crossing with it. At once with reduced motion.",
          },
          {
            name: "switch-trail",
            category: "duration",
            value: "300ms",
            use: "The light following the thumb, a little after it lands. At once with reduced motion.",
          },
          {
            name: "switch-track-hover",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.28)",
            dark: "oklch(0.96 0.02 150 / 0.26)",
            use: "A switch that is off, under a pointer or pressed: field-edge one small step stronger, so it never looks on.",
          },
        ],
      },
    ],
  },
  {
    id: "radio",
    title: "Radio",
    sets: [
      {
        id: "radio-parts",
        title: "Radio",
        tokens: [
          {
            name: "radio-size",
            category: "size",
            value: "{checkbox-box}",
            use: "The circle of a radio: as large as a checkbox's box, so the two stand in one column.",
          },
          {
            name: "radio-dot",
            category: "size",
            value: "6px",
            use: "The dot inside a chosen radio.",
          },
        ],
      },
    ],
  },
  {
    id: "choice",
    title: "Choice",
    sets: [
      {
        id: "choice-parts",
        title: "Checkbox, radio and switch",
        tokens: [
          {
            name: "control-border",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.17)",
            dark: "oklch(0.96 0.02 150 / 0.22)",
            use: "The edge of an empty box or circle: soft, so it reads by its shape.",
          },
          {
            name: "control-border-hover",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.28)",
            dark: "oklch(0.96 0.02 150 / 0.34)",
            use: "choice-edge under a pointer: one step stronger.",
          },
          {
            name: "control-border-invalid",
            category: "colors",
            value: "color-mix(in oklch, {destructive} 72%, transparent)",
            use: "The edge of a checkbox or radio whose answer is wrong: danger itself, a little softened. A field's red hairline (field-edge-invalid) sits on a white fill and a lift; a box has only its edge, so it takes a stronger red to be seen beside its message.",
          },
          {
            name: "switch-track",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.2)",
            dark: "oklch(0.96 0.02 150 / 0.16)",
            use: "The track of a switch that is off: a soft fill, no edge, so the white thumb stands out. On a light page deep enough to be found (at 0.12 it was 1.25:1 to the page and the off switch all but vanished).",
          },
        ],
      },
    ],
  },
  {
    id: "textarea",
    title: "Textarea",
    sets: [
      {
        id: "textarea-parts",
        title: "Textarea",
        tokens: [
          {
            name: "textarea-height",
            category: "size",
            value: "15rem",
            use: "The tallest a textarea grows with its text before the text scrolls inside it.",
          },
        ],
      },
    ],
  },
  {
    id: "tabs",
    title: "Tabs",
    sets: [
      {
        id: "tabs-parts",
        title: "Tabs",
        tokens: [
          {
            name: "tab-line",
            category: "colors",
            value: "{mint-deep}",
            use: "The line under the chosen tab: mint that holds 3:1, so it marks the choice without the words' colour.",
          },
          {
            name: "tab-line-width",
            category: "size",
            value: "2px",
            use: "How thick the chosen tab's line is.",
          },
          {
            name: "tab-gap",
            category: "space",
            value: "{space-4}",
            use: "The room between two tabs.",
          },
          {
            name: "tab-bg-selected",
            category: "colors",
            value: "{card}",
            use: "The chosen segment in segmented tabs: raised out of a soft track, with a card's edge and lift.",
          },
        ],
      },
    ],
  },
  {
    id: "badge",
    title: "Badge",
    sets: [
      {
        id: "badge-parts",
        title: "Badge",
        tokens: [
          {
            name: "badge-height",
            category: "size",
            value: "22px",
            use: "The height of a badge: a status beside a title or in a row.",
          },
          {
            name: "badge-height-sm",
            category: "size",
            value: "18px",
            use: "The height of a small badge: in a dense table or beside small text.",
          },
          {
            name: "badge-padding",
            category: "size",
            value: "6px",
            use: "Room at each end of a badge, inside its pill.",
          },
          {
            name: "badge-icon",
            category: "size",
            value: "12px",
            use: "An icon before a badge's words.",
          },
          {
            name: "severity-dot",
            category: "size",
            value: "6px",
            use: "The mark of a severity: a dot beside neutral words, so the colour never paints the whole line.",
          },
        ],
      },
    ],
  },
  {
    id: "empty",
    title: "Empty",
    sets: [
      {
        id: "empty-parts",
        title: "Empty",
        tokens: [
          {
            name: "empty-page",
            category: "size",
            value: "400px",
            use: "The least height of an empty state that stands for a whole list or page.",
          },
          {
            name: "empty-section",
            category: "size",
            value: "150px",
            use: "The least height of an empty state in a card or one tab of a list.",
          },
          {
            name: "empty-measure",
            category: "size",
            value: "310px",
            use: "The widest an empty state's words run, so they stay a short block.",
          },
        ],
      },
    ],
  },
  {
    id: "separator",
    title: "Separator",
    sets: [
      {
        id: "separator-parts",
        title: "Separator",
        tokens: [
          {
            name: "separator-width",
            category: "size",
            value: "{hairline}",
            use: "How thick a separator's line is: the system's hairline, drawn in line.",
          },
        ],
      },
    ],
  },
  {
    id: "avatar",
    title: "Avatar",
    sets: [
      {
        id: "avatar-sizes",
        title: "Avatar",
        tokens: [
          {
            name: "avatar-xs",
            category: "size",
            value: "24px",
            use: "An avatar in a dense row: a table cell, a mention.",
          },
          {
            name: "avatar-sm",
            category: "size",
            value: "32px",
            use: "An avatar beside a name in a list.",
          },
          {
            name: "avatar-default",
            category: "size",
            value: "40px",
            use: "The usual avatar: a comment, a member, an account menu.",
          },
          {
            name: "avatar-lg",
            category: "size",
            value: "48px",
            use: "An avatar that heads a card or a panel.",
          },
          {
            name: "avatar-xl",
            category: "size",
            value: "64px",
            use: "An avatar that heads a profile.",
          },
          {
            name: "avatar-border",
            category: "size",
            value: "inset 0 0 0 1px {border-strong-color}",
            use: "The system's edge, drawn inside an avatar and over its picture, so a white photo keeps its rim.",
          },
          {
            name: "avatar-2xs",
            category: "size",
            value: "16px",
            use: "The smallest avatar, in a control's own line.",
          },
        ],
      },
    ],
  },
  {
    id: "alert",
    title: "Alert",
    sets: [
      {
        id: "alert-parts",
        title: "Alert",
        tokens: [
          {
            name: "alert-bg-default",
            category: "colors",
            value: "{accent}",
            use: "The tint of a neutral alert: ink at a few per cent, so it reads on any ground, soft and night included.",
          },
        ],
      },
    ],
  },
  {
    id: "pagination",
    title: "Pagination",
    sets: [
      {
        id: "pagination-parts",
        title: "Pagination",
        tokens: [
          {
            name: "pagination-step",
            category: "size",
            value: "24px",
            use: "The side of a pagination's Previous and Next: small, beside the count they step through.",
          },
        ],
      },
    ],
  },
  {
    id: "progress",
    title: "Progress",
    sets: [
      {
        id: "progress-parts",
        title: "Progress",
        tokens: [
          {
            name: "progress-sm",
            category: "size",
            value: "4px",
            use: "A thin bar: in a row, under a file's name.",
          },
          {
            name: "progress-default",
            category: "size",
            value: "8px",
            use: "The usual bar.",
          },
          {
            name: "progress-lg",
            category: "size",
            value: "12px",
            use: "A bar that is the point of its panel.",
          },
          {
            name: "progress-track",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.12)",
            dark: "oklch(0.96 0.02 150 / 0.16)",
            use: "The ground of a bar or a ring: what is still to do. Its own value: a bar is long and reads by its length, so it stays as soft as the off switch was.",
          },
          {
            name: "progress-ring-track",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.12)",
            dark: "oklch(0.96 0.02 150 / 0.42)",
            use: "The ground of a ring: what is still to do. A ring is small and reads by its whole round, so in dark its track reads at 3:1 against the page (at progress-track it all but vanished and only the arc showed). Light as progress-track.",
          },
          {
            name: "progress-bg",
            category: "colors",
            value: "{primary}",
            use: "What is done: the first action's colour.",
          },
          {
            name: "progress-ring-sm",
            category: "size",
            value: "14px",
            use: "A ring beside words.",
          },
          {
            name: "progress-ring-default",
            category: "size",
            value: "20px",
            use: "A ring in a row or a button's place.",
          },
          {
            name: "progress-ring-lg",
            category: "size",
            value: "60px",
            use: "A ring that holds its value in the middle.",
          },
          {
            name: "progress-ring-line",
            category: "size",
            value: "2px",
            use: "How thick a small or usual ring is.",
          },
          {
            name: "progress-ring-line-lg",
            category: "size",
            value: "6px",
            use: "How thick a large ring is.",
          },
          {
            name: "progress-sweep",
            category: "duration",
            value: "1400ms",
            use: "One sweep of an unknown bar across its track.",
          },
        ],
      },
    ],
  },
  {
    id: "collapsible",
    title: "Collapsible",
    sets: [
      {
        id: "collapsible-parts",
        title: "Collapsible",
        tokens: [
          {
            name: "collapsible-trigger",
            category: "size",
            value: "{control-xs}",
            use: "The height of a collapsible's trigger.",
          },
          {
            name: "collapsible-open",
            category: "duration",
            value: "{duration-mark}",
            use: "How long a collapsible's panel takes to open or close.",
          },
          {
            name: "collapsible-padding",
            category: "size",
            value: "8px",
            use: "A trigger's padding at the sides, and how far it bleeds out, so its title lines up with the panel.",
          },
        ],
      },
    ],
  },
  {
    id: "data-table-filters",
    title: "Data table filters",
    sets: [
      {
        id: "data-table-filters-parts",
        title: "Data table filters",
        tokens: [
          {
            name: "data-table-filter-segment",
            category: "size",
            value: "{control-default}",
            use: "The height of a filter's field, operator and value segments: a field's own, so a filter stands level with the search beside it.",
          },
          {
            name: "data-table-filter-divider",
            category: "size",
            value: "1px",
            use: "The line between a filter's segments: the gap that shows the ground.",
          },
        ],
      },
    ],
  },
  {
    id: "skeleton",
    title: "Skeleton",
    sets: [
      {
        id: "skeleton-parts",
        title: "Skeleton",
        tokens: [
          {
            name: "skeleton-bg",
            category: "colors",
            value: "oklch(0.173 0.028 169.36 / 0.14)",
            dark: "oklch(0.96 0.02 150 / 0.08)",
            use: "A placeholder's fill while content loads: a soft grey with no edge.",
          },
          {
            name: "skeleton-pulse",
            category: "size",
            value: "2s",
            use: "One breath of a placeholder, from full to faint and back. Still with reduced motion.",
          },
          {
            name: "skeleton-ease",
            category: "duration",
            value: "cubic-bezier(0.4, 0, 0.6, 1)",
            use: "The curve of a placeholder's breath: slow at both ends.",
          },
          {
            name: "skeleton-low",
            category: "size",
            value: "0.5",
            use: "How faint a placeholder goes at the middle of its breath.",
          },
          {
            name: "skeleton-band",
            category: "size",
            value: "420px",
            use: "The width of the band of light that crosses a wave placeholder.",
          },
          {
            name: "skeleton-wave-speed",
            category: "size",
            value: "520",
            use: "How fast the wave's light travels, in pixels a second: slow enough to read as light, not a flash.",
          },
          {
            name: "skeleton-wave-rest",
            category: "size",
            value: "0.2",
            use: "The share of a wave's pass the light rests before the next one.",
          },
          {
            name: "skeleton-wave-slope",
            category: "size",
            value: "0.6",
            use: "How far the wave is from upright: a placeholder lower on the page is reached this much later.",
          },
        ],
      },
    ],
  },
  {
    id: "spinner",
    title: "Spinner",
    sets: [
      {
        id: "spinner-parts",
        title: "Spinner",
        tokens: [
          {
            name: "spinner-lg",
            category: "size",
            value: "24px",
            use: "A large spinner: alone in an empty panel while it loads.",
          },
          {
            name: "spinner-breath",
            category: "size",
            value: "{skeleton-pulse}",
            use: "A spinner with reduced motion stands still and breathes, as a placeholder does.",
          },
          {
            name: "spinner-faint",
            category: "size",
            value: "{skeleton-low}",
            use: "How faint a still spinner goes at the middle of its breath.",
          },
          {
            name: "spinner-fade",
            category: "size",
            value: "0.4",
            use: "How faint a spinner's last bar is: its bars fade from full to this round the turn. At 0.3 the last bars sank into a dark ground and the spinner read weaker than its words.",
          },
          {
            name: "spinner-ease",
            category: "duration",
            value: "{skeleton-ease}",
            use: "The curve of a still spinner's breath.",
          },
        ],
      },
    ],
  },
  {
    id: "agent-indicator",
    title: "Agent indicator",
    sets: [
      {
        id: "agent-indicator-parts",
        title: "Agent indicator",
        tokens: [
          {
            name: "agent-indicator-dot",
            category: "size",
            value: "3px",
            use: "One dot of the dither glyph: nine of them, three by three, fill an icon's room.",
          },
          {
            name: "agent-indicator-gap",
            category: "size",
            value: "2px",
            use: "The space between the dither glyph's dots.",
          },
          {
            name: "agent-indicator-core",
            category: "size",
            value: "2px",
            use: "The still point at the middle of the orbit and the breath, and the bead's core.",
          },
          {
            name: "agent-indicator-stroke",
            category: "size",
            value: "1.5px",
            use: "The orbit's arc and the breath's ring: as fine as an icon's line.",
          },
          {
            name: "agent-indicator-rest",
            category: "colors",
            value:
              "light-dark(color-mix(in oklch, {pine} 28%, transparent), color-mix(in oklch, {pine} 60%, transparent))",
            use: "A dot the light is not on: pine, faint, as the loading dot field rests. On dark, pine's own dark value at 60%: at 28% the resting glyph all but vanished on the night ground (1.4:1); now 3:1 and more.",
          },
          {
            name: "agent-indicator-lit",
            category: "colors",
            value: "{pine}",
            use: "Where the light is: pine, so the mark is calm on light and dark.",
          },
          {
            name: "agent-indicator-accent",
            category: "colors",
            value: "{mint-deep}",
            use: "The mark's mint: only its core, never a blob.",
          },
          {
            name: "agent-indicator-wave",
            category: "duration",
            value: "1600ms",
            use: "One pass of the light through the dither glyph and its rest. A continuous sign of life: it may loop longer than a transition.",
          },
          {
            name: "agent-indicator-wave-step",
            category: "duration",
            value: "130ms",
            use: "How far behind each diagonal of the dither glyph lights after the one before.",
          },
          {
            name: "agent-indicator-circle",
            category: "duration",
            value: "1200ms",
            use: "The light once round the dither glyph's edge, and its rest.",
          },
          {
            name: "agent-indicator-circle-step",
            category: "duration",
            value: "150ms",
            use: "How far behind each dot of the round lights after the one before.",
          },
          {
            name: "agent-indicator-snake",
            category: "duration",
            value: "1500ms",
            use: "The light once through the dither glyph, row by row, and its rest.",
          },
          {
            name: "agent-indicator-snake-step",
            category: "duration",
            value: "110ms",
            use: "How far behind each dot of the snake lights after the one before.",
          },
          {
            name: "agent-indicator-orbit",
            category: "duration",
            value: "1700ms",
            use: "The orbit's arc once round, and its rest.",
          },
          {
            name: "agent-indicator-breath",
            category: "duration",
            value: "1600ms",
            use: "The breath's ring growing, or falling back.",
          },
          {
            name: "agent-indicator-glide",
            category: "duration",
            value: "2200ms",
            use: "The glint once across the bead, and its rest.",
          },
        ],
      },
    ],
  },
  {
    id: "text-shimmer",
    title: "Text shimmer",
    sets: [
      {
        id: "text-shimmer-parts",
        title: "Text shimmer",
        tokens: [
          {
            name: "shimmer-soft",
            category: "font",
            value: "{pine}",
            use: "The light crossing a line of what an agent is doing, at its quietest: pine.",
          },
          {
            name: "shimmer-clear",
            category: "font",
            value: "light-dark(oklch(0.33 0.1 167), oklch(0.88 0.15 165))",
            use: "The light, as it is by default: deep mint on paper, mint on night, twice the muted words' contrast so the band reads as light moving, not as green words.",
          },
          {
            name: "shimmer-bright",
            category: "font",
            value: "light-dark(oklch(0.27 0.09 168), oklch(0.93 0.12 165))",
            use: "The light at its strongest, in a wider band.",
          },
        ],
      },
    ],
  },
  {
    id: "slider",
    title: "Slider",
    sets: [
      {
        id: "slider-parts",
        title: "Slider",
        tokens: [
          {
            name: "slider-track",
            category: "size",
            value: "4px",
            use: "How thick a slider's track is: a soft line the thumb rides on.",
          },
          {
            name: "slider-thumb",
            category: "size",
            value: "16px",
            use: "The thumb of a slider: a white circle with the low lift.",
          },
        ],
      },
    ],
  },
  {
    id: "level-slider",
    title: "Level slider",
    sets: [
      {
        id: "level-slider-parts",
        title: "Level slider",
        tokens: [
          {
            name: "slider-levels-track",
            category: "size",
            value: "24px",
            use: "How tall the track of dots is at the compact size, inside a popup or a menu.",
          },
          {
            name: "slider-levels-track-regular",
            category: "size",
            value: "32px",
            use: "How tall the track is at the regular size, on a page.",
          },
          {
            name: "slider-levels-hover",
            category: "size",
            value: "1.08",
            use: "How much the thumb grows while a pointer is over the slider, to be taken hold of.",
          },
          {
            name: "slider-levels-warm",
            category: "colors",
            value: "oklch(0.74 0.15 58)",
            dark: "{warning}",
            use: "The few warm dots just before the thumb, the light's leading edge: a clear orange on paper, amber at night.",
          },
          {
            name: "slider-levels-run-padding",
            category: "size",
            value: "2px",
            use: "How far the thumb's run stops short of the track's round ends, so the thumb's ring stays inside them at either end.",
          },
          {
            name: "slider-levels-thumb-padding",
            category: "size",
            value: "3px",
            use: "How far the round thumb stands inside the track, top and bottom.",
          },
          {
            name: "slider-levels-pitch",
            category: "size",
            value: "4px",
            use: "The halftone's grid: one dot on every 4px, its size drawn from the dot's own seed.",
          },
          {
            name: "slider-levels-snap",
            category: "duration",
            value: "160ms",
            use: "The dots filling to a new level and the thumb settling there: ease-out, no overshoot. At once with reduced motion.",
          },
          {
            name: "slider-levels-rest",
            category: "colors",
            value: "{muted}",
            use: "The track's ground, under the dots.",
          },
          {
            name: "slider-levels-thumb",
            category: "colors",
            value: "{card}",
            dark: "{brand-paper}",
            use: "The round thumb: white on paper, and white at night too, so it stands out on the dots.",
          },
        ],
      },
    ],
  },
  {
    id: "table",
    title: "Table",
    sets: [
      {
        id: "table-parts",
        title: "Table",
        tokens: [
          {
            name: "table-head-height",
            category: "size",
            value: "48px",
            use: "The height of a table's head row.",
          },
          {
            name: "table-cell-block",
            category: "space",
            value: "{space-3}",
            use: "Room above and below the words in a table's cell.",
          },
          {
            name: "table-cell-inline",
            category: "space",
            value: "{space-4}",
            use: "Room at each side of the words in a table's cell.",
          },
          {
            name: "table-row-bg-hover",
            category: "colors",
            value: "{accent}",
            use: "The fill a table's row gains under a pointer.",
          },
          {
            name: "table-text",
            category: "size",
            value: "0.8125rem",
            use: "The words in a table's cells: a step under text-sm.",
          },
          {
            name: "table-text-line",
            category: "size",
            value: "1.125rem",
            use: "The line height of table-text.",
          },
          {
            name: "table-cell-block-compact",
            category: "size",
            value: "7px",
            use: "Room above and below a compact table's words: a 32px row.",
          },
          {
            name: "table-cell-block-comfortable",
            category: "space",
            value: "{space-4}",
            use: "Room above and below a roomy table's words: a 50px row.",
          },
          {
            name: "table-head-height-compact",
            category: "size",
            value: "40px",
            use: "The head row of a compact table.",
          },
          {
            name: "table-resize-step",
            category: "size",
            value: "16px",
            use: "How far an arrow key widens or narrows a column.",
          },
          {
            name: "table-column-min",
            category: "size",
            value: "64px",
            use: "The narrowest a column can be made.",
          },
          {
            name: "table-fade",
            category: "space",
            value: "{space-12}",
            use: "How far a table's box fades at an edge with more beyond it: wide enough that a cut column reads as more this way, not as cut.",
          },
          {
            name: "table-lead-min",
            category: "size",
            value: "11rem",
            use: "The least width of a row's lead cell, so what the row is reads in whole phrases while a narrow table scrolls sideways.",
          },
          {
            name: "table-row-bg-selected-mint",
            category: "colors",
            value: "{data-grid-range-wash}",
            use: "A chosen row's band in the mint look: the Data grid's wash over a range, so the two read as one family.",
          },
          {
            name: "table-head-text",
            category: "colors",
            value: "{muted-foreground}",
            dark: "oklch(0.72 0.025 158)",
            use: "A column's name in the head: the muted words, a step lighter in dark, so they reach 4.5:1 on the page's own ground as the plain head draws them.",
          },
        ],
      },
    ],
  },
  {
    id: "drawer",
    title: "Drawer and sheet",
    sets: [
      {
        id: "drawer-parts",
        title: "Drawer and sheet",
        tokens: [
          {
            name: "drawer-width",
            category: "size",
            value: "40rem",
            use: "The widest a drawer grows along the bottom of a wide window; a phone's is its full width.",
          },
          {
            name: "drawer-height",
            category: "size",
            value: "85dvh",
            use: "The tallest a drawer grows before its body scrolls.",
          },
          {
            name: "drawer-handle-width",
            category: "size",
            value: "40px",
            use: "The grip at the top of a drawer: wide enough to see as a thing to drag.",
          },
          {
            name: "drawer-handle-height",
            category: "size",
            value: "4px",
            use: "How thick a drawer's grip is.",
          },
          {
            name: "drawer-handle-bg",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.18)",
            dark: "oklch(0.96 0.02 150 / 0.22)",
            use: "The grip at the top of a drawer: a soft bar, quieter than words.",
          },
          {
            name: "sheet-width",
            category: "size",
            value: "26rem",
            use: "The width of a sheet along a side of the window: room for a form's fields.",
          },
          {
            name: "sheet-width-wide",
            category: "size",
            value: "37.5rem",
            use: "A wide sheet: room for a layout of its own.",
          },
          {
            name: "sheet-width-full",
            category: "size",
            value: "64rem",
            use: "A full sheet: a chart or a table opened in full beside the page.",
          },
          {
            name: "sheet-padding",
            category: "size",
            value: "6px",
            use: "How far a sheet floats off the window's edges.",
          },
          {
            name: "sheet-head-height",
            category: "size",
            value: "48px",
            use: "The height of a sheet's head: its title and its close button, over a hairline.",
          },
        ],
      },
    ],
  },
  {
    id: "toast",
    title: "Toast",
    sets: [
      {
        id: "toast-parts",
        title: "Toast",
        tokens: [
          {
            name: "toast-width",
            category: "size",
            value: "24rem",
            use: "The width of a toast: a title and a sentence on a line or two.",
          },
          {
            name: "toast-duration",
            category: "duration",
            value: "3500ms",
            use: "How long a toast shows while nothing pauses it.",
          },
          {
            name: "toast-duration-action",
            category: "duration",
            value: "8000ms",
            use: "How long a toast with an action shows: long enough to read it and reach the action, as there is no close.",
          },
          {
            name: "toast-gap",
            category: "space",
            value: "{space-3}",
            use: "The room between toasts in an open stack.",
          },
          {
            name: "toast-peek",
            category: "space",
            value: "{space-3}",
            use: "How far each toast behind the newest shows from under it in a closed stack.",
          },
          {
            name: "toast-peek-scale",
            category: "size",
            value: "0.05",
            use: "How much smaller each toast behind the newest is in a closed stack.",
          },
        ],
      },
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    sets: [
      {
        id: "calendar-parts",
        title: "Calendar",
        tokens: [
          {
            name: "calendar-day",
            category: "size",
            value: "{control-sm}",
            use: "The side of a day in a calendar with a pointer: a small control's height.",
          },
          {
            name: "calendar-day-touch",
            category: "size",
            value: "{control-lg}",
            use: "The side of a day on a touch screen: a whole fingertip's target.",
          },
          {
            name: "calendar-bg-selected",
            category: "colors",
            value: "{primary}",
            use: "A chosen day, and the ends of a chosen range: the first action's colour.",
          },
          {
            name: "calendar-text-selected",
            category: "colors",
            value: "{primary-foreground}",
            use: "The number on a chosen day.",
          },
          {
            name: "calendar-bg-range",
            category: "colors",
            value: "{accent-highlight}",
            use: "The days inside a chosen range, between its ends.",
          },
          {
            name: "calendar-bg-today",
            category: "colors",
            value: "{accent-active}",
            use: "Today, when it is not chosen: a quiet fill that finds it.",
          },
        ],
      },
    ],
  },
  {
    id: "toggle",
    title: "Toggle",
    sets: [
      {
        id: "toggle-parts",
        title: "Toggle",
        tokens: [
          {
            name: "toggle-height",
            category: "size",
            value: "{control-xs}",
            use: "The height of a toggle.",
          },
          {
            name: "toggle-padding",
            category: "size",
            value: "6px",
            use: "Room at each end of a toggle's words.",
          },
          {
            name: "toggle-gap",
            category: "size",
            value: "2px",
            use: "Room between the toggles inside a group's track.",
          },
          {
            name: "toggle-track-padding",
            category: "space",
            value: "{space-1}",
            use: "Room round the pressed toggle inside a group's track, the same on every side, as segmented Tabs'.",
          },
          {
            name: "toggle-icon",
            category: "size",
            value: "{icon-sm}",
            use: "A toggle's icon.",
          },
          {
            name: "toggle-bg-pressed",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.14)",
            dark: "oklch(0.96 0.02 150 / 0.2)",
            use: "A pressed toggle alone: a veil of ink clearly deeper than a hovered one's, so pressed reads strongest.",
          },
          {
            name: "toggle-bg-pressed-hover",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.19)",
            dark: "oklch(0.96 0.02 150 / 0.26)",
            use: "A pressed toggle alone under a pointer: one step past pressed.",
          },
        ],
      },
    ],
  },
  {
    id: "scroll-area",
    title: "Scroll area",
    sets: [
      {
        id: "scroll-area-parts",
        title: "Scroll area",
        tokens: [
          {
            name: "scrollbar-size",
            category: "size",
            value: "10px",
            use: "The width of a scroll area's bar.",
          },
          {
            name: "scrollbar-padding",
            category: "size",
            value: "1px",
            use: "Room round the thumb inside its bar.",
          },
          {
            name: "scroll-thumb",
            category: "colors",
            value: "{switch-track}",
            use: "The thumb that shows where the view is.",
          },
          {
            name: "scroll-thumb-hover",
            category: "colors",
            value: "{switch-track-hover}",
            use: "The thumb under a pointer, or dragged.",
          },
        ],
      },
    ],
  },
  {
    id: "kbd",
    title: "Kbd",
    sets: [
      {
        id: "kbd-parts",
        title: "Kbd",
        tokens: [
          {
            name: "kbd-height",
            category: "size",
            value: "20px",
            use: "The height of a key.",
          },
          {
            name: "kbd-padding",
            category: "space",
            value: "{space-1}",
            use: "Room at each side of a key's sign.",
          },
        ],
      },
    ],
  },
  {
    id: "resizable",
    title: "Resizable",
    sets: [
      {
        id: "resizable-parts",
        title: "Resizable",
        tokens: [
          {
            name: "resizable-line",
            category: "colors",
            value: "{border}",
            use: "The hairline between two panels.",
          },
          {
            name: "resizable-line-active",
            category: "colors",
            value: "{muted-foreground}",
            use: "The hairline under a pointer or while dragged.",
          },
          {
            name: "resizable-handle-length",
            category: "size",
            value: "24px",
            use: "The length of a handle's grip.",
          },
          {
            name: "resizable-handle-width",
            category: "size",
            value: "4px",
            use: "The width of a handle's grip.",
          },
        ],
      },
    ],
  },
  {
    id: "tag",
    title: "Tag",
    sets: [
      {
        id: "tag-parts",
        title: "Tag",
        tokens: [
          {
            name: "tag-height",
            category: "size",
            value: "{chip}",
            use: "The height of a tag.",
          },
          {
            name: "tag-height-sm",
            category: "size",
            value: "20px",
            use: "The height of a small tag, in a dense row.",
          },
          {
            name: "tag-padding",
            category: "space",
            value: "{space-2}",
            use: "Room at each end of a tag's words.",
          },
          {
            name: "tag-icon",
            category: "size",
            value: "{badge-icon}",
            use: "The size of an icon in a tag, and of its remove cross.",
          },
          {
            name: "tag-bg",
            category: "colors",
            value: "{accent-active}",
            use: "A soft tag's fill: a veil of ink, so it shows on paper and on soft.",
          },
        ],
      },
    ],
  },
  {
    id: "section-header",
    title: "Section header",
    sets: [
      {
        id: "section-header-parts",
        title: "Section header",
        tokens: [
          {
            name: "section-header-gap",
            category: "space",
            value: "{space-6}",
            use: "Room between a section's header and each part under it.",
          },
          {
            name: "section-header-title-wait",
            category: "size",
            value: "180px",
            use: "The width of a section title's placeholder while it loads.",
          },
        ],
      },
    ],
  },
  {
    id: "table-of-contents",
    title: "Table of contents",
    sets: [
      {
        id: "table-of-contents-parts",
        title: "Table of contents",
        tokens: [
          {
            name: "table-of-contents-mark",
            category: "size",
            value: "2px",
            use: "How thick the mark beside the section being read is, and the measure of how much of the page is read.",
          },
          {
            name: "table-of-contents-read",
            category: "colors",
            value: "{mint-deep}",
            use: "What is read: the measure's fill, and the compact form's tick for the section being read.",
          },
          {
            name: "table-of-contents-tick",
            category: "space",
            value: "{space-3}",
            use: "How long a section's tick is in the compact form.",
          },
          {
            name: "table-of-contents-tick-short",
            category: "space",
            value: "{space-2}",
            use: "How long a sub-section's tick is in the compact form.",
          },
          {
            name: "table-of-contents-tick-active",
            category: "space",
            value: "{space-5}",
            use: "How long the tick of the section being read is.",
          },
          {
            name: "table-of-contents-tick-gap",
            category: "space",
            value: "{space-2}",
            use: "The room between two ticks in the compact form.",
          },
          {
            name: "table-of-contents-width",
            category: "size",
            value: "16rem",
            use: "The widest the compact form's list opens: less on a window narrower than it and its gutters.",
          },
        ],
      },
    ],
  },
  {
    id: "prompt-input",
    title: "Prompt input and attachments",
    sets: [
      {
        id: "prompt-input-parts",
        title: "Prompt input and attachments",
        tokens: [
          {
            name: "prompt-input-width",
            category: "size",
            value: "36rem",
            use: "The widest a prompt input grows.",
          },
          {
            name: "prompt-input-height",
            category: "size",
            value: "12rem",
            use: "The tallest a prompt input's text grows before it scrolls inside.",
          },
          {
            name: "attachment-max-width",
            category: "size",
            value: "20rem",
            use: "The widest a file waiting to be sent grows, in the strip above a prompt input's text: its width is its name's, up to this or the strip's width, and only a name longer than that is cut.",
          },
          {
            name: "attachment-thumb",
            category: "size",
            value: "{control-default}",
            use: "The square of a file's picture or mark at the start of its card.",
          },
          {
            name: "prompt-input-mention-width",
            category: "size",
            value: "18rem",
            use: "The width of the menu that opens at the caret when @ or / is typed.",
          },
          {
            name: "prompt-input-field-min",
            category: "size",
            value: "8rem",
            use: "The least width of a one-row prompt input's text: with less room beside the tools, the text takes the row and the tools go under it. The text never gives.",
          },
          {
            name: "prompt-input-light",
            category: "colors",
            value:
              "linear-gradient(90deg, {brand-mint} 0%, {brand-sea} 12%, transparent 22%, {brand-lime} 34%, {brand-mint} 44%, transparent 54%, {brand-sea} 64%, {brand-lime} 76%, transparent 88%, {brand-mint} 100%)",
            use: "The working light over a prompt input's top edge: lime, sea and mint in beams with gaps between, ending as it starts so it loops without a seam.",
          },
          {
            name: "prompt-input-tint",
            category: "colors",
            value:
              "linear-gradient(90deg, currentColor 0%, color-mix(in oklch, currentColor 55%, transparent) 14%, transparent 24%, currentColor 36%, color-mix(in oklch, currentColor 30%, transparent) 50%, transparent 58%, currentColor 68%, color-mix(in oklch, currentColor 45%, transparent) 82%, currentColor 100%)",
            use: "The working light in one accent colour, the colour set on the light's layer.",
          },
          {
            name: "prompt-input-halo",
            category: "shadow",
            value:
              "0 0 10px 2px color-mix(in oklch, currentColor 45%, transparent), 0 3px 18px 3px color-mix(in oklch, currentColor 25%, transparent)",
            use: "Success: a soft glow round a prompt input's card in the colour set on it, mint by default. It fades out; it never draws a line.",
          },
          {
            name: "prompt-input-halo-time",
            category: "duration",
            value: "1.2s",
            use: "The success halo, from nothing to full and out again: a moment, played once.",
          },
          {
            name: "prompt-input-glass",
            category: "colors",
            value: "color-mix(in oklch, {card} 86%, transparent)",
            use: "A prompt input's card over what scrolls behind it (variant=\"glass\"): the card's colour most of the way, over a blur.",
          },
          {
            name: "prompt-input-glass-blur",
            category: "size",
            value: "blur(14px) saturate(1.5)",
            use: "The backdrop filter that goes with prompt-input-glass.",
          },
          {
            name: "prompt-input-light-opacity",
            category: "size",
            value: "0.9",
            use: "How strongly the working light shows round the card: soft, never a hard ring.",
          },
          {
            name: "prompt-input-light-in",
            category: "duration",
            value: "280ms",
            use: "How long the working light takes to come up or go.",
          },
          {
            name: "prompt-input-beam",
            category: "duration",
            value: "6s",
            use: "The widest beam of the working light, once along the edge. A continuous sign of life: it may loop longer than a transition.",
          },
          {
            name: "prompt-input-beam-fast",
            category: "duration",
            value: "4.4s",
            use: "The quickest beam of the working light.",
          },
          {
            name: "prompt-input-beam-slow",
            category: "duration",
            value: "7s",
            use: "The slowest beam of the working light: it breathes, it does not race.",
          },
        ],
      },
    ],
  },
  {
    id: "message",
    title: "Message",
    sets: [
      {
        id: "message-parts",
        title: "Message",
        tokens: [
          {
            name: "message-bubble-width",
            category: "size",
            value: "80%",
            use: "The widest a person's message grows across the conversation, so it reads as theirs.",
          },
          {
            name: "message-text",
            category: "size",
            value: "{text-sm}",
            use: "Every word the chat reads in: a message, an answer's Markdown, a source's passage, the prompt input's text. 14px, as the sidebar's rows.",
          },
          {
            name: "message-text-line",
            category: "size",
            value: "1.375rem",
            use: "The line height of chat-text: a little more room than text-sm's, for reading at length.",
          },
        ],
      },
    ],
  },
  {
    id: "audio-player",
    title: "Audio player",
    sets: [
      {
        id: "audio-player-parts",
        title: "Audio player",
        tokens: [
          {
            name: "audio-width",
            category: "size",
            value: "40rem",
            use: "The widest an audio player's bar grows.",
          },
        ],
      },
    ],
  },
  {
    id: "sidebar",
    title: "Sidebar",
    sets: [
      {
        id: "sidebar-parts",
        title: "Sidebar",
        tokens: [
          {
            name: "sidebar-width",
            category: "size",
            value: "15rem",
            use: "The width of an open sidebar.",
          },
          {
            name: "sidebar-rail-width",
            category: "size",
            value: "56px",
            use: "The width of a sidebar folded to its icons.",
          },
          // Neutral greys, as the sidebar's other colours: with no theme they stand as written; in
          // a theme the ground is made from the theme's paper (tokens/model.ts).
          {
            name: "sidebar",
            category: "colors",
            value: "oklch(0.957 0 0)",
            dark: "oklch(0.18 0 0)",
            use: "The sidebar's ground, which the page's card stands on.",
          },
          {
            name: "sidebar-menu-button-height",
            category: "size",
            value: "{control-sm}",
            use: "The height of a row, as Button's small one.",
          },
          {
            name: "sidebar-menu-button-height-lg",
            category: "size",
            value: "46px",
            use: "The height of a large row: a picture and two lines (a person, a workspace).",
          },
          {
            name: "sidebar-accent",
            category: "colors",
            value: "oklch(0 0 0 / 0.05)",
            dark: "oklch(1 0 0 / 0.07)",
            use: "The row of the page you are on: ink laid flat over the ground.",
          },
        ],
      },
      {
        id: "sidebar-colours",
        title: "Sidebar colours",
        tokens: [
          // The sidebar on the window's ground and the page as a card on it. Neutral greys, ink laid over the ground for what is pointed at or chosen.
          {
            name: "sidebar-card",
            category: "colors",
            value: "oklch(1 0 0)",
            dark: "oklch(0.215 0 0)",
            use: "The page's card on the ground.",
          },
          {
            name: "sidebar-hover",
            category: "colors",
            value: "oklch(0 0 0 / 0.035)",
            dark: "oklch(1 0 0 / 0.05)",
            use: "A row or button under the pointer.",
          },
          {
            name: "sidebar-rule",
            category: "colors",
            value: "oklch(0 0 0 / 0.08)",
            dark: "oklch(1 0 0 / 0.1)",
            use: "A rule that parts the sidebar, and a badge's edge.",
          },
          {
            name: "sidebar-text",
            category: "colors",
            value: "oklch(0.269 0 0)",
            dark: "oklch(0.96 0 0)",
            use: "Words read first: the current row, the page bar's last crumb.",
          },
          // 0.52 in light: 4.86:1 on the system's ground and 4.69:1 on Pine's (its paper's ground is a
          // hair darker), the least step that passes 4.5:1 for the rows' 14px words on every theme.
          {
            name: "sidebar-text-secondary",
            category: "colors",
            value: "oklch(0.52 0 0)",
            dark: "oklch(0.72 0 0)",
            use: "The rows' words and their icons.",
          },
          {
            name: "sidebar-text-tertiary",
            category: "colors",
            value: "oklch(0.64 0 0)",
            dark: "oklch(0.6 0 0)",
            use: "A mark quieter than the rows' words: the chevrons at the end of a person's row.",
          },
          {
            name: "sidebar-card-border",
            category: "colors",
            value: "oklch(0 0 0 / 0.1)",
            dark: "oklch(1 0 0 / 0.1)",
            use: "The line drawn inside the page card's edge, round every corner; the card has no lift.",
          },
        ],
      },
      {
        id: "sidebar-sizes",
        title: "Sidebar sizes",
        tokens: [
          {
            name: "sidebar-row-gap",
            category: "size",
            value: "2px",
            use: "The room between two rows.",
          },
          {
            name: "sidebar-row-inline",
            category: "size",
            value: "8px",
            use: "A row's padding at its sides.",
          },
          {
            name: "sidebar-icon-gap",
            category: "size",
            value: "10px",
            use: "The room between a row's icon and its words.",
          },
          {
            name: "sidebar-icon",
            category: "size",
            value: "16px",
            use: "A row's icon.",
          },
          {
            name: "sidebar-icon-button",
            category: "size",
            value: "{control-xs}",
            use: "A button that is only an icon in the frame (the sidebar's toggle).",
          },
          {
            name: "sidebar-card-radius",
            category: "radius",
            value: "12px",
            use: "The page card's corner.",
          },
          {
            name: "sidebar-card-gap",
            category: "size",
            value: "6px",
            use: "The room round the page's card, on the sidebar's ground.",
          },
          // A squircle of radius r cuts in r·√2·(1 − 2^(−¼)) at 45°, a round corner r·√2·(1 − 2^(−½)):
          // the same cut takes a squircle 1.84 times the round corner's radius .
          // A window round the shell (an example's, a host's pane) takes the card's corner plus the
          // card's inset, round as the card is, so the two corners nest.
          {
            name: "sidebar-tracking",
            category: "size",
            value: "-0.01em",
            use: "The rows' letter spacing: a hair tighter than set.",
          },
          {
            name: "sidebar-name-line",
            category: "font",
            value: "1.125rem",
            use: "The line height of a large row's first line: the person's name at the sidebar's foot.",
          },
          {
            name: "sidebar-note-line",
            category: "font",
            value: "1rem",
            use: "The line height of a large row's second line: the organisation under the person's name.",
          },
          {
            name: "sidebar-count-inline",
            category: "size",
            value: "5px",
            use: "A row's count: its padding at the sides.",
          },
        ],
      },
    ],
  },
  {
    id: "app-shell",
    title: "App shell",
    sets: [
      {
        id: "app-shell-sizes",
        title: "App shell",
        tokens: [
          {
            name: "app-shell-mark",
            category: "size",
            value: "20px",
            use: "The product's mark at the top of the sidebar.",
          },
          {
            name: "app-shell-bar",
            category: "size",
            value: "48px",
            use: "The least height of the page bar across the top of the page's card.",
          },
          // The page's words and the page bar's first and last ink stand this far in from the card's
          // sides, so the bar and the page under it share both edges. A host whose
          // page keeps a narrower gutter on a phone sets it there, and the bar follows.
          {
            name: "app-shell-page-inline",
            category: "size",
            value: "{space-6}",
            use: "The room between the page card's sides and the page's words; the page bar's first and last ink keep it too.",
          },
          // The room under the last thing on a page: the usual, or enough to scroll it clear of a
          // chat box floating over the page's foot (the product's pb-chat).
          {
            name: "app-shell-page-room-below",
            category: "size",
            value: "32px",
            use: "The room under the last thing on a page.",
          },
        ],
      },
    ],
  },
  {
    id: "container",
    title: "Container",
    sets: [
      {
        id: "container-parts",
        title: "Container",
        tokens: [
          {
            name: "container-sm",
            category: "size",
            value: "40rem",
            use: 'The width of a settings page\'s centred column: its title and its groups of rows (Container size="sm").',
          },
          {
            name: "container-default",
            category: "size",
            value: "45rem",
            use: "The width of a page column at the page's start: a settings page's groups of rows (Container).",
          },
          {
            name: "container-lg",
            category: "size",
            value: "64rem",
            use: 'The width of a page column of wider things (Container size="lg").',
          },
        ],
      },
    ],
  },
  {
    id: "theme-toggle",
    title: "Theme toggle",
    sets: [
      {
        id: "theme-toggle-parts",
        title: "Theme toggle",
        tokens: [
          {
            name: "picker-tile",
            category: "size",
            value: "8rem",
            use: "The widest a picker's tile grows with tileSize=\"default\": a theme's miniature, a backdrop's preview.",
          },
        ],
      },
    ],
  },
  {
    id: "carousel",
    title: "Carousel",
    sets: [
      {
        id: "carousel-parts",
        title: "Carousel",
        tokens: [
          {
            name: "carousel-gap",
            category: "space",
            value: "{space-4}",
            use: "The room between two slides.",
          },
          {
            name: "carousel-dot",
            category: "size",
            value: "6px",
            use: "The height of a page's mark, and its width at rest.",
          },
          {
            name: "carousel-dot-active",
            category: "size",
            value: "20px",
            use: "The width of the current page's mark.",
          },
          {
            name: "carousel-dot-target",
            category: "size",
            value: "24px",
            use: "The square a pointer presses round a page's mark; 44px on a touch screen.",
          },
          {
            name: "carousel-dot-bg",
            category: "colors",
            value: "{muted-foreground}",
            use: "A page's mark at rest.",
          },
          {
            name: "carousel-dot-bg-active",
            category: "colors",
            value: "{foreground}",
            use: "The current page's mark.",
          },
        ],
      },
    ],
  },
  {
    id: "form",
    title: "Form",
    sets: [
      {
        id: "form-parts",
        title: "Form",
        tokens: [
          {
            name: "form-gap",
            category: "space",
            value: "{space-5}",
            use: "The room between two fields, down and across.",
          },
          {
            name: "form-group-gap",
            category: "space",
            value: "{space-8}",
            use: "The room between two groups of fields, either side of a hairline.",
          },
          {
            name: "form-column",
            category: "size",
            value: "12rem",
            use: "The narrowest a field in a row may be before the row stacks.",
          },
          {
            name: "form-width",
            category: "size",
            value: "40rem",
            use: "The widest a form's column stands, so a line of fields stays easy to read.",
          },
          {
            name: "item-grid-tile",
            category: "size",
            value: "15rem",
            use: "The narrowest a tile in an ItemGrid stands before its row takes one fewer: as many per row as fit.",
          },
          {
            name: "connect-tile",
            category: "size",
            value: "11rem",
            use: "The narrowest a provider's tile stands in the connect block before its row takes one fewer: four in a row in a settings column.",
          },
          {
            name: "field-control-column",
            category: "size",
            value: "20rem",
            use: "A setting row's control column: one width for every row of a page, so the controls share one end edge.",
          },
          {
            name: "field-row",
            category: "space",
            value: "{space-12}",
            use: "A setting row's least height, a 32px control with room above and below; with a line of help it is 56px.",
          },
        ],
      },
    ],
  },
  {
    id: "confirmation",
    title: "Confirmation",
    sets: [
      {
        id: "confirmation-parts",
        title: "Confirmation",
        tokens: [
          {
            name: "confirmation-width",
            category: "size",
            value: "{prompt-input-width}",
            use: "The widest an approval request stands: the prompt input's width, as it sits in the same thread.",
          },
          {
            name: "confirmation-settle",
            category: "duration",
            value: "{duration-ui}",
            use: "How long a decided request takes to settle into its one quiet line.",
          },
        ],
      },
    ],
  },
  {
    id: "diff",
    title: "Diff",
    sets: [
      {
        id: "diff-parts",
        title: "Diff",
        tokens: [
          {
            name: "diff-viewer-added-bg",
            category: "colors",
            value: "{success-subtle}",
            dark: "oklch(0.29 0.07 150)",
            use: "The ground of a line that was added. In dark it stands as far from the panel as a removed line does (OKLab step 0.069 against 0.079).",
          },
          {
            name: "diff-viewer-removed-bg",
            category: "colors",
            value: "{destructive-subtle}",
            dark: "oklch(0.265 0.045 28)",
            use: "The ground of a line that was removed. In dark it is quieter than a danger message, to match an added line's step from the panel.",
          },
          {
            name: "diff-viewer-added-word",
            category: "colors",
            value: "oklch(0.885 0.085 152)",
            dark: "oklch(0.37 0.1 150)",
            use: "The words that changed within an added line: a step deeper than the line.",
          },
          {
            name: "diff-viewer-removed-word",
            category: "colors",
            value: "oklch(0.895 0.065 28)",
            dark: "oklch(0.355 0.085 28)",
            use: "The words that changed within a removed line: a step deeper than the line.",
          },
          {
            name: "diff-viewer-fold-bg",
            category: "colors",
            value: "{muted}",
            use: "The ground of a folded run of unchanged lines, and of a change's head.",
          },
          {
            name: "diff-viewer-number",
            category: "size",
            value: "5ch",
            use: "The width of a line-number column: four figures and room.",
          },
          {
            name: "diff-viewer-height",
            category: "size",
            value: "32rem",
            use: "The tallest a long diff stands before it scrolls inside, drawing only the lines in view.",
          },
        ],
      },
    ],
  },
  {
    id: "chart",
    title: "Chart",
    sets: [
      {
        id: "chart-parts",
        title: "Chart",
        tokens: [
          {
            name: "chart-1",
            category: "colors",
            value: "{mint-deep}",
            use: "The value: an area's line and a bar's cap. Never mint, which is too faint on paper.",
          },
          {
            name: "chart-plain",
            category: "colors",
            value: "{mint-deep}",
            use: "A plain bar's fill.",
          },
          {
            name: "chart-grid",
            category: "colors",
            value:
              "light-dark(oklch(0.29 0.05 162 / 0.18), oklch(0.96 0.02 150 / 0.2))",
            use: "The chart's grid: its own value, a step above the hairline (line), so the axes' lines read on a white card (\"no visible axes\").",
          },
          {
            name: "chart-dither-lit",
            category: "colors",
            value: "{brand-mint}",
            use: "The lit cells of a dither fill, near the value.",
          },
          {
            name: "chart-dither-bg",
            category: "colors",
            value: "{brand-pine}",
            use: "The ground of a dither fill, at the floor: evergreen.",
          },
          {
            name: "chart-tick",
            category: "colors",
            value: "{muted-foreground}",
            use: "The words and numbers along an axis.",
          },
          {
            name: "chart-muted",
            category: "colors",
            value: "{muted-foreground}",
            use: "A comparison drawn as a line: last period's, quieter than the value and dashed, never a second hue.",
          },
          {
            name: "chart-muted-bg",
            category: "colors",
            value: "color-mix(in oklch, {muted-foreground} 32%, transparent)",
            use: "A comparison drawn as a bar: last year's beside this year's.",
          },
          {
            name: "chart-2",
            category: "colors",
            value: "oklch(0.43 0.078 175)",
            dark: "oklch(0.74 0.09 175)",
            use: "A ring's second part: the light turned deep (pine). The first is the value colour. Each tone steps evenly towards the ground and holds 3:1 against it.",
          },
          {
            name: "chart-3",
            category: "colors",
            value: "oklch(0.493 0.064 172)",
            dark: "oklch(0.683 0.078 172)",
            use: "A ring's third part, 3:1 or more against the page.",
          },
          {
            name: "chart-4",
            category: "colors",
            value: "oklch(0.556 0.05 170)",
            dark: "oklch(0.627 0.066 170)",
            use: "A ring's fourth part, 3:1 or more against the page.",
          },
          {
            name: "chart-5",
            category: "colors",
            value: "oklch(0.62 0.036 168)",
            dark: "oklch(0.57 0.054 168)",
            use: "A ring's fifth part, 3:1 or more against the page.",
          },
          {
            name: "chart-node-muted",
            category: "colors",
            value: "oklch(0.5 0.03 160)",
            dark: "oklch(0.5 0.025 158)",
            use: "A Sankey's quiet end (disputed, waiting): muted, and in dark no brighter than the value's nodes.",
          },
          {
            name: "chart-ribbon",
            category: "colors",
            value: "color-mix(in oklch, {mint-deep} 26%, transparent)",
            use: "A Sankey's flow at rest: the value colour, faint, so where flows cross both still show.",
          },
          {
            name: "chart-ribbon-lit",
            category: "colors",
            value: "oklch(0.5 0.12 167 / 0.58)",
            dark: "oklch(0.8 0.15 165 / 0.42)",
            use: "A Sankey's flow lit, with every flow before and after it. In dark a step fainter, so the ink of a name standing on it keeps 4.5:1.",
          },
          {
            name: "chart-ribbon-muted",
            category: "colors",
            value: "color-mix(in oklch, {muted-foreground} 18%, transparent)",
            use: "A flow into a quiet end (disputed, waiting), and every flow stepped back while another is lit.",
          },
        ],
      },
    ],
  },
  {
    id: "date-range-picker",
    title: "Date range picker",
    sets: [
      {
        id: "date-range-picker-parts",
        title: "Date range picker",
        tokens: [
          {
            name: "date-picker-field-padding",
            category: "space",
            value: "{space-3}",
            use: "Room inside a date field before its first date; its calendar opens moved back by it, so the popup's edge meets the field's.",
          },
          {
            name: "date-picker-range-width",
            category: "size",
            value: "24rem",
            use: "The widest a date range picker's field grows: two dates and the calendar button.",
          },
          {
            name: "date-picker-range-presets",
            category: "size",
            value: "9rem",
            use: "The column of presets beside the calendar: Today, Last 7 days, This month.",
          },
        ],
      },
    ],
  },
  {
    id: "tree",
    title: "Tree",
    sets: [
      {
        id: "tree-parts",
        title: "Tree",
        tokens: [
          {
            name: "tree-view-row",
            category: "size",
            value: "{control-sm}",
            use: "The height of a tree's row with a pointer: a small control's.",
          },
          {
            name: "tree-view-row-touch",
            category: "size",
            value: "{tap-target}",
            use: "The height of a tree's row on a touch screen: a fingertip's target.",
          },
          {
            name: "tree-view-indent",
            category: "space",
            value: "{space-4}",
            use: "How far each level of a tree stands in from the one above it.",
          },
          {
            name: "tree-view-row-padding",
            category: "space",
            value: "{space-2}",
            use: "Room at each end of a tree's row, inside its fill.",
          },
          {
            name: "tree-view-row-gap",
            category: "size",
            value: "{hairline}",
            use: "The room between two rows of a tree.",
          },
          {
            name: "tree-view-text",
            category: "colors",
            value: "{body-foreground}",
            use: "A tree row's words.",
          },
          {
            name: "tree-view-icon-gap",
            category: "space",
            value: "{space-2}",
            use: "The room between a tree row's chevron, icon and words.",
          },
          {
            name: "tree-view-guide",
            category: "size",
            value: "{hairline}",
            use: "The width of a tree's guide (`guides`): its stem and elbows, a hairline.",
          },
          {
            name: "tree-view-icon",
            category: "colors",
            value: "{muted-foreground}",
            use: "A tree row's chevron and icon: quieter than its words, unless a host draws them in the words' colour (a sidebar does).",
          },
          {
            name: "tree-view-text-hover",
            category: "colors",
            value: "{body-foreground}",
            use: "A tree row's words under a pointer: as they stand, unless a host brightens them (a sidebar does).",
          },
          {
            name: "tree-view-text-selected",
            category: "colors",
            value: "{foreground}",
            use: "The words of a chosen row and of the current page.",
          },
          {
            name: "tree-view-weight",
            category: "font",
            value: "{font-weight-normal}",
            use: "A tree row's words' weight.",
          },
          {
            name: "tree-view-weight-active",
            category: "font",
            value: "{font-weight-medium}",
            use: "The current page's words: a step heavier.",
          },
          {
            name: "tree-view-tracking",
            category: "size",
            value: "normal",
            use: "A tree row's letter spacing: as set, unless a host draws its rows closer (a sidebar does).",
          },
          {
            name: "tree-view-bg-hover",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.035)",
            dark: "oklch(0.96 0.02 150 / 0.05)",
            use: "A tree's row under a pointer: a third of the current page's fill, so a row under the pointer is never taken for the current page, as the sidebar's hover is to its selected row.",
          },
          {
            name: "tree-view-bg-selected",
            category: "colors",
            value: "{data-grid-range-wash}",
            use: "A chosen row in a tree: the mint wash of a chosen row in a Table, so it is told from a row under a pointer.",
          },
          {
            name: "tree-view-bg-active",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.11)",
            dark: "oklch(0.96 0.02 150 / 0.15)",
            use: "The current page in a tree of pages: the pointer's fill, nearly twice as strong, under words a step heavier.",
          },
        ],
      },
    ],
  },
  {
    id: "link",
    title: "Link",
    sets: [
      {
        id: "link-parts",
        title: "Link",
        tokens: [
          {
            name: "link-underline",
            category: "colors",
            value: "oklch(0.267 0.048 169.88 / 0.3)",
            dark: "oklch(0.965 0.014 150 / 0.3)",
            use: "A link's underline at rest: ink at 30%, so the words stay the thing you read. Under the pointer it takes the words' own colour.",
          },
          {
            name: "link-underline-width",
            category: "size",
            value: "{hairline}",
            use: "How thick a link's underline is: the system's hairline.",
          },
          {
            name: "link-underline-offset",
            category: "size",
            value: "3px",
            use: "How far a link's underline sits under its words, clear of the descenders.",
          },
          {
            name: "link-mark",
            category: "size",
            value: "0.9em",
            use: "The external mark after a link's words: a step under the text, at any text size.",
          },
          {
            name: "link-mark-gap",
            category: "size",
            value: "0.2em",
            use: "The room between a link's last word and its external mark.",
          },
        ],
      },
    ],
  },
  {
    id: "page-header",
    title: "Page header",
    sets: [
      {
        id: "page-header-parts",
        title: "Page header",
        tokens: [
          {
            name: "page-title-wait",
            category: "size",
            value: "280px",
            use: "The width of a page title's placeholder while the page loads.",
          },
          {
            name: "page-header-dither-strength",
            category: "size",
            value: "0.3",
            use: "How strongly the dither shows behind an inspector's head: a texture you find, not a pattern you see.",
          },
        ],
      },
    ],
  },
  {
    id: "stepper",
    title: "Stepper",
    sets: [
      {
        id: "stepper-parts",
        title: "Stepper",
        tokens: [
          {
            name: "stepper-mark",
            category: "size",
            value: "{chip}",
            use: "The circle that marks a step in a stepper: a chip's height.",
          },
          {
            name: "stepper-pitch",
            category: "size",
            value: "56px",
            use: "How far apart a stepper's marks stand when it shows them alone (labelsHidden): calm, and each mark's 44px target clear of the next.",
          },
          {
            name: "stepper-line-gap",
            category: "space",
            value: "{space-1}",
            use: "How far a stepper's line stops short of each mark, so it never touches what it joins.",
          },
          {
            name: "stepper-dot",
            category: "size",
            value: "8px",
            use: "A step's dot in the light look, done or still to come: small, so the line and the names carry the row.",
          },
          {
            name: "stepper-dot-active",
            category: "size",
            value: "10px",
            use: "The current step's dot, and a failed step's square: a little larger than the rest.",
          },
          {
            name: "stepper-ring",
            category: "size",
            value: "1.5px",
            use: "The stroke of a step still to come, and of the one quiet ring round the current step: an icon's line.",
          },
          {
            name: "stepper-ring-gap",
            category: "size",
            value: "3px",
            use: "The room between the current step's dot and its ring.",
          },
          {
            name: "stepper-line",
            category: "size",
            value: "2px",
            use: "The weight of a stepper's line, the whole of it (the light look): the value colour where done, a quiet colour still to come.",
          },
          {
            name: "stepper-travel",
            category: "duration",
            value: "2400ms",
            use: "The working light once along the line to the next step: ambient and slow. Still with reduced motion.",
          },
          {
            name: "stepper-travel-across",
            category: "colors",
            value:
              "linear-gradient(90deg, transparent, {brand-sea} 30%, {brand-mint} 50%, {brand-sea} 70%, transparent)",
            use: "The short stretch of the working light that travels the line toward the next step, across: the brand's sea and mint.",
          },
          {
            name: "stepper-travel-down",
            category: "colors",
            value:
              "linear-gradient(180deg, transparent, {brand-sea} 30%, {brand-mint} 50%, {brand-sea} 70%, transparent)",
            use: "The same, running down.",
          },
        ],
      },
    ],
  },
  {
    id: "code-block",
    title: "Code block",
    sets: [
      {
        id: "code-block-parts",
        title: "Code block",
        tokens: [
          {
            name: "code-block-bg",
            category: "colors",
            value: "oklch(0.29 0.05 162 / 0.035)",
            dark: "oklch(0.96 0.02 150 / 0.04)",
            use: "The ground of a block of code: a wash over whatever it stands on (night in light, light in dark), so it reads as one step off the page, a card or the App shell's card alike; with the edge round it. Solid soft stood 1.01:1 on the shell's card in dark.",
          },
          {
            name: "code-block-head",
            category: "size",
            value: "36px",
            use: "The row over a block of code: its file name, its language and the copy button.",
          },
          {
            name: "code-block-line",
            category: "font",
            value: "{text-base-line}",
            use: "The height of a line of code: 1.5rem (24px at the usual size), so code has room to breathe.",
          },
          {
            name: "code-block-gutter",
            category: "colors",
            value: "{subtle-foreground}",
            use: "Line numbers: quieter than the code, never copied.",
          },
          {
            name: "code-block-marked",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.16)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.14)",
            use: "A marked line's fill: a wash of the light's mint, never the only mark (the gutter's bar says it too).",
          },
          {
            name: "code-block-marked-bar",
            category: "colors",
            value: "{brand-mint}",
            use: "The bar at a marked line's start.",
          },
          {
            name: "code-block-bar-width",
            category: "size",
            value: "2px",
            use: "How thick the bar at a marked line's start is.",
          },
          {
            name: "code-block-fade",
            category: "size",
            value: "48px",
            use: "How tall the fade is where folded code is cut.",
          },
          {
            name: "syntax-keyword",
            category: "colors",
            value: "{lavender}",
            use: "Keywords in code: import, return, const.",
          },
          {
            name: "syntax-string",
            category: "colors",
            value: "{mint-deep}",
            use: "Strings in code.",
          },
          {
            name: "syntax-constant",
            category: "colors",
            value: "{pine}",
            use: "Numbers, booleans and constants in code.",
          },
          {
            name: "syntax-comment",
            category: "colors",
            value: "{muted-foreground}",
            use: "Comments in code: quieter, never hidden.",
          },
          {
            name: "syntax-function",
            category: "colors",
            value: "{foreground}",
            use: "Functions, class names and tags in code.",
          },
          {
            name: "syntax-punctuation",
            category: "colors",
            value: "{muted-foreground}",
            use: "Punctuation and operators in code.",
          },
          {
            name: "syntax-attribute",
            category: "colors",
            value: "{info}",
            use: "Attribute and property names in code.",
          },
          {
            name: "syntax-inserted",
            category: "colors",
            value: "{success}",
            use: "Lines added, in a diff.",
          },
          {
            name: "syntax-deleted",
            category: "colors",
            value: "{destructive}",
            use: "Lines removed, in a diff.",
          },
        ],
      },
    ],
  },
  {
    id: "data-grid",
    title: "Data grid",
    sets: [
      {
        id: "data-grid-parts",
        title: "Data grid",
        tokens: [
          {
            name: "data-grid-row-height",
            category: "size",
            value: "36px",
            use: "A data grid's row: a step denser than a table's, as a spreadsheet.",
          },
          {
            name: "data-grid-head-height",
            category: "size",
            value: "40px",
            use: "A data grid's head row.",
          },
          {
            name: "data-grid-number-width",
            category: "size",
            value: "40px",
            use: "The column of row numbers at a data grid's start.",
          },
          {
            name: "data-grid-active-border",
            category: "colors",
            value: "{brand-pine}",
            dark: "{foreground}",
            use: "The hairline round the active cell: pine on a light ground, the ink on a dark one. Never the range's mint: in dark the two were one colour and the active cell was lost in its range.",
          },
          {
            name: "data-grid-active-halo",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.42)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.3)",
            use: "The soft mint shadow that fades out round the active cell, our focus language, never a hard box.",
          },
          {
            name: "data-grid-range-wash",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.14)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.18)",
            use: "The very soft mint wash over a selected range of cells.",
          },
          {
            name: "data-grid-range-dot",
            category: "colors",
            value: "oklch(0.4321 0.0778 175.187 / 0.28)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.28)",
            use: "The fine dots of a range drawn in dither, one of the looks on trial.",
          },
          {
            name: "data-grid-range-line",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.3)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.14)",
            use: "The hairlines between cells inside a selected range: mint and quiet, so the range reads as one block.",
          },
          {
            name: "data-grid-range-ring",
            category: "colors",
            value: "{brand-mint}",
            use: "The soft mint edge round a selected range, one of the looks on trial.",
          },
        ],
      },
    ],
  },
  {
    id: "side-panel",
    title: "Side panel",
    sets: [
      {
        id: "side-panel-parts",
        title: "Side panel",
        tokens: [
          {
            name: "side-panel-width",
            category: "size",
            value: "420px",
            use: "The width of an inspector panel beside a page.",
          },
          {
            name: "side-panel-bar",
            category: "size",
            value: "48px",
            use: "The height of an inspector's top bar: its actions, and its views once the head has scrolled away.",
          },
          {
            name: "side-panel-pad",
            category: "space",
            value: "{space-6}",
            use: "The room round an inspector's content: one left edge for its tile, its title and its cards.",
          },
          {
            name: "side-panel-head",
            category: "size",
            value: "128px",
            use: "How tall a page's head stands to its line, beside the page's own panel: a page band and the panel's head (its bar, its title) both, so their two foot lines are one line (the bar's 48px and space-20).",
          },
          {
            name: "side-panel-pad-end",
            category: "space",
            value: "{space-20}",
            use: "The room under an inspector's last section, so it never ends on the window's edge.",
          },
          {
            name: "side-panel-gap",
            category: "space",
            value: "{space-6}",
            use: "Between the sections of an inspector, and between its head and its first section.",
          },
          {
            name: "side-panel-label-gap",
            category: "space",
            value: "{space-3}",
            use: "Between a section's label row and its card.",
          },
          {
            name: "side-panel-padding",
            category: "space",
            value: "{space-3}",
            use: "How far a label and a row's words sit in from the card's edge: one line for both.",
          },
          {
            name: "side-panel-text",
            category: "size",
            value: "0.8125rem",
            use: "A row's name, a label and a view: a step under text-sm.",
          },
          {
            name: "side-panel-text-line",
            category: "size",
            value: "1.125rem",
            use: "The line height of side-panel-text.",
          },
          {
            name: "side-panel-dash-offset",
            category: "size",
            value: "3px",
            use: "How far a label's dashed underline sits under its words: it says the label explains itself on hover.",
          },
          {
            name: "side-panel-long",
            category: "size",
            value: "300px",
            use: "How tall a long text card stands before its words fade and it offers to open in full.",
          },
          {
            name: "side-panel-long-fade",
            category: "size",
            value: "64px",
            use: "How tall the fade is at the foot of a long text card.",
          },
          {
            name: "side-panel-dot",
            category: "size",
            value: "2px",
            use: "The small dot between the parts of an inspector's line of who and when.",
          },
          {
            name: "side-panel-seated",
            category: "colors",
            value: "{sidebar-card}",
            use: "The bar's and the views strip's ground when the panel is seated beside a Sidebar's page card: that card's own.",
          },
        ],
      },
    ],
  },
  {
    id: "icon-tile",
    title: "Icon tile",
    sets: [
      {
        id: "icon-tile-parts",
        title: "Icon tile",
        tokens: [
          {
            name: "icon-tile-foreground",
            category: "colors",
            value: "{mint-deep}",
            use: "The one accent: the small icons that say what kind of thing a row is. Everything else stays neutral.",
          },
          {
            name: "icon-tile",
            category: "size",
            value: "40px",
            use: "The tile that holds an object's own icon, at the head of its inspector.",
          },
          {
            name: "icon-tile-icon",
            category: "size",
            value: "24px",
            use: "The icon inside an object's tile.",
          },
          {
            name: "icon-tile-sm",
            category: "size",
            value: "{avatar-xs}",
            use: "The small tile, for an object in a dense table row: as tall as a person's picture there.",
          },
          {
            name: "icon-tile-sm-icon",
            category: "size",
            value: "14px",
            use: "The icon inside the small tile.",
          },
          {
            name: "icon-tile-tint",
            category: "colors",
            value: "oklch(0.8005 0.1625 165.25 / 0.14)",
            dark: "oklch(0.8005 0.1625 165.25 / 0.16)",
            use: "The quiet tile: a wash of the light's mint behind the icon.",
          },
        ],
      },
    ],
  },
  {
    id: "sources",
    title: "Sources",
    sets: [
      {
        id: "sources-parts",
        title: "Sources",
        tokens: [
          {
            name: "sources-mark-inline",
            category: "size",
            value: "14px",
            use: "A source's mark inside a named chip in running text.",
          },
          {
            name: "sources-pile-mark",
            category: "size",
            value: "26px",
            use: "One mark in the pile under an answer.",
          },
          {
            name: "sources-pile-overlap",
            category: "size",
            value: "6px",
            use: "How far each mark in the pile slides under the one before it: no further than the room round its icon, so every icon shows whole.",
          },
        ],
      },
    ],
  },
];

/**
 * The pairs people will use, measured in both schemes and shown on the Colour page. A `text` pair
 * must hold 4.5:1, a `large` or `ui` pair 3:1, in light and in dark, or `node tokens/generate.ts --check`
 * fails.
 */
export const contrastPairs: ContrastPair[] = [
  ...[
    "foreground",
    "body-foreground",
    "muted-foreground",
    "subtle-foreground",
  ].flatMap((text) =>
    ["background", "muted", "card"].map((on): ContrastPair => ({
      kind: "text",
      on,
      text,
    }))
  ),
  ...["mint-deep", "pine", "lavender"].map((text): ContrastPair => ({
    kind: "text",
    on: "background",
    text,
  })),
  ...["background", "card", "muted"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "ring",
  })),
  ...["success", "warning", "destructive", "info"].flatMap((text) => [
    { kind: "text", on: "background", text } satisfies ContrastPair,
    { kind: "text", on: `${text}-subtle`, text } satisfies ContrastPair,
  ]),
  { kind: "text", on: "success-subtle", text: "mint-deep" },
  // What is done on a bar against what is not, on every ground.
  { kind: "ui", on: "progress-track", text: "progress-bg" },
  // A severity's dot against the grounds it stands on.
  ...["destructive", "warning"].flatMap((text) =>
    ["background", "muted", "card"].map((on): ContrastPair => ({
      kind: "ui",
      on,
      text,
    }))
  ),
  // An alert's icons on their tints: the neutral one in muted, the others in their own colour.
  { kind: "ui", on: "alert-bg-default", text: "muted-foreground" },
  { kind: "text", on: "mint", text: "brand-ink" },
  // The words on each filled button, the labels the Button page's proof row reads.
  { kind: "text", on: "primary", text: "primary-foreground" },
  { kind: "text", on: "secondary", text: "foreground" },
  { kind: "text", on: "button-secondary", text: "foreground" },
  { kind: "text", on: "button-secondary-active", text: "foreground" },
  { kind: "text", on: "destructive-fill", text: "destructive-fill-foreground" },
  { kind: "text", on: "success-fill", text: "success-fill-foreground" },
  // A pressed button's words.
  { kind: "text", on: "primary-active", text: "primary-foreground" },
  {
    kind: "text",
    on: "destructive-fill-active",
    text: "destructive-fill-foreground",
  },
  // A field: its hairline on every ground, its value and placeholder on its fill.
  ...["foreground", "muted-foreground"].map((text): ContrastPair => ({
    kind: "text",
    on: "input-bg",
    text,
  })),
  ...["foreground", "muted-foreground"].map((text): ContrastPair => ({
    kind: "text",
    on: "input-bg-read",
    text,
  })),
  // Selected words in a field.
  { kind: "text", on: "input-selection", text: "foreground" },
  // The focus ring round a field focused by the keyboard: against the field's own fill as well as the grounds.
  { kind: "ui", on: "input-bg", text: "ring" },
  // A ring on action-fill, round a link in a filled bubble.
  { kind: "ui", on: "primary", text: "ring-on-color" },
  ...["background", "muted", "card", "input-bg"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "input-border-focus",
  })),
  // A field's error in words on the other grounds (on paper it is a status pair above).
  ...["muted", "card"].map((on): ContrastPair => ({
    kind: "text",
    on,
    text: "destructive",
  })),
  // A checked box against the ground it stands on, and its tick on its fill.
  ...["background", "muted", "card"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "primary",
  })),
  { kind: "ui", on: "primary", text: "primary-foreground" },
  { kind: "ui", on: "checkbox-bg-hover", text: "primary-foreground" },
  // An item in a popup: its words on the popup, and on the highlight.
  { kind: "text", on: "popover", text: "foreground" },
  { kind: "text", on: "accent-highlight", text: "foreground" },
  { kind: "text", on: "popover", text: "muted-foreground" },
  { kind: "text", on: "popover", text: "body-foreground" },
  // The chosen tab's line on every ground.
  ...["background", "muted", "card"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "tab-line",
  })),
  { kind: "text", on: "tab-bg-selected", text: "foreground" },
  // An alert's title and words on its tint.
  ...[
    "alert-bg-default",
    "success-subtle",
    "warning-subtle",
    "destructive-subtle",
  ].flatMap((on) =>
    ["foreground", "body-foreground"].map((text): ContrastPair => ({
      kind: "text",
      on,
      text,
    }))
  ),
  // A calendar's day: its number on the chosen fill, inside a range, and on today.
  { kind: "text", on: "calendar-bg-selected", text: "calendar-text-selected" },
  { kind: "text", on: "calendar-bg-range", text: "foreground" },
  { kind: "text", on: "calendar-bg-today", text: "foreground" },
  // A tree's chosen row: its words on the fill.
  { kind: "text", on: "tree-view-bg-selected", text: "foreground" },
  { kind: "text", on: "tree-view-bg-active", text: "foreground" },
  // Code on its block's ground, in every colour of its highlighting, and on a marked line.
  ...[
    "body-foreground",
    "syntax-keyword",
    "syntax-string",
    "syntax-constant",
    "syntax-comment",
    "syntax-attribute",
    "syntax-inserted",
    "syntax-deleted",
  ].map((text): ContrastPair => ({
    kind: "text",
    on: "code-block-bg",
    text,
  })),
  { kind: "text", on: "code-block-marked", text: "body-foreground" },
  // A tooltip's words on its fill.
  { kind: "text", on: "tooltip", text: "tooltip-foreground" },
  // A sidebar's rows on its ground, and the current row's words on its fill.
  ...["foreground", "muted-foreground"].map((text): ContrastPair => ({
    kind: "text",
    on: "sidebar",
    text,
  })),
  { kind: "text", on: "sidebar-accent", text: "foreground" },
  { kind: "text", on: "sidebar-accent", text: "muted-foreground" },
  // The sidebar's own words on its ground and on the page card beside it: the current row's, and
  // the rows' and the group labels' (sidebar-text-secondary).
  ...["sidebar", "sidebar-card"].map((on): ContrastPair => ({
    kind: "text",
    on,
    text: "sidebar-text",
  })),
  ...["sidebar", "sidebar-card"].map((on): ContrastPair => ({
    kind: "text",
    on,
    text: "sidebar-text-secondary",
  })),
  // A confirmation's "Cannot be undone", on the card and on its list of what it touches.
  ...["card", "muted"].map((on): ContrastPair => ({
    kind: "text",
    on,
    text: "warning",
  })),
  // A diff's lines: words on the added and removed grounds and on the changed words, the line
  // numbers on the grounds, and the marks at a line's start.
  ...[
    "diff-viewer-added-bg",
    "diff-viewer-removed-bg",
    "diff-viewer-added-word",
    "diff-viewer-removed-word",
    "diff-viewer-fold-bg",
  ].map((on): ContrastPair => ({ kind: "text", on, text: "foreground" })),
  ...[
    "diff-viewer-added-bg",
    "diff-viewer-removed-bg",
    "diff-viewer-fold-bg",
  ].map((on): ContrastPair => ({ kind: "text", on, text: "muted-foreground" })),
  { kind: "ui", on: "diff-viewer-added-bg", text: "success" },
  { kind: "ui", on: "diff-viewer-removed-bg", text: "destructive" },
  // A carousel's page marks on every ground.
  ...["background", "muted", "card"].flatMap((on) =>
    ["carousel-dot-bg", "carousel-dot-bg-active"].map((text): ContrastPair => ({
      kind: "ui",
      on,
      text,
    }))
  ),
  // A danger item's words in a menu, at rest and highlighted.
  ...["popover", "accent-highlight"].map((on): ContrastPair => ({
    kind: "text",
    on,
    text: "destructive",
  })),
  // A menu item's shortcut keys on the highlight.
  { kind: "text", on: "accent-highlight", text: "muted-foreground" },
  // A highlight's change on its card, in each tone.
  ...["success", "warning", "destructive", "info"].map(
    (text): ContrastPair => ({
      kind: "text",
      on: "card",
      text,
    })
  ),
  // A ring's tones against every ground: each part is a mark of its own.
  ...["chart-2", "chart-3", "chart-4", "chart-5"].flatMap((text) =>
    ["background", "muted", "card"].map((on): ContrastPair => ({
      kind: "ui",
      on,
      text,
    }))
  ),
  // A chart's value line and bar cap against every ground.
  ...["background", "muted", "card"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "chart-1",
  })),
  // An icon tile's icon in the one accent, on a card and on its tint.
  ...["card", "background", "icon-tile-tint"].map((on): ContrastPair => ({
    kind: "ui",
    on,
    text: "icon-tile-foreground",
  })),
];
