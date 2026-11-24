// What the three menus share (dropdown menu, context menu and menubar), on UI SDK's Menu: an item
// with an icon, words, keys and work that can fail, checkbox and radio items, groups, labels,
// separators and submenus. Each menu draws them under its own names (its kind starts every
// part's slot, dropdown-menu-item), in the one look all three share: the raised panel
// (menuStyles).
//
//   const kind: MenuKind = "context-menu";
//   export const ContextMenuSeparator = (props: ContextMenuSeparatorProps) => (
//     <MenuSeparatorPart {...props} kind={kind} />
//   );
"use client";

import * as stylex from "@stylexjs/stylex";
import {
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSubContent,
  MenuSubTrigger,
} from "@ui-sdk/react/menu";
import type {
  MenuCheckboxItemState,
  MenuItemState,
  MenuRadioItemState,
  MenuTriggerState,
} from "@ui-sdk/react/menu";
import { useShortcutHint } from "@ui-sdk/react/shortcuts";
import { isValidElement, useId, useState } from "react";
import type {
  ComponentProps,
  ElementType,
  ReactElement,
  ReactNode,
} from "react";

import { useI18n } from "./i18n";
import { CheckIcon, ChevronRightIcon, Icon, LoaderIcon } from "./icons";
import type { IconData } from "./icons";
import { menuStyles, scrollbarHidden } from "./styles";
import { colors, media, size, space } from "./tokens.stylex";
import { popup } from "./tokens.values";
import {
  announce,
  announceWork,
  className,
  isThenable,
  listOf,
  slotted,
  slotWords,
  wordsOf,
} from "./utils";
import type { LayoutStyle } from "./utils";

/** Which menu a part is drawn for: its name, which starts each slot. */
export type MenuKind = "dropdown-menu" | "context-menu" | "menubar";

// The widest a submenu may be. UI SDK flips a submenu that does not fit beside its parent to the
// other side, and where it fits neither (a phone) shifts it over its parent, kept on screen, as a
// native menu does: but only a submenu no wider than the item that opened it (--anchor-width). So
// beside its parent a submenu takes the room UI SDK gives on its side (--available-width), and
// once shifted, its item's width, rather than growing back off the screen.
//
// Which of the two holds is read from those two numbers. Beside its parent, the room runs from
// the item's far edge (and the gap) to the gutter, so the room and the item's width together fall
// short of the window less both gutters by how far the item stands in from the near gutter: never
// less than nothing, since the parent itself stays inside the gutters. Once UI SDK has shifted a
// submenu, it gives the window less both gutters as its room, so the two together pass it by the
// item's whole width. That shortfall plus 1px, times 1000, is therefore at least 1000px beside its
// parent, more than any room, and below zero once shifted, for a parent of any width: the min
// keeps the room beside it, and the max then gives a shifted submenu its item's width. (100vw
// also counts a scrollbar, which UI SDK's window leaves out: narrower than any item, it changes
// neither.)
const SUB_ROOM = `max(var(--anchor-width, 0px), min(var(--available-width, ${size.popupWidth}), (100vw - 2 * ${space.popupGutter} - var(--available-width, 0px) - var(--anchor-width, 0px) + 1px) * 1000))`;

const styles = stylex.create({
  // The sheet a tap outside a submenu over its parent lands on (MenuSubContentPart): the whole
  // window, beneath the parent's rows, inside the parent menu, so UI SDK closes the submenu alone.
  // Only on a touch screen: under a mouse it would hold the pointer inside the parent, which loses
  // the keys' place once it goes.
  back: {
    display: { default: "none", [media.pointerCoarse]: "block" },
    position: "fixed",
    inset: 0,
    zIndex: -1,
  },
  subPanel: {
    minWidth: `min(${size.menuWidth}, ${SUB_ROOM})`,
    maxWidth: `min(${size.popupWidth}, ${SUB_ROOM})`,
  },
  // A submenu's trigger is lit while the keys or the pointer are on it, and while it is open.
  subHighlighted: {
    backgroundColor: {
      default: null,
      ":is([data-highlighted])": {
        default: colors.accentHighlight,
        [media.forcedColors]: "Highlight",
      },
    },
    color: {
      default: null,
      ":is([data-highlighted])": {
        default: colors.foreground,
        [media.forcedColors]: "HighlightText",
      },
    },
  },
});

/** The words typing finds an item by, and an agent presses it by: none when it has none. */
const nameOf = (label: string | undefined, children: ReactNode) => {
  const name = label ?? wordsOf(children);
  return name === "" ? undefined : name;
};

// ---- An item -------------------------------------------------------------------------------------

