// UserPicker: choose a person by typing a few letters of their name, built on UI SDK's Combobox
// and the library's InputGroup and Avatar: closed, an InputGroup with the chosen person's Avatar at
// its start and a chevron at its end; open, the list Combobox and Select share (lib/styles
// listStyles), each person with their avatar and a muted line (a role or an email) that a search
// also finds.
//
//   <Field>
//     <FieldLabel>Assignee</FieldLabel>
//     <UserPicker users={team} defaultValue="amara" />
//   </Field>
//
// The people are data, given by the page, so an agent can choose one by name and is refused anyone
// not in the list. Emptying the words clears the choice. Each avatar is decorative: the row and the
// field are named by the person's name.
"use client";

import * as stylex from "@stylexjs/stylex";
import type { ChangeDetails } from "@ui-sdk/core";
import {
  Combobox as ComboboxPrimitive,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIcon,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValueIcon,
} from "@ui-sdk/react/combobox";
import type {
  ComboboxInputState,
  ComboboxItemState,
  ComboboxItemTextState,
  ComboboxQueryChangeReason,
  ComboboxTriggerState,
  ComboboxValueChangeReason,
  ListData,
  ListItem,
} from "@ui-sdk/react/combobox";
import { useId, useRef, useState } from "react";

import { useI18n } from "../lib/i18n";
import { CheckIcon, ChevronDownIcon, Icon, UsersIcon } from "../lib/icons";
import { pressedJustNow, transformOriginFrom } from "../lib/layer";
import { listStyles, scrollbarHidden } from "../lib/styles";
import {
  colors,
  duration,
  font,
  media,
  size,
  space,
} from "../lib/tokens.stylex";
import { popup } from "../lib/tokens.values";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, listMarker, motionVars } from "../lib/vars.stylex";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { InputGroup, InputGroupAddon } from "./input-group";

/** One person who can be chosen. */
export interface UserPickerUser {
  /** A unique, lasting id: what the form sends ("amara"). */
  id: string;
  /** Their name, as the team knows it ("Amara Okafor"). Typing finds it. */
  name: string;
  /** A line under the name in the list: their role or email. Typing finds it too. */
  detail?: string;
  /** Their picture. Until it loads, and if it fails, their initials show. */
  src?: string;
}

/** Every prop a UserPicker takes. */
export interface UserPickerProps {
  /** Everyone who can be chosen, in the order the list shows them. */
  users: readonly UserPickerUser[];
  /** The chosen person's id at first. Leave it out for no one. A form reset returns here. */
  defaultValue?: string | null;
  /** The chosen person's id, when you keep it in state. `null` is no one. Pair it with `onValueChange`. */
  value?: string | null;
  /**
   * Called with the new person's id, or `null` when the words are emptied, and why it changed.
   * `details.source` is `"agent"` when an agent chose.
   */
  onValueChange?: (
    id: string | null,
    details: ChangeDetails<ComboboxValueChangeReason>
  ) => void;
  /** What it says while no one is chosen: a verb and the thing ("Choose an assignee"). */
  placeholder?: string;
  /** The name the id is sent under in a form. Inside a Field, the Field's `name` serves. */
  name?: string;
  /** Needs someone before the form is sent. @default false */
  required?: boolean;
  /** Shows who is chosen and is sent, but does not open. @default false */
  readOnly?: boolean;
  /** Out of use: not focusable, not sent, half strength. @default false */
  disabled?: boolean;
  /** Its name when no FieldLabel names it ("Assignee"). */
  "aria-label"?: string;
  /** Layout only: margins, alignment and width. */
  style?: LayoutStyle;
}

const HOVER = media.hover;
const COARSE = media.pointerCoarse;
const FORCED = media.forcedColors;

