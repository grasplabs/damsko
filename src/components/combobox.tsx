// Combobox: type to find one value in a list, from shadcn's (registry/bases/base/ui/combobox.tsx),
// converted from Tailwind to StyleX and rebuilt on UI SDK's Combobox: closed, it is an Input (the
// same fill, hairline, heights and corner) with a chevron at the end; open, it is the list popup
// Select shares, and the letters that matched are drawn in the text colour.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Field>
//     <FieldLabel>Country</FieldLabel>
//     <Combobox items={countries} placeholder="Search countries" />
//   </Field>
//   <Combobox items={[{ type: "group", label: "Europe", items }]}>
//     <ComboboxEmpty>No city has that name</ComboboxEmpty>
//   </Combobox>
//
// The items are data, so filtering, the keyboard and an agent know every one, and the chosen
// label is known on the server. The value is always an item's; the text is only a search.
"use client";

import * as stylex from "@stylexjs/stylex";
import type { ChangeDetails } from "@ui-sdk/core";
import {
  Combobox as ComboboxPrimitive,
  ComboboxContent,
  ComboboxEmpty as EmptyPrimitive,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox";
import type {
  ComboboxInputState,
  ComboboxItemState,
  ComboboxItemTextState,
  ComboboxTriggerState,
  ComboboxValueChangeReason,
  ListData,
  ListItem,
} from "@ui-sdk/react/combobox";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { CheckIcon, ChevronDownIcon, Icon } from "../lib/icons";
import { pressedJustNow, transformOriginFrom } from "../lib/layer";
import {
  focusField,
  inputStyles,
  listStyles,
  scrollbarHidden,
} from "../lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  shadow,
  size,
  space,
} from "../lib/tokens.stylex";
// UI SDK places a popup in pixels: popup-gap and popup-gutter, as the generator writes them.
import { popup } from "../lib/tokens.values";
import { isDevelopment, isInvalid, warnUnnamed } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, listMarker, motionVars } from "../lib/vars.stylex";

/** The control's height: Input's and Button's. */
export type ComboboxSize = "sm" | "default" | "lg";

/**
 * The items: plain strings, `{ value, label, keywords, disabled }`, groups
 * `{ type: "group", label, items }` and separators `{ type: "separator" }`.
 */
export type ComboboxItems = ListData;

// Every prop is documented once, here; the props on the docs page are read from ComboboxProps.

/** Every prop a Combobox takes. */
export interface ComboboxProps {
  /**
   * What can be chosen: strings (each is its own value and label), `{ value, label, keywords,
   * disabled }`, groups and separators. `keywords` are other words that find an item ("Holland").
   */
  items: ComboboxItems;
  /** A ComboboxEmpty, for the words the list says when nothing matches. Without one, the catalogue's. */
  children?: ReactNode;
  /** The value chosen at first. A form reset returns here. Leave it out to start with nothing. */
  defaultValue?: string | null;
  /** The value, when you keep it in state. `null` is nothing chosen. Pair it with `onValueChange`. */
  value?: string | null;
  /**
   * Called with the new value and why it changed: a choice in the list, emptied text, a form reset,
   * or code and agents. `details.source` is `"agent"` when an agent chose, and `details.cancel()`
   * keeps the value as it was.
   */
  onValueChange?: (
    value: string | null,
    details: ChangeDetails<ComboboxValueChangeReason>
  ) => void;
  /** What it says while it is empty: a verb and the thing ("Search countries"). */
  placeholder?: string;
  /**
   * The height, the same as Input's and Button's: `sm` 32px, `default` 36px, `lg` 44px. On a touch
   * screen every size has a 44px target, and every item in the list is 44px tall.
   * @default "default"
   */
  size?: ComboboxSize;
  /** The name the value is sent under in a form. Inside a Field, the Field's `name` serves. */
  name?: string;
  /**
   * Needs a value before the form is sent. Inside a Field, its label shows the required mark.
   * @default false
   */
  required?: boolean;
  /**
   * Shows its value and is sent with the form, but does not open. Drawn on a quieter fill.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Out of use: not focusable, not sent, half strength. Say why near it.
   * @default false
   */
  disabled?: boolean;
  /** Marked wrong, as a Field with an error marks it: the destructive edge. */
  "aria-invalid"?: boolean | "true" | "false";
  /** Its name when no FieldLabel names it, as a screen reader and an agent say it ("Country"). */
  "aria-label"?: string;
  /** The `id` of a form it belongs to, when it stands outside that form. */
  form?: string;
  /** The `id` of the input, for a Label outside a Field (`htmlFor`). */
  id?: string;
  /** Layout only: margins, alignment and width. Colours, heights and corners belong to the combobox. */
  style?: LayoutStyle;
}

