// Button: one action to press, in Tailwind, in the
// brand's Bevel finish with the one corner. Its behaviour is UI SDK's Button, so an agent on the page
// finds it by its name and presses it; a destructive one waits for the person's yes first.
//
//   <Button>Save changes</Button>
//   <Button variant="outline"><Icon icon={PlusIcon} />Invite people</Button>
//   <Button variant="ghost" size="icon-sm" aria-label="More actions"><Icon icon={DotsIcon} /></Button>
//   <Button asChild><a href="/settings">Settings</a></Button>
//   <Button onClick={saveChanges}>Save changes</Button>          saveChanges returns a Promise
//   <Button onClick={sendInvite} successLabel="Sent" errorLabel="Not sent">Send invite</Button>
//
// A press whose `onClick` returns a Promise is followed by the Button itself (hooks/use-action):
// while it works the button is busy, takes no second press and shows a spinner; once it settles, a
// tick or the alert for a moment, then it rests. While it works the spinner takes the place of its
// icon and the words stay; with no icon the mark stands over the words, which keep their place
// unseen (and their name for a screen reader), so the button never changes width. Words for a
// state (`loadingLabel`, `successLabel`, `errorLabel`) are said, and shown in the words' place, every
// one stacked in the same cell so the widest sets the width. Failed, it draws the quiet fill with
// destructive words and edge, whatever its variant. A page that runs the work elsewhere (a form's
// submit) gives `status` instead.
//
// `tooltip` gives it a Tooltip of its own, as SidebarMenuButton's: an icon-only button shows its
// name (`aria-label`) by default, `tooltip={false}` shows none, and words show those. Inside a
// Tooltip of the caller's it shows none.
//
// Drawn by another UI SDK part (`<DialogTrigger asChild><Button /></DialogTrigger>`), it takes that
// part's props and is only its face: one element is never two UI SDK buttons, which an agent would
// see twice. A caller may set layout only, by `className`; its look belongs to `variant` and
// `size`. A part that holds a ghost button may set `--damsko-ghost-*` (Snippet does).
"use client";

import { Button as ButtonPrimitive } from "@ui-sdk/react/button";
import { mergeProps } from "@ui-sdk/react/primitive";
import { cva } from "class-variance-authority";
import { isValidElement } from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { useAction } from "../hooks/use-action";
import type { ActionResult, ActionStatus } from "../hooks/use-action";
import { CheckIcon, CircleAlertIcon, Icon } from "../lib-tw/icons";
import {
  cn,
  isIconSize,
  isInvalid,
  isThenable,
  listOf,
  textOf,
} from "../lib-tw/utils";
import "../lib-tw/styles";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";
import { Spinner } from "./spinner";
import { ControlTooltip } from "./tooltip";

export type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";
export type ButtonSize =
  | "xs"
  | "sm"
  | "default"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";
type IconSize = "icon" | "icon-xs" | "icon-sm" | "icon-lg";

// Every prop is documented once, where it is first declared; the props on the docs page are read
// from ButtonProps, the union below, so they cannot drift from what the code accepts.

/** What every button takes: these, and the rest of UI SDK's Button and a <button>. */
interface ButtonBase extends Omit<
  ComponentProps<typeof ButtonPrimitive>,
  "className" | "style" | "render" | "children" | "onClick"
