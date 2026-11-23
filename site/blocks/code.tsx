import {
  CheckIcon,
  CircleAlertIcon,
  CopyIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { focusRing, focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// A block of code: one solid ground (soft) in the one corner, no ring, Geist Mono 14/20, line
// numbers in a quiet gutter at the left, and a 24px copy button at the top right. The box is as
// tall as its code. Longer than a stage is tall (400px), it is cut with a fade and a "Show all"
// pill opens it, so a long file never pushes the page about until someone asks. Lines too wide
// scroll sideways inside the box, never the page; the box takes keyboard focus for that. Used for
// code in a page (MDX's fenced code, through Pre.astro) and for a stage's Code view.
//
// The highlighting is Shiki's (with the themes in site/system/highlight.ts). The line numbers
// are CSS counters on Shiki's lines (site/system/styles/blocks.css):
// drawn, not text, so they are never selected or copied.
import * as stylex from "@stylexjs/stylex";

import { siteSize } from "../system/site-tokens.stylex";
import { actionMarker, codeMarker } from "./markers.stylex";
import { partStyles } from "./parts";

/** Lines that fit in a 400px box with its padding (12 + 18 * 20 + 12); more and it is cut. */
export const VISIBLE_LINES = 18;

const NO_SCRIPT = "@media (scripting: none)";
const done = '[data-action-state="done"]';
const failed = '[data-action-state="failed"]';
const result = ':is([data-action-state="done"], [data-action-state="failed"])';

const styles = stylex.create({
  box: {
    position: "relative",
    display: "grid",
    minWidth: 0,
    backgroundColor: colors.muted,
    borderRadius: radius.base,
    cornerShape: radius.shape,
    overflow: "hidden",
    marginTop: space["6"],
    marginBottom: space["6"],
  },
  // In a stage: no margins of its own; as tall as its code.
  inStage: {
    marginTop: 0,
    marginBottom: 0,
  },
  scroller: {
    minWidth: 0,
    overflowX: "auto",
    overflowY: "hidden",
    padding: space["3"],
    // The copy button stands at the top right, on the box's own ground beside the code: the code
    // ends before it and scrolls in its own room, so a long line never shows under the button or
    // on both sides of it.
    marginInlineEnd: space["10"],
    paddingInlineEnd: space["2"],
    fontFamily: font.mono,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.bodyForeground,
    whiteSpace: "pre",
    tabSize: 2,
    borderRadius: "inherit",
    // No bar (CONTRIBUTING.md): it scrolls sideways by wheel, touch and keys, and an edge fades
    // while there is more beyond it (site/behaviour/code-edges.ts marks which; site.css draws it).
    scrollbarWidth: "none",
    maskImage: "var(--site-code-edge, none)",
  },
  // Cut at the stage's height, faded at the foot. Opened by "Show all"; never cut without script.
  cut: {
    maxHeight: {
      default: siteSize.stageMin,
      [stylex.when.ancestor("[data-expanded]", codeMarker)]: "none",
      [NO_SCRIPT]: "none",
    },
    // The foot's fade, and the sideways one while there is more (both must show: intersect).
    maskImage: {
      default:
        "var(--site-code-edge, linear-gradient(black, black)), linear-gradient(to bottom, black calc(100% - 96px), transparent)",
      [stylex.when.ancestor("[data-expanded]", codeMarker)]:
        "var(--site-code-edge, none)",
      [NO_SCRIPT]: "none",
    },
    maskComposite: "intersect",
    paddingBottom: {
      default: space["16"],
      [stylex.when.ancestor("[data-expanded]", codeMarker)]: space["16"],
      [NO_SCRIPT]: space["3"],
    },
  },
  // The copy button: 24px, an icon only, centred on the first line.
  copy: {
    position: "absolute",
    zIndex: 1,
    top: `calc(${space["3"]} + (${font.textSmLine} - ${size.chip}) / 2)`,
    insetInlineEnd: space["2"],
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box",
    width: size.chip,
    height: size.chip,
    margin: 0,
    padding: 0,
    [iconVars.size]: size.iconSm,
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [media.hover]: colors.foreground },
      [stylex.when.ancestor(done, actionMarker)]: colors.mintDeep,
      [stylex.when.ancestor(failed, actionMarker)]: colors.destructive,
    },
    // On the code's ground, so a long first line scrolled under it does not show through; the
    // hover and press fills are laid over it.
    backgroundColor: colors.muted,
    backgroundImage: {
      default: "none",
      ":hover": {
        default: null,
        [media.hover]: `linear-gradient(${colors.accent}, ${colors.accent})`,
      },
      ":active": `linear-gradient(${colors.accentActive}, ${colors.accentActive})`,
    },
    borderWidth: 0,
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    cursor: "copy",
    WebkitTapHighlightColor: "transparent",
    transform: { default: null, ":active": `scale(${size.buttonPressScale})` },
    transitionProperty: "background-image, color, transform",
    transitionDuration: `${duration.hover}, ${duration.hover}, ${duration.press}`,
    transitionTimingFunction: duration.ease,
    pointerEvents: {
      default: null,
      [stylex.when.ancestor(result, actionMarker)]: "none",
    },
    // A finger needs 44px; the button stays 24px to the eye.
    "::before": {
      content: '""',
      position: "absolute",
      inset: {
        default: 0,
        [media.pointerCoarse]: `calc((${size.chip} - ${size.tapTarget}) / 2)`,
      },
    },
  },
  // "Copied" or "Could not copy", in place: beside the button, on the code's own ground.
  said: {
    position: "absolute",
    insetInlineEnd: "100%",
    top: "50%",
    paddingInline: space["2"],
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    whiteSpace: "nowrap",
    backgroundColor: colors.muted,
    pointerEvents: "none",
    opacity: { default: 0, [stylex.when.ancestor(result, actionMarker)]: 1 },
    transform: {
      default: `translateY(-50%) translateX(${space["1"]})`,
      [stylex.when.ancestor(result, actionMarker)]: "translateY(-50%)",
      [media.reducedMotion]: "translateY(-50%)",
    },
    transitionProperty: "opacity, transform",
    transitionDuration: duration.swap,
    transitionTimingFunction: duration.ease,
  },
  whenDone: {
    display: {
      default: "none",
      [stylex.when.ancestor(done, actionMarker)]: "inline",
    },
  },
  whenFailed: {
    display: {
      default: "none",
      [stylex.when.ancestor(failed, actionMarker)]: "inline",
    },
  },
  more: {
    position: "absolute",
    zIndex: 1,
    insetInline: 0,
    bottom: space["4"],
    display: { default: "flex", [NO_SCRIPT]: "none" },
    justifyContent: "center",
    pointerEvents: "none",
  },
  moreButton: {
    pointerEvents: "auto",
    cursor: "pointer",
    fontFamily: font.sans,
    fontWeight: font.weightMedium,
    color: colors.foreground,
    backgroundColor: {
      default: colors.card,
      ":hover": { default: null, [media.hover]: colors.background },
    },
    transform: { default: null, ":active": `scale(${size.buttonPressScale})` },
    transitionProperty: "background-color, transform",
    transitionDuration: `${duration.hover}, ${duration.press}`,
    transitionTimingFunction: duration.ease,
    "::before": {
      content: '""',
      position: "absolute",
      insetInline: 0,
      insetBlock: {
        default: 0,
        [media.pointerCoarse]: `calc((${size.chip} - ${size.tapTarget}) / 2)`,
      },
    },
  },
  whenOpen: {
    display: {
      default: "none",
      [stylex.when.ancestor("[data-expanded]", codeMarker)]: "inline",
    },
  },
  whenCut: {
    display: {
      default: "inline",
      [stylex.when.ancestor("[data-expanded]", codeMarker)]: "none",
    },
  },
});