/** Every prop a ComboboxEmpty takes. */
export interface ComboboxEmptyProps {
  /**
   * What the list says when nothing matches the words typed ("No city has that name").
   * @default "No results"
   */
  children?: ReactNode;
}

// ---- The look --------------------------------------------------------------------------------------

const HOVER = media.hover;
const COARSE = media.pointerCoarse;
const FORCED = media.forcedColors;
// Focus from the keys, never after a press (lib/styles marks a pointer's focus).
const KEYBOARD = ":focus-visible:not([data-focus-pointer])";
// Where the words can be painted through a gradient, a long value fades at its end (below).
// Not in Firefox: it passes the test, but a form control's words are not clipped there, so the
// gradient filled the whole box and every value drew as a dark bar. There a long value is cut by
// the box's edge as it scrolls.
const CLIP_TEXT =
  "@supports (background-clip: text) and (not (-moz-appearance: none))";
const FADE_END = `linear-gradient(to right, currentColor calc(100% - ${space[5]}), transparent), linear-gradient(transparent, transparent)`;
const FADE_END_RTL = `linear-gradient(to left, currentColor calc(100% - ${space[5]}), transparent), linear-gradient(transparent, transparent)`;

const styles = stylex.create({
  // The box holds the input, its touch target and the chevron. It is as wide as its column.
  box: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
  // The input: Input's own look (the same fill, hairline, words and fade of a long value).
  input: {
    // Above its touch target, so a press on the words puts the caret where it lands.
    position: "relative",
    flexGrow: 1,
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    margin: 0,
    appearance: "none",
    // No border: the edge is a hairline drawn inside, which adds no size. In forced colours the
    // shadow is dropped, so a real one appears there.
    borderWidth: { default: 0, [FORCED]: 1 },
    borderStyle: "solid",
    borderColor: "currentColor",
    cornerShape: radius.shape,
    backgroundColor: colors.inputBg,
    boxShadow: {
      default: `inset 0 0 0 1px ${colors.input}, ${shadow.inputShadow}`,
      ":focus-visible": size.inputFocus,
    },
    color: colors.foreground,
    caretColor: colors.foreground,
    fontFamily: font.sans,
    // 16px on a phone or a touch screen (media.maxSmOrCoarse), or Safari zooms the page in when the field takes focus.
    fontSize: {
      default: font.textSm,
      [media.maxSmOrCoarse]: size.inputTextTouch,
    },
    lineHeight: font.textSmLine,
    fontWeight: font.weightNormal,
    letterSpacing: "normal",
    textAlign: "start",
    // A placeholder too long for the field ends in an ellipsis, never mid-word: Chromium reads the
    // input's own text-overflow for its placeholder, so it is set while the placeholder shows.
    // A typed value fades instead (below).
    textOverflow: { default: "clip", ":placeholder-shown": "ellipsis" },
    paddingInline: space[3],
    // A value longer than the field fades out at its end, as Tabs and Code block do, never a cut
    // through a letter. The words are painted through a gradient (clipped to the text) that ends in
    // transparent over the last space-5 of the content box; a short value never reaches it. While
    // the field has focus the words are plain ink, so the caret's end of the value always shows.
    // The second, empty layer keeps the field's fill on its whole box.
    // Input draws it only while the value is longer than the field (fits, below).
    WebkitTextFillColor: {
      default: null,
      [CLIP_TEXT]: {
        default: "transparent",
        ":focus": "currentColor",
        [FORCED]: "currentColor",
      },
    },
    // In forced colours the background is dropped, so the words keep their own colour there.
    backgroundImage: {
      default: null,
      [CLIP_TEXT]: { default: FADE_END, ":dir(rtl)": FADE_END_RTL },
    },
    backgroundOrigin: {
      default: null,
      [CLIP_TEXT]: "content-box, padding-box",
    },
    backgroundClip: { default: null, [CLIP_TEXT]: "text, padding-box" },
    // One tile: words past the content box (in the end padding) take no paint, so stay unseen.
    backgroundRepeat: { default: null, [CLIP_TEXT]: "no-repeat" },
    // Focus is the edge itself (field-focus, in live and invalid below: a step darker and a faint
    // halo, no ring), with focusField (lib/styles) for forced colours.
    transitionProperty: "box-shadow, background-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
    // One look for clearing a field in the library: Input group's own clear button
    // (InputGroupClear). A search field here shows no cross of the browser's; Escape still
    // empties it where the browser does that.
    // display: none, not appearance: none: WebKit draws its own cross with appearance none too.
    "::-webkit-search-cancel-button": { display: "none" },
    // A time field in one look in every engine: Chromium's clock button goes (Firefox and Safari
    // draw none on a computer); its parts sit on the field's own line.
    "::-webkit-calendar-picker-indicator": { display: "none" },
    "::-webkit-datetime-edit": { padding: 0 },
    // Selected words in our own tone (field-selection), never the browser's blue.
    "::selection": {
      backgroundColor: colors.inputSelection,
      color: colors.foreground,
    },
    "::placeholder": {
      color: colors.mutedForeground,
      // Its own colour, not the transparent fill the value's fade sets on the input.
      WebkitTextFillColor: colors.mutedForeground,
      opacity: 1,
      // A hint too long for the field ends in an ellipsis, never mid-word.
      textOverflow: "ellipsis",
    },
  },
  // Can be read and copied, not changed: Input's settled look, its words a step quieter.
  readOnly: {
    backgroundColor: colors.inputBgRead,
    boxShadow: {
      default: `inset 0 0 0 1px ${colors.input}`,
      [KEYBOARD]: size.inputFocusRead,
    },
    color: colors.inputInkRead,
    caretColor: "transparent",
    cursor: "default",
  },
  // An option reads as Select's does: the field's 14px on a 36px row, regular weight.
  option: {
    fontWeight: font.weightNormal,
  },
  // The words stop before the chevron. A field is one line already; a value too long for it ends
  // in an ellipsis at rest (a browser shows the ellipsis only while the field is not being typed
  // in), not clipped mid-letter.
  inputEnd: {
    paddingInlineEnd: `calc(${space[2]} + ${size.iconSm} + ${space[2]})`,
    textOverflow: "ellipsis",
  },
  // The chevron at the end opens the list for a pointer. The keyboard opens it from the input, so
  // the chevron stays out of the Tab order.
  trigger: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    position: "absolute",
    zIndex: 1,
    insetBlock: 0,
    insetInlineEnd: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    // One inset at every size, as Select's chevron and the words keep.
    width: `calc(${space[2]} * 2 + ${size.iconSm})`,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [HOVER]: colors.foreground },
    },
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    // Out of the Tab order: the field is where the keyboard is, and shows it.
    outline: "none",
    transitionProperty: "color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // On a touch screen the chevron's press area is 44px tall and wide, unseen.
  triggerTarget: {
    position: "absolute",
    insetBlock: {
      default: 0,
      [COARSE]: `min(0px, calc((100% - ${size.tapTarget}) / 2))`,
    },
    insetInline: {
      default: 0,
      [COARSE]: `min(0px, calc((100% - ${size.tapTarget}) / 2))`,
    },
  },
  triggerOff: {
    cursor: "default",
    pointerEvents: "none",
  },
  // The chevron turns over while the list is open; back as fast as the list leaves.
  chevron: {
    display: "inline-flex",
    transitionProperty: "transform",
    transitionDuration: motionVars.leave,
    transitionTimingFunction: duration.ease,
  },
  chevronOpen: {
    transform: "rotate(0.5turn)",
    transitionDuration: motionVars.popup,
  },
  // Open, the list is at least as wide as the control.
  content: {
    minWidth: "var(--anchor-width)",
  },
});

