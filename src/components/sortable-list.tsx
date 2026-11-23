// Sortable list: a list a person puts in order by hand, by a handle on each item: dragged with a
// pointer or a finger, or moved from the keyboard, every step said to a screen reader.
// In StyleX, built on UI SDK's createReorder (@ui-sdk/core), which keeps the order being moved as a
// draft and hands the new one to `onValueChange` once it is dropped.
//
//   <SortableList aria-label="Steps, in order" value={order} onValueChange={setOrder}>
//     {order.map((id) => (
//       <SortableListItem key={id} value={id} textValue={names[id]}>
//         <SortableListHandle aria-label={`Move ${names[id]}`} />
//         <Field orientation="horizontal">…</Field>
//       </SortableListItem>
//     ))}
//   </SortableList>
//
// The handle carries the move, so an item holds its own controls (a switch, a field) and they
// keep their keys and presses. From the keyboard: Space or Enter on a handle picks its item up, the
// arrows move it (Home and End to either end), Space or Enter puts it down, Escape or Tab puts it
// back. While an item is up it is lifted on the raised ground; while a pointer drags it, it follows
// the pointer and the others make room. The order is the caller's: it renders the items in `value`
// and takes the new order from `onValueChange` once one is put down, as a list of its own data
// always is. Its words (the handles' instructions, what is said at each step) come from the
// I18nProvider.
"use client";

import * as stylex from "@stylexjs/stylex";
import {
  createChange,
  createReorder,
  definePrimitive,
  reorderMessage,
} from "@ui-sdk/core";
import type { ChangeDetails, ReorderDraft, ReorderReason } from "@ui-sdk/core";
import { usePart, usePrimitive } from "@ui-sdk/react/primitive";
import { createContext, use, useId } from "react";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { GripVerticalIcon, Icon } from "../lib/icons";
import { focusRing } from "../lib/styles";
import {
  colors,
  duration,
  media,
  radius,
  shadow,
  size,
  space,
} from "../lib/tokens.stylex";
import { announce, className } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars } from "../lib/vars.stylex";

/** Why the order changed: a pointer's drag, the keyboard, or code. */
export type SortableListChangeReason = ReorderReason;

/** Every prop a SortableList takes. */
export interface SortableListProps {
  /** Its SortableListItems, in the order the list holds. */
  children: ReactNode;
  /**
   * The items' values in the order the caller renders them, kept in state. The list draws an item
   * being moved where it is going, and gives the new order to `onValueChange` once it is put down.
   */
  value: string[];
  /**
   * Called with the new order once an item is put down, and why: a drag (`drag`), the keyboard
   * (`move-key`) or code (`imperative`). Render the items in it; `details.cancel()` puts the item
   * back.
   */
  onValueChange: (
    value: string[],
    details: ChangeDetails<SortableListChangeReason>
  ) => void;
  /**
   * No item can be moved: every handle out of use. Say why near it.
   * @default false
   */
  disabled?: boolean;
  /** What the list holds, as a screen reader says it ("Steps, in order"). */
  "aria-label": string;
  /** Layout only: margins, alignment and width. */
  style?: LayoutStyle;
}

/** Every prop a SortableListItem takes: one item of the list. */
export interface SortableListItemProps {
  /** Its value in the list's order: unique and the same between renders. */
  value: string;
  /** Its SortableListHandle, then what it shows: its words, its own controls. */
  children: ReactNode;
  /**
   * Its name, as a screen reader hears it at each step of a move ("Picked up Welcome, position 1
   * of 4"), when its words say more than its name. Without it, its text.
   */
  textValue?: string;
  /**
   * It cannot be picked up; the others still move past it.
   * @default false
   */
  disabled?: boolean;
  /** Layout only: alignment inside the item's row. */
  style?: LayoutStyle;
}

/** Every prop a SortableListHandle takes: the grip that moves its item. */
export interface SortableListHandleProps {
  /** What it does, with the item's name: "Move Welcome", as a screen reader says it. */
  "aria-label": string;
}

// ---- The behaviour --------------------------------------------------------------------------------

/** What the words of a step are made from. */
type Say = (
  type: "grab" | "move" | "drop" | "cancel",
  name: string,
  position: number,
  total: number
) => string;