export interface CodeBlockProps {
  /** Shiki's highlighted lines: the inside of its <code>. */
  html: string;
  /** The language, for the box's name ("tsx"). */
  language?: string;
  /** Inside a stage: no margins of its own. */
  inStage?: boolean;
  /** What a screen reader hears after copying. */
  said?: string;
}

export function CodeBlock({
  html: highlighted,
  language,
  inStage = false,
  said = "Copied the code",
}: CodeBlockProps) {
  // A file's last newline gives Shiki an empty last line: not a line of code, so not numbered.
  const html = highlighted.replace(/\n?<span class="line"><\/span>\s*$/u, "");
  const lines = (html.match(/class="line"/gu) ?? []).length;
  const cut = lines > VISIBLE_LINES;
  const box = stylex.props(codeMarker, styles.box, inStage && styles.inStage);
  const scroller = stylex.props(
    styles.scroller,
    cut && styles.cut,
    focusRingInset
  );
  return (
    <div
      {...box}
      className={`not-prose site-codeblock ${box.className ?? ""}`}
      data-copy-scope=""
      data-code-block=""
    >
      <button
        type="button"
        data-copy-from="[data-code-source]"
        data-copy-said={said}
        aria-label="Copy the code"
        {...stylex.props(actionMarker, styles.copy, focusRing)}
      >
        <span {...stylex.props(partStyles.rest, partStyles.beside)}>
          <Icon icon={CopyIcon} />
        </span>
        <span {...stylex.props(partStyles.tick, partStyles.beside)}>
          <Icon icon={CheckIcon} />
        </span>
        <span {...stylex.props(partStyles.failedMark, partStyles.beside)}>
          <Icon icon={CircleAlertIcon} />
        </span>
        <span aria-hidden="true" {...stylex.props(styles.said)}>
          <span {...stylex.props(styles.whenDone)}>Copied</span>
          <span {...stylex.props(styles.whenFailed)}>Could not copy</span>
        </span>
      </button>
      {/* biome-ignore lint: a scrolling region takes focus so a keyboard can scroll it. */}
      <div
        role="region"
        data-code-scroll=""
        aria-label={language ? `Code, ${language}` : "Code"}
        tabIndex={0}
        {...scroller}
        className={`site-code-scroll ${scroller.className ?? ""}`}
      >
        <code data-code-source="" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {cut && (
        <div {...stylex.props(styles.more)}>
          <button
            type="button"
            data-code-expand=""
            aria-expanded="false"
            {...stylex.props(partStyles.chip, styles.moreButton, focusRing)}
          >
            <span {...stylex.props(styles.whenCut)}>
              Show all {lines} lines
            </span>
            <span {...stylex.props(styles.whenOpen)}>Show less</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** The inside of Shiki's <code> in a highlighted block (its <pre><code>…</code></pre>). */
export const innerCode = (highlighted: string) =>
  /<code[^>]*>([\s\S]*)<\/code>\s*<\/pre>/u.exec(highlighted)?.[1] ??
  highlighted;