const sizeStyles = {
  sm: inputStyles.sm,
  default: inputStyles.default,
  lg: inputStyles.lg,
} as const;
const targetStyles = {
  sm: inputStyles.targetSm,
  default: inputStyles.targetDefault,
  lg: inputStyles.targetLg,
} as const;

const className = (...parts: stylex.StyleXStyles[]) =>
  stylex.props(...parts).className;

const asItem = (entry: ListItem | string): ListItem =>
  typeof entry === "string" ? { value: entry, label: entry } : entry;

/** Every value in the items, groups included. */
const valuesOf = (items: ComboboxItems): Set<string> => {
  const values = new Set<string>();
  for (const entry of items) {
    if (typeof entry === "string") {
      values.add(entry);
    } else if ("type" in entry && entry.type === "group") {
      for (const inner of entry.items) {
        values.add(asItem(inner).value);
      }
    } else if (!("type" in entry && entry.type === "separator")) {
      values.add(entry.value);
    }
  }
  return values;
};

/** An item's words, with the letters the typed words matched in the text colour. */
const Words = () => (
  <ComboboxItemText {...stylex.props(listStyles.itemText)}>
    {(state: ComboboxItemTextState) =>
      state.segments.map((segment, index) =>
        segment.match ? (
          // A match has no id of its own; its place in the label is its key.
          <mark key={index} {...stylex.props(listStyles.match)}>
            {segment.text}
          </mark>
        ) : (
          segment.text
        )
      )
    }
  </ComboboxItemText>
);

