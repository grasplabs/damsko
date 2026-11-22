// PromptInput: where a person writes to an assistant, after shadcn's Prompt Input pattern
// (apps/v4/content/docs/ai-elements/base/prompt-input.mdx and its demo), whose parts keep the AI
// Elements names its migration keeps, in StyleX on UI SDK's Token Input and Trigger Menu. A card
// with the files on top (Attachment), then the text, then a footer of tools (Button, DropdownMenu),
// Submit at the end. Enter sends and Shift+Enter starts a line; an input method's Enter never
// sends, and Enter in an open suggestion menu chooses the suggestion.
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <PromptInput onSubmit={({ text, files, tokens }) => send(text, files, tokens)} status={status}>
//     <PromptInputHeader>
//       <PromptInputAttachments />
//     </PromptInputHeader>
//     <PromptInputBody>
//       <PromptInputTextarea aria-label="Message" placeholder="Ask anything" />
//     </PromptInputBody>
//     <PromptInputFooter>
//       <PromptInputTools>
//         <PromptInputActionMenu>
//           <PromptInputActionMenuTrigger />
//           <PromptInputActionMenuContent>
//             <PromptInputActionAddAttachments />
//           </PromptInputActionMenuContent>
//         </PromptInputActionMenu>
//         <PromptInputSpeechButton listening={listening} onListeningChange={setListening} />
//       </PromptInputTools>
//       <PromptInputSubmit onStop={stop} />
//     </PromptInputFooter>
//     <PromptInputMention triggers={[{ char: "@", type: "person", items: loadPeople }]} />
//   </PromptInput>
//
// A mention is a real token in the text: it moves, deletes and copies as one piece, and reads as its
// label and kind. The caller says which characters open a menu, where each one's items come from,
// and how a picked item becomes a token; nothing here knows what the items are.
//
// The files are the prompt input's, as AI Elements' are: picked, pasted or dropped, it keeps them,
// PromptInputAttachments shows them (as an AttachmentGroup), and they go with the message to `onSubmit`;
// `usePromptInputAttachments()` reads and changes them from a part of the caller's. The body is a
// slot: in place of the text the caller may put a question or a dictation, and focus follows it
// there and back. Every value is a token.
//
// shadcn draws the pattern as an InputGroup with addons above and below a textarea. Damsko's
// InputGroup is a field's box (an input's hairline and corner, no room inside, its addons padded as
// a field's), so the card here keeps the composer's own look, and its tools are Buttons, not
// InputGroupButtons (which set themselves in from a field's edge). The text is Token Input's editor,
// not a textarea, so a mention is a token; the length limit's sums are in prompt-input-limit.ts.
"use client";

import * as stylex from "@stylexjs/stylex";
import { formatFileSize } from "@ui-sdk/react/file-input";
import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  createTokenInputController,
  toLabel,
  toText,
} from "@ui-sdk/react/token-input";
import type {
  Token,
  TokenCodec,
  TokenInputController,
  TokenInputTokenState,
  TokenInputValue,
  TokenInputValueChangeDetails,
} from "@ui-sdk/react/token-input";
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuGroup,
  TriggerMenuGroupLabel,
  TriggerMenuItem,
  TriggerMenuItemIcon,
  TriggerMenuList,
  TriggerMenuStatus,
} from "@ui-sdk/react/trigger-menu";
import type {
  TriggerBoundary,
  TriggerMenuContentState,
  TriggerMenuData,
  TriggerMenuItemState,
  TriggerMenuStatusState,
} from "@ui-sdk/react/trigger-menu";
import {
  Fragment,
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ClipboardEvent,
  DragEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref,
} from "react";
import { flushSync } from "react-dom";

import { useI18n, useLocale } from "../lib/i18n";
import type { I18nCatalog } from "../lib/i18n";
import {
  ArrowUpIcon,
  AudioWaveformIcon,
  CircleAlertIcon,
  Icon,
  LoaderIcon,
  MicIcon,
  PaperclipIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "../lib/icons";
import type { IconData } from "../lib/icons";
import { menuStyles, scrollbarHidden, visuallyHidden } from "../lib/styles";
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
import { popup } from "../lib/tokens.values";
import { announce, assignRef, isThenable } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, menuMarker } from "../lib/vars.stylex";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "./attachment";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import type {
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuProps,
} from "./dropdown-menu";
import { refitOf, stageOf } from "./prompt-input-limit";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** Where the answer to the last message is: AI Elements' four, from the AI SDK's chat status. */
type Status = "ready" | "submitted" | "streaming" | "error";

/** What a submit hands the caller. */
export interface PromptInputMessage {
  /** The text, each token written by the codec (`[@Ada](person:ada)` by default). */
  text: string;
  /** The files attached to it, in the order they came. */
  files: File[];
  /** The tokens in it, in order: what each mention stands for. */
  tokens: Token[];
  /** The value itself: text and tokens, as the editor holds it. */
  value: TokenInputValue;
}

// Every prop is documented once, where it is first declared; the props on the docs page are read
// from the types below, so they cannot drift from what the code accepts.