> {
  /**
   * The weight of the action: `default` for the one main step of a view, `outline` for the
   * ordinary button anywhere (the lesser one beside it, a standalone action or trigger),
   * `secondary` for a flat one repeated or dense (the same action on every row; never a filter or
   * an on/off control, which is a Toggle), `ghost` for
   * toolbars, rows and icon buttons, `destructive` for what cannot be undone, `link` for an action
   * that reads as words.
   * @default "default"
   */
  variant?: ButtonVariant;
  /**
   * Draw the one element given as the child (`<a href>`, a router's link) in its place, with the
   * button's look and behaviour. It keeps its own role: a link stays a link.
   * @default false
   */
  asChild?: boolean;
  /**
   * What the button does, said to the person when an agent asks to press it ("Deletes the
   * workspace and its files"). The agent's press waits for their yes. A `destructive` button always
   * asks: in its own words unless this says it better.
   */
  agentConfirm?: string;
  /**
   * Keeps it in the tab order while it cannot be pressed, so it holds focus and a tooltip that says
   * why. Pass it while it is loading, so focus stays on it.
   * @default false
   */
  focusableWhenDisabled?: boolean;
  /**
   * Out of use: no press, no hover, half strength. Say why near it.
   * @default false
   */
  disabled?: boolean;
  /**
   * Runs when it is pressed. Return a Promise and the Button follows it: busy, with a spinner and
   * no second press, until it settles; then a tick or the alert for a moment, said once to a screen
   * reader, and back to rest. A failure is caught and said, never thrown to the page.
   */
  onClick?: ComponentProps<typeof ButtonPrimitive>["onClick"];
  /** Said while its press works, and shown in place of its words ("Saving"). */
  loadingLabel?: string;
  /** Said once its press worked, and shown in place of its words for a moment ("Saved"). */
  successLabel?: string;
  /** Said when its press failed, and shown in place of its words for a moment ("Not saved"). */
  errorLabel?: string;
  /**
   * Where its work is, when the page runs it (a form's submit): the Button shows it and leaves
   * `onClick` alone. Whoever runs the work says how it went.
   */
  status?: ActionStatus;
  /**
   * Squeezed, the words stay on one line and end in an ellipsis instead of wrapping, and the button
   * may shrink to its square. They stay its name whole; give `tooltip` to show them whole to the
   * pointer. For a name in a narrow head, where a second line would push the next control off. An
   * icon-only button has no words to cut.
   * @default false
   */
  truncate?: boolean;
  /**
   * Its tooltip, under a resting pointer and on keyboard focus. Left out, a control that is only an
   * icon shows its `aria-label`; `false` shows none; words or a node show those in its place, on a
   * control with words too. Inside a Tooltip of your own it shows none.
   */
  tooltip?: ReactNode;
  /** Layout only: where it sits and how much room it takes. Its look belongs to `variant` and `size`. */
  className?: LayoutClass;
}

/**
 * A button with words, and an icon before or after them if it helps.
 * @when with words
 */
interface WithWords extends ButtonBase {
  /**
   * The height: `xs` 28px, `sm` 32px, `default` 36px, `lg` 44px; an icon-only button is a square of
   * the same heights, `icon-xs`, `icon-sm`, `icon` and `icon-lg`. On a touch screen every size has
   * a 44px target.
   * @default "default"
   */
  size?: Exclude<ButtonSize, IconSize>;
  /**
   * The words, a verb first in sentence case ("Save changes"), with an `<Icon />` before or after
   * them. Icon only: the `<Icon />`.
   */
  children: ReactNode;
}

/**
 * A button that is only an icon: square, named by `aria-label`.
 * @when icon only
 */
interface IconOnly extends ButtonBase {
  size: IconSize;
  /**
   * Its name, for a screen reader, a voice command and an agent ("More actions"). It shows in a
   * tooltip under a resting pointer and on keyboard focus.
   */
  "aria-label": string;
  children: ReactNode;
}

export type ButtonProps = WithWords | IconOnly;

// ---- The look ------------------------------------------------------------------------------------
//
// `hover:` is Damsko's (styles-tw/damsko.css): only where a fine pointer can hover, so a tap never
// leaves a button lit. The press is plain `active:`, which Tailwind orders after hover, so it wins.