const styles = stylex.create({
  // The root: the box the list lines up with, as wide as its column.
  root: {
    position: "relative",
    display: "flex",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
  // The input draws no edge or fill of its own: the InputGroup round it draws them.
  input: {
    position: "relative",
    flexGrow: 1,
    alignSelf: "stretch",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    margin: 0,
    paddingBlock: 0,
    paddingInline: space[2],
    appearance: "none",
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    outline: "none",
    color: {
      default: colors.foreground,
      ":read-only:not(:disabled)": colors.inputInkRead,
    },
    caretColor: { default: colors.foreground, ":read-only": "transparent" },
    font: "inherit",
    letterSpacing: "normal",
    textAlign: "start",
    textOverflow: "ellipsis",
    cursor: {
      default: "text",
      ":read-only:not(:disabled)": "default",
      ":disabled": "not-allowed",
    },
    "::selection": {
      backgroundColor: colors.inputSelection,
      color: colors.foreground,
    },
    "::placeholder": {
      color: colors.mutedForeground,
      opacity: 1,
      textOverflow: "ellipsis",
    },
  },
  // The chosen person's avatar, or a quiet icon while there is none, at the start of the field.
  start: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.avatarXs,
    color: colors.mutedForeground,
    pointerEvents: "none",
  },
  // UI SDK's value icon: the chosen person's avatar from the list, over the quiet icon, so it is
  // always the real one, after a reset, Escape or an agent's change too.
  value: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  valueSearching: { visibility: "hidden" },
  // The chevron at the end opens the list for a pointer; the keyboard opens it from the input, so
  // the chevron stays out of the Tab order.
  trigger: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    alignSelf: "stretch",
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: {
      default: colors.mutedForeground,
      ":hover": { default: null, [HOVER]: colors.foreground },
    },
    cursor: "pointer",
    outline: "none",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
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
  triggerOff: { cursor: "default", pointerEvents: "none" },
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
  content: { minWidth: "var(--anchor-width)" },
  // A person in the list: avatar, name over their line, the tick at the end.
  row: { paddingBlock: space[1] },
  icon: { display: "flex", flexShrink: 0 },
  person: { display: "grid", minWidth: 0, flexGrow: 1 },
  line: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    // In forced colours it takes the highlighted row's own colour.
    color: { default: colors.mutedForeground, [FORCED]: "inherit" },
    overflowWrap: "anywhere",
  },
});

const className = (...parts: (stylex.StyleXStyles | false)[]) =>
  stylex.props(...parts).className;

// Whether a person has a line about them to show and to search by.
const hasDetail = (
  user: UserPickerUser
): user is UserPickerUser & { detail: string } =>
  user.detail !== undefined && user.detail !== "";

// The value of one entry in the list: every item here is a person's id.
const valueOf = (entry: unknown): string | undefined =>
  typeof entry === "object" &&
  entry !== null &&
  "value" in entry &&
  typeof entry.value === "string"
    ? entry.value
    : undefined;

/** A face for a person, beside their written name: decorative. */
const Face = ({ user }: { user: UserPickerUser }) => (
  <Avatar name={user.name} size="xs" decorative>
    <AvatarImage src={user.src} />
    <AvatarFallback />
  </Avatar>
);

/** One person in the list: their avatar, their name and line, the tick when chosen. */
const UserItem = ({
  user,
  lineId,
}: {
  user: UserPickerUser;
  lineId: string;
}) => {
  const lined = hasDetail(user);
  return (
    <ComboboxItem
      value={user.id}
      label={user.name}
      keywords={lined ? [user.detail] : undefined}
      // Its name is the person's; their line is read after it, not run into it.
      aria-label={user.name}
      aria-describedby={lined ? lineId : undefined}
      render={<div data-slot="user-picker-item" />}
      className={(state: ComboboxItemState) =>
        className(
          listStyles.item,
          styles.row,
          state.highlighted && listStyles.itemHighlighted,
          state.disabled && listStyles.itemDisabled
        )
      }
    >
      <ComboboxItemIcon {...stylex.props(styles.icon)}>
        <Face user={user} />
      </ComboboxItemIcon>
      <span {...stylex.props(styles.person)}>
        <ComboboxItemText {...stylex.props(listStyles.itemText)}>
          {(state: ComboboxItemTextState) =>
            state.segments.map((segment, index) =>
              segment.match ? (
                // A match has no id of its own; its place in the name is its key.
                <mark key={index} {...stylex.props(listStyles.match)}>
                  {segment.text}
                </mark>
              ) : (
                segment.text
              )
            )
          }
        </ComboboxItemText>
        {lined && (
          <span id={lineId} {...stylex.props(styles.line)}>
            {user.detail}
          </span>
        )}
      </span>
      <ComboboxItemIndicator {...stylex.props(listStyles.check)}>
        <Icon icon={CheckIcon} />
      </ComboboxItemIndicator>
    </ComboboxItem>
  );
};

