// Queue: what waits while an answer is written, the messages a person sent ahead and the to-dos an
// assistant keeps, as shadcn's Queue pattern (apps/v4/content/docs/ai-elements/base/queue.mdx) builds
// it: a Trace with a TraceCollapsible for each section, its line the section's count and label, the
// items a Trace of TraceLines under it. Every look and announcement is Trace's; an item's actions
// and the files a message carries stand in its line.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <Queue>
//     <QueueSection>
//       <QueueSectionTrigger>
//         <QueueSectionLabel count={left.length} label="to do" icon={ListIcon} />
//       </QueueSectionTrigger>
//       <QueueSectionContent>
//         <QueueList>
//           {todos.map((todo) => (
//             <QueueItem key={todo.id} status={todo.done ? undefined : todo.running ? "running" : "pending"}>
//               <QueueItemIndicator completed={todo.done} />
//               <QueueItemContent>{todo.title}</QueueItemContent>
//             </QueueItem>
//           ))}
//         </QueueList>
//       </QueueSectionContent>
//     </QueueSection>
//   </Queue>
//
// It shows a queue; the product keeps it: what is in it, its order and what an action does. A
// section starts open; its trigger is a button with `aria-expanded`. A done to-do says so in words,
// not by its mark alone. A to-do not yet started is `pending` and the one under way `running`: one
// that finishes on its line (its status gone) is said once, as Trace says a line that is done; one
// that only moves to another list is a new line there, and silent. An image's address comes from a model or a person: only one that is safe to
// load shows. A caller may set layout only (the `style` prop).
"use client";

import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { useI18n } from "../lib/i18n";
import { CircleCheckIcon, CircleIcon, Icon, PaperclipIcon } from "../lib/icons";
import type { IconData } from "../lib/icons";
import { visuallyHidden } from "../lib/styles";
import { colors, font, media, radius, size, space } from "../lib/tokens.stylex";
import { safeMediaSrc } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars } from "../lib/vars.stylex";
import { Button } from "./button";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./trace";
import type { TraceLineProps } from "./trace";

/** Every prop a Queue takes. */
export interface QueueProps {
  /** Its QueueSections, or one QueueList. */
  children: ReactNode;
  /** Where it sits and how wide it is. */
  style?: LayoutStyle;
}

/** Every prop a QueueSection takes. */
export interface QueueSectionProps {
  /** Its QueueSectionTrigger, then its QueueSectionContent. */
  children: ReactNode;
  /** Whether it is open. Pass it with `onOpenChange` to control it. */
  open?: boolean;
  /**
   * Whether it starts open, when you do not control it.
   * @default true
   */
  defaultOpen?: boolean;
  /** Runs with the new state when the trigger is pressed. */
  onOpenChange?: (open: boolean) => void;
}

/** Every prop a QueueSectionTrigger takes. */
export interface QueueSectionTriggerProps {
  /** Its QueueSectionLabel. */
  children: ReactNode;
}

/** Every prop a QueueSectionLabel takes. */
export interface QueueSectionLabelProps {
  /** What the section holds, in a word or two, after its count ("to do", "completed", "queued"). */
  label: string;
  /** How many it holds: said before the label ("3 to do"). Leave it out for the label alone. */
  count?: number;
  /** A mark before the words, from lib/icons. */
  icon?: IconData;
}

/** Every prop a QueueSectionContent takes. */
export interface QueueSectionContentProps {
  /** Its QueueList. */
  children: ReactNode;
}