// Inside a Button group the corners below count only the group's own items, never a layer a
// trigger in it draws inline (a Dropdown menu's list, while open): written out in full in each
// class, because Tailwind reads classes from the source and cannot see one built from a constant.
export const buttonVariants = cva(
  [
    // The icon inside follows these: Icon reads --damsko-icon-size and --damsko-icon-stroke-width.
    "group/button icon-sm relative isolate m-0 box-border inline-flex max-w-full shrink-0 items-center justify-center gap-2",
    // No border: the edge is the bevel's shadows, which add no size. Forced colours drop shadows,
    // so a real one appears there, in the system's button text colour.
    "corner-squircle border-0 border-solid border-current forced-colors:border forced-colors:border-[ButtonText]",
    "tracking-ui hyphenate text-center font-sans text-sm font-medium no-underline",
    // A long label wraps between words, balanced, and breaks only a word longer than its column.
    "tap-highlight-none cursor-pointer touch-manipulation wrap-anywhere whitespace-normal select-none [text-wrap-style:balance]",
    // With reduced motion the press still shows, at once, without travelling.
    "ease-ui transition-[transform,background-color,box-shadow,color] duration-[var(--damsko-motion-press),var(--damsko-duration-hover),var(--damsko-duration-hover),var(--damsko-duration-hover)]",
    // Inside a Button group: square between buttons, and at the group's ends its corner, so a
    // pressed fill sits inside the group's shape. Logical corners, so right to left holds too.
    "[[data-slot=button-group]>&]:rounded-none",
    `[[data-slot=button-group]>&:nth-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-ss-[inherit]`,
    `[[data-slot=button-group]>&:nth-last-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-ee-[inherit]`,
    `[[data-slot=button-group]:not([aria-orientation=vertical])>&:nth-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-es-[inherit] [[data-slot=button-group][aria-orientation=vertical]>&:nth-last-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-es-[inherit]`,
    `[[data-slot=button-group]:not([aria-orientation=vertical])>&:nth-last-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-se-[inherit] [[data-slot=button-group][aria-orientation=vertical]>&:nth-child(1_of_:not([data-slot$="-content"],[data-slot$="-positioner"],[data-slot$="-backdrop"],[role=menu],[role=dialog],[role=listbox],[role=tooltip]))]:rounded-se-[inherit]`,
    "focus-ring",
  ],
  {
    variants: {
      variant: {
        default: "text-primary-foreground bg-primary shadow-bevel-ink",
        // A flat veil of ink, no edge and no lift: quieter than outline, firmer than ghost.
        secondary: "text-foreground bg-secondary shadow-none",
        destructive:
          "text-destructive-fill-foreground bg-destructive-fill shadow-bevel-destructive",
        // The ordinary button: the quiet fill, a field's edge and its lift.
        outline: "text-foreground bg-control shadow-bevel-muted",
        // Its ink, its fills and its ring's colour are the --damsko-ghost-* variables, which the
        // part that holds it may set. Held on (aria-pressed), the press's fill stays.
        ghost:
          "focus-key:not-forced-colors:outline-(color:--damsko-ghost-ring) bg-transparent text-(color:--damsko-ghost-ink) shadow-none outline-(color:--damsko-ghost-ring) aria-pressed:bg-(color:--damsko-ghost-active)",
        // Words that act: underlined under a pointer, with no fill or edge.
        link: "text-foreground decoration-link-underline bg-transparent decoration-(length:--damsko-link-underline-width) underline-offset-(--damsko-link-underline-offset) shadow-none",
      },
      // Height comes from the line plus padding, so a wrapped label makes the button taller and
      // never spills out. The corner is the one corner, capped at half the height.
      size: {
        xs: "min-h-control-xs min-w-control-xs rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-xs)/2))] px-2 py-[calc((var(--damsko-control-xs)-var(--damsko-text-sm-line))/2)]",
        sm: "min-h-control-sm min-w-control-sm rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-sm)/2))] px-3 py-[calc((var(--damsko-control-sm)-var(--damsko-text-sm-line))/2)]",
        default:
          "min-h-control-default min-w-control-default rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-default)/2))] px-3 py-[calc((var(--damsko-control-default)-var(--damsko-text-sm-line))/2)]",
        // The large size's icon is the default one, with words or without.
        lg: "icon-default min-h-control-lg min-w-control-lg rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-lg)/2))] px-4 py-[calc((var(--damsko-control-lg)-var(--damsko-text-sm-line))/2)]",
        "icon-xs":
          "min-h-control-xs w-control-xs rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-xs)/2))] px-0 py-[calc((var(--damsko-control-xs)-var(--damsko-text-sm-line))/2)]",
        "icon-sm":
          "min-h-control-sm w-control-sm rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-sm)/2))] px-0 py-[calc((var(--damsko-control-sm)-var(--damsko-text-sm-line))/2)]",
        icon: "min-h-control-default w-control-default rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-default)/2))] px-0 py-[calc((var(--damsko-control-default)-var(--damsko-text-sm-line))/2)]",
        "icon-lg":
          "icon-default min-h-control-lg w-control-lg rounded-[min(var(--damsko-radius-xl),calc(var(--damsko-control-lg)/2))] px-0 py-[calc((var(--damsko-control-lg)-var(--damsko-text-sm-line))/2)]",
      },
      // Pressable: its hover and press. Left out while it cannot be pressed.
      live: {
        true: "active:[transform:scale(var(--damsko-button-press-scale))]",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        live: true,
        // Under a pointer the fill lightens a step as the bevel brightens; in dark it goes to white.
        className:
          "hover:shadow-bevel-ink-hover active:shadow-bevel-ink-press active:bg-primary-active hover:bg-[light-dark(oklch(from_var(--damsko-primary)_calc(l_+_0.08)_c_h),var(--damsko-primary-hover))]",
      },
      {
        variant: "secondary",
        live: true,
        className: "hover:bg-secondary-hover active:bg-secondary-active",
      },
      {
        variant: "destructive",
        live: true,
        className:
          "hover:shadow-bevel-destructive-hover active:shadow-bevel-destructive-press active:bg-destructive-fill-active hover:bg-[oklch(from_var(--damsko-destructive-fill)_calc(l_+_0.06)_c_h)]",
      },
      {
        variant: "outline",
        live: true,
        className: "hover:bg-control-hover active:bg-control-active",
      },
      {
        variant: "ghost",
        live: true,
        className:
          "hover:bg-(color:--damsko-ghost-hover) active:bg-(color:--damsko-ghost-active) hover:aria-pressed:bg-(color:--damsko-ghost-active)",
      },
      { variant: "link", live: true, className: "hover:underline" },
      // In a layer's footer on a phone, every Button takes an equal part of the line, each at least
      // as wide as its words. It may give way in a row that is short of room, whatever the page's
      // reset says: after the size, so it wins over the size's least width, as in the StyleX file.
      {
        className:
          "min-w-0 in-data-layer-footer:max-sm:min-w-fit in-data-layer-footer:max-sm:grow in-data-layer-footer:max-sm:basis-0",
      },
    ],
    defaultVariants: { variant: "default", size: "default", live: true },
  }
);

