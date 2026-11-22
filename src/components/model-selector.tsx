// ModelSelector: the model an assistant answers with, chosen from a searchable list beside its
// trigger, after shadcn's Model Selector pattern (apps/v4/content/docs/ai-elements/base/
// model-selector.mdx), in Damsko's look. shadcn builds the pattern on Dropdown Menu, with the list
// a radio group holding the chosen model, and keeps the search parts on Command for a list that is
// searched; this one is searched, so it is built on Popover and Command. The models, their makers
// and their logos are the caller's: nothing here knows a model.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <ModelSelector>
//     <ModelSelectorTrigger>
//       <ModelSelectorLogo logo={makerLogo} />
//       <ModelSelectorName>{current.name}</ModelSelectorName>
//     </ModelSelectorTrigger>
//     <ModelSelectorContent footer={<EffortToggle />}>
//       <ModelSelectorInput />
//       <ModelSelectorEmpty />
//       <ModelSelectorList value={model} onValueChange={setModel}>
//         <ModelSelectorGroup heading="Maker">
//           <ModelSelectorItem value="model-a">
//             <ModelSelectorLogo logo={makerLogo} />
//             <ModelSelectorName>Model A</ModelSelectorName>
//           </ModelSelectorItem>
//         </ModelSelectorGroup>
//       </ModelSelectorList>
//     </ModelSelectorContent>
//   </ModelSelector>
//
// The trigger is named by the selector's word and the model it shows ("Model: Model A"). It opens
// on the search field; typing narrows the list, the arrows move, Enter or a press picks; the
// chosen one is marked current. Picking closes it and focus goes back to the trigger; so does
// Escape, which no listener of the page hears after it. A footer under the list holds what the
// product adds (its effort toggle). Every value is a token. A caller may set layout only (`style`).
"use client";

