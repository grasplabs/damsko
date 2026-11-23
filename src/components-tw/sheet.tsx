// Sheet: a task or details in a panel along a side of the window,
// in StyleX, built on UI SDK's
// Drawer: a raised panel the window's height, floating a little off its edges, a head with its
// title and a close button, a body that scrolls, and actions at its foot. Escape, a press on the
// shade or a drag towards its side closes it.
//
//   <Sheet>
//     <SheetTrigger asChild><Button variant="outline">Edit profile</Button></SheetTrigger>
//     <SheetContent side="end">
//       <SheetHeader>
//         <SheetTitle>Edit profile</SheetTitle>
//         <SheetDescription>Your name and role, as the team sees them.</SheetDescription>
//       </SheetHeader>
//       <SheetBody>…</SheetBody>
//       <SheetFooter>
//         <SheetClose>Cancel</SheetClose>
//         <Button size="sm" {...save.props}>Save</Button>
//       </SheetFooter>
//     </SheetContent>
//   </Sheet>
//
// UI SDK's Drawer moves the panel as it is dragged and springs it back; the sheet slides it in from
// its side and back out. The page behind is inert and does not scroll, Tab stays inside, and focus
// goes back to what opened it (hooks/use-return-focus for one opened by `open`). Its body, its
// description and its footer wear Dialog's look (dialog.tsx's `dialogStyles`), so the layers are
// one family.
"use client";