// The default button out of use draws a quiet fill, not the full fill at half strength: at night
// the full fill is near white, and dimmed it was still the brightest thing in a box that can do
// nothing.
const disabledLook =
  "opacity-(--damsko-opacity-disabled) cursor-not-allowed forced-colors:border-[GrayText]";
const defaultDisabledLook =
  "opacity-100 text-primary-foreground-disabled bg-primary-disabled shadow-[inset_0_0_0_var(--damsko-hairline)_var(--damsko-border-strong-color)] forced-colors:text-[GrayText] forced-colors:bg-[ButtonFace] forced-colors:shadow-none";
// Failed, on every variant: calm. Its fill and edge are said for hover and press too: StyleX
// replaced the variant's whole background and box-shadow, hover and press included; cn() replaces
// only the classes of the same variant. The quiet fill, destructive words, a field's edge tinted
// destructive, and one small shake. The alert and the words say it too, so it is never colour alone.
const failedLook =
  "text-destructive forced-colors:text-[ButtonText] bg-control hover:bg-control active:bg-control shadow-(--damsko-error-border) hover:shadow-(--damsko-error-border) active:shadow-(--damsko-error-border) animate-[damsko-shake_var(--damsko-duration-ui)_var(--damsko-ease-in-out)_1] motion-reduce:animate-none";
