// Dialog: a focused task over the page,
// in Tailwind, built on UI SDK's Dialog: a raised panel with the one
// corner over a shade, a title that names it, a body that scrolls between the title and actions
// that stay put, and a close button in its corner. Under 640px it is a sheet along the bottom of
// the window.
//
//   <Dialog>
//     <DialogTrigger asChild><Button>Rename project</Button></DialogTrigger>
//     <DialogContent>
//       <DialogHeader>
//         <DialogTitle>Rename project</DialogTitle>
//         <DialogDescription>Everyone in the workspace sees the new name.</DialogDescription>
//       </DialogHeader>
//       <DialogBody>…</DialogBody>
//       <DialogFooter>
//         <DialogClose>Cancel</DialogClose>
//         <Button size="sm" {...rename.props}>Rename</Button>
//       </DialogFooter>
//     </DialogContent>
//   </Dialog>
//
// The page behind is inert and does not scroll while it is open, Tab stays inside, Escape and a
// press on the shade close it, and focus goes back to what opened it: UI SDK's Dialog, and
// hooks/use-return-focus for one opened by `open` with no trigger. An agent opens it by its
// trigger's name and presses its buttons by theirs.
"use client";

import {
  DialogBackdrop as BackdropPrimitive,
  Dialog as DialogPrimitive,
  DialogClose as ClosePrimitive,
  DialogContent as ContentPrimitive,
  DialogDescription as DescriptionPrimitive,
  DialogTitle as TitlePrimitive,
  DialogTrigger as TriggerPrimitive,
} from "@ui-sdk/react/dialog";
import type {
  DialogDismissAttemptDetails,
  DialogOpenChangeDetails,
} from "@ui-sdk/react/dialog";
import { mergeProps } from "@ui-sdk/react/primitive";
import type { ComponentProps, ReactNode } from "react";

import { useReturnFocus } from "../hooks/use-return-focus";
import { Icon, XIcon } from "../lib-tw/icons";
import { layerStyles, useLayerBody, watchPanel } from "../lib-tw/layer";
import { cn, slotProps } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";
import { Button } from "./button";
import type { ButtonSize, ButtonVariant } from "./button";

type RootProps = ComponentProps<typeof DialogPrimitive>;
type TriggerPrimitiveProps = ComponentProps<typeof TriggerPrimitive>;
type ContentPrimitiveProps = ComponentProps<typeof ContentPrimitive>;
type ClosePrimitiveProps = ComponentProps<typeof ClosePrimitive>;

// Every prop is documented once, where it is first declared; the props on the docs page are read
// from the types below, so they cannot drift from what the code accepts.

/** Every prop a Dialog takes: these, and the rest of UI SDK's Dialog. */
export interface DialogProps extends Omit<
  RootProps,
  "children" | "presentation"
> {
  /** The trigger and the content. */
  children: ReactNode;
  /**
   * Open now. Pass it with `onOpenChange` to open and close the dialog yourself. It may be mounted
   * only while open: focus still goes back to what opened it.
   */
  open?: boolean;
  /**
   * Open when the page loads, and focus moves into it.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Runs when the dialog wants to open or close; `details.reason` says why, and `details.cancel()`
   * keeps it as it is (while its action works).
   */
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /**
   * Whether Escape and a press on the shade close it. Pass `false` while a form has unsaved
   * changes, or while its action works, and ask in `onDismissAttempt`. The close button and
   * DialogClose still close it.
   * @default true
   */
  dismissible?: boolean;
  /** Runs when Escape or a press on the shade was refused, because it is not dismissible. */
  onDismissAttempt?: (details: DialogDismissAttemptDetails) => void;
}

/** The root: holds the trigger and the content, and renders nothing of its own. */
export const Dialog = ({ children, ...rest }: DialogProps) => {
  // Opened by `open` with no trigger: focus goes back to what had it (hooks/use-return-focus).
  useReturnFocus(rest.open);
  return <DialogPrimitive {...rest}>{children}</DialogPrimitive>;
};

/** What a plain wrapper part takes: `asChild`, its children and a layout. */
interface WrapperProps {
  /**
   * Draw the one element given as the child (a Button) as this part, with the part's behaviour;
   * it keeps its own look and name.
   * @default false
   */
  asChild?: boolean;
  /** The element, with `asChild`; else the words. */
  children: ReactNode;
  /** Layout only. */
  className?: LayoutClass;
}

/** Every prop a DialogTrigger takes: these, and the rest of UI SDK's DialogTrigger. */
export interface DialogTriggerProps
  extends
    Omit<TriggerPrimitiveProps, "render" | "children" | "className" | "style">,
    WrapperProps {}

/**
 * The control that opens the dialog: `<DialogTrigger asChild><Button>…</Button></DialogTrigger>`.
 * For an icon-only one, wrap the Button in a Tooltip for its words.
 */
export const DialogTrigger = ({
  asChild,
  children,
  className,
  ...rest
}: DialogTriggerProps) => (
  <TriggerPrimitive
    {...rest}
    className={className}
    {...slotProps(asChild, children)}
  />
);