import {
  DrawerBackdrop as BackdropPrimitive,
  DrawerClose as ClosePrimitive,
  DrawerContent as ContentPrimitive,
  DrawerDescription as DescriptionPrimitive,
  Drawer as RootPrimitive,
  DrawerTitle as TitlePrimitive,
  DrawerTrigger as TriggerPrimitive,
} from "@ui-sdk/react/drawer";
import type { DrawerDismissAttemptDetails } from "@ui-sdk/react/drawer";
import { createContext, use, useLayoutEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { useReturnFocus } from "../hooks/use-return-focus";
import { Icon, XIcon } from "../lib-tw/icons";
import { keepBodyPut, useLayerBody } from "../lib-tw/layer";
import { cn, slotProps } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";
import { Button } from "./button";
import type { ButtonSize, ButtonVariant } from "./button";
import { dialogStyles } from "./dialog";

type RootProps = ComponentProps<typeof RootPrimitive>;
type TriggerPrimitiveProps = ComponentProps<typeof TriggerPrimitive>;
type ContentPrimitiveProps = ComponentProps<typeof ContentPrimitive>;
type ClosePrimitiveProps = ComponentProps<typeof ClosePrimitive>;

/** The side a sheet stands along. Both follow the reading direction. */
type Side = "start" | "end";

// The side lives on UI SDK's root, which moves the panel; SheetContent names it,
// and hands it up.
const SideContext = createContext<(side: Side) => void>(() => {
  // Outside a Sheet there is no root to tell.
});

// Every prop is documented once, where it is first declared; the props on the docs page are read
// from the types below, so they cannot drift from what the code accepts.

/** Every prop a Sheet takes: these, and the rest of UI SDK's Drawer. */
export interface SheetProps extends Omit<
  RootProps,
  | "children"
  | "side"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "dismissible"
  | "onDismissAttempt"
  | "snapPoints"
  | "snapPoint"
  | "defaultSnapPoint"
  | "onSnapPointChange"
> {
  /** The trigger and the content. */
  children: ReactNode;
  /**
   * Open now. Pass it with `onOpenChange` to open and close the sheet yourself. It may be mounted
   * only while open: focus still goes back to what opened it.
   */
  open?: boolean;
  /**
   * Open when the page loads, and focus moves into it.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Runs when the sheet wants to open or close; `details.reason` says why, a swipe included, and
   * `details.cancel()` keeps it as it is (while its action works).
   */
  onOpenChange?: RootProps["onOpenChange"];
  /**
   * Whether Escape, a press on the shade and a drag towards its side close it. Pass `false` while a
   * form has unsaved changes, and ask in `onDismissAttempt`. The close button and SheetClose still
   * close it.
   * @default true
   */
  dismissible?: boolean;
  /** Runs when a close was refused because it is not dismissible; a drag springs back. */
  onDismissAttempt?: (details: DrawerDismissAttemptDetails) => void;
}

/** The root: holds the trigger and the content, and renders nothing of its own. */
export const Sheet = ({ children, ...rest }: SheetProps) => {
  const [side, setSide] = useState<Side>("end");
  // Opened by `open` with no trigger: focus goes back to what had it (hooks/use-return-focus).
  useReturnFocus(rest.open);
  return (
    <SideContext value={setSide}>
      <RootPrimitive {...rest} side={side}>
        {children}
      </RootPrimitive>
    </SideContext>
  );
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

/**
 * UI SDK names a Drawer's parts `drawer-*`, over a `data-slot` given as a prop; the element it
 * draws keeps its own. So a part that draws its own element names it there. With `asChild` the
 * element is the caller's, and keeps UI SDK's name.
 */
const slotted = (
  slot: string,
  asChild: boolean | undefined,
  children: ReactNode
) =>
  asChild === true
    ? slotProps(asChild, children)
    : {
        render: (
          <button type="button" data-slot={slot}>
            {children}
          </button>
        ),
      };

/** Every prop a SheetTrigger takes: these, and the rest of UI SDK's DrawerTrigger. */
export interface SheetTriggerProps
  extends
    Omit<TriggerPrimitiveProps, "render" | "children" | "className" | "style">,
    WrapperProps {}

/** The control that opens the sheet: `<SheetTrigger asChild><Button>…</Button></SheetTrigger>`. */
export const SheetTrigger = ({
  asChild,
  children,
  className,
  ...rest
}: SheetTriggerProps) => (
  <TriggerPrimitive
    {...rest}
    className={className}
    {...slotted("sheet-trigger", asChild, children)}
  />
);

// ---- The look ------------------------------------------------------------------------------------

const styles = {
  overlay: "fixed inset-0 bg-dialog-scrim",
  // A raised panel standing sheet-padding in from the window's edges, the one corner on every
  // corner, on a phone too (in place of the dialog's sheet corners). It slides in from its side.
  panel:
    "relative w-[min(var(--damsko-sheet-width),100%-2*var(--damsko-sheet-padding))] h-[calc(100%-2*var(--damsko-sheet-padding))] my-(--damsko-sheet-padding) mx-(--damsko-sheet-padding) rounded-xl max-sm:rounded-xl data-[side=right]:motion-moving:[translate:calc(100%+var(--damsko-sheet-padding))_0] data-[side=left]:motion-moving:[translate:calc(-100%-var(--damsko-sheet-padding))_0] transition-[translate] duration-(--damsko-motion-open) ease-ui",
  lg: "w-[min(var(--damsko-sheet-width-wide),100%-2*var(--damsko-sheet-padding))]",
  full: "w-[min(var(--damsko-sheet-width-full),100%-2*var(--damsko-sheet-padding))]",
  header: "shrink-0 flex flex-col",
  // The head: the title on a line of its own, a hairline under it, room at its end for the close.
  title:
    "box-border min-h-sheet-head-height m-0 py-[calc((var(--damsko-sheet-head-height)-var(--damsko-text-sm-line))/2)] ps-6 pe-[calc(var(--damsko-space-4)+var(--damsko-control-sm))] font-sans text-sm font-medium text-foreground wrap-anywhere hyphens-manual text-balance shadow-[inset_0_calc(-1*var(--damsko-hairline))_0_var(--damsko-border)]",
  description: "mt-6 px-6",
  stack: "grid gap-y-4",
  footer:
    "mt-auto pt-6 pb-[max(var(--damsko-space-6),env(safe-area-inset-bottom))]",
  close:
    "absolute top-[calc((var(--damsko-sheet-head-height)-var(--damsko-control-sm))/2)] end-[calc((var(--damsko-sheet-head-height)-var(--damsko-control-sm))/2)] flex",
};

// ---- The parts -----------------------------------------------------------------------------------

/** Every prop a SheetContent takes: these, and the rest of UI SDK's DrawerContent. */
export interface SheetContentProps extends Omit<
  ContentPrimitiveProps,
  "children" | "className" | "style" | "render"
> {
  /** The header, the body and the footer, in that order. */
  children: ReactNode;
  /**
   * The side it stands along: `end` (the right in English) for a task or details, `start` for a
   * list of places to go. Both follow the reading direction.
   * @default "end"
   */
  side?: Side;
  /**
   * How wide it is: `default` for a form or details, `lg` for a layout of its own, `full` for a
   * chart or a table opened in full. Never closer than its inset to the window's edges.
   * @default "default"
   */
  size?: "default" | "lg" | "full";
  /**
   * The close button at the end of its head, named by the I18nProvider's `sheet.close`. Leave it
   * off only where the content puts a SheetClose of its own.
   * @default true
   */
  showCloseButton?: boolean;
  /** Layout only. */
  className?: LayoutClass;
}

/** The panel, with the shade behind it and the close button at the end of its head. */
export const SheetContent = ({
  children,
  side = "end",
  size = "default",
  showCloseButton = true,
  className,
  ...rest
}: SheetContentProps) => {
  const { close } = useI18n().sheet;
  const setSide = use(SideContext);
  useLayoutEffect(() => {
    setSide(side);
  }, [setSide, side]);
  return (
    <>
      <BackdropPrimitive
        render={<div data-slot="sheet-overlay" />}
        className={cn(styles.overlay)}
      />
      {/* The panel keeps UI SDK's own slot, drawer-content: named otherwise through its render
          element, UI SDK's focus trap no longer holds Tab inside it. */}
      <ContentPrimitive
        {...rest}
        className={cn(
          "group/panel",
          dialogStyles.panel,
          styles.panel,
          size === "lg" && styles.lg,
          size === "full" && styles.full,
          className
        )}
      >
        {children}
        {showCloseButton && (
          <span className={cn(styles.close)}>
            <ClosePrimitive
              render={
                <Button
                  data-slot="sheet-close"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={close}
                >
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

/** What a sheet's own layout parts take. */
interface PartProps {
  children: ReactNode;
  /** Layout only. */
  className?: LayoutClass;
}

/** Every prop a SheetHeader takes. */
export interface SheetHeaderProps extends PartProps {
  /** The title, and the description under it. */
  children: ReactNode;
}

/** The title and the description under it, at the top of the panel. */
export const SheetHeader = ({ children, className }: SheetHeaderProps) => (
  <div data-slot="sheet-header" className={cn(styles.header, className)}>
    {children}
  </div>
);

/** Every prop a SheetTitle takes. */
export interface SheetTitleProps extends PartProps {
  /** What the sheet is for, in sentence case: it names it for a screen reader and an agent. */
  children: ReactNode;
}

/** The title: the sheet's head, and its name. */
export const SheetTitle = ({ children, className }: SheetTitleProps) => (
  <TitlePrimitive
    render={<h2 data-slot="sheet-title">{children}</h2>}
    className={cn(styles.title, className)}
  />
);

/** Every prop a SheetDescription takes. */
export interface SheetDescriptionProps extends PartProps {
  /** One or two sentences on what it holds, read with the title when it opens. */
  children: ReactNode;
}

/** The sentence under the head. It describes the sheet to a screen reader. */
export const SheetDescription = ({
  children,
  className,
}: SheetDescriptionProps) => (
  <DescriptionPrimitive
    render={<p data-slot="sheet-description" />}
    className={cn(dialogStyles.description, styles.description, className)}
  >
    {children}
  </DescriptionPrimitive>
);

/** Every prop a SheetBody takes. */
export interface SheetBodyProps extends PartProps {
  /** The task or the details: fields, a list, words, one under another. */
  children: ReactNode;
}

/**
 * What the sheet is about: the one part that scrolls, so the head and the actions stay put. When
 * it holds more than it shows, it takes focus and is named by the title, so the keys can scroll it
 * too; when everything fits it is not a stop at all.
 */
export const SheetBody = ({ children, className }: SheetBodyProps) => {
  const body = useLayerBody("dialog", keepBodyPut);
  return (
    <div
      {...body}
      data-slot="sheet-body"
      className={cn(
        dialogStyles.body,
        "scrollbar-hidden focus-ring-inset",
        className
      )}
    >
      <div className={cn(styles.stack)}>{children}</div>
    </div>
  );
};

/** Every prop a SheetFooter takes. */
export interface SheetFooterProps extends PartProps {
  /** The actions, the main one last: Cancel, then Save. */
  children: ReactNode;
}

/** The actions, at the end of the line, at the sheet's foot. On a phone every Button in it takes an equal part of its width. */
export const SheetFooter = ({ children, className }: SheetFooterProps) => (
  <div
    data-slot="sheet-footer"
    data-layer-footer=""
    className={cn(dialogStyles.footer, styles.footer, className)}
  >
    {children}
  </div>
);

/** Every prop a SheetClose takes: these, and the rest of UI SDK's DrawerClose. */
export interface SheetCloseProps
  extends
    Omit<ClosePrimitiveProps, "render" | "children" | "className" | "style">,
    WrapperProps {
  /**
   * The look of the Button it draws, without `asChild`: `outline` for Cancel beside the main
   * action; `default` when closing is the step the sheet is for.
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
 * Closes the sheet, and focus goes back to what opened it. On its own it draws an outline Button
 * with its words (`<SheetClose>Cancel</SheetClose>`); with `asChild` it hands its behaviour to the
 * element inside.
 */
export const SheetClose = ({
  asChild,
  children,
  variant = "outline",
  size = "sm",
  className,
  ...rest
}: SheetCloseProps) =>
  asChild === true ? (
    <ClosePrimitive
      {...rest}
      className={className}
      {...slotted("sheet-close", asChild, children)}
    />
  ) : (
    <ClosePrimitive
      {...rest}
      render={
        <Button
          data-slot="sheet-close"
          variant={variant}
          size={size}
          className={className}
        >
          {children}
        </Button>
      }
    />
  );