const Option = ({ item }: { item: ListItem }) => (
  <ComboboxItem
    value={item.value}
    label={item.label}
    keywords={item.keywords}
    disabled={item.disabled}
    className={(state: ComboboxItemState) =>
      className(
        listStyles.item,
        listStyles.menuItem,
        styles.option,
        listStyles.cut,
        state.highlighted && listStyles.itemHighlighted,
        state.disabled && listStyles.itemDisabled
      )
    }
  >
    <Words />
    <ComboboxItemIndicator {...stylex.props(listStyles.check)}>
      <Icon icon={CheckIcon} />
    </ComboboxItemIndicator>
  </ComboboxItem>
);

/** The items that match, as parts: items, groups with their names, separators. */
const Options = ({ items }: { items: ListData<unknown> }) =>
  // SAFETY: the list hands back the items the combobox was given, which are ComboboxItems.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- see SAFETY
  (items as ComboboxItems).map((entry, index) => {
    if (
      typeof entry !== "string" &&
      "type" in entry &&
      entry.type === "separator"
    ) {
      // A separator has no value; its place in the list is its key.
      return (
        <ComboboxSeparator
          key={`separator-${index}`}
          {...stylex.props(listStyles.separator)}
        />
      );
    }
    if (
      typeof entry !== "string" &&
      "type" in entry &&
      entry.type === "group"
    ) {
      return (
        <ComboboxGroup key={`group-${entry.label ?? index}`}>
          {entry.label !== undefined && entry.label !== "" && (
            <ComboboxGroupLabel
              {...stylex.props(listStyles.groupLabel, listStyles.cut)}
            >
              {entry.label}
            </ComboboxGroupLabel>
          )}
          {entry.items.map((inner) => {
            const item = asItem(inner);
            return <Option key={item.value} item={item} />;
          })}
        </ComboboxGroup>
      );
    }
    const item = asItem(entry);
    return <Option key={item.value} item={item} />;
  });

/** What the list says when nothing matches the words typed. */
export const ComboboxEmpty = ({ children }: ComboboxEmptyProps) => {
  const words = useI18n();
  return (
    <EmptyPrimitive {...stylex.props(listStyles.empty)}>
      {children ?? words.combobox.empty}
    </EmptyPrimitive>
  );
};