// Failed, a `link`: words with no box stay words. The destructive ink, and no underline to press.
const failedWordsLook =
  "text-destructive forced-colors:text-[LinkText] no-underline hover:no-underline";

/** The variants drawn on a fill, which carry the sheen. */
const filled = (variant: ButtonVariant) =>
  variant === "default" || variant === "destructive";

/** Whether the element's props say its press failed (`data-status`, from `withStatus`). */
const hasFailed = (extra: Record<string, unknown>) =>
  extra["data-status"] === "error";

// ---- The parts -------------------------------------------------------------------------------------

/** The words an agent is told before its press runs, when it must ask. */
interface AgentWords {
  agentAsks: string;
  agentPresses: (words: string) => string;
}

/**
 * What an agent is told before its press runs: `agentConfirm`, or the part's own. A destructive
 * button always asks, in its own words, unless it only opens something (a dialog's trigger): the
 * action inside asks.
 */
const confirmFor = (
  variant: ButtonVariant,
  given: unknown,
  extra: Record<string, unknown>,
  words: unknown,
  said: AgentWords
) => {
  if (typeof given === "string") {
    return given;
  }
  const slot = extra["data-slot"];
  const popup = extra["aria-haspopup"];
  const opens =
    (typeof slot === "string" && slot.endsWith("-trigger")) ||
    (popup !== undefined && popup !== false && popup !== "false");
  const own =
    typeof words === "string" && words !== ""
      ? said.agentPresses(words)
      : said.agentAsks;
  return variant === "destructive" && !opens ? own : undefined;
};

/** The button's own props: its look, its slot, its variant and size, and what an agent is told. */
const ownOf = (
  {
    variant,
    size,
    disabled,
    truncate,
    className,
  }: Required<Pick<ButtonBase, "variant" | "disabled" | "truncate">> &
    Pick<ButtonBase, "className"> & { size: ButtonSize },
  extra: Record<string, unknown>,
  agentConfirm: string | undefined,
  words: unknown,
  said: AgentWords
) => {
  // Drawn by another part (a dialog's trigger), the element keeps that part's slot, which its own
  // selectors and the page's read, and says it is a Button with data-button.
  const part =
    typeof extra["data-slot"] === "string" ? extra["data-slot"] : undefined;
  const busy = isInvalid(extra["aria-busy"]);
  return {
    className: cn(
      buttonVariants({ variant, size, live: !disabled }),
      truncate && "shrink whitespace-nowrap",
      disabled && !busy && disabledLook,
      disabled && !busy && variant === "default" && defaultDisabledLook,
      busy && "cursor-progress",
      hasFailed(extra) && (variant === "link" ? failedWordsLook : failedLook),
      className
    ),
    "data-slot": part ?? "button",
    "data-button": part === undefined ? undefined : "",
    "data-variant": variant,
    "data-size": size,
    "data-agent-confirm": confirmFor(
      variant,
      agentConfirm ?? extra["data-agent-confirm"],
      extra,
      words,
      said
    ),
  };
};

// The touch target of each size: as tall as a finger needs, and as wide for a square.
const targetStyles: Record<ButtonSize, string> = {
  xs: "coarse:inset-y-[calc((var(--damsko-control-xs)-var(--damsko-tap-target))/2)]",
  sm: "coarse:inset-y-[calc((var(--damsko-control-sm)-var(--damsko-tap-target))/2)]",
  default:
    "coarse:inset-y-[calc((var(--damsko-control-default)-var(--damsko-tap-target))/2)]",
  lg: "",
  "icon-xs":
    "coarse:inset-[calc((var(--damsko-control-xs)-var(--damsko-tap-target))/2)]",
  "icon-sm":
    "coarse:inset-[calc((var(--damsko-control-sm)-var(--damsko-tap-target))/2)]",
  icon: "coarse:inset-[calc((var(--damsko-control-default)-var(--damsko-tap-target))/2)]",
  "icon-lg": "",
};