import * as stylex from "@stylexjs/stylex";
import { PopoverContent as PopoverContentPrimitive } from "@ui-sdk/react/popover";
import { createContext, isValidElement, use, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { CheckIcon, ChevronDownIcon, Icon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import {
  colors,
  duration,
  font,
  media,
  size,
  space,
} from "../lib/tokens.stylex";
import { popup } from "../lib/tokens.values";
import { textOf } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, motionVars } from "../lib/vars.stylex";
import { BrandIcon } from "./brand-icon";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./command";
import type { CommandSeparatorProps, CommandShortcutProps } from "./command";
import { Popover, PopoverTrigger } from "./popover";

/** Every prop a ModelSelector takes. */
export interface ModelSelectorProps {
  /** Its ModelSelectorTrigger, then its ModelSelectorContent. */
  children: ReactNode;
  /** Open now. Pass it with `onOpenChange` to open and close it yourself. */
  open?: boolean;
  /**
   * Open when the page loads.
   * @default false
   */
  defaultOpen?: boolean;
  /** Runs when it opens or closes: the trigger, a pick, Escape, a press outside or Tab out. */
  onOpenChange?: (open: boolean) => void;
}

/** Every prop a ModelSelectorTrigger takes. */
export interface ModelSelectorTriggerProps {
  /**
   * What the trigger shows: the chosen model's ModelSelectorLogo and ModelSelectorName. With
   * `asChild`, the one element drawn as the trigger.
   */
  children: ReactNode;
  /**
   * Its name, when its words do not say the model.
   * @default "Model: " and the words it shows (`modelSelector.trigger`)
   */
  "aria-label"?: string;
  /**
   * Draw the one element given as the child (a Button of your own) as the trigger.
   * @default false
   */
  asChild?: boolean;
  /**
   * Out of use: it does not open. Say why near it.
   * @default false
   */
  disabled?: boolean;
  /** Layout only: where it sits and how much room it takes. */
  style?: LayoutStyle;
}

/** Every prop a ModelSelectorContent takes. */
export interface ModelSelectorContentProps {
  /** Its ModelSelectorInput, ModelSelectorEmpty and ModelSelectorList. */
  children: ReactNode;
  /** Under the list, across the panel: what the product adds there, such as its effort toggle. */
  footer?: ReactNode;
  /**
   * The side of the trigger it opens on. It flips when there is no room.
   * @default "bottom"
   */
  side?: "top" | "bottom" | "left" | "right";
  /**
   * How it lines up with the trigger; `start` and `end` follow the reading direction.
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /** Layout only: its width. */
  style?: LayoutStyle;
}

/** Every prop a ModelSelectorInput takes. */
export interface ModelSelectorInputProps {
  /**
   * The search field's name.
   * @default "Search models" (`modelSelector.search`)
   */
  "aria-label"?: string;
  /**
   * What the empty field says.
   * @default "Search models" (`modelSelector.search`)
   */
  placeholder?: string;
}

/** Every prop a ModelSelectorList takes. */
export interface ModelSelectorListProps {
  /** Its ModelSelectorGroup parts, or ModelSelectorItem parts straight in it. */
  children: ReactNode;
  /** The chosen model's value: its item is marked current. */
  value?: string;
  /** Runs with the model picked. The list closes. */
  onValueChange?: (value: string) => void;
}

/** Every prop a ModelSelectorEmpty takes. */
export interface ModelSelectorEmptyProps {
  /**
   * What the list says when no model matches.
   * @default "No models" (`modelSelector.empty`)
   */
  children?: ReactNode;
}

/** Every prop a ModelSelectorGroup takes. */
export interface ModelSelectorGroupProps {
  /** The maker's name, small and quiet over its models. */
  heading?: string;
  /** Its ModelSelectorItem parts. */
  children: ReactNode;
}

/** Every prop a ModelSelectorItem takes. */
export interface ModelSelectorItemProps {
  /** What `onValueChange` receives when it is picked. Unique in the list. */
  value: string;
  /** The model's ModelSelectorLogo and ModelSelectorName, and a ModelSelectorShortcut at the end. */
  children: ReactNode;
  /**
   * The words typing matches and the item is named by.
   * @default the words of its children
   */
  label?: string;
  /** Other words typing finds it by (its maker, an older name). */
  keywords?: string[];
  /** A second, quiet line under its name: what it is good at, or why it cannot be picked. */
  description?: ReactNode;
  /**
   * Out of use: the keys and the pointer pass it. Say why in its `description`.
   * @default false
   */
  disabled?: boolean;
}

/** Every prop a ModelSelectorLogo takes. */
export interface ModelSelectorLogoProps {
  /** The maker's logo, from the product's own (an IconData made with lib/icons' `filledMark`). */
  logo: IconData;
  /**
   * The maker's name, when the logo stands without it in words beside it. Left out, the logo is
   * decoration.
   */
  label?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a ModelSelectorLogoGroup takes. */
export interface ModelSelectorLogoGroupProps {
  /** Its ModelSelectorLogo parts: the makers a model is offered by. */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a ModelSelectorName takes. */
export interface ModelSelectorNameProps {
  /** The model's name, as its maker writes it. Cut with an ellipsis where there is no room. */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a ModelSelectorShortcut takes: the keys, as Command's shortcut takes them. */
export type ModelSelectorShortcutProps = CommandShortcutProps;

/** Every prop a ModelSelectorSeparator takes. */
export type ModelSelectorSeparatorProps = CommandSeparatorProps;

const MOVING = ":is([data-starting-style], [data-ending-style])";

const styles = stylex.create({
  // No box of its own: the trigger stands where it is, the panel in its layer.
  root: { display: "contents" },
  // The panel: Command's own surface, beside the trigger, never wider than the window less the
  // gutter. It grows from the trigger and leaves faster; with reduced motion, at once.
  panel: {
    display: "flex",
    boxSizing: "border-box",
    width: `min(${size.popoverWidth}, 100vw - 2 * ${space.popupGutter})`,
    maxHeight: `min(${size.popupHeight}, var(--available-height, ${size.popupHeight}))`,
    outline: "none",
    transformOrigin: "var(--transform-origin)",
    opacity: { default: 1, [MOVING]: 0 },
    transform: { default: "none", [MOVING]: `scale(${size.popupFromScale})` },
    transitionProperty: "opacity, transform",
    transitionDuration: {
      default: motionVars.popup,
      ":is([data-ending-style])": motionVars.leave,
    },
    transitionTimingFunction: duration.ease,
  },
  // The product's row under the list, a hairline above it.
  footer: {
    paddingBlock: space["2"],
    paddingInline: space.popupPadding,
    borderBlockStartWidth: size.hairline,
    borderBlockStartStyle: "solid",
    borderBlockStartColor: {
      default: colors.border,
      [media.forcedColors]: "CanvasText",
    },
  },
  slot: { display: "contents" },
  // The trigger's and an item's logo and name, on one line.
  name: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logo: {
    display: "inline-flex",
    flexShrink: 0,
  },
  logoGroup: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    columnGap: space["1"],
  },
  // The chosen model's tick, in ink.
  check: {
    [iconVars.size]: size.iconSm,
    display: "inline-flex",
    color: colors.foreground,
  },
  chevron: {
    display: "inline-flex",
    flexShrink: 0,
    color: colors.mutedForeground,
  },
  words: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: space["2"],
    minWidth: 0,
    fontFamily: font.sans,
  },
});

// What closes the selector, for its panel and its list.
const CloseContext = createContext<(() => void) | null>(null);

/** The chosen model, and what picks one: the list's. */
interface Choice {
  value: string | undefined;
  pick: (value: string) => void;
}

const ChoiceContext = createContext<Choice | null>(null);

const useClose = (part: string): (() => void) => {
  const close = use(CloseContext);
  if (close === null) {
    throw new Error(`${part} must be inside a ModelSelector.`);
  }
  return close;
};

/** The model picker: its trigger and its panel, open or closed. */
export const ModelSelector = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}: ModelSelectorProps) => {
  const [openHere, setOpenHere] = useState(defaultOpen);
  const shown = open ?? openHere;
  const change = (next: boolean) => {
    setOpenHere(next);
    onOpenChange?.(next);
  };
  const close = () => {
    change(false);
  };
  return (
    <span data-slot="model-selector" {...stylex.props(styles.root)}>
      <Popover
        open={shown}
        onOpenChange={(next: boolean) => {
          change(next);
        }}
      >
        {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled */}
        <CloseContext value={close}>{children}</CloseContext>
      </Popover>
    </span>
  );
};