/** Choose a person by typing a few letters of their name. */
export const UserPicker = ({
  users,
  value: given,
  defaultValue = null,
  onValueChange,
  placeholder,
  style,
  "aria-label": ariaLabel,
  ...options
}: UserPickerProps) => {
  const words = useI18n().userPicker;
  // Opened by a press on the chevron, the list grows from that button; by typing, from the field.
  const chevron = useRef<HTMLButtonElement>(null);
  const pressedAt = useRef(0);
  const fromChevron = transformOriginFrom(() =>
    pressedJustNow(pressedAt.current) ? chevron.current : null
  );
  // The list lines up with the whole field, avatar and chevron included, not the input alone.
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const byId = new Map(users.map((user) => [user.id, user]));
  // Each person's place in the list: their line's id is built from it, as an id may hold a space,
  // which would split an IDREF.
  const placeOf = new Map(users.map((user, at) => [user.id, at]));
  const items: ListData = users.map((user): ListItem => ({
    value: user.id,
    label: user.name,
    keywords: hasDetail(user) ? [user.detail] : undefined,
  }));
  const ids = useId();
  // UI SDK's value icon fills in once the list has been open, so until then the chosen person's
  // avatar is drawn from a mirror of the value, under it. The mirror follows only changes that
  // went through.
  const [mirror, setMirror] = useState<string | null>(defaultValue);
  const shown = given === undefined ? mirror : given;
  const chosen = shown !== null && shown !== "" ? byId.get(shown) : undefined;
  // While the words typed are a search, not the chosen person's name, their avatar steps aside for
  // the quiet icon: the picture never claims the words are theirs.
  const [searching, setSearching] = useState(false);

  const change = (
    next: string | null,
    details: ChangeDetails<ComboboxValueChangeReason>
  ) => {
    // Only someone in the list can be chosen: anyone else is refused, and an agent hears why.
    if (next !== null && !byId.has(next)) {
      details.cancel();
      if (details.source === "agent") {
        throw new Error(words.notInList(next));
      }
      return;
    }
    onValueChange?.(next, details);
    if (!details.canceled) {
      setMirror(next);
    }
  };

  return (
    <ComboboxPrimitive
      items={items}
      autoHighlight="always"
      {...options}
      {...(given === undefined ? { defaultValue } : { value: given })}
      onValueChange={change}
      onQueryChange={(
        query: string,
        details: ChangeDetails<ComboboxQueryChangeReason>
      ) => {
        setSearching(
          details.reason === "input-change" &&
            query !== "" &&
            query !== chosen?.name
        );
      }}
    >
      <div
        ref={setAnchor}
        data-slot="user-picker"
        {...stylex.props(styles.root, style)}
      >
        <InputGroup>
          <InputGroupAddon>
            <span aria-hidden="true" {...stylex.props(styles.start)}>
              {chosen && !searching ? (
                <Face user={chosen} />
              ) : (
                <Icon icon={UsersIcon} />
              )}
              <ComboboxValueIcon
                aria-hidden="true"
                {...stylex.props(
                  styles.value,
                  searching && styles.valueSearching
                )}
              />
            </span>
          </InputGroupAddon>
          <ComboboxInput
            aria-label={ariaLabel}
            placeholder={placeholder ?? words.placeholder}
            render={(
              props: Record<string, unknown>,
              _state: ComboboxInputState
            ) => (
              <input
                {...props}
                data-slot="user-picker-input"
                {...stylex.props(styles.input)}
              />
            )}
          />
          <InputGroupAddon align="inline-end">
            <ComboboxTrigger
              ref={chevron}
              onPointerDown={(event) => {
                pressedAt.current =
                  Date.now() - (performance.now() - event.timeStamp);
              }}
              aria-label={words.trigger}
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
          </InputGroupAddon>
        </InputGroup>
      </div>
      <ComboboxContent
        ref={fromChevron}
        anchor={anchor ?? undefined}
        sideOffset={popup.gap}
        collisionPadding={popup.gutter}
        {...stylex.props(
          listMarker,
          listStyles.popup,
          styles.content,
          scrollbarHidden
        )}
      >
        <ComboboxEmpty {...stylex.props(listStyles.empty)}>
          {words.empty}
        </ComboboxEmpty>
        <ComboboxList>
          {(state: { items: ListData<unknown> }) =>
            state.items.map((entry) => {
              const id = valueOf(entry);
              const user = id === undefined ? undefined : byId.get(id);
              return user === undefined ? null : (
                <UserItem
                  key={user.id}
                  user={user}
                  lineId={`${ids}-${String(placeOf.get(user.id) ?? 0)}`}
                />
              );
            })
          }
        </ComboboxList>
      </ComboboxContent>
    </ComboboxPrimitive>
  );
};