/** Every prop a menu's shortcut part takes. */
interface ShortcutPartProps {
  kind: MenuKind;
  /** The keys, like `"mod+d"`: ⌘D on a Mac, Ctrl+D elsewhere. */
  children: string;
}

/** The keys at the end of an item. Hidden from screen readers, which hear them on the item. */
export const MenuShortcutPart = ({ kind, children }: ShortcutPartProps) => {
  const hint = useShortcutHint(children);
  return (
    <MenuShortcut
      render={slotted("span", `${kind}-shortcut`)}
      {...stylex.props(menuStyles.shortcut)}
    >
      {hint.text}
    </MenuShortcut>
  );
};

/**
 * An item's parts: its words, the shortcut among them apart (it stands at the end, where work and
 * failure do), its keys, and with `asChild` the link it is drawn as, without its words.
 */
const partsOf = (
  children: ReactNode,
  asChild: boolean | undefined,
  shortcut: ElementType
) => {
  const slot = slotWords(asChild, children);
  const all = listOf(slot.children);
  const keys = all.find(
    (child): child is ReactElement<{ children: string }> =>
      isValidElement(child) && child.type === shortcut
  );
  return {
    words: all.filter((child) => child !== keys),
    keys,
    render: slot.render,
  };
};

/** What stands at the end of an item: the spinner while it works, its failure, or its keys. */
const End = ({
  state,
  errorText,
  keys,
}: {
  state: MenuItemState;
  errorText: string;
  keys: ReactElement | undefined;
}): ReactElement | null => {
  if (state.pending) {
    return (
      <span
        aria-hidden="true"
        {...stylex.props(menuStyles.shortcut, menuStyles.spinner)}
      >
        <Icon icon={LoaderIcon} />
      </span>
    );
  }
  if (state.error !== undefined) {
    return (
      <span {...stylex.props(menuStyles.shortcut, menuStyles.error)}>
        {errorText}
      </span>
    );
  }
  return keys ?? null;
};

/**
 * Waits for an item's work, which is said (announceWork: its own words at once, the catalogue's
 * once it runs long); a failure is said aloud and rejects with the words the item shows.
 */
const settle = async (
  work: PromiseLike<unknown>,
  loading: { label: string; own: boolean },
  errorText: string
) => {
  const over = announceWork(loading.label, loading.own);
  try {
    return await work;
  } catch (error) {
    announce(errorText);
    throw new Error(errorText, { cause: error });
  } finally {
    over();
  }
};

/** Every prop a menu's item part takes. */
interface ItemPartProps {
  kind: MenuKind;
  /** The menu's shortcut part, found among the words and drawn at the end. */
  shortcut: ElementType;
  children: ReactNode;
  asChild?: boolean;
  icon?: IconData;
  variant?: "default" | "destructive";
  disabled?: boolean;
  onSelect?: (event: Event) => unknown;
  closeOnSelect?: boolean;
  /**
   * Said as work that returns a Promise starts; left out, the catalogue's menu.loading is said
   * once the work has run a second.
   */
  loadingText?: string;
  /** Said and shown when that work fails. @default the catalogue's menu.error */
  errorText?: string;
  agentConfirm?: string;
  label?: string;
  style?: LayoutStyle;
}

/** An item's own props, its children read once (partsOf), and the keys it names. */
type ItemProps = Omit<
  ItemPartProps,
  "shortcut" | "children" | "asChild" | "loadingText" | "errorText"
> &
  ReturnType<typeof partsOf> & {
    keysLabel?: string;
    loadingText: string;
    /** The loading words are the caller's, not the catalogue's. */
    loadingOwn: boolean;
    errorText: string;
  };

const Item = ({
  kind,
  words,
  keys,
  render,
  keysLabel,
  icon,
  variant = "default",
  disabled,
  onSelect,
  closeOnSelect,
  loadingText,
  loadingOwn,
  errorText,
  agentConfirm,
  label,
  style,
}: ItemProps) => {
  const name = nameOf(label, words);
  const destructive = variant === "destructive";
  // Work is said (settle); work that fails is said aloud, and rejects with the words shown, so an
  // agent's press fails with them.
  const select =
    onSelect &&
    ((event: Event): unknown => {
      const result = onSelect(event);
      if (!isThenable(result)) {
        return result;
      }
      return settle(result, { label: loadingText, own: loadingOwn }, errorText);
    });
  return (
    <MenuItem
      label={name}
      disabled={disabled}
      destructive={destructive}
      closeOnSelect={closeOnSelect}
      onSelect={select}
      aria-keyshortcuts={keysLabel}
      data-agent-confirm={agentConfirm ?? (destructive ? name : undefined)}
      render={slotted("div", `${kind}-item`, render)}
      className={(state: MenuItemState) =>
        className(
          menuStyles.item,
          state.highlighted && menuStyles.highlighted,
          destructive && menuStyles.destructive,
          destructive && state.highlighted && menuStyles.destructiveHighlighted,
          state.disabled && !state.pending && menuStyles.disabled,
          state.pending && menuStyles.loading,
          style
        )
      }
    >
      {(state: MenuItemState) => (
        <>
          {icon && (
            <MenuItemIcon {...stylex.props(menuStyles.icon)}>
              <Icon icon={icon} />
            </MenuItemIcon>
          )}
          <span
            {...stylex.props(
              menuStyles.text,
              icon === undefined && menuStyles.inset
            )}
          >
            {words}
          </span>
          <End state={state} errorText={errorText} keys={keys} />
        </>
      )}
    </MenuItem>
  );
};