/** The sheen over a filled button, and the touch target. */
const Inside = ({
  variant,
  size,
  pressable,
  failed,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  pressable: boolean;
  failed: boolean;
}) => (
  <>
    {filled(variant) && !failed && (
      // The light over a filled button: white at the top, fading to nothing; brighter under a
      // pointer, dimmer while pressed (the button is `group/button`).
      <span
        aria-hidden="true"
        className={cn(
          "corner-inherit ease-ui pointer-events-none absolute inset-0 -z-1 rounded-[inherit] bg-[linear-gradient(var(--damsko-button-sheen),transparent)] opacity-60 transition-opacity duration-(--damsko-motion-hover)",
          pressable &&
            "group-hover/button:opacity-100 group-active/button:opacity-30"
        )}
      />
    )}
    {/* A finger needs 44px: on a touch screen an unseen area makes up the difference. */}
    <span
      aria-hidden="true"
      className={cn("absolute inset-x-0 inset-y-0", targetStyles[size])}
    />
  </>
);

type Child = ReactElement<{ children?: ReactNode }>;

/**
 * The element given with `asChild`, or a plain <button> when another part draws the Button: the
 * face's props merged onto it (its own win, its handlers both run), with the sheen and the touch
 * target before its children.
 */
const Face = ({
  element,
  face,
  inside,
  words,
  children,
}: {
  element: Child | undefined;
  face: Record<string, unknown>;
  inside: ReactNode;
  /** Draws the words with the press's state round them. */
  words: (content: ReactNode) => ReactNode;
  children?: ReactNode;
}) => {
  if (element === undefined) {
    return (
      <button type="button" {...face}>
        {inside}
        {words(children)}
      </button>
    );
  }
  const { type: Element, props } = element;
  return (
    <Element {...mergeProps(face, props)}>
      {inside}
      {words(props.children)}
    </Element>
  );
};

// ---- A press that takes time ----------------------------------------------------------------------

/** What the Button waits on: the Promise its `onClick` gave. */
const waitFor = async (work: PromiseLike<unknown>) => await work;

/**
 * The end of a press's run, for UI SDK's Button, which stays pending until it settles, and for an
 * agent's press: a failure rejects with its words, so the agent hears it failed.
 */
const reported = async (
  run: Promise<ActionResult<unknown>>,
  failed: string
) => {
  const result = await run;
  if (!result.ok && !("busy" in result)) {
    throw new Error(failed);
  }
};

const statusStyles = {
  // The words, as they are, while it rests: the box adds nothing to the button's own layout.
  contents: "contents",
  // The words while a mark stands over them: still in their place and its name, but not seen.
  unseen: "text-transparent",
  // Truncated: the content is a row of its own that may shrink, its icons whole and its words cut.
  cutRow: "inline-flex items-center gap-2 min-w-0 max-w-full",
  cutWords: "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
  // A state's mark, centred over the words.
  mark: "absolute inset-0 flex items-center justify-center pointer-events-none animate-[damsko-mark-in_var(--damsko-motion-mark)_var(--damsko-ease)]",
  // With words for a state: every state in one cell, on top of each other, so the widest sets the
  // width. Only one is seen.
  stack: "inline-grid items-center justify-items-center min-w-0 max-w-full",
  layer:
    "[grid-area:1/1] inline-flex items-center justify-center gap-2 min-w-0 max-w-full transition-[opacity,visibility] duration-(--damsko-motion-swap) ease-ui",
  // A state that is not showing only keeps its width, on one line.
  gone: "opacity-0 invisible whitespace-nowrap",
  // The words while a mark with no words of its own stands over them: unseen, still its name.
  faded: "opacity-0 whitespace-nowrap",
  // The room a state's mark takes beside its words, and the spinner where the button's icon stood.
  place:
    "inline-flex items-center justify-center shrink-0 size-(--damsko-icon-size)",
};
type Labels = Partial<Record<Exclude<ActionStatus, "idle">, string>>;