interface SortableListOptions {
  value?: string[];
  onValueChange?: (
    value: string[],
    details: ChangeDetails<SortableListChangeReason>
  ) => void;
  disabled?: boolean;
  say?: Say;
}

interface ItemProps {
  value: string;
  textValue?: string;
  disabled?: boolean;
}

/** The draft at rest: nothing picked up. */
const notMoving: ReorderDraft | null = null;

const sortableList = definePrimitive({
  name: "sortable-list",
  options: {
    value: "value",
    onValueChange: "callback",
    disabled: "boolean",
    say: "value",
  },
  controlled: ["value"],
  state: (options: SortableListOptions) => ({
    value: options.value ?? [],
    moving: notMoving,
  }),
  sync: (options) =>
    options.value === undefined ? {} : { value: options.value },
  api: (context) => {
    const change = createChange(context);
    const reorder = createReorder(context, {
      slot: "item",
      key: "value",
      draft: "moving",
      set: (value, details) => change("value", value, details),
      disabled: (item: { key: string; props: ItemProps }) =>
        context.options().disabled === true || item.props.disabled === true,
      label: (key) => context.props<ItemProps>("item", key)?.textValue,
      // Said through the page's one live region (lib/utils' announce), as every part of Damsko
      // speaks; the empty text left to UI SDK says nothing a second time.
      message: (message) => {
        const { say } = context.options();
        announce(
          say === undefined
            ? reorderMessage(message)
            : say(message.type, message.label, message.position, message.total),
          "assertive"
        );
        return "";
      },
    });
    return { reorder };
  },
  slots: (slot) => ({
    root: slot({}),
    item: slot<
      ItemProps,
      { moving: boolean; dragging: boolean; place: number | undefined }
    >({
      props: { value: "key", textValue: "string", disabled: "boolean" },
      state: (state, { api, key }) => ({
        moving: api.reorder.moving(state, key),
        dragging: api.reorder.dragging(state, key),
        // While an item is moved, each item's place in the order being shown.
        place:
          state.moving === null
            ? undefined
            : api.reorder.order(state).indexOf(key),
      }),
      attrs: (state, { api, key }) => ({
        "data-moving": api.reorder.moving(state, key) ? "" : undefined,
        "data-dragging": api.reorder.dragging(state, key) ? "" : undefined,
      }),
      bind: (el, part) => part.api.reorder.bind(el, part),
    }),
    handle: slot<{ value: string }, { moving: boolean }>({
      props: { value: "string" },
      state: (state, { api, key }) => ({
        moving: api.reorder.moving(state, key),
      }),
      attrs: (state, { api, key }) => ({
        type: "button",
        "aria-pressed": api.reorder.moving(state, key) ? "true" : undefined,
      }),
      // A press with no drag (a click, or a screen reader's activation, which sends no key) picks
      // the item up, and a second puts it down, as Space does; a drag that ends swallows its click.
      press: ({ api, key, store }, event) => {
        if (api.reorder.moving(store.get(), key)) {
          api.reorder.drop(event);
        } else {
          api.reorder.grab(key);
        }
      },
      on: {
        keydown: (event, { api, key }) => {
          api.reorder.keydown(event, key);
        },
        pointerdown: (event, { api, key }) => {
          api.reorder.pointerdown(event, key);
        },
      },
    }),
  }),
});

// ---- The look --------------------------------------------------------------------------------------

const COARSE = media.pointerCoarse;
const FORCED = media.forcedColors;
const HOVER = media.hover;
const REDUCED = media.reducedMotion;