/** The control that opens the list, named by the selector's word and the model it shows. */
export const ModelSelectorTrigger = ({
  children,
  "aria-label": named,
  asChild = false,
  disabled,
  style,
}: ModelSelectorTriggerProps) => {
  const words = useI18n().modelSelector;
  const shows = textOf(children).trim();
  const label =
    named ??
    (shows === "" ? words.trigger : words.triggerWith(words.trigger, shows));
  return (
    <span data-slot="model-selector-trigger" {...stylex.props(styles.slot)}>
      <PopoverTrigger asChild aria-label={label} disabled={disabled}>
        {asChild ? (
          children
        ) : (
          <Button variant="ghost" size="sm" style={style}>
            <span {...stylex.props(styles.words)}>{children}</span>
            <span aria-hidden="true" {...stylex.props(styles.chevron)}>
              <Icon icon={ChevronDownIcon} />
            </span>
          </Button>
        )}
      </PopoverTrigger>
    </span>
  );
};

/**
 * The panel: the search, the list and a footer, beside the trigger. Escape closes it, and no
 * listener of the page hears that Escape and closes more.
 */
export const ModelSelectorContent = ({
  children,
  footer,
  side = "bottom",
  align = "start",
  style,
}: ModelSelectorContentProps) => {
  const closeSelector = useClose("ModelSelectorContent");
  // One Escape closes the panel and nothing more: the page's own Escape (closing a chat) does not
  // hear it, whatever the search field did with it first.
  const close = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closeSelector();
    }
  };
  return (
    <PopoverContentPrimitive
      render={<div data-slot="model-selector-content" />}
      side={side}
      align={align}
      sideOffset={popup.popoverGap}
      collisionPadding={popup.gutter}
      onKeyDown={close}
      {...stylex.props(styles.panel, style)}
    >
      <Command>
        {children}
        {footer === undefined || footer === null ? null : (
          <div
            data-slot="model-selector-footer"
            {...stylex.props(styles.footer)}
          >
            {footer}
          </div>
        )}
      </Command>
    </PopoverContentPrimitive>
  );
};