// ---- The look ------------------------------------------------------------------------------------
//
// Arriving, it starts from the browser's own @starting-style (`starting:`), so the fade begins in the
// first frame it is drawn; leaving, UI SDK's data-ending-style (`leaving:`). lib/layer's watchPanel
// sets --dialog-shift to 0 when it grows from its trigger, where a rise would fight the origin.

const look = {
  // The shade over the page. It follows the panel in and out.
  overlay:
    "fixed inset-0 bg-dialog-scrim opacity-100 starting:opacity-0 leaving:opacity-0 transition-opacity duration-(--damsko-motion-ui) leaving:duration-(--damsko-motion-leave) ease-ui",
  // The panel (layerStyles' panel): the one corner, a sheet's on a phone, and nothing out of it.
  panel: "overflow-hidden rounded-xl max-sm:rounded-t-xl max-sm:rounded-b-none",
  // Over the page: in the middle of the window, clear of its edges by the gutter. On a phone, a
  // sheet along the bottom as wide as the window, over the keyboard when one is up.
  placed:
    "fixed inset-x-0 top-0 max-sm:top-auto bottom-0 max-sm:bottom-[var(--keyboard-inset,0px)] my-auto max-sm:my-0 mx-auto max-sm:mx-0 w-[min(var(--damsko-dialog-width),100%-2*var(--damsko-dialog-gutter))] max-sm:w-full max-w-none h-fit max-h-[calc(var(--visual-viewport-height,100dvh)-2*var(--damsko-dialog-gutter))] max-sm:max-h-[calc(var(--visual-viewport-height,100dvh)-var(--damsko-dialog-gutter))]",
  // A full dialog: a chart or a table opened in full. On a phone, the same sheet as any dialog.
  full: "w-[min(var(--damsko-dialog-width-full),100%-2*var(--damsko-dialog-gutter))] max-sm:w-full",
  // In and out: from a little lower and smaller, or from below the window on a phone. Leaving is
  // faster than arriving. With reduced motion it is there and gone at once.
  motion: [
    "opacity-100 starting:opacity-0 max-sm:starting:opacity-100 leaving:opacity-0 max-sm:leaving:opacity-100",
    "transform-none starting:[transform:translateY(var(--dialog-shift,var(--damsko-dialog-from-shift)))_scale(var(--damsko-dialog-from-scale))] max-sm:starting:[transform:translateY(100%)]",
    "leaving:[transform:translateY(var(--dialog-shift,var(--damsko-dialog-from-shift)))_scale(var(--damsko-dialog-from-scale))] max-sm:leaving:[transform:translateY(100%)]",
    "transition-[opacity,transform] duration-(--damsko-motion-ui) leaving:duration-(--damsko-motion-leave) ease-ui",
  ],
  // The title and the sentence under it, at the top of the panel.
  header: "shrink-0 flex flex-col gap-y-4 pt-6 px-6",
  // Its own tracking, so a host page's heading rules never reach it, and room for the close button.
  title: "tracking-ui pe-control-sm",
  // A body that holds fields: one under another.
  stack: "grid gap-y-5",
  // The actions, at the end of the line, the main one last. On a phone a Button in it takes an
  // equal share of the line (it reads `data-layer-footer`). Clear of a phone's home bar.
  footer:
    "shrink-0 flex flex-wrap justify-end items-center gap-2 mt-6 px-6 pb-6 max-sm:pb-[max(var(--damsko-space-6),env(safe-area-inset-bottom))]",
  // The close button, level with the title's first line, its cross on the content's edge.
  close:
    "absolute top-[calc(var(--damsko-space-6)+(var(--damsko-text-base-line)-var(--damsko-control-sm))/2)] end-[calc(var(--damsko-space-6)-var(--damsko-space-2))] flex",
};

/** The dialog's look, for the panels built like it: Alert dialog's and Command's. */
export const dialogStyles = {
  ...look,
  panel: cn(layerStyles.panel, look.panel),
  title: cn(layerStyles.title, look.title),
  description: layerStyles.description,
  body: layerStyles.body,
};

const styles = dialogStyles;

// ---- The parts -----------------------------------------------------------------------------------

/** Every prop a DialogContent takes: these, and the rest of UI SDK's DialogContent. */
export interface DialogContentProps extends Omit<
  ContentPrimitiveProps,
  "children" | "className" | "style" | "render"
> {
  /** The header, the body and the footer, in that order. */
  children: ReactNode;
  /**
   * How wide it is: `default` for a form or a short task, `full` for a chart or a table opened in
   * full. Never wider than the window less its gutters; on a phone, the sheet along the bottom
   * either way.
   * @default "default"
   */
  size?: "default" | "full";
  /**
   * The close button in its corner, named by the I18nProvider's `dialog.close`. Leave it on unless
   * the footer has a way out of its own and nothing would be lost.
   * @default true
   */
  showCloseButton?: boolean;
  /** Layout only. */
  className?: LayoutClass;
}

/**
 * The panel, with the shade behind it and the close button in its corner. Over the page in the
 * middle of the window, `dialog-width` wide or `dialog-width-full` when full; a sheet along the
 * bottom under 640px. It grows from the trigger that opened it.
 */