// The keys named to a screen reader on the item, written for the platform the same way on the
// server and on first render, then for the one it is on. Apart, as UI SDK's hint needs keys.
const ItemWithKeys = (
  props: ItemProps & { keys: ReactElement<{ children: string }> }
) => {
  const hint = useShortcutHint(props.keys.props.children);
  return <Item {...props} keysLabel={hint.ariaKeyshortcuts} />;
};

/** An action in a menu. */
export const MenuItemPart = ({
  shortcut,
  children,
  asChild,
  loadingText,
  errorText,
  ...rest
}: ItemPartProps) => {
  const { menu } = useI18n();
  const props = {
    ...rest,
    loadingText: loadingText ?? menu.loading,
    loadingOwn: loadingText !== undefined,
    errorText: errorText ?? menu.error,
  };
  const parts = partsOf(children, asChild, shortcut);
  return parts.keys === undefined ? (
    <Item {...props} {...parts} />
  ) : (
    <ItemWithKeys {...props} {...parts} keys={parts.keys} />
  );
};

// ---- Checkbox and radio items ---------------------------------------------------------------------

type CheckedChange = ComponentProps<typeof MenuCheckboxItem>["onCheckedChange"];
type ValueChange = ComponentProps<typeof MenuRadioGroup>["onValueChange"];

/** Every prop a menu's checkbox item part takes. */
interface CheckboxItemPartProps {
  kind: MenuKind;
  children: ReactNode;
  checked?: boolean;
  onCheckedChange?: CheckedChange;
  disabled?: boolean;
  closeOnSelect?: boolean;
  label?: string;
  style?: LayoutStyle;
}

/** An option that is on or off, with a tick while it is on. */
export const MenuCheckboxItemPart = ({
  kind,
  children,
  label,
  style,
  ...rest
}: CheckboxItemPartProps) => {
  // Its own, so two options with the same words are each their own.
  const value = useId();
  return (
    <MenuCheckboxItem
      {...rest}
      value={value}
      label={nameOf(label, children)}
      render={slotted("div", `${kind}-checkbox-item`)}
      className={(state: MenuCheckboxItemState) =>
        className(
          menuStyles.item,
          state.highlighted && menuStyles.highlighted,
          state.disabled && menuStyles.disabled,
          style
        )
      }
    >
      <span {...stylex.props(menuStyles.text, menuStyles.inset)}>
        {children}
      </span>
      <MenuItemIndicator {...stylex.props(menuStyles.check)}>
        <Icon icon={CheckIcon} />
      </MenuItemIndicator>
    </MenuCheckboxItem>
  );
};

/** Every prop a menu's radio group part takes. */
interface RadioGroupPartProps {
  kind: MenuKind;
  children: ReactNode;
  value?: string | null;
  onValueChange?: ValueChange;
  style?: LayoutStyle;
}

/** A set of options, one of them chosen. */
export const MenuRadioGroupPart = ({
  kind,
  children,
  style,
  ...rest
}: RadioGroupPartProps) => (
  <MenuRadioGroup
    {...rest}
    render={slotted("div", `${kind}-radio-group`)}
    {...stylex.props(style)}
  >
    {children}
  </MenuRadioGroup>
);

/** Every prop a menu's radio item part takes. */
interface RadioItemPartProps {
  kind: MenuKind;
  children: ReactNode;
  value: string;
  disabled?: boolean;
  closeOnSelect?: boolean;
  label?: string;
  style?: LayoutStyle;
}

/** One option of a radio group, with a dot while it is chosen. */
export const MenuRadioItemPart = ({
  kind,
  children,
  label,
  style,
  ...rest
}: RadioItemPartProps) => (
  <MenuRadioItem
    {...rest}
    label={nameOf(label, children)}
    render={slotted("div", `${kind}-radio-item`)}
    className={(state: MenuRadioItemState) =>
      className(
        menuStyles.item,
        state.highlighted && menuStyles.highlighted,
        state.disabled && menuStyles.disabled,
        style
      )
    }
  >
    <span {...stylex.props(menuStyles.text, menuStyles.inset)}>{children}</span>
    <MenuItemIndicator {...stylex.props(menuStyles.dot)} />
  </MenuRadioItem>
);