/** The search field over the list, with its icon; it takes focus as the panel opens. */
export const ModelSelectorInput = ({
  "aria-label": named,
  placeholder,
}: ModelSelectorInputProps) => {
  const words = useI18n().modelSelector;
  return (
    <div data-slot="model-selector-input" {...stylex.props(styles.slot)}>
      <CommandInput
        aria-label={named ?? words.search}
        placeholder={placeholder ?? words.search}
      />
    </div>
  );
};

/** The models, under the search, holding which is chosen; it scrolls past the panel's height. */
export const ModelSelectorList = ({
  children,
  value,
  onValueChange,
}: ModelSelectorListProps) => {
  const close = useClose("ModelSelectorList");
  const choice: Choice = {
    value,
    pick: (picked) => {
      onValueChange?.(picked);
      close();
    },
  };
  return (
    <div data-slot="model-selector-list" {...stylex.props(styles.slot)}>
      {/* oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled */}
      <ChoiceContext value={choice}>
        <CommandList>{children}</CommandList>
      </ChoiceContext>
    </div>
  );
};

/** What the list says when no model matches. */
export const ModelSelectorEmpty = ({ children }: ModelSelectorEmptyProps) => {
  const words = useI18n().modelSelector;
  return (
    <div data-slot="model-selector-empty" {...stylex.props(styles.slot)}>
      <CommandEmpty>{children ?? words.empty}</CommandEmpty>
    </div>
  );
};

/** One maker's models, under its name; it hides while none of them matches. */
export const ModelSelectorGroup = ({
  heading,
  children,
}: ModelSelectorGroupProps) => (
  <CommandGroup heading={heading}>{children}</CommandGroup>
);

/** Whether a child is the item's shortcut. */
const isKeys = (child: ReactNode) =>
  isValidElement(child) && child.type === CommandShortcut;

/** One model: Enter or a press picks it and closes the list. The chosen one is marked current. */
export const ModelSelectorItem = ({
  value,
  children,
  label,
  keywords,
  description,
  disabled,
}: ModelSelectorItemProps) => {
  const choice = use(ChoiceContext);
  if (choice === null) {
    throw new Error("ModelSelectorItem must be inside a ModelSelectorList.");
  }
  const chosen = choice.value === value;
  // The logo and the name stand together; a shortcut stays a child of its own, so the command
  // finds it and puts it at the end.
  const all = [children].flat();
  const keys = all.find(isKeys);
  const words = all.filter((child) => !isKeys(child));
  return (
    <CommandItem
      value={value}
      label={label ?? textOf(children).trim()}
      keywords={keywords}
      description={description}
      disabled={disabled}
      current={chosen}
      end={
        chosen ? (
          <span aria-hidden="true" {...stylex.props(styles.check)}>
            <Icon icon={CheckIcon} />
          </span>
        ) : undefined
      }
      onAction={() => {
        choice.pick(value);
      }}
    >
      <span {...stylex.props(styles.words)}>{words}</span>
      {keys ?? null}
    </CommandItem>
  );
};

/** A maker's logo, beside the model's name. */
export const ModelSelectorLogo = ({
  logo,
  label,
  style,
}: ModelSelectorLogoProps) => (
  <span data-slot="model-selector-logo" {...stylex.props(styles.logo, style)}>
    <BrandIcon
      logo={logo}
      label={label ?? ""}
      decorative={label === undefined}
      tile={false}
    />
  </span>
);

/** A few makers' logos in a row. */
export const ModelSelectorLogoGroup = ({
  children,
  style,
}: ModelSelectorLogoGroupProps) => (
  <span
    data-slot="model-selector-logo-group"
    {...stylex.props(styles.logoGroup, style)}
  >
    {children}
  </span>
);

/** The model's name. */
export const ModelSelectorName = ({
  children,
  style,
}: ModelSelectorNameProps) => (
  <span data-slot="model-selector-name" {...stylex.props(styles.name, style)}>
    {children}
  </span>
);

// The keys at an item's end that pick it while the list is open (`"mod+1"`), and the hairline
// between groups: Command's own, so an item finds its shortcut among its children.
export {
  CommandShortcut as ModelSelectorShortcut,
  CommandSeparator as ModelSelectorSeparator,
} from "./command";