/** Every prop a QueueList takes. */
export interface QueueListProps {
  /** Its QueueItems, in the order they will be taken. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a QueueItem takes: a TraceLine's. */
export type QueueItemProps = TraceLineProps;

/** Every prop a QueueItemIndicator takes. */
export interface QueueItemIndicatorProps {
  /**
   * The to-do is done: the ticked circle, and a screen reader hears so.
   * @default false
   */
  completed?: boolean;
}

/** Every prop a QueueItemContent takes. */
export interface QueueItemContentProps {
  /** Its words: a to-do's title, a message's text. */
  children: ReactNode;
}

/** Every prop a QueueItemDescription takes. */
export interface QueueItemDescriptionProps {
  /** A quiet note after its words. */
  children: ReactNode;
}

/** Every prop a QueueItemActions takes. */
export interface QueueItemActionsProps {
  /** Its QueueItemActions, at the end of the item's line. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a QueueItemAction takes. */
export interface QueueItemActionProps {
  /** Its mark: an `<Icon />`. */
  children: ReactNode;
  /** What it does, for a screen reader, a voice command and an agent ("Remove", "Send now"). */
  "aria-label": string;
  /** Runs when it is pressed. */
  onClick?: () => void;
  /**
   * Out of use: no press, half strength.
   * @default false
   */
  disabled?: boolean;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a QueueItemAttachment takes. */
export interface QueueItemAttachmentProps {
  /** Its QueueItemImages and QueueItemFiles, in a row of their own under the words. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a QueueItemImage takes. */
export interface QueueItemImageProps {
  /**
   * Where the picture loads from: a picture written into the address (`data:image/png;base64,…`),
   * one the page made (`blob:`), or a path on this site; an `http(s)` address only with
   * `allowRemote`. Any other loads nothing, and the image is not drawn.
   */
  src: string;
  /**
   * Loads an `http(s)` `src` too. Turn it on only for a source you trust: a picture's address that
   * a model or another person wrote tells its site who looked at it, and when.
   * @default false
   */
  allowRemote?: boolean;
  /**
   * What it shows, for a screen reader. Left empty, it is a preview a screen reader passes over.
   * @default ""
   */
  alt?: string;
  /** Where it sits. */
  style?: LayoutStyle;
}

/** Every prop a QueueItemFile takes. */
export interface QueueItemFileProps {
  /** The file's name ("brief.pdf"): cut short with an ellipsis when long. */
  children: ReactNode;
  /** Where it sits. */
  style?: LayoutStyle;
}

const FORCED = media.forcedColors;

const styles = stylex.create({
  // At the end of the item's line.
  actions: {
    display: "flex",
    alignItems: "center",
    gap: space["1"],
    marginInlineStart: "auto",
  },
  // A row of its own under the words.
  attachment: {
    display: "flex",
    flexBasis: "100%",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
    paddingBlockStart: space["1"],
  },
  image: {
    display: "block",
    flexShrink: 0,
    boxSizing: "border-box",
    width: size.controlSm,
    height: size.controlSm,
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.border, [FORCED]: "CanvasText" },
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    objectFit: "cover",
  },
  // A file: its paperclip and its name, on a quiet chip.
  file: {
    [iconVars.size]: size.badgeIcon,
    [iconVars.stroke]: size.iconStroke,
    display: "inline-flex",
    alignItems: "center",
    gap: space["1"],
    boxSizing: "border-box",
    maxWidth: "100%",
    height: size.chip,
    paddingInline: space["2"],
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.border, [FORCED]: "CanvasText" },
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    color: colors.foreground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  fileMark: {
    display: "inline-flex",
    flexShrink: 0,
    color: colors.mutedForeground,
  },
  fileName: {
    minWidth: 0,
    maxWidth: `calc(${size.popupWidth} / 3)`,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

/** What waits while an answer is written: its sections, or one list. */
export const Queue = ({ children, style }: QueueProps) => (
  <Trace style={style}>{children}</Trace>
);

/** One section of the queue, open at first: its line, and the list it folds. */
export const QueueSection = ({
  children,
  open,
  defaultOpen = true,
  onOpenChange,
}: QueueSectionProps) => (
  <TraceCollapsible
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
  >
    {children}
  </TraceCollapsible>
);

/** The section's line: a button that folds and opens its list. */
export const QueueSectionTrigger = ({ children }: QueueSectionTriggerProps) => (
  <TraceCollapsibleTrigger>{children}</TraceCollapsibleTrigger>
);

/** What the section holds and how many: its mark, then its words. */
export const QueueSectionLabel = ({
  label,
  count,
  icon,
}: QueueSectionLabelProps) => {
  const words = useI18n().queue;
  return (
    <TraceLine>
      {icon === undefined ? null : (
        <TraceIcon>
          <Icon icon={icon} />
        </TraceIcon>
      )}
      <TraceTitle>
        {count === undefined ? label : words.section(count, label)}
      </TraceTitle>
    </TraceLine>
  );
};

/** What the line folds: the section's list. */
export const QueueSectionContent = ({ children }: QueueSectionContentProps) => (
  <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
);

/** The items, one under another. */
export const QueueList = ({ children, style }: QueueListProps) => (
  <Trace style={style}>{children}</Trace>
);

/** One message or to-do in the list: a line, running while it is being worked on. */
export const QueueItem = (props: QueueItemProps) => <TraceLine {...props} />;

/** A to-do's mark: a circle, ticked once it is done; done is said in words to a screen reader. */
export const QueueItemIndicator = ({
  completed = false,
}: QueueItemIndicatorProps) => {
  const words = useI18n().queue;
  return (
    <>
      <TraceIcon>
        <Icon icon={completed ? CircleCheckIcon : CircleIcon} />
      </TraceIcon>
      {completed && (
        <span {...stylex.props(visuallyHidden)}>{`${words.completed}, `}</span>
      )}
    </>
  );
};

/** The item's words. */
export const QueueItemContent = ({ children }: QueueItemContentProps) => (
  <TraceTitle>{children}</TraceTitle>
);

/** A quiet note after the item's words. */
export const QueueItemDescription = ({
  children,
}: QueueItemDescriptionProps) => (
  <TraceDescription>{children}</TraceDescription>
);

/** The item's actions, at the end of its line. */
export const QueueItemActions = ({
  children,
  style,
}: QueueItemActionsProps) => (
  <span data-slot="queue-item-actions" {...stylex.props(styles.actions, style)}>
    {children}
  </span>
);

/** One action on the item: a small quiet button with its mark, named by `aria-label`. */
export const QueueItemAction = ({
  children,
  "aria-label": label,
  onClick,
  disabled,
  style,
}: QueueItemActionProps) => (
  <Button
    variant="ghost"
    size="icon-xs"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    style={style}
  >
    {children}
  </Button>
);

/** The files a queued message carries, in a row under its words. */
export const QueueItemAttachment = ({
  children,
  style,
}: QueueItemAttachmentProps) => (
  <span
    data-slot="queue-item-attachment"
    {...stylex.props(styles.attachment, style)}
  >
    {children}
  </span>
);

/** A small preview of an image the message carries, when its address is safe to load. */
export const QueueItemImage = ({
  src,
  alt = "",
  allowRemote = false,
  style,
}: QueueItemImageProps) => {
  const safe = safeMediaSrc(src, { remote: allowRemote });
  if (safe === null) {
    return null;
  }
  return (
    <img
      src={safe}
      alt={alt}
      width={32}
      height={32}
      data-slot="queue-item-image"
      {...stylex.props(styles.image, style)}
    />
  );
};

/** A file the message carries: a paperclip and its name. */
export const QueueItemFile = ({ children, style }: QueueItemFileProps) => (
  <span data-slot="queue-item-file" {...stylex.props(styles.file, style)}>
    <span aria-hidden="true" {...stylex.props(styles.fileMark)}>
      <Icon icon={PaperclipIcon} />
    </span>
    <span {...stylex.props(styles.fileName)}>{children}</span>
  </span>
);