const styles = stylex.create({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: space[1],
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // An item: its handle at the start, then what it holds, on the ground it stands on.
  item: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: space[2],
    minWidth: 0,
    borderRadius: radius.lg,
    cornerShape: radius.shape,
    // A real edge in forced colours while it is up, where the lift is dropped.
    outlineWidth: 1,
    outlineStyle: "solid",
    outlineColor: "transparent",
    transitionProperty: {
      default: "box-shadow, background-color",
      [REDUCED]: "none",
    },
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // Picked up: lifted on the raised ground, over its neighbours.
  moving: {
    zIndex: 1,
    backgroundColor: colors.popover,
    boxShadow: shadow.popupShadow,
    outlineColor: { default: "transparent", [FORCED]: "CanvasText" },
  },
  // Dragged: it follows the pointer up and down the list, never sideways.
  dragging: {
    transform: "translateY(var(--drag-y, 0px))",
    // Its words are not selected as it is dragged over.
    userSelect: "none",
  },
  // The grip: a ghost icon button, square at the small control's height.
  handle: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: size.controlSm,
    height: size.controlSm,
    margin: 0,
    padding: 0,
    borderWidth: { default: 0, [FORCED]: 1 },
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: `min(${radius.xl}, calc(${size.controlSm} / 2))`,
    cornerShape: radius.shape,
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: colors.accent },
      ":active": colors.accentActive,
    },
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [HOVER]: colors.foreground },
    },
    cursor: { default: "grab", ":active": "grabbing" },
    // A finger on the grip drags the item; anywhere else on the item it scrolls the page.
    touchAction: "none",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "background-color, color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // Up from the keyboard: the press's fill stays while it is moved.
  handleMoving: {
    backgroundColor: colors.accentActive,
    color: colors.foreground,
  },
  handleDisabled: {
    opacity: size.opacityDisabled,
    backgroundColor: "transparent",
    cursor: "default",
  },
  // A finger needs 44px round the grip on a touch screen.
  target: {
    position: "absolute",
    inset: { default: 0, [COARSE]: `calc((100% - ${size.tapTarget}) / 2)` },
  },
});

// The id of the instructions every handle is described by.
const Instructions = createContext("");
// Whether the list round a handle is out of use; the item round it, and whether that is.
const ListDisabled = createContext(false);
const ItemValue = createContext("");
const ItemDisabled = createContext(false);

/** A list a person puts in order by hand, by each item's handle. */
export const SortableList = ({
  children,
  value,
  onValueChange,
  disabled = false,
  "aria-label": ariaLabel,
  style,
}: SortableListProps) => {
  const words = useI18n().sortableList;
  const instructions = useId();
  const handle = usePrimitive(sortableList, {
    value,
    onValueChange,
    disabled,
    say: (type, name, position, total) => {
      const said = {
        grab: words.grabbed,
        move: words.moved,
        drop: words.dropped,
        cancel: words.cancelled,
      }[type];
      return said(name, position, total);
    },
  });
  const list = usePart(
    handle,
    "root",
    {},
    {
      "aria-label": ariaLabel,
      ...stylex.props(styles.list, style),
      children,
    },
    "ul"
  );
  return (
    <Instructions value={instructions}>
      <ListDisabled value={disabled}>
        {list}
        <span id={instructions} hidden>
          {words.instructions}
        </span>
      </ListDisabled>
    </Instructions>
  );
};

/** One item: its handle, then what it holds. Lifted while it is moved. */
export const SortableListItem = ({
  value,
  children,
  textValue,
  disabled = false,
  style,
}: SortableListItemProps) =>
  usePart(
    sortableList,
    "item",
    { value, textValue, disabled },
    {
      className: (state: { moving: boolean; dragging: boolean }) =>
        className(
          styles.item,
          state.moving && styles.moving,
          state.dragging && styles.dragging,
          style
        ),
      // While an item is moved the items are drawn in the order being shown, and the page's own
      // order stays as it is until the new one is put down and given back: nothing is moved in the
      // document under a dragging pointer or a focused handle. At rest, no style at all.
      style: (state: { place: number | undefined }) =>
        state.place === undefined ? undefined : { order: state.place },
      children: (
        <ItemValue value={value}>
          <ItemDisabled value={disabled}>{children}</ItemDisabled>
        </ItemValue>
      ),
    },
    "li"
  );

/** The grip that moves its item: dragged, or Space and the arrows from the keyboard. */
export const SortableListHandle = ({
  "aria-label": ariaLabel,
}: SortableListHandleProps) => {
  const instructions = use(Instructions);
  const value = use(ItemValue);
  const disabled = use(ListDisabled) || use(ItemDisabled);
  return usePart(
    sortableList,
    "handle",
    // The item round it: the handle moves it.
    { value },
    {
      "aria-label": ariaLabel,
      "aria-describedby": instructions,
      disabled,
      className: (state: { moving: boolean }) =>
        className(
          styles.handle,
          state.moving && styles.handleMoving,
          disabled && styles.handleDisabled,
          focusRing
        ),
      children: (
        <>
          <span aria-hidden="true" {...stylex.props(styles.target)} />
          <Icon icon={GripVerticalIcon} />
        </>
      ),
    },
    "button"
  );
};