export const DialogContent = ({
  children,
  size = "default",
  showCloseButton = true,
  className,
  ...rest
}: DialogContentProps) => {
  const { close } = useI18n().dialog;
  return (
    <>
      <BackdropPrimitive
        render={<div data-slot="dialog-overlay" />}
        className={styles.overlay}
      />
      <ContentPrimitive
        {...mergeProps(rest, { ref: watchPanel })}
        className={cn(
          "group/panel",
          styles.panel,
          styles.placed,
          size === "full" && styles.full,
          styles.motion,
          className
        )}
      >
        {children}
        {showCloseButton && (
          <span className={cn(styles.close)}>
            <ClosePrimitive
              render={
                <Button variant="ghost" size="icon-sm" aria-label={close}>
                  <Icon icon={XIcon} />
                </Button>
              }
            />
          </span>
        )}
      </ContentPrimitive>
    </>
  );
};

/** What a dialog's own layout parts take. */
interface PartProps {
  children: ReactNode;
  /** Layout only. */
  className?: LayoutClass;
}

/** Every prop a DialogHeader takes. */
export interface DialogHeaderProps extends PartProps {
  /** The title, and the description under it. */
  children: ReactNode;
}

/** The title and the description under it, at the top of the panel. */
export const DialogHeader = ({ children, className }: DialogHeaderProps) => (
  <div data-slot="dialog-header" className={cn(styles.header, className)}>
    {children}
  </div>
);

/** Every prop a DialogTitle takes. */
export interface DialogTitleProps extends PartProps {
  /** What the dialog is for, in sentence case: it names the dialog for a screen reader and an agent. */
  children: ReactNode;
}

/** The title. It names the dialog. */
export const DialogTitle = ({ children, className }: DialogTitleProps) => (
  <TitlePrimitive className={cn(styles.title, className)}>
    {children}
  </TitlePrimitive>
);

/** Every prop a DialogDescription takes. */
export interface DialogDescriptionProps extends PartProps {
  /** One or two sentences on what happens, read with the title when the dialog opens. */
  children: ReactNode;
}

/** The sentence under the title. It describes the dialog to a screen reader. */
export const DialogDescription = ({
  children,
  className,
}: DialogDescriptionProps) => (
  <DescriptionPrimitive className={cn(styles.description, className)}>
    {children}
  </DescriptionPrimitive>
);

/** Every prop a DialogBody takes. */
export interface DialogBodyProps extends PartProps {
  /** The task: fields, a list, words, one under another. */
  children: ReactNode;
}

/**
 * What the dialog is about: the one part that scrolls, so the title and the actions stay put. When
 * it holds more than it shows, it takes focus and is named by the dialog's title, so the keys can
 * scroll it too (WCAG 2.1.1); when everything fits it is not a stop at all.
 */
export const DialogBody = ({ children, className }: DialogBodyProps) => {
  const body = useLayerBody("dialog");
  return (
    <div
      {...body}
      data-slot="dialog-body"
      className={cn(
        styles.body,
        "scrollbar-hidden focus-ring-inset",
        className
      )}
    >
      <div className={cn(styles.stack)}>{children}</div>
    </div>
  );
};

/** Every prop a DialogFooter takes. */
export interface DialogFooterProps extends PartProps {
  /** The actions, the main one last: Cancel, then Rename. */
  children: ReactNode;
}

/** The actions, at the end of the line. On a phone every Button in it takes an equal part of its width. */
export const DialogFooter = ({ children, className }: DialogFooterProps) => (
  // The marker a Button reads to take its share of the line on a phone.
  <div
    data-slot="dialog-footer"
    data-layer-footer=""
    className={cn(styles.footer, className)}
  >
    {children}
  </div>
);

/** Every prop a DialogClose takes: these, and the rest of UI SDK's DialogClose. */
export interface DialogCloseProps
  extends
    Omit<ClosePrimitiveProps, "render" | "children" | "className" | "style">,
    WrapperProps {
  /**
   * The look of the Button it draws, without `asChild`: `outline` for Cancel beside the main
   * action; `default` when closing is the step the dialog is for.
   * @default "outline"
   */
  variant?: ButtonVariant;
  /**
   * The height of the Button it draws, without `asChild`: a footer's actions are small.
   * @default "sm"
   */
  size?: Exclude<ButtonSize, `icon${string}`>;
}

/**
 * Closes the dialog, and focus goes back to what opened it. On its own it draws an outline Button
 * with its words (`<DialogClose>Cancel</DialogClose>`); with `asChild` it hands its behaviour to
 * the element inside (`<DialogClose asChild><Button variant="destructive">…</Button></DialogClose>`).
 */
export const DialogClose = ({
  asChild,
  children,
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: DialogCloseProps) =>
  asChild === true ? (
    <ClosePrimitive
      {...rest}
      className={className}
      {...slotProps(asChild, children)}
    />
  ) : (
    <ClosePrimitive
      {...rest}
      render={
        <Button variant={variant} size={size} className={className}>
          {children}
        </Button>
      }
    />
  );