/** Type to find one value in a list. */
export const Combobox = ({
  items,
  children,
  size: scale = "default",
  placeholder,
  style,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  id,
  onValueChange,
  ...options
}: ComboboxProps) => {
  const words = useI18n();
  // Opened by a press on the chevron at the field's end, the list grows from that button; opened by
  // typing (or the keys), from the field it lines up with (the rule: from the trigger).
  const chevron = useRef<HTMLButtonElement>(null);
  const pressedAt = useRef(0);
  const fromChevron = transformOriginFrom(() =>
    pressedJustNow(pressedAt.current) ? chevron.current : null
  );
  // The value is always an item's: a value from outside the list (an agent's, or code's) is refused,
  // so whoever set it hears that it failed.
  const known = valuesOf(items);
  const change = (
    next: string | null,
    details: ChangeDetails<ComboboxValueChangeReason>
  ) => {
    if (next !== null && !known.has(next)) {
      details.cancel();
      // An agent hears why, in words.
      if (details.source === "agent") {
        throw new Error(words.combobox.notChoice(next));
      }
      return;
    }
    onValueChange?.(next, details);
  };
  // In development, say so when nothing names it: no Field label, no aria-label.
  const input = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    warnUnnamed("Combobox", input.current);
  }, []);

  // A starting value from outside the list is a mistake in the code: say so in development.
  // Keyed on the items, not on `known`: that is a new Set at every render.
  useEffect(() => {
    if (!isDevelopment) {
      return;
    }
    const listed = valuesOf(items);
    for (const start of [options.value, options.defaultValue]) {
      if (start !== null && start !== undefined && !listed.has(start)) {
        console.error(`Combobox: ${start} is not one of its items.`);
      }
    }
  }, [items, options.value, options.defaultValue]);

  return (
    <ComboboxPrimitive
      items={items}
      autoHighlight="always"
      {...options}
      onValueChange={change}
    >
      {/* The box that holds the field, its touch target and the chevron. */}
      <div data-slot="combobox" {...stylex.props(styles.box, style)}>
        <span
          aria-hidden="true"
          {...stylex.props(inputStyles.target, targetStyles[scale])}
        />
        <ComboboxInput
          ref={input}
          id={id}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          placeholder={placeholder}
          render={(
            props: Record<string, unknown>,
            state: ComboboxInputState
          ) => (
            <input
              {...props}
              {...stylex.props(
                styles.input,
                sizeStyles[scale],
                styles.inputEnd,
                !(state.disabled || state.readOnly) && inputStyles.enabled,
                state.readOnly && styles.readOnly,
                state.disabled && inputStyles.disabled,
                isInvalid(props["aria-invalid"]) && inputStyles.invalid,
                focusField.default
              )}
            />
          )}
        />
        <ComboboxTrigger
          ref={chevron}
          onPointerDown={(event) => {
            pressedAt.current =
              Date.now() - (performance.now() - event.timeStamp);
          }}
          aria-label={words.combobox.trigger}
          className={(state: ComboboxTriggerState) =>
            className(
              styles.trigger,
              (state.disabled || state.readOnly) && styles.triggerOff
            )
          }
        >
          {(state: ComboboxTriggerState) => (
            <>
              <span
                aria-hidden="true"
                {...stylex.props(styles.triggerTarget)}
              />
              <span
                aria-hidden="true"
                {...stylex.props(
                  styles.chevron,
                  state.open && styles.chevronOpen
                )}
              >
                <Icon icon={ChevronDownIcon} />
              </span>
            </>
          )}
        </ComboboxTrigger>
      </div>
      <ComboboxContent
        ref={fromChevron}
        sideOffset={popup.gap}
        collisionPadding={popup.gutter}
        {...stylex.props(
          listMarker,
          listStyles.popup,
          styles.content,
          scrollbarHidden
        )}
      >
        {children ?? <ComboboxEmpty />}
        <ComboboxList>
          {(state: { items: ListData<unknown> }) => (
            <Options items={state.items} />
          )}
        </ComboboxList>
        <span aria-hidden="true" {...stylex.props(listStyles.more)} />
      </ComboboxContent>
    </ComboboxPrimitive>
  );
};