// ---- Groups, labels and separators ---------------------------------------------------------------

/** Every prop a menu's group, label or separator part takes. */
interface PartProps {
  kind: MenuKind;
  children?: ReactNode;
  style?: LayoutStyle;
}

/** A group of items, named by its label. */
export const MenuGroupPart = ({ kind, children, style }: PartProps) => (
  <MenuGroup render={slotted("div", `${kind}-group`)} {...stylex.props(style)}>
    {children}
  </MenuGroup>
);

/** A group's name, above its items. */
export const MenuLabelPart = ({ kind, children, style }: PartProps) => (
  <MenuGroupLabel
    render={slotted("div", `${kind}-label`)}
    {...stylex.props(menuStyles.label, style)}
  >
    {children}
  </MenuGroupLabel>
);

/** A line between groups of items, edge to edge. */
export const MenuSeparatorPart = ({ kind, style }: PartProps) => (
  <MenuSeparator
    render={slotted("div", `${kind}-separator`)}
    {...stylex.props(menuStyles.separator, style)}
  />
);

// ---- Submenus ------------------------------------------------------------------------------------

/** Every prop a menu's submenu trigger part takes. */
interface SubTriggerPartProps {
  kind: MenuKind;
  children: ReactNode;
  icon?: IconData;
  disabled?: boolean;
  style?: LayoutStyle;
}

/** The item that opens its submenu, with a chevron pointing the way it opens. */
export const MenuSubTriggerPart = ({
  kind,
  children,
  icon,
  disabled,
  style,
}: SubTriggerPartProps) => (
  <MenuSubTrigger
    disabled={disabled}
    render={slotted("div", `${kind}-sub-trigger`)}
    className={(state: MenuTriggerState) =>
      className(
        menuStyles.item,
        styles.subHighlighted,
        state.open && menuStyles.highlighted,
        state.disabled && menuStyles.disabled,
        style
      )
    }
  >
    {icon && (
      <MenuItemIcon {...stylex.props(menuStyles.icon)}>
        <Icon icon={icon} />
      </MenuItemIcon>
    )}
    <span
      {...stylex.props(menuStyles.text, icon === undefined && menuStyles.inset)}
    >
      {children}
    </span>
    <span aria-hidden="true" {...stylex.props(menuStyles.chevron)}>
      <Icon icon={ChevronRightIcon} />
    </span>
  </MenuSubTrigger>
);

/**
 * Calls `onOver` with whether a submenu stands over its parent menu, again each time UI SDK places
 * it (it writes the place into the submenu's style), and with false once it is gone.
 */
const watchOver = (submenu: HTMLElement, onOver: (over: boolean) => void) => {
  const parent = submenu.parentElement?.closest('[role="menu"]');
  const check = () => {
    const own = submenu.getBoundingClientRect();
    const theirs = parent?.getBoundingClientRect();
    onOver(
      theirs !== undefined && own.left < theirs.right && theirs.left < own.right
    );
  };
  const placed = new MutationObserver(check);
  placed.observe(submenu, { attributeFilter: ["style"] });
  check();
  return () => {
    placed.disconnect();
    onOver(false);
  };
};

/**
 * The submenu, beside its trigger. Where it stands over its parent (a phone), a tap on the
 * parent's rows still showing goes back one level without pressing the row: UI SDK closes only
 * the menus a press lands outside of, and keeps the press from what is under it. A tap anywhere
 * else outside does the same rather than closing the whole menu, since the submenu may cover every
 * row of its parent: it lands on a sheet that fills the window inside the parent menu, beneath
 * its rows. The keys close one level already (Escape, and the arrow back).
 */
export const MenuSubContentPart = ({ kind, children, style }: PartProps) => {
  const [over, setOver] = useState(false);
  return (
    <>
      {over && <div aria-hidden="true" {...stylex.props(styles.back)} />}
      <MenuSubContent
        ref={(node: HTMLDivElement | null) =>
          node === null ? undefined : watchOver(node, setOver)
        }
        sideOffset={popup.gap}
        collisionPadding={popup.gutter}
        render={slotted("div", `${kind}-sub-content`)}
        {...stylex.props(
          menuStyles.panel,
          menuStyles.motion,
          scrollbarHidden,
          styles.subPanel,
          style
        )}
      >
        {children}
      </MenuSubContent>
    </>
  );
};