/** A state's mark: the spinner while it works, a tick, the alert. */
const Mark = ({ status }: { status: Exclude<ActionStatus, "idle"> }) => {
  if (status === "loading") {
    return <Spinner />;
  }
  return <Icon icon={status === "success" ? CheckIcon : CircleAlertIcon} />;
};

/**
 * The button's content while it works, when it has an icon: the spinner in the icon's place, the
 * words as they were. Without an icon, nothing: the mark stands over the words instead.
 */
const spinning = (children: ReactNode) => {
  const parts = listOf(children);
  const at = parts.findIndex(
    (part) => isValidElement(part) && part.type === Icon
  );
  return at === -1
    ? undefined
    : parts.with(
        at,
        <span
          key="spinner"
          data-slot="button-spinner"
          className={cn(statusStyles.place)}
        >
          <Spinner />
        </span>
      );
};

/** The content with each run of words in a box that cuts them with an ellipsis (`truncate`). */
const cutWords = (children: ReactNode): ReactNode[] =>
  listOf(children).map((child, index): ReactNode =>
    typeof child === "string" || typeof child === "number" ? (
      // Words have no id of their own; their place among the icons is their key.
      <span key={index} className={cn(statusStyles.cutWords)}>
        {child}
      </span>
    ) : (
      child
    )
  );

/**
 * The words, and over them the state's mark; with words for a state, every state stacked in one
 * cell. Mounted only while it shows, a mark never turns unseen.
 */
const Status = ({
  status,
  labels,
  truncate,
  children: given,
}: {
  status: ActionStatus;
  labels: Labels;
  truncate: boolean;
  children: ReactNode;
}) => {
  const label = status === "idle" ? undefined : labels[status];
  // While it works with no words of its own, the spinner stands where the icon stood.
  const inPlace =
    status === "loading" && label === undefined ? spinning(given) : undefined;
  const resting = status === "idle" || inPlace !== undefined;
  const content = inPlace ?? given;
  const children = truncate ? cutWords(content) : content;
  const mark =
    resting || label !== undefined ? null : (
      <span aria-hidden="true" className={cn(statusStyles.mark)}>
        <Mark status={status} />
      </span>
    );
  const stacked = Object.values(labels).some((each) => each !== undefined);
  if (!stacked) {
    return (
      <>
        <span
          data-slot="button-content"
          className={cn(
            truncate ? statusStyles.cutRow : statusStyles.contents,
            !resting && statusStyles.unseen
          )}
        >
          {children}
        </span>
        {mark}
      </>
    );
  }
  return (
    <>
      <span data-slot="button-content" className={cn(statusStyles.stack)}>
        <span
          aria-hidden={label === undefined ? undefined : true}
          className={cn(
            statusStyles.layer,
            !resting &&
              (label === undefined ? statusStyles.faded : statusStyles.gone)
          )}
        >
          {children}
        </span>
        {(["loading", "success", "error"] as const).map((each) =>
          labels[each] === undefined ? null : (
            <span
              key={each}
              aria-hidden={status === each ? undefined : true}
              className={cn(
                statusStyles.layer,
                status !== each && statusStyles.gone
              )}
            >
              {status === each ? (
                <Mark status={each} />
              ) : (
                <span className={cn(statusStyles.place)} />
              )}
              {labels[each]}
            </span>
          )
        )}
      </span>
      {mark}
    </>
  );
};

/** The button's own props with where its press is: busy while it works, and `data-status`. */
const withStatus = (
  rest: Record<string, unknown>,
  status: ActionStatus
): Record<string, unknown> => ({
  ...rest,
  "aria-busy": status === "loading" ? true : rest["aria-busy"],
  "data-status": status === "idle" ? undefined : status,
});

/**
 * A press whose `onClick` gives a Promise, followed: where it is, and the handler for UI SDK's
 * Button. With `held`, the page's status, and `onClick` as it is.
 */