/** Every prop a PromptInput takes. */
export interface PromptInputProps {
  /** Its parts: a PromptInputHeader, a PromptInputBody, a PromptInputFooter and any PromptInputMention. */
  children: ReactNode;
  /**
   * Sends the message, its text and files: on Enter, or Submit. They clear at once (the text unless
   * you keep `value` yourself), as AI Elements' do: the AI SDK's `sendMessage` settles only when the
   * whole answer has come. Return a Promise and a second Enter waits for it; when it rejects, the
   * failure is said and what was sent comes back, the text if nothing new has been typed.
   */
  onSubmit?: (message: PromptInputMessage) => unknown;
  /**
   * Where the answer is: `ready` to send, `submitted` sent and waiting, `streaming` while the
   * answer comes (Submit turns into Stop), `error` when it failed (said once; Submit sends again).
   * Set on the form as `data-status`, for a layer of the product's own.
   * @default "ready"
   */
  status?: Status;
  /** The text and its tokens, when you keep them in state. Pair it with `onValueChange`. */
  value?: TokenInputValue;
  /** The text and tokens it starts with. */
  defaultValue?: TokenInputValue;
  /**
   * Runs on every change: typing, a paste, a picked mention, undo. `details.reason` says why and
   * `details.cancel()` keeps the value as it was.
   */
  onValueChange?: (
    value: TokenInputValue,
    details: TokenInputValueChangeDetails
  ) => void;
  /**
   * How tokens are written as text, for `text`, the clipboard and a draft, and read back.
   * @default `[@label](type:value)`
   */
  codec?: TokenCodec;
  /**
   * Reads and writes the text from outside: an agent's words, a dictation's, a draft brought back.
   * Make one with `createTokenInputController()` from `@ui-sdk/react/token-input`.
   */
  controller?: TokenInputController;
  /**
   * The kinds of file it takes, as an `<input type="file">`'s `accept` ("image/*,.pdf"): the picker
   * offers only these, and others pasted or dropped are left out.
   */
  accept?: string;
  /**
   * Takes files dropped anywhere on the page, not only on the card.
   * @default false
   */
  globalDrop?: boolean;
  /**
   * The most characters the text may hold, a token counting as its label. A count shows from 90%,
   * and nearing and reaching it are said. What is added past it at once (a paste, a drop, an input
   * method's phrase, a dictation, a mention) is cut there, a token whole or not at all, and that is
   * said.
   */
  maxLength?: number;
  /**
   * Out of use: nothing can be typed or pressed.
   * @default false
   */
  disabled?: boolean;
  /**
   * One row: the tools, the text and Submit side by side, the text growing in its own column. On a
   * narrow card the tools and Submit go under the text.
   * @default false
   */
  compact?: boolean;
  /** The form's name, said as the person enters it ("Message the assistant"). */
  "aria-label"?: string;
  /** Layout only: where it sits and how wide it is. It stands at most `prompt-input-width` wide. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputHeader takes. */
export interface PromptInputHeaderProps {
  /** What stands above the text: PromptInputAttachments, a notice. Takes no room while empty. */
  children?: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputBody takes. */
export interface PromptInputBodyProps {
  /**
   * A PromptInputTextarea; or, in its place for a while, a question or a dictation of the
   * product's. Focus goes to its first control as it comes, and back to the text as it goes.
   */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputTextarea takes. */
export interface PromptInputTextareaProps {
  /** Its name, for a screen reader and an agent ("Message"). */
  "aria-label"?: string;
  /** The id of the element that names it, in place of `aria-label`. */
  "aria-labelledby"?: string;
  /** An example of what to write, shown while it is empty ("Ask anything"). */
  placeholder?: string;
  /**
   * Takes focus as it appears.
   * @default false
   */
  autoFocus?: boolean;
  /** Runs on each key, after the editor's own handling: Enter, the arrows and Backspace are its. */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** The editor's element, to focus it or measure it. */
  ref?: Ref<HTMLDivElement>;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputFooter takes. */
export interface PromptInputFooterProps {
  /** A PromptInputTools at the start and a PromptInputSubmit at the end. */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputTools takes. */
export interface PromptInputToolsProps {
  /** The tools before Submit: the action menu, a model selector, the speech button. */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputButton takes. */
export interface PromptInputButtonProps {
  /** An `<Icon />`, with words beside it or alone. */
  children: ReactNode;
  /** Its name, when it is an icon alone ("Search the web"). Without it the words name it. */
  "aria-label"?: string;
  /** A few words that add to its name, in a tooltip. */
  tooltip?: ReactNode;
  /** On or off, for a tool that stays on ("Search the web" while it searches); said as pressed. */
  pressed?: boolean;
  /** What a press does. Return a Promise and an agent waits for it. */
  onClick?: () => unknown;
  /**
   * Out of use. A disabled PromptInput turns its tools off too.
   * @default false
   */
  disabled?: boolean;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputSubmit takes. */
export interface PromptInputSubmitProps {
  /**
   * Where the answer is, when this Submit says it apart from its PromptInput.
   * @default the PromptInput's `status`
   */
  status?: Status;
  /**
   * Stops the answer while it is `submitted` or `streaming`: Submit is Stop then. Without it, Submit
   * is out of use until the answer is in.
   */
  onStop?: () => unknown;
  /** Its name, in place of `promptInput.submit` ("Send") or `promptInput.stop` ("Stop"). */
  "aria-label"?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputActionMenu takes: DropdownMenu's. */
export type PromptInputActionMenuProps = DropdownMenuProps;

/** Every prop a PromptInputActionMenuTrigger takes. */
export interface PromptInputActionMenuTriggerProps {
  /**
   * The icon.
   * @default a plus
   */
  children?: ReactNode;
  /** Its name, in place of `promptInput.add` ("Add to message"). */
  "aria-label"?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputActionMenuContent takes: DropdownMenuContent's. */
export type PromptInputActionMenuContentProps = DropdownMenuContentProps;

/** Every prop a PromptInputActionMenuItem takes: DropdownMenuItem's. */
export type PromptInputActionMenuItemProps = DropdownMenuItemProps;

/** Every prop a PromptInputActionAddAttachments takes. */
export interface PromptInputActionAddAttachmentsProps {
  /** Its words, in place of `promptInput.addAttachments` ("Add files"). */
  label?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** A file attached to the message: what an Attachment shows of it, and the file itself. */
export interface PromptInputFile {
  /** Its own key, kept while it is there. */
  id: string;
  /** Its name, as the person knows it ("brief.pdf"). */
  name: string;
  /** Its size in bytes, shown as people say it ("1.4 MB"). */
  size: number;
  /** Its media type ("image/png", "application/pdf"): it chooses the mark a file without a picture wears. */
  type?: string;
  /** The address of a picture of it: an image's own, or a video's. */
  preview?: string;
  /** The file, as picked, pasted or dropped. */
  file: File;
}

/** Every prop a PromptInputAttachments takes. */
export interface PromptInputAttachmentsProps {
  /**
   * How each file shows.
   * @default a PromptInputAttachment
   */
  children?: (file: PromptInputFile) => ReactNode;
  /** The list's name, in place of `promptInput.attachments` ("Files to send"). */
  "aria-label"?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputAttachment takes. */
export interface PromptInputAttachmentProps {
  /** The file, as PromptInputAttachments or `usePromptInputAttachments()` hands it. */
  data: PromptInputFile;
  /**
   * Its parts: AttachmentMedia, AttachmentContent and AttachmentActions, in place of its own.
   * @default its picture or mark, its name and size, and a remove action
   */
  children?: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputNote takes. */
export interface PromptInputNoteProps {
  /** A quiet line in the card ("Answers can be wrong. Check what matters."). */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** One item a mention menu suggests. */
export interface PromptInputMentionData {
  /** What it stands for: the token's value, and its key in the menu. */
  value: string;
  /** Its name, shown, matched by typing and written as the token's label. */
  label: string;
  /** A quiet line after its name ("Design lead"). */
  description?: string;
  /** A mark before its name. */
  icon?: IconData;
  /** The heading it stands under; items of one group stand together, in the order given. */
  group?: string;
  /** More words typing finds it by. */
  keywords?: string[];
  /** Shown, but cannot be picked. */
  disabled?: boolean;
}

/** The token a picked item becomes. */
interface MentionToken {
  /** Its kind. @default the trigger's `type` */
  type?: string;
  value: string;
  label: string;
  /** What the token keeps for its own use; never written into the text. */
  data?: Record<string, unknown>;
}

/** One character (or more) that opens a menu, and what that menu suggests. */
export interface PromptInputMentionTrigger {
  /** What opens it: `"@"`, `"/"`, `"#"`. */
  char: string;
  /**
   * Where it may start: `word` after a space or at the start, `line` only at a line's start (for
   * commands), `start` only at the very start, `anywhere`.
   * @default "word"
   */
  boundary?: TriggerBoundary;
  /** The kind of token a picked item becomes ("person", "file", "command"). */
  type: string;
  /**
   * What a token of this trigger says after its label, for a screen reader ("person").
   * @default `type`
   */
  description?: string;
  /**
   * The items, or a loader given what was typed after the character and an AbortSignal; a newer
   * query aborts the older load. Items given as a list are filtered as the person types; loaded
   * ones are the loader's to filter.
   */
  items:
    | readonly PromptInputMentionData[]
    | ((
        query: string,
        context: { signal: AbortSignal }
      ) =>
        | Promise<readonly PromptInputMentionData[]>
        | readonly PromptInputMentionData[]);
  /**
   * Makes the token a picked item becomes.
   * @default the item's value and label, of the trigger's type
   */
  toToken?: (item: PromptInputMentionData) => MentionToken;
}

/** Every prop a PromptInputMention takes. */
export interface PromptInputMentionProps {
  /** The characters that open a menu, with each one's items and tokens. */
  triggers: readonly PromptInputMentionTrigger[];
  /**
   * Runs as an item is picked, with the trigger it came from. Return a Promise and its token waits,
   * marked as pending, until it settles; it goes again if it rejects.
   */
  onSelect?: (
    item: PromptInputMentionData,
    trigger: string
  ) => void | Promise<void>;
  /** How an item shows in the menu, in place of its icon, name and description. */
  renderItem?: (item: PromptInputMentionData) => ReactNode;
  /**
   * The menu, when it needs its own: a PromptInputMentionContent.
   * @default a PromptInputMentionContent
   */
  children?: ReactNode;
}

/** Every prop a PromptInputMentionContent takes. */
export interface PromptInputMentionContentProps {
  /**
   * Rows of your own, as PromptInputMentionItems, drawn in place of the rows of the trigger's
   * `items` (which every trigger has). Without them it draws the trigger's items.
   */
  children?: ReactNode;
  /**
   * The words while nothing matches.
   * @default `promptInput.mentionEmpty`
   */
  emptyLabel?: string;
  /**
   * The words when the items could not be loaded.
   * @default `promptInput.mentionsError`
   */
  errorLabel?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputMentionItem takes. */
export interface PromptInputMentionItemProps {
  /** What it stands for. */
  value: string;
  /** Its name, matched by typing and written as the token's label. */
  label: string;
  /** A quiet line after its name. */
  description?: string;
  /** A mark before its name. */
  icon?: IconData;
  /**
   * Shown, but cannot be picked.
   * @default false
   */
  disabled?: boolean;
  /**
   * What shows, in place of its name and description.
   * @default its name and description
   */
  children?: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** Every prop a PromptInputSpeechButton takes. */
export interface PromptInputSpeechButtonProps {
  /** Listening now. Pass it with `onListeningChange` to keep it in state. */
  listening?: boolean;
  /**
   * Runs as a press turns listening on or off. The product listens, and writes the words through
   * the PromptInput's `controller`.
   */
  onListeningChange?: (listening: boolean) => void;
  /** Its name, in place of `promptInput.speechButton.label` ("Dictate"). */
  "aria-label"?: string;
  /**
   * Out of use.
   * @default false
   */
  disabled?: boolean;
  /** Layout only. */
  style?: LayoutStyle;
}

// ---- The look ------------------------------------------------------------------------------------

const FORCED = media.forcedColors;
const REDUCED = media.reducedMotion;
const TYPING = media.maxSmOrCoarse;
// The one row while there is room for a text column beside the tools: from 20rem wide. A container
// query cannot read a variable, so the width is written here.
const ROW = "@container prompt-input (width >= 20rem)";

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

const styles = stylex.create({
  root: {
    display: "grid",
    width: "100%",
    maxWidth: size.promptInputWidth,
    minWidth: 0,
    margin: 0,
    containerType: "inline-size",
    containerName: "prompt-input",
    fontFamily: font.sans,
  },
  // The card: text over the footer, the one corner of the prompt input, at medium lift. While the
  // text has focus the edge goes a step stronger with a faint halo: no ring, the caret says where
  // the words go.
  card: {
    [iconVars.size]: size.iconSm,
    [iconVars.stroke]: size.iconStroke,
    position: "relative",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: space["1"],
    boxSizing: "border-box",
    minWidth: 0,
    margin: 0,
    padding: space["2"],
    borderWidth: { default: 0, [FORCED]: size.hairline },
    borderStyle: "solid",
    borderColor: "CanvasText",
    borderRadius: radius.promptInputRadius,
    cornerShape: radius.shape,
    backgroundColor: { default: colors.card, ":disabled": colors.muted },
    boxShadow: {
      default: shadow.md,
      ":has([contenteditable=true]:focus)": `inset 0 0 0 ${size.hairline} ${colors.promptInputBorderFocus}, 0 0 0 3px ${colors.inputFocusHalo}, ${shadow.md}`,
    },
    color: colors.foreground,
    cursor: { default: "text", ":disabled": "not-allowed" },
    // In forced colours, where the edge and halo drop, the system's highlight rings the card.
    outline: {
      default: "none",
      [FORCED]: {
        default: "none",
        ":has([contenteditable=true]:focus)": `${size.ringWidth} solid Highlight`,
      },
    },
    transitionProperty: "box-shadow, background-color",
    transitionDuration: duration.hover,
    transitionTimingFunction: duration.ease,
  },
  // One row: the tools, the text and Submit; the text's column grows, and a narrow card folds the
  // tools and Submit under the text.
  // A note (a failed send, a hint) is a line of words: in the tools' column it would take the
  // text's width, so with one the card folds as a narrow one does, the note under the text.
  compact: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      [ROW]: {
        default: "auto minmax(0, 1fr) auto",
        ":has([data-slot=prompt-input-note])": "minmax(0, 1fr) auto",
      },
    },
    gridTemplateAreas: {
      default: '"header header" "field field" "start end"',
      [ROW]: {
        default: '"header header header" "start field end"',
        ":has([data-slot=prompt-input-note])":
          '"header header" "field field" "start end"',
      },
    },
    alignItems: "end",
    columnGap: space["1"],
  },
  // Files dragged over the card: tinted, its words say what a drop does.
  over: {
    backgroundColor: `color-mix(in oklch, ${colors.mint} 12%, ${colors.card})`,
    boxShadow: `inset 0 0 0 ${size.ringWidth} ${colors.mint}, ${shadow.md}`,
  },
  drop: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    display: "grid",
    placeItems: "center",
    borderRadius: "inherit",
    backgroundColor: "inherit",
    color: colors.foreground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    pointerEvents: "none",
  },
  header: {
    display: { default: "flex", ":empty": "none" },
    flexWrap: "wrap",
    gap: space["2"],
    minWidth: 0,
  },
  compactHeader: { gridArea: "header" },
  attachments: { flexBasis: "100%", minWidth: 0 },
  body: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    minWidth: 0,
  },
  compactBody: { gridArea: "field" },
  // The text: grows with its lines to prompt-input-height, then scrolls inside.
  editor: {
    display: "block",
    boxSizing: "border-box",
    minWidth: 0,
    minHeight: `calc(2 * ${font.textSmLine} + 2 * ${space["2"]})`,
    maxHeight: size.promptInputHeight,
    overflowY: "auto",
    margin: 0,
    paddingBlock: space["2"],
    paddingInline: space["2"],
    color: colors.foreground,
    caretColor: colors.foreground,
    // 16px on a phone or a touch screen, or Safari zooms the page in when the text takes focus.
    fontSize: { default: font.textSm, [TYPING]: size.inputTextTouch },
    lineHeight: font.textSmLine,
    textAlign: "start",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    outline: "none",
    "::selection": {
      backgroundColor: colors.inputSelection,
      color: colors.foreground,
    },
  },
  compactEditor: {
    minHeight: `calc(${font.textSmLine} + 2 * ${space["2"]})`,
  },
  placeholder: {
    "::before": {
      content: "attr(aria-placeholder)",
      color: colors.mutedForeground,
      pointerEvents: "none",
    },
  },
  // A token in the text: its label on a quiet ground, a cross under a pointer.
  token: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: space["1"],
    marginInline: "1px",
    paddingInline: space["1"],
    borderRadius: `calc(${radius.base} / 2)`,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
    boxShadow: size.borderStrong,
    color: colors.foreground,
    fontWeight: font.weightMedium,
    whiteSpace: "nowrap",
    outline: { default: "none", [FORCED]: `${size.hairline} solid` },
  },
  tokenSelected: {
    backgroundColor: colors.inputSelection,
  },
  tokenPending: {
    opacity: size.opacityDisabled,
  },
  tokenRemove: {
    display: "inline-flex",
    alignSelf: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    opacity: {
      default: 1,
      [media.hover]: {
        default: 0,
        [stylex.when.ancestor(":hover")]: 1,
      },
    },
  },
  footer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["1"],
    minWidth: 0,
  },
  // In one row the footer gives its tools and Submit to the card's own columns.
  compactFooter: { display: "contents" },
  tools: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["1"],
    minWidth: 0,
  },
  compactTools: { gridArea: "start" },
  end: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    marginInlineStart: "auto",
  },
  compactEnd: { gridArea: "end", justifySelf: "end" },
  count: {
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  countAt: { color: colors.destructive },
  note: {
    margin: 0,
    paddingInline: space["2"],
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
  spinner: {
    display: "inline-flex",
    animationName: { default: spin, [REDUCED]: "none" },
    animationDuration: duration.spin,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  // The mention menu: a menu's panel at the caret, items with a mark, a name and a quiet line.
  mentionPanel: {
    width: `min(${size.promptInputMentionWidth}, 100vw - 2 * ${space.popupGutter})`,
  },
  mentionList: {
    opacity: { default: 1, ":is([aria-busy=true])": size.opacityDisabled },
    transitionProperty: "opacity",
    transitionDuration: duration.hover,
  },
  mentionDescription: {
    marginInlineStart: space["2"],
    color: { default: colors.mutedForeground, [FORCED]: "inherit" },
    fontWeight: font.weightNormal,
  },
  mentionEmpty: {
    paddingBlock: space["2"],
    paddingInline: space.menuItemPadding,
    color: colors.mutedForeground,
  },
});

// ---- The form's own state ------------------------------------------------------------------------

interface PromptInputContextValue {
  controller: TokenInputController;
  status: Status;
  disabled: boolean;
  compact: boolean;
  /** Nothing to send: no words, no token and no file. */
  empty: boolean;
  /** The text's length now, a token as its label, and the most it may be. */
  length: number;
  maxLength: number | undefined;
  /** Sends what is written now; rejects when the caller's send does. */
  submit: () => Promise<void>;
  /** Opens the file picker, while the form is in use. */
  openFiles: (() => void) | undefined;
  /** The text says it is there, or gone (a takeover in its place). */
  setEditorShown: (shown: boolean) => void;
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null);

/** The form's state, for a part inside it. A part outside one draws as if it were at rest. */
const usePromptInput = () => use(PromptInputContext);

/** The files attached to the message, and what changes them: AI Elements' attachments. */
interface PromptInputAttachmentsValue {
  /** The files, in the order they came. */
  files: PromptInputFile[];
  /** Attaches files: those `accept` takes. */
  add: (files: readonly File[]) => void;
  /** Takes one off, by its `id`. */
  remove: (id: string) => void;
  /** Takes them all off. */
  clear: () => void;
  /** Opens the file picker. */
  openFileDialog: () => void;
}

const AttachmentsContext = createContext<PromptInputAttachmentsValue | null>(
  null
);

/**
 * The files attached to the PromptInput around it, and what attaches and takes them off, for a part
 * of the product's own (a list of its own look, a button that attaches a screenshot).
 */
export const usePromptInputAttachments = (): PromptInputAttachmentsValue => {
  const attachments = use(AttachmentsContext);
  if (attachments === null) {
    throw new Error("usePromptInputAttachments goes inside a PromptInput.");
  }
  return attachments;
};

/** The tokens of a value, in order. */
const tokensOf = (value: TokenInputValue): Token[] =>
  value.filter((segment): segment is Token => typeof segment !== "string");

/** Whether there are no words to send: no token, and no words but spaces. */
const emptyOf = (value: TokenInputValue) =>
  tokensOf(value).length === 0 && toLabel(value).trim() === "";

/** Says `words` once, until `said` is let go again. */
const sayOnce = (said: { current: boolean }, words: string) => {
  if (!said.current) {
    said.current = true;
    announce(words);
  }
};

/** Runs `send`, and lets `running` go once it is done, however it ends. */
const settle = async (
  running: { current: Promise<void> | null },
  send: () => Promise<void>
) => {
  try {
    await send();
  } finally {
    running.current = null;
  }
};

/** Runs `send` one at a time: a second call while one runs waits for that one, and sends nothing. */
const oneAtATime = async (
  running: { current: Promise<void> | null },
  send: () => Promise<void>
) => {
  running.current ??= settle(running, send);
  await running.current;
};

/** What the live region says of the limit: that a change was cut, that it is reached, or near. */
const limitWords = (
  words: I18nCatalog["promptInput"],
  length: number,
  maxLength: number | undefined,
  cut: boolean
) => {
  if (maxLength === undefined) {
    return "";
  }
  if (cut) {
    return words.cut(maxLength);
  }
  const stage = stageOf(length, maxLength);
  if (stage === "at") {
    return words.reached(maxLength);
  }
  return stage === "near" ? words.near(maxLength) : "";
};

const hasFiles = (transfer: DataTransfer | null) =>
  [...(transfer?.types ?? [])].includes("Files");

/**
 * The card's handlers for files: pasted into the text (before the editor reads the clipboard) or
 * dropped on it, they go to `take`; dragged over it, `setOver` tints it. A paste that holds words
 * as well (cells copied from a spreadsheet come with a picture of them) is the words.
 */
const fileHandlers = (
  take: ((files: File[]) => void) | undefined,
  setOver: (over: boolean) => void
) => ({
  onPasteCapture: (event: ClipboardEvent<HTMLFormElement>) => {
    const pasted = [...event.clipboardData.files];
    if (
      take === undefined ||
      pasted.length === 0 ||
      event.clipboardData.getData("text/plain") !== ""
    ) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    take(pasted);
  },
  onDragOver: (event: DragEvent<HTMLFormElement>) => {
    if (take === undefined || !hasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    setOver(true);
  },
  onDragLeave: (event: DragEvent<HTMLFormElement>) => {
    const to = event.relatedTarget;
    if (!(to instanceof Node) || !event.currentTarget.contains(to)) {
      setOver(false);
    }
  },
  onDropCapture: (event: DragEvent<HTMLFormElement>) => {
    const dropped = [...event.dataTransfer.files];
    setOver(false);
    if (take === undefined || dropped.length === 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    take(dropped);
  },
});

// ---- Files ---------------------------------------------------------------------------------------

/** Whether `accept` ("image/*,.pdf") takes the file; every file, without it. */
const accepts = (file: File, accept: string | undefined) => {
  const kinds = (accept ?? "")
    .split(",")
    .map((kind) => kind.trim().toLowerCase())
    .filter((kind) => kind !== "");
  if (kinds.length === 0) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return kinds.some((kind) => {
    if (kind.startsWith(".")) {
      return name.endsWith(kind);
    }
    return kind.endsWith("/*")
      ? type.startsWith(kind.slice(0, -1))
      : type === kind;
  });
};

/** A picture of the file to show while it is attached: an image's or a video's own. */
const previewOf = (file: File) =>
  file.type.startsWith("image/") || file.type.startsWith("video/")
    ? URL.createObjectURL(file)
    : undefined;

/** Lets the files' pictures go, as they are taken off. */
const letGo = (files: readonly PromptInputFile[]) => {
  for (const { preview } of files) {
    if (preview !== undefined) {
      URL.revokeObjectURL(preview);
    }
  }
};

/**
 * The attached files: what comes in through the picker, a paste or a drop, and what goes with a
 * send. Each picture is let go as its file is taken off, and all of them as the form goes. A form
 * hidden and shown again (`<Activity>`) goes and comes back with its files: their pictures are made
 * again as it comes back.
 */
const useAttachments = (
  accept: string | undefined,
  picker: { current: HTMLInputElement | null }
) => {
  const prefix = useId();
  const count = useRef(0);
  const [files, setFiles] = useState<PromptInputFile[]>([]);
  // The files as they are now, ahead of the render: two changes before one never read stale files.
  const latest = useRef(files);
  const change = (update: (all: PromptInputFile[]) => PromptInputFile[]) => {
    const now = update(latest.current);
    latest.current = now;
    setFiles(now);
  };
  const hidden = useRef(false);
  useEffect(() => {
    if (hidden.current) {
      hidden.current = false;
      const shown = latest.current.map((attached) => ({
        ...attached,
        preview: previewOf(attached.file),
      }));
      latest.current = shown;
      setFiles(shown);
    }
    return () => {
      hidden.current = true;
      letGo(latest.current);
    };
  }, []);
  const value: PromptInputAttachmentsValue = {
    files,
    add: (added) => {
      const taken = added
        .filter((file) => accepts(file, accept))
        .map((file) => {
          count.current += 1;
          return {
            id: `${prefix}${count.current}`,
            name: file.name,
            size: file.size,
            type: file.type === "" ? undefined : file.type,
            preview: previewOf(file),
            file,
          };
        });
      if (taken.length > 0) {
        change((all) => [...all, ...taken]);
      }
    },
    remove: (id) => {
      letGo(latest.current.filter((file) => file.id === id));
      change((all) => all.filter((file) => file.id !== id));
    },
    clear: () => {
      letGo(latest.current);
      change(() => []);
    },
    openFileDialog: () => {
      picker.current?.click();
    },
  };
  /** Takes off the files being sent, at once; any attached while they go stay. */
  const sending = (gone: readonly PromptInputFile[]) => {
    change((all) => all.filter((file) => !gone.includes(file)));
  };
  /** The files were sent: their pictures go. */
  const sent = (gone: readonly PromptInputFile[]) => {
    letGo(gone);
  };
  /** The send failed: the files are attached again, before any attached since. */
  const failed = (gone: readonly PromptInputFile[]) => {
    change((all) => [...gone, ...all]);
  };
  return { value, sending, sent, failed };
};

/** What a token says after its label to a screen reader: its trigger's word, else its kind. */
const describeToken = (token: Token) => {
  const said = token.data?.description;
  return typeof said === "string" ? said : token.type;
};

/** A token in the text: its label, and a cross that takes it out (Backspace does, for the keys). */
const Chip = () => (
  <TokenInputToken
    render={(props: Record<string, unknown>, state: TokenInputTokenState) => (
      <span
        {...props}
        {...stylex.props(
          styles.token,
          state.selected && styles.tokenSelected,
          state.pending && styles.tokenPending
        )}
      >
        {state.token.label}
        {!(state.disabled || state.readOnly) && (
          <TokenInputTokenRemove {...stylex.props(styles.tokenRemove)}>
            <Icon icon={XIcon} />
          </TokenInputTokenRemove>
        )}
      </span>
    )}
  />
);

/** The focus is in the form, or on the page's body after a press in it (Safari never focuses a button). */
const focusHere = (form: HTMLFormElement | null) =>
  document.activeElement === document.body ||
  (form?.contains(document.activeElement) ?? false);

/** Puts focus on what stands in the text's place: a choice already made, else its first control. */
const focusTakeover = (form: HTMLFormElement | null) => {
  const body = form?.querySelector<HTMLElement>(
    '[data-slot="prompt-input-body"]'
  );
  (
    body?.querySelector<HTMLElement>("[aria-checked=true]") ??
    body?.querySelector<HTMLElement>(
      "textarea, input, button, [contenteditable=true]"
    )
  )?.focus({ preventScroll: true });
};

/** Files dropped anywhere on the page go to `take`; dropped on the card, they are the card's own. */
const listenForDrops = (
  take: (files: File[]) => void,
  form: { current: HTMLFormElement | null }
) => {
  const hold = (event: globalThis.DragEvent) => {
    if (hasFiles(event.dataTransfer)) {
      event.preventDefault();
    }
  };
  const drop = (event: globalThis.DragEvent) => {
    if (!hasFiles(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    if (
      event.target instanceof Node &&
      form.current?.contains(event.target) === true
    ) {
      return;
    }
    const files = [...(event.dataTransfer?.files ?? [])];
    if (files.length > 0) {
      take(files);
    }
  };
  window.addEventListener("dragover", hold);
  window.addEventListener("drop", drop);
  return () => {
    window.removeEventListener("dragover", hold);
    window.removeEventListener("drop", drop);
  };
};

/**
 * Focus follows what the body holds: to a takeover's first control as it comes, back to the text
 * as it goes; only when focus was in the form, so a page of several forms never jumps.
 */
const useTakeoverFocus = (
  shown: boolean,
  form: { current: HTMLFormElement | null },
  controller: TokenInputController
) => {
  const before = useRef(shown);
  const inside = useRef(false);
  useEffect(() => {
    if (before.current === shown) {
      return;
    }
    before.current = shown;
    if (!inside.current && !focusHere(form.current)) {
      return;
    }
    if (shown) {
      controller.focus({ at: "end" });
    } else {
      focusTakeover(form.current);
    }
  }, [shown, form, controller]);
  return {
    handleFocus: () => {
      inside.current = true;
    },
    // Focus leaves the form only for something outside it: falling to the body from inside (a
    // button that went away) it is still this form's.
    handleBlur: (event: FocusEvent<HTMLFormElement>) => {
      if (
        event.relatedTarget !== null &&
        !event.currentTarget.contains(event.relatedTarget)
      ) {
        inside.current = false;
      }
    },
  };
};

/**
 * Sends for the keys: a failure is already said, and the text stays, so nothing more is done with
 * it. Submit's press keeps the rejection, so an agent's press fails with it.
 */
const sendQuietly = async (send: () => Promise<void>) => {
  try {
    await send();
  } catch {
    // Said by the send itself; the text stays to try again.
  }
};

// The parts a press on empty room in the card goes through to the text from.
const ROOM = new Set([
  "prompt-input-header",
  "prompt-input-body",
  "prompt-input-footer",
  "prompt-input-tools",
]);

/** The form: holds the text, its tokens and its files, and sends them. */
export const PromptInput = ({
  children,
  onSubmit,
  status = "ready",
  value,
  defaultValue,
  onValueChange,
  codec,
  controller: given,
  accept,
  globalDrop = false,
  maxLength,
  disabled = false,
  compact = false,
  "aria-label": label,
  style,
}: PromptInputProps) => {
  const words = useI18n().promptInput;
  // oxlint-disable-next-line react/hook-use-state -- made once, never set
  const [own] = useState(createTokenInputController);
  const controller = given ?? own;
  // The value as it is now: the caller's, else the last the editor reported.
  const [seen, setSeen] = useState<TokenInputValue>(
    () => value ?? defaultValue ?? []
  );
  const current = value ?? seen;
  const [cut, setCut] = useState(false);
  const [over, setOver] = useState(false);
  const [editorShown, setEditorShown] = useState(true);
  const form = useRef<HTMLFormElement | null>(null);
  const picker = useRef<HTMLInputElement | null>(null);
  const attachments = useAttachments(accept, picker);
  const { files } = attachments.value;
  // While what fits of a change too long goes in, in its place: never cut again.
  const refitting = useRef(false);
  // The send that is out, while it is: a second Enter waits for it.
  const running = useRef<Promise<void> | null>(null);
  // A failure is said once, whether the send's rejection or the status says it first.
  const failureSaid = useRef(false);
  const busy = status === "submitted" || status === "streaming";
  const { length } = toLabel(current);
  const empty = emptyOf(current) && files.length === 0;
  const takeFiles = disabled ? undefined : attachments.value.add;

  useEffect(
    () =>
      globalDrop && takeFiles !== undefined
        ? listenForDrops(takeFiles, form)
        : undefined,
    [globalDrop, takeFiles]
  );
  const focusWatch = useTakeoverFocus(editorShown, form, controller);

  const failed = status === "error";
  useEffect(() => {
    if (failed) {
      sayOnce(failureSaid, words.failed);
    } else {
      failureSaid.current = false;
    }
  }, [failed, words.failed]);

  // A change past the limit is put in again as what fits of it, where it went: the editor's caret
  // has already moved past it, and a paste over a selection replaces the selection.
  const refit = (next: TokenInputValue) => {
    if (maxLength === undefined) {
      return;
    }
    const {
      at,
      fits,
      cut: cutNow,
    } = refitOf(controller.getValue(), next, maxLength);
    if (cutNow) {
      setCut(true);
    }
    if (fits.length === 0) {
      return;
    }
    queueMicrotask(() => {
      refitting.current = true;
      controller.insert(fits, { at });
      refitting.current = false;
    });
  };

  const change = (
    next: TokenInputValue,
    details: TokenInputValueChangeDetails
  ) => {
    if (maxLength !== undefined) {
      const after = toLabel(next).length;
      if (after > maxLength && after > length) {
        details.cancel();
        if (!refitting.current) {
          refit(next);
        }
        return;
      }
    }
    // Drawn now, in the same task as the change: an agent writes and then presses Submit two
    // frames later, which Firefox can run before a render React schedules for later.
    flushSync(() => {
      setSeen(next);
      // What fits of a cut change keeps saying it was cut.
      setCut(refitting.current);
    });
    onValueChange?.(next, details);
  };

  const send = async (message: TokenInputValue, sending: PromptInputFile[]) => {
    failureSaid.current = false;
    const sent = onSubmit?.({
      text: toText(message, codec),
      files: sending.map((attached) => attached.file),
      tokens: tokensOf(message),
      value: message,
    });
    // Cleared at once, as AI Elements' is: a send can settle only when the whole answer has come.
    if (value === undefined) {
      controller.clear();
    }
    attachments.sending(sending);
    if (isThenable(sent)) {
      try {
        await sent;
      } catch (error) {
        // What was sent comes back to be sent again, unless a new message has been started.
        if (value === undefined && emptyOf(controller.getValue())) {
          controller.setValue(message);
        }
        attachments.failed(sending);
        sayOnce(failureSaid, words.failed);
        throw error;
      }
    }
    attachments.sent(sending);
  };

  const submit = async () => {
    if (running.current !== null) {
      await running.current;
      return;
    }
    const message = controller.getValue();
    if (disabled || busy || (emptyOf(message) && files.length === 0)) {
      return;
    }
    await oneAtATime(running, async () => {
      await send(message, files);
    });
  };

  const openFiles =
    takeFiles === undefined ? undefined : attachments.value.openFileDialog;

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    // One Escape does one thing: a layer inside (the mention menu, the action menu) closed on it,
    // and no listener of the page's hears it and closes more.
    if (event.key === "Escape" && event.defaultPrevented) {
      event.stopPropagation();
      return;
    }
    // Cmd or Ctrl and / opens the file picker.
    if (
      event.key === "/" &&
      (event.metaKey || event.ctrlKey) &&
      openFiles !== undefined
    ) {
      event.preventDefault();
      openFiles();
    }
  };

  // A press on the card's empty room puts the caret at the end of the text.
  const onPointerDown = (event: PointerEvent<HTMLFieldSetElement>) => {
    const { target } = event;
    const room =
      target === event.currentTarget ||
      (target instanceof HTMLElement && ROOM.has(target.dataset.slot ?? ""));
    if (!room || !editorShown || disabled) {
      return;
    }
    event.preventDefault();
    controller.focus({ at: "end" });
  };

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- the form hears what happens in its controls: focus, Escape, the file keys, files pasted and dropped
    <form
      ref={form}
      aria-label={label}
      data-slot="prompt-input"
      data-status={status}
      onSubmit={(event) => {
        event.preventDefault();
        void sendQuietly(submit);
      }}
      onKeyDown={onKeyDown}
      {...fileHandlers(takeFiles, setOver)}
      onFocus={focusWatch.handleFocus}
      onBlur={focusWatch.handleBlur}
      {...stylex.props(styles.root, style)}
    >
      <PromptInputContext
        // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
        value={{
          controller,
          status,
          disabled,
          compact,
          empty,
          length,
          maxLength,
          submit,
          openFiles,
          setEditorShown,
        }}
      >
        <AttachmentsContext
          // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
          value={{
            ...attachments.value,
            // The last file taken off: focus goes on to the text, as the list goes with it.
            remove: (id) => {
              if (files.length === 1 && focusHere(form.current)) {
                controller.focus({ at: "end" });
              }
              attachments.value.remove(id);
            },
          }}
        >
          <TokenInput
            controller={controller}
            value={value}
            defaultValue={defaultValue}
            onValueChange={change}
            codec={codec}
            disabled={disabled}
            getTokenDescription={describeToken}
            // Enter sends; never while an input method composes or a menu is open (the editor's).
            onSubmit={() => {
              void sendQuietly(submit);
            }}
            renderToken={() => <Chip />}
          >
            <fieldset
              disabled={disabled}
              onPointerDown={onPointerDown}
              {...stylex.props(
                styles.card,
                compact && styles.compact,
                over && styles.over
              )}
            >
              {children}
              {over && (
                <span aria-hidden="true" {...stylex.props(styles.drop)}>
                  {words.drop}
                </span>
              )}
            </fieldset>
          </TokenInput>
        </AttachmentsContext>
      </PromptInputContext>
      {takeFiles !== undefined && (
        <input
          ref={picker}
          type="file"
          multiple
          accept={accept}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const picked = [...(event.currentTarget.files ?? [])];
            event.currentTarget.value = "";
            takeFiles(picked);
          }}
          {...stylex.props(visuallyHidden)}
        />
      )}
      {maxLength !== undefined && (
        <p
          aria-live="polite"
          data-slot="prompt-input-live-region"
          {...stylex.props(visuallyHidden)}
        >
          {limitWords(words, length, maxLength, cut)}
        </p>
      )}
    </form>
  );
};

/** One attached file: an Attachment whose remove action takes it off the message. */
export const PromptInputAttachment = ({
  data,
  children,
  style,
}: PromptInputAttachmentProps) => {
  const words = useI18n().attachment;
  const locale = useLocale();
  const remove = use(AttachmentsContext)?.remove;
  return (
    <Attachment style={style}>
      {children ?? (
        <>
          <AttachmentMedia src={data.preview} type={data.type} />
          <AttachmentContent>
            <AttachmentTitle>{data.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatFileSize(data.size, locale)}
            </AttachmentDescription>
          </AttachmentContent>
          {remove !== undefined && (
            <AttachmentActions>
              <AttachmentAction
                aria-label={words.remove(data.name)}
                onClick={() => {
                  remove(data.id);
                }}
              >
                <Icon icon={XIcon} />
              </AttachmentAction>
            </AttachmentActions>
          )}
        </>
      )}
    </Attachment>
  );
};

/** The files attached to the message, as an AttachmentGroup: nothing while there are none. */
export const PromptInputAttachments = ({
  children,
  "aria-label": label,
  style,
}: PromptInputAttachmentsProps) => {
  const words = useI18n().promptInput;
  const files = use(AttachmentsContext)?.files ?? [];
  if (files.length === 0) {
    return null;
  }
  return (
    // The files take the header's whole line: their row is a size container, which takes no width
    // from its files and would shrink to nothing as an item of the header's row.
    <div {...stylex.props(styles.attachments)}>
      <AttachmentGroup aria-label={label ?? words.attachments} style={style}>
        {files.map((file) => (
          <Fragment key={file.id}>
            {children === undefined ? (
              <PromptInputAttachment data={file} />
            ) : (
              children(file)
            )}
          </Fragment>
        ))}
      </AttachmentGroup>
    </div>
  );
};

/** What stands above the text: the attached files, a notice. */
export const PromptInputHeader = ({
  children,
  style,
}: PromptInputHeaderProps) => {
  const compact = usePromptInput()?.compact === true;
  return (
    <div
      data-slot="prompt-input-header"
      {...stylex.props(styles.header, compact && styles.compactHeader, style)}
    >
      {children}
    </div>
  );
};

/** Where the text stands, or what the product puts in its place for a while. */
export const PromptInputBody = ({ children, style }: PromptInputBodyProps) => {
  const compact = usePromptInput()?.compact === true;
  return (
    <div
      data-slot="prompt-input-body"
      {...stylex.props(styles.body, compact && styles.compactBody, style)}
    >
      {children}
    </div>
  );
};

/** The text: UI SDK's Token Input editor, a multi-line text box with tokens in it. */
export const PromptInputTextarea = ({
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  placeholder,
  autoFocus = false,
  onKeyDown,
  ref,
  style,
}: PromptInputTextareaProps) => {
  const form = usePromptInput();
  const setShown = form?.setEditorShown;
  const controller = form?.controller;
  const compact = form?.compact === true;
  // Here, the text stands in the body; gone, a takeover does.
  useEffect(() => {
    setShown?.(true);
    return () => {
      setShown?.(false);
    };
  }, [setShown]);
  useEffect(() => {
    if (autoFocus) {
      controller?.focus({ at: "end" });
    }
  }, [autoFocus, controller]);
  return (
    <TokenInputEditor
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      ref={(element: HTMLDivElement | null) => {
        assignRef(ref, element);
      }}
      render={(props: Record<string, unknown>, state: { empty: boolean }) => (
        <div
          {...props}
          data-slot="prompt-input-textarea"
          {...stylex.props(
            styles.editor,
            compact && styles.compactEditor,
            state.empty && styles.placeholder,
            scrollbarHidden,
            style
          )}
        />
      )}
    />
  );
};

/** The row under the text: the tools at the start, Submit at the end. */
export const PromptInputFooter = ({
  children,
  style,
}: PromptInputFooterProps) => {
  const compact = usePromptInput()?.compact === true;
  return (
    <div
      data-slot="prompt-input-footer"
      {...stylex.props(styles.footer, compact && styles.compactFooter, style)}
    >
      {children}
    </div>
  );
};

/** The tools before Submit. */
export const PromptInputTools = ({
  children,
  style,
}: PromptInputToolsProps) => {
  const compact = usePromptInput()?.compact === true;
  return (
    <div
      data-slot="prompt-input-tools"
      {...stylex.props(styles.tools, compact && styles.compactTools, style)}
    >
      {children}
    </div>
  );
};

/**
 * A bare (ghost) Button, small, named, pressed on or off: an element, not a part of its own, so a
 * TooltipTrigger around it gives its props to the Button itself.
 */
const toolButton = ({
  children,
  "aria-label": ariaLabel,
  pressed,
  onClick,
  off,
  slot,
  style,
}: Omit<PromptInputButtonProps, "tooltip" | "disabled"> & {
  off: boolean;
  slot: string;
}) => {
  const element = (
    <button
      type="button"
      data-slot={slot}
      aria-pressed={pressed}
      // The text keeps the focus while a tool is pressed with a pointer.
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    >
      {children}
    </button>
  );
  // Words name it at the small size; an icon alone is a square named by `aria-label`.
  const sized =
    ariaLabel === undefined
      ? { size: "sm" as const }
      : { size: "icon-sm" as const, "aria-label": ariaLabel };
  return (
    <Button
      asChild
      variant="ghost"
      {...sized}
      disabled={off}
      onClick={onClick}
      style={style}
    >
      {element}
    </Button>
  );
};

/** A tool in the footer: a small bare button, an icon with words or alone, a tooltip if it helps. */
export const PromptInputButton = ({
  tooltip,
  disabled,
  ...props
}: PromptInputButtonProps) => {
  const off = (usePromptInput()?.disabled ?? false) || disabled === true;
  const button = toolButton({ ...props, off, slot: "prompt-input-button" });
  if (tooltip === undefined || tooltip === null) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

/** The count near the limit: hidden from a screen reader, which hears the stage instead. */
const Count = ({ length, max }: { length: number; max: number }) => {
  const words = useI18n().promptInput;
  const stage = stageOf(length, max);
  if (stage === "under") {
    return null;
  }
  return (
    <span
      aria-hidden="true"
      data-slot="prompt-input-count"
      data-limit={stage}
      {...stylex.props(styles.count, stage === "at" && styles.countAt)}
    >
      {words.count(Math.min(length, max), max)}
    </span>
  );
};

/** The mark Submit wears: an arrow to send, a spinner once sent, a square to stop, a mark on failure. */
const submitIcon = (status: Status, stoppable: boolean): ReactNode => {
  if (status === "streaming" || (status === "submitted" && stoppable)) {
    return <Icon icon={SquareIcon} />;
  }
  if (status === "submitted") {
    return (
      <span {...stylex.props(styles.spinner)}>
        <Icon icon={LoaderIcon} />
      </span>
    );
  }
  return <Icon icon={status === "error" ? CircleAlertIcon : ArrowUpIcon} />;
};

/** Where Submit is: its status, whether the answer comes, whether it stops it, whether it is off. */
const submitState = (
  form: PromptInputContextValue | null,
  given: Status | undefined,
  canStop: boolean
) => {
  const status = given ?? form?.status ?? "ready";
  const working = status === "submitted" || status === "streaming";
  const nothing = form?.empty ?? true;
  return {
    status,
    working,
    stoppable: working && canStop,
    off: (form?.disabled ?? false) || (working ? !canStop : nothing),
  };
};

/** Send, or Stop while the answer comes; the count before it near the limit. */
export const PromptInputSubmit = ({
  status: givenStatus,
  onStop,
  "aria-label": ariaLabel,
  style,
}: PromptInputSubmitProps) => {
  const words = useI18n().promptInput;
  const form = usePromptInput();
  const { status, working, stoppable, off } = submitState(
    form,
    givenStatus,
    onStop !== undefined
  );
  const compact = form?.compact === true;
  const press = async (event: MouseEvent<HTMLElement>) => {
    if (stoppable) {
      await onStop?.();
      return;
    }
    // The text takes the focus first: Submit gives way to Stop as the message goes, and focus
    // would fall to the page's body. Only when the focus is this form's, so an agent's press
    // never pulls it from elsewhere.
    if (focusHere(event.currentTarget.closest("form"))) {
      form?.controller.focus({ at: "end" });
    }
    await form?.submit();
  };
  return (
    <span {...stylex.props(styles.end, compact && styles.compactEnd, style)}>
      {form?.maxLength !== undefined && (
        <Count length={form.length} max={form.maxLength} />
      )}
      <Button
        asChild
        variant={off && !working ? "ghost" : "default"}
        size="icon-sm"
        aria-label={ariaLabel ?? (stoppable ? words.stop : words.submit)}
        disabled={off}
        focusableWhenDisabled={working}
        aria-busy={status === "submitted" ? true : undefined}
        // The prompt input holds where its message is and draws it itself: the Button follows none.
        status="idle"
        onClick={press}
      >
        <button
          type="button"
          data-slot="prompt-input-submit"
          data-status={status}
        >
          {submitIcon(status, stoppable)}
        </button>
      </Button>
    </span>
  );
};

/** The plus menu: actions that add to the message. */
export const PromptInputActionMenu = ({
  onOpenChange,
  ...props
}: PromptInputActionMenuProps) => (
  <DropdownMenu
    {...props}
    // One Escape does one thing: it closes the menu, and no listener of the page's on the document
    // hears it and closes more.
    onOpenChange={(open, details) => {
      if (!open && details.reason === "escape-key") {
        details.event?.stopImmediatePropagation();
      }
      onOpenChange?.(open, details);
    }}
  />
);

/** The plus that opens the action menu. */
export const PromptInputActionMenuTrigger = ({
  children,
  "aria-label": ariaLabel,
  style,
}: PromptInputActionMenuTriggerProps) => {
  const words = useI18n().promptInput;
  const off = usePromptInput()?.disabled ?? false;
  return (
    <DropdownMenuTrigger asChild disabled={off}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={ariaLabel ?? words.add}
        disabled={off}
        style={style}
      >
        {children ?? <Icon icon={PlusIcon} />}
      </Button>
    </DropdownMenuTrigger>
  );
};

/** The action menu's panel, opening from the plus's start. */
export const PromptInputActionMenuContent = ({
  align = "start",
  ...props
}: PromptInputActionMenuContentProps) => (
  <DropdownMenuContent align={align} {...props} />
);

/** An action in the menu. */
export const PromptInputActionMenuItem = (
  props: PromptInputActionMenuItemProps
) => <DropdownMenuItem {...props} />;

// The keys that open the file picker while focus is in the form: Cmd or Ctrl and /.
const PICKER_KEYS = "mod+/";

/** Opens the file picker: Cmd or Ctrl and / does the same while focus is in the form. */
export const PromptInputActionAddAttachments = ({
  label,
  style,
}: PromptInputActionAddAttachmentsProps) => {
  const words = useI18n().promptInput;
  const openFiles = usePromptInput()?.openFiles;
  return (
    <DropdownMenuItem
      icon={PaperclipIcon}
      disabled={openFiles === undefined}
      onSelect={() => {
        openFiles?.();
      }}
      label={label ?? words.addAttachments}
      style={style}
    >
      {label ?? words.addAttachments}
      <DropdownMenuShortcut>{PICKER_KEYS}</DropdownMenuShortcut>
    </DropdownMenuItem>
  );
};

/** A quiet line in the card. */
export const PromptInputNote = ({ children, style }: PromptInputNoteProps) => (
  <p data-slot="prompt-input-note" {...stylex.props(styles.note, style)}>
    {children}
  </p>
);

/** Dictation's button: pressed while it listens. The product listens, and writes what it hears. */
export const PromptInputSpeechButton = ({
  listening,
  onListeningChange,
  "aria-label": ariaLabel,
  disabled,
  style,
}: PromptInputSpeechButtonProps) => {
  const words = useI18n().promptInput.speechButton;
  const off = (usePromptInput()?.disabled ?? false) || disabled === true;
  const [own, setOwn] = useState(false);
  const on = listening ?? own;
  // A toggle: its name stays, pressed says it listens, and that it starts listening is said.
  return toolButton({
    "aria-label": ariaLabel ?? words.label,
    pressed: on,
    off,
    slot: "prompt-input-speech-button",
    style,
    onClick: () => {
      if (!on) {
        announce(words.listening);
      }
      setOwn(!on);
      onListeningChange?.(!on);
    },
    children: <Icon icon={on ? AudioWaveformIcon : MicIcon} />,
  });
};

// ---- Mentions ------------------------------------------------------------------------------------

/**
 * Whether an entry the menu hands back is one of the caller's items: the menu keeps the objects it
 * was given, so their icon and description come back with them.
 */
const isMentionData = (entry: unknown): entry is PromptInputMentionData =>
  typeof entry === "object" &&
  entry !== null &&
  "value" in entry &&
  typeof entry.value === "string" &&
  "label" in entry &&
  typeof entry.label === "string";

/** Items as the menu takes them: the ungrouped first, then each group in the order it first comes. */
const toMenuData = (
  items: readonly PromptInputMentionData[]
): TriggerMenuData => {
  const loose: PromptInputMentionData[] = [];
  const groups = new Map<string, PromptInputMentionData[]>();
  for (const item of items) {
    if (item.group === undefined) {
      loose.push(item);
    } else {
      groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
    }
  }
  return [
    ...loose,
    ...[...groups].map(([label, grouped]) => ({
      type: "group" as const,
      label,
      items: grouped,
    })),
  ];
};

/** The caller's item for an entry of the menu, or one made of its value and label. */
const itemOf = (entry: {
  value: unknown;
  label: string;
}): PromptInputMentionData =>
  isMentionData(entry)
    ? entry
    : { value: String(entry.value), label: entry.label };

/** One trigger as UI SDK's Trigger Menu takes it: the items as its data, the token a pick inserts. */
const definitionOf = (trigger: PromptInputMentionTrigger) => {
  const { items } = trigger;
  return {
    char: trigger.char,
    boundary: trigger.boundary,
    type: trigger.type,
    items:
      typeof items === "function"
        ? async (query: string, context: { signal: AbortSignal }) =>
            toMenuData(await items(query, context))
        : toMenuData(items),
    insert: (entry: { value: unknown; label: string }) => {
      const item = itemOf(entry);
      const made: MentionToken = trigger.toToken?.(item) ?? {
        value: item.value,
        label: item.label,
      };
      return {
        type: made.type ?? trigger.type,
        value: made.value,
        label: made.label,
        // What it says after its label, in the caller's words; never written into the text.
        data: {
          ...made.data,
          description: trigger.description ?? trigger.type,
        },
      };
    },
  };
};

/** How an item shows in the menu, when the caller draws it. */
const RenderItemContext = createContext<
  ((item: PromptInputMentionData) => ReactNode) | undefined
>(undefined);

/** One suggestion: a mark, its name and a quiet line. Picked, it goes in the text as a token. */
export const PromptInputMentionItem = ({
  value,
  label,
  description,
  icon,
  disabled,
  children,
  style,
}: PromptInputMentionItemProps) => (
  <TriggerMenuItem
    value={value}
    label={label}
    disabled={disabled}
    className={(state: TriggerMenuItemState) =>
      stylex.props(
        menuStyles.item,
        state.highlighted && menuStyles.highlighted,
        state.disabled && menuStyles.disabled,
        style
      ).className
    }
  >
    {icon !== undefined && (
      <TriggerMenuItemIcon data-menu-icon="" {...stylex.props(menuStyles.icon)}>
        <Icon icon={icon} />
      </TriggerMenuItemIcon>
    )}
    {children ?? (
      <span {...stylex.props(menuStyles.text)}>
        {label}
        {description !== undefined && (
          <span {...stylex.props(styles.mentionDescription)}>
            {description}
          </span>
        )}
      </span>
    )}
  </TriggerMenuItem>
);

/** One row of the menu as data gives it: the caller's drawing, else a mark, its name and a quiet line. */
const DataItem = ({ item }: { item: PromptInputMentionData }) => {
  const renderItem = use(RenderItemContext);
  return (
    <PromptInputMentionItem
      value={item.value}
      label={item.label}
      description={item.description}
      icon={item.icon}
      disabled={item.disabled}
    >
      {renderItem?.(item)}
    </PromptInputMentionItem>
  );
};

/**
 * The rows of the menu, from the items it shows now: loose items, then groups under their names,
 * which is all toMenuData gives it. Keyed by place: two items may stand for the same value.
 */
const DataRows = ({ items }: { items: TriggerMenuData<unknown> }) =>
  items.map((entry, index) => {
    if (isMentionData(entry)) {
      return <DataItem key={index} item={entry} />;
    }
    return typeof entry === "object" &&
      "type" in entry &&
      entry.type === "group" ? (
      <TriggerMenuGroup key={index}>
        {entry.label !== undefined && (
          <TriggerMenuGroupLabel {...stylex.props(menuStyles.label)}>
            {entry.label}
          </TriggerMenuGroupLabel>
        )}
        {entry.items.filter(isMentionData).map((item, at) => (
          <DataItem key={at} item={item} />
        ))}
      </TriggerMenuGroup>
    ) : null;
  });

/** What the menu says of itself: that its items failed to load, that they load, else `rest`. */
const menuWords = (
  state: { status: TriggerMenuContentState["status"]; loading?: boolean },
  words: { error: string; loading: string },
  rest: string
) => {
  if (state.status === "error") {
    return words.error;
  }
  return state.loading === true || state.status === "loading"
    ? words.loading
    : rest;
};

/** The menu: a menu's panel at the caret, its items, and what it says when it has none. */
export const PromptInputMentionContent = ({
  children,
  emptyLabel,
  errorLabel,
  style,
}: PromptInputMentionContentProps) => {
  const words = useI18n().promptInput;
  const said = {
    error: errorLabel ?? words.mentionsError,
    loading: words.mentionsLoading,
  };
  return (
    <TriggerMenuContent
      side="top"
      align="start"
      sideOffset={popup.menuGap}
      collisionPadding={popup.gutter}
      render={(props: Record<string, unknown>) => (
        <div
          {...props}
          data-slot="prompt-input-mention-content"
          {...stylex.props(
            menuMarker,
            menuStyles.panel,
            menuStyles.motion,
            styles.mentionPanel,
            scrollbarHidden,
            style
          )}
        />
      )}
    >
      {(state: TriggerMenuContentState) => (
        <>
          {/* Its own words when the loader failed, where UI SDK would say nothing matched. */}
          <TriggerMenuEmpty {...stylex.props(styles.mentionEmpty)}>
            {menuWords(state, said, emptyLabel ?? words.mentionEmpty)}
          </TriggerMenuEmpty>
          <TriggerMenuList
            data-slot="prompt-input-mention"
            {...stylex.props(styles.mentionList)}
          >
            {children ?? <DataRows items={state.items} />}
          </TriggerMenuList>
        </>
      )}
    </TriggerMenuContent>
  );
};

/** The menus that open on typed characters, each with its trigger's items, inserting tokens. */
export const PromptInputMention = ({
  triggers,
  onSelect,
  renderItem,
  children,
}: PromptInputMentionProps) => {
  const words = useI18n().promptInput;
  const said = { error: words.mentionsError, loading: words.mentionsLoading };
  return (
    <TriggerMenu
      triggers={triggers.map(definitionOf)}
      // Silent: the status below says that items load, in the page's language.
      pendingAnnouncement=""
      // One Escape does one thing: it closes the menu, and no listener of the page's on the
      // document hears it and closes more (UI SDK's layers hear it there first).
      onOpenChange={(
        open: boolean,
        details: { reason: string; event?: Event }
      ) => {
        if (!open && details.reason === "escape-key") {
          details.event?.preventDefault();
          details.event?.stopImmediatePropagation();
        }
      }}
      onSelect={(
        _value: string,
        details: { trigger: string; item: { value: unknown; label: string } }
      ): void | Promise<void> =>
        onSelect?.(itemOf(details.item), details.trigger)
      }
    >
      <TriggerMenuStatus {...stylex.props(visuallyHidden)}>
        {(state: TriggerMenuStatusState) =>
          menuWords(
            state,
            said,
            state.open ? words.mentionsFound(state.count) : ""
          )
        }
      </TriggerMenuStatus>
      <RenderItemContext value={renderItem}>
        {children ?? <PromptInputMentionContent />}
      </RenderItemContext>
    </TriggerMenu>
  );
};