const usePress = (
  onClick: ButtonBase["onClick"],
  held: ActionStatus | undefined,
  labels: Labels
) => {
  const action = useAction(waitFor, {
    loadingLabel: labels.loading,
    successLabel: labels.success,
    errorLabel: labels.error,
  });
  if (held !== undefined) {
    return { status: held, press: onClick };
  }
  const press: ButtonBase["onClick"] = (event, details) => {
    // While it works or shows how it went, a press does nothing.
    if (action.status !== "idle") {
      event.preventDefault();
      return null;
    }
    const result = onClick?.(event, details);
    return isThenable(result)
      ? reported(action.run(result), action.labels.error)
      : result;
  };
  return { status: action.status, press };
};

const Pressable = ({
  variant = "default",
  size = "default",
  asChild = false,
  agentConfirm,
  disabled = false,
  focusableWhenDisabled = false,
  pendingAnnouncement = "",
  loadingLabel,
  successLabel,
  errorLabel,
  status: held,
  tooltip: _tooltip,
  onClick,
  className,
  truncate = false,
  children,
  ...rest
}: ButtonProps) => {
  const { agentAsks, agentPresses } = useI18n().action;
  const { status, press } = usePress(onClick, held, {
    loading: loadingLabel,
    success: successLabel,
    error: errorLabel,
  });
  const working = status === "loading";
  const extra = withStatus(rest, status);
  const off = disabled || working;
  const own = ownOf(
    { variant, size, disabled: off, truncate, className },
    extra,
    agentConfirm,
    textOf(children) || extra["aria-label"],
    { agentAsks, agentPresses }
  );
  const inside = (
    <Inside
      variant={variant}
      size={size}
      pressable={!off}
      failed={hasFailed(extra)}
    />
  );
  const element =
    asChild && isValidElement<{ children?: ReactNode }>(children)
      ? children
      : undefined;
  // An icon-only button keeps its square: its words are said, never shown.
  const words = (content: ReactNode) => (
    <Status
      status={status}
      truncate={truncate}
      labels={
        isIconSize(size)
          ? {}
          : { loading: loadingLabel, success: successLabel, error: errorLabel }
      }
    >
      {content}
    </Status>
  );
  // Kept in focus while it works, so focus stays on it.
  const focusable = focusableWhenDisabled || working;

  if (typeof extra["data-slot"] === "string") {
    // Drawn by another UI SDK part: only its face, on the part's own element. The part's own
    // click (a popover trigger's open) runs only while the button can be pressed: kept in focus
    // with `focusableWhenDisabled`, the element is not disabled, so the guard is ours.
    const face: Record<string, unknown> = {
      ...extra,
      ...own,
      onClick: (...args: Parameters<NonNullable<typeof onClick>>) => {
        if (off) {
          args[0].preventDefault();
          return null;
        }
        return press?.(...args);
      },
      disabled: off && !focusable ? true : undefined,
      "aria-disabled": off && focusable ? true : extra["aria-disabled"],
    };
    return (
      <Face element={element} face={face} inside={inside} words={words}>
        {children}
      </Face>
    );
  }
  return (
    <ButtonPrimitive
      {...extra}
      {...own}
      onClick={press}
      render={
        element === undefined
          ? undefined
          : (props: Record<string, unknown>) => (
              <Face
                element={element}
                face={props}
                inside={inside}
                words={words}
              />
            )
      }
      disabled={off}
      focusableWhenDisabled={focusable}
      // Silent by default: hooks/use-action says a press's life once, by the page's one voice.
      pendingAnnouncement={pendingAnnouncement}
    >
      {element === undefined && (
        <>
          {inside}
          {words(children)}
        </>
      )}
    </ButtonPrimitive>
  );
};

export const Button = (props: ButtonProps) => (
  <ControlTooltip
    tooltip={props.tooltip}
    iconOnly={isIconSize(props.size ?? "default")}
  >
    <Pressable {...props} />
  </ControlTooltip>
);
