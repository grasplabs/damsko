// Sidebar: an app's main places down one side: a provider that holds whether it is open, the
// sidebar with its header, its content in groups of menus and its footer, a trigger and a rail that
// fold it, and the page beside it (SidebarInset).
//
//   <SidebarProvider>
//     <Sidebar>
//       <SidebarHeader>…</SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Workspace</SidebarGroupLabel>
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton asChild isActive>
//                 <a href="/inbox"><Icon icon={InboxIcon} />Inbox</a>
//               </SidebarMenuButton>
//               <SidebarMenuBadge>3</SidebarMenuBadge>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter>…</SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//     <SidebarInset>
//       <SidebarTrigger />
//       …
//     </SidebarInset>
//   </SidebarProvider>
//
// It stands in the page's flow, never fixed to the window, so it lives in any frame: an aside
// named by the I18nProvider's `sidebar.name`, its content a navigation named `sidebar.main`.
// It folds away whole, off the canvas; `collapsible="icon"` folds it down to its icons instead,
// where each row's words show in a tooltip. A row's words longer than the row end in an ellipsis,
// and its tooltip shows them whole. Under the lg breakpoint it is a Sheet from its side, which holds Tab inside
// and gives focus back to the trigger. Cmd+B on a Mac, Ctrl+B elsewhere, folds and opens it from
// anywhere on the page (`keyboardShortcut`); where a page holds several, the one holding focus
// answers, else the first. `storageKey` keeps the person's choice in localStorage, and
// `sidebarStateScript` draws it before the page wakes. A group that folds is a SidebarCollapsible,
// a Collapsible by a `name`, whose fold is kept and drawn the same way. Nothing here knows a
// product: a profile, a theme control or a working mark is the caller's, composed into the parts.
//
// An area of the product with a navigation of its own (its settings, one project) is a level: the
// SidebarLevels between the header and the footer hold a SidebarLevel for each, one shown at a
// time, by `value` (the router's). The others stay in the page, unseen and out of reach, so each
// keeps its scroll place and its folded groups.
//
//   <SidebarLevels value={area}>
//     <SidebarLevel value="main">
//       <SidebarContent>…</SidebarContent>
//     </SidebarLevel>
//     <SidebarLevel value="settings">
//       <SidebarLevelHeader>
//         <SidebarMenu>…a SidebarMenuButton that leads back…</SidebarMenu>
//         <SidebarLevelTitle><Icon icon={SettingsIcon} />Settings</SidebarLevelTitle>
//       </SidebarLevelHeader>
//       <SidebarContent aria-label="Settings">…</SidebarContent>
//     </SidebarLevel>
//   </SidebarLevels>
"use client";

import { mergeProps, renderElement } from "@ui-sdk/react/primitive";
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts";
import {
  createContext,
  createElement,
  Fragment,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  ComponentProps,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";

// Not ported in the experiment: its pixel grid is CSS computed by functions at build time
// (lib/skeleton), which a class string cannot hold; it would move to a CSS file of its own.
import { Skeleton } from "../components/skeleton";
import { Icon, PanelLeftIcon } from "../lib-tw/icons";
import "../lib-tw/styles";
import { announce, cn, listOf, slotProps, slotWords } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";
import { durations, px } from "../lib/tokens.values";
import { Collapsible } from "./collapsible";
import { Input } from "./input";
import type { InputProps } from "./input";
import { Sheet, SheetContent } from "./sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import type { TooltipProps } from "./tooltip";

/** The keys that fold the sidebar and open it again: Cmd+B on a Mac, Ctrl+B elsewhere. */
export const SIDEBAR_KEYBOARD_SHORTCUT = "mod+b";

// Under the lg breakpoint the sidebar is a sheet: the page is too narrow to stand beside it.
const MOBILE = `(width < ${px.lg}px)`;

// ---- The look ------------------------------------------------------------------------------------

// The sidebar's parts follow its state from its attributes alone (the head script sets them before
// React wakes): the aside is `group/sidebar`, so a row reads
// `group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:` (StyleX's sidebarMarker). The
// page beside an inset sidebar reads it through their shared parent, `group/sidebar-wrapper`, with
// `group-has-[>[data-variant=inset]]` (StyleX's anySibling); Tailwind's `peer` sees only a sibling
// before it. A menu item is `group/menu-item`, so its action shows while the pointer is on the row.
// The rows' words are sized by `text-(length:…)` with their own `leading-…`: tailwind-merge drops a
// `text-sm` whole, line height with it, for another font size.
const styles = {
  // The row the sidebar and the page stand in: the window's height unless the frame sets its own.
  wrapper:
    "group/sidebar-wrapper flex w-full min-h-svh overflow-x-clip has-[>[data-variant=inset]]:bg-sidebar",
  // The aside holds its room in the row; its width follows the fold.
  aside:
    "group/sidebar relative flex max-lg:hidden shrink-0 self-stretch w-sidebar-width data-[state=collapsed]:data-[collapsible=offcanvas]:w-0 data-[state=collapsed]:data-[collapsible=icon]:w-sidebar-rail-width text-sidebar-foreground transition-[width] duration-(--damsko-motion-ui) ease-ui",
  // Floating, the panel stands in by space-2: the rail grows by as much on each side.
  asideFloating:
    "w-sidebar-width data-[state=collapsed]:data-[collapsible=offcanvas]:w-0 data-[state=collapsed]:data-[collapsible=icon]:w-[calc(var(--damsko-sidebar-rail-width)+2*var(--damsko-space-2))]",
  // Never folding: as wide as the sidebar, on a phone too.
  asideFixed: "flex max-lg:flex w-sidebar-width",
  // The panel: as tall as the window at most, held in view while the page scrolls past.
  container:
    "sticky top-0 z-1 flex box-border w-full h-full max-h-svh transition-[translate,visibility] duration-(--damsko-motion-ui) ease-ui",
  // Off the canvas it keeps its width and slides out past its side; once gone it is hidden.
  offcanvas:
    "shrink-0 w-sidebar-width group-data-[state=collapsed]/sidebar:invisible",
  offcanvasStart:
    "group-data-[state=collapsed]/sidebar:[translate:-100%_0] group-data-[state=collapsed]/sidebar:rtl:[translate:100%_0]",
  // Its ground parts it from the page, with no line; in forced colours a line does.
  edgeStart:
    "border-e-0 forced-colors:border-e-[length:var(--damsko-hairline)] border-e-[CanvasText]",
  edgeEnd:
    "border-s-0 forced-colors:border-s-[length:var(--damsko-hairline)] border-s-[CanvasText]",
  roomy: "p-2",
  // What it holds: the header, the content and the footer, top to bottom.
  inner:
    "[--damsko-icon-size:var(--damsko-sidebar-icon)] [--damsko-icon-stroke-width:var(--damsko-icon-stroke)] flex flex-col box-border w-full h-full min-h-0 bg-sidebar font-sans text-sm",
  floating:
    "rounded-2xl corner-squircle border-[length:var(--damsko-hairline)] border-solid border-border forced-colors:border-[CanvasText] shadow-sm",
  // In a sheet, on a narrow window: it fills the sheet, on its own ground from edge to edge.
  sheet:
    "[--damsko-icon-size:var(--damsko-sidebar-icon)] [--damsko-icon-stroke-width:var(--damsko-icon-stroke)] flex flex-col grow min-h-0 rounded-[inherit] corner-inherit bg-sidebar text-sidebar-foreground font-sans text-sm",
  // The rail along its inner edge: pressed, it folds or opens the sidebar; a line under the pointer
  // (any pointer: StyleX's own hover here is not the fine pointer's).
  rail: "absolute inset-y-0 z-1 w-4 p-0 border-0 visible cursor-ew-resize bg-transparent [&:hover]:bg-[linear-gradient(to_right,transparent_calc(50%-var(--damsko-hairline)),var(--damsko-border)_calc(50%-var(--damsko-hairline)),var(--damsko-border)_calc(50%+var(--damsko-hairline)),transparent_calc(50%+var(--damsko-hairline)))] block max-lg:hidden",
  railStart: "-end-2",
  railEnd: "-start-2",
  // The page beside it. Beside an inset sidebar it is a card on the sidebar's ground, from lg, with
  // a line inside its edge (a layer over what the card holds), and no lift.
  inset: [
    "relative flex flex-col grow min-w-0 bg-background lg:group-has-[>[data-variant=inset]]/sidebar-wrapper:bg-sidebar-card lg:group-has-[>[data-variant=inset]]/sidebar-wrapper:m-(--damsko-sidebar-card-gap) lg:group-has-[>[data-variant=inset]]/sidebar-wrapper:rounded-md",
    "after:content-none lg:group-has-[>[data-variant=inset]]/sidebar-wrapper:after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:corner-inherit after:shadow-[inset_0_0_0_var(--damsko-hairline)_var(--damsko-sidebar-card-border)] forced-colors:after:shadow-[inset_0_0_0_var(--damsko-hairline)_CanvasText] after:pointer-events-none",
  ],
  header: "flex flex-col gap-2 pt-4 pb-1 px-2",
  footer: "flex flex-col gap-2 p-2",
  // The one part that scrolls, its bar hidden; folded to its icons, nothing scrolls sideways.
  content:
    "flex flex-col grow gap-2 min-h-0 py-2 overflow-auto group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:overflow-hidden overscroll-contain",
  separator:
    "shrink-0 h-hairline mx-2 bg-sidebar-border forced-colors:bg-[CanvasText]",
  input: "flex flex-col",
  group:
    "relative flex flex-col gap-sidebar-row-gap box-border w-full min-w-0 px-2",
  // The small label over a group's menu; folded to its icons, it gives its room up. Drawn as a
  // button or a link (`asChild`), it answers the pointer as a row's words do.
  groupLabel: [
    "flex shrink-0 items-center gap-1 box-border w-full h-sidebar-menu-button-height m-0 pt-2 pb-1 px-sidebar-row-inline border-0 rounded-lg corner-squircle bg-transparent",
    "text-sidebar-secondary-foreground hover:[&:is(button,a)]:text-sidebar-foreground [&:is(button,a)]:cursor-pointer font-sans text-xs font-medium text-start whitespace-nowrap overflow-hidden no-underline",
    "opacity-100 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:opacity-0 mt-0 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:mt-[calc(-1*var(--damsko-sidebar-menu-button-height))] transition-[margin-block-start,opacity] duration-(--damsko-motion-ui) ease-ui",
  ],
  groupContent: "w-full text-(length:--damsko-text-sm)",
  // A small button at the end of a row or a group's label.
  action:
    "absolute flex group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:hidden items-center justify-center box-border size-sidebar-icon-button p-0 border-0 forced-colors:border-[length:var(--damsko-hairline)] border-solid border-[ButtonText] rounded-lg corner-squircle text-sidebar-secondary-foreground hover:text-sidebar-foreground bg-transparent hover:bg-sidebar-hover aria-expanded:bg-sidebar-hover cursor-pointer transition-[color,background-color,opacity] duration-(--damsko-duration-hover) ease-[ease]",
  groupAction:
    "top-[calc((var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon-button))/2)] end-[calc(var(--damsko-space-2)+(var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon-button))/2)]",
  menuAction:
    "top-[calc((var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon-button))/2)] coarse:top-[calc((var(--damsko-tap-target)-var(--damsko-sidebar-icon-button))/2)] end-[calc((var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon-button))/2)]",
  // Shown while the pointer is on its row, focus is in the row or its menu is open; on a touch
  // screen, always.
  showOnHover:
    "opacity-0 group-[:hover]/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 aria-expanded:opacity-100 coarse:opacity-100",
  menu: "flex flex-col gap-sidebar-row-gap w-full min-w-0 m-0 p-0 list-none",
  menuItem: "group/menu-item relative",
  // A row: its icon and its words, quiet until the pointer is on it or it is the page you are on.
  // Folded to its icons: a square the row's height, in the middle of the rail, its words cut away.
  // Room at its end for an action or a badge beside it, while its words show.
  button: [
    "relative flex items-center gap-sidebar-icon-gap box-border min-w-0 w-full group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:w-sidebar-menu-button-height h-sidebar-menu-button-height coarse:h-tap-target group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:h-sidebar-menu-button-height",
    "my-0 mx-0 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:mx-[calc((var(--damsko-sidebar-rail-width)-2*var(--damsko-space-2)-var(--damsko-sidebar-menu-button-height))/2)] py-0 ps-sidebar-row-inline group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:ps-[calc((var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon))/2)] pe-sidebar-row-inline has-[~[data-slot=sidebar-menu-action],~[data-slot=sidebar-menu-badge]]:pe-[calc(var(--damsko-sidebar-icon-button)+var(--damsko-space-2))] group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:pe-[calc((var(--damsko-sidebar-menu-button-height)-var(--damsko-sidebar-icon))/2)]",
    "border-0 forced-colors:border-[length:var(--damsko-hairline)] border-solid border-transparent rounded-lg corner-squircle overflow-hidden",
    "text-sidebar-secondary-foreground hover:text-sidebar-foreground bg-transparent hover:bg-sidebar-hover font-sans text-(length:--damsko-text-sm) leading-(--damsko-text-sm-line) font-medium tracking-sidebar text-start no-underline whitespace-nowrap",
    "cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default [&:is(:disabled,[aria-disabled=true])]:opacity-(--damsko-opacity-disabled) [&:is(:disabled,[aria-disabled=true])]:pointer-events-none transition-[color,background-color,width,height,padding,margin] duration-(--damsko-duration-hover) ease-[ease]",
  ],
  // A row's own words: longer than the row, they end in an ellipsis before its end.
  label: "grow min-w-0 overflow-hidden text-ellipsis",
  sm: "h-control-xs coarse:h-tap-target group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:h-sidebar-menu-button-height text-(length:--damsko-text-xs)",
  // A large row (a person, a workspace), in the words read first; it folds to its picture alone.
  // Its own height on a touch screen too: StyleX's height here replaced the row's whole height.
  lg: "rounded-lg text-sidebar-foreground h-sidebar-menu-button-height-lg coarse:h-sidebar-menu-button-height-lg group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:h-sidebar-menu-button-height ps-sidebar-row-inline group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:ps-0 pe-sidebar-row-inline has-[~[data-slot=sidebar-menu-action],~[data-slot=sidebar-menu-badge]]:pe-[calc(var(--damsko-sidebar-icon-button)+var(--damsko-space-2))] group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:pe-0",
  outline:
    "bg-background hover:bg-sidebar-hover shadow-[inset_0_0_0_var(--damsko-hairline)_var(--damsko-border)]",
  // A button that is only its icon (a search in the head, the trigger): round, the icon button's
  // size, a finger's on a touch screen; a circle, the rows' squircle does not reach it. Folded or
  // not, the same: StyleX replaced the row's whole width, height and padding.
  icon: "shrink-0 justify-center w-sidebar-icon-button coarse:w-tap-target group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:w-sidebar-icon-button group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:coarse:w-tap-target h-sidebar-icon-button coarse:h-tap-target group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:h-sidebar-icon-button group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:coarse:h-tap-target mx-0 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:mx-0 ps-0 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:ps-0 pe-0 has-[~[data-slot=sidebar-menu-action],~[data-slot=sidebar-menu-badge]]:pe-0 group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:pe-0 rounded-full corner-round",
  // The page you are on: ink laid flat over the ground, the words in the ink read first, under the
  // pointer too. In forced colours a border marks it.
  active:
    "text-sidebar-foreground hover:text-sidebar-foreground bg-sidebar-accent hover:bg-sidebar-accent border-transparent forced-colors:border-[Highlight]",
  // A count at a row's end, quiet, never pressed.
  badge:
    "absolute top-[calc((var(--damsko-sidebar-menu-button-height)-calc(var(--damsko-text-xs-line)+2*var(--damsko-hairline)))/2)] coarse:top-[calc((var(--damsko-tap-target)-calc(var(--damsko-text-xs-line)+2*var(--damsko-hairline)))/2)] end-2 flex group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:hidden items-center justify-center box-border min-w-(--damsko-text-xs-line) h-[calc(var(--damsko-text-xs-line)+2*var(--damsko-hairline))] px-sidebar-count-inline border-[length:var(--damsko-hairline)] border-solid border-sidebar-border forced-colors:border-[CanvasText] rounded-full bg-sidebar-card text-sidebar-secondary-foreground text-xs font-medium tabular-nums pointer-events-none select-none",
  // Quiet bars in a row's own box, before the rows arrive.
  skeleton:
    "flex items-center gap-sidebar-icon-gap h-sidebar-menu-button-height px-sidebar-row-inline",
  skeletonIcon:
    "flex flex-col shrink-0 size-sidebar-icon overflow-hidden rounded-sm corner-squircle",
  skeletonWords: "flex flex-col grow max-w-(--damsko-skeleton-words)",
  // The rows under a row, their words in line with its words; folded to its icons, they go.
  sub: "flex group-[[data-state=collapsed][data-collapsible=icon]]/sidebar:hidden flex-col gap-sidebar-row-gap min-w-0 mt-sidebar-row-gap mb-0 mx-0 p-0 list-none",
  subItem: "relative",
  subButton:
    "ps-[calc(var(--damsko-sidebar-row-inline)+var(--damsko-sidebar-icon)+var(--damsko-sidebar-icon-gap))]",
  subSm: "text-(length:--damsko-text-xs)",
  // The levels: the room between the header and the footer; what moves in is cut at its edges.
  levels: "relative flex flex-col grow min-w-0 min-h-0 overflow-clip",
  // A level moves in from the way the person went (`data-entering`), from the end going deeper, from
  // the start going back. With reduced motion it is simply there.
  level:
    "flex flex-col grow min-w-0 min-h-0 [animation-duration:var(--damsko-motion-ui)] [animation-timing-function:var(--damsko-ease)] [animation-fill-mode:both] data-[entering=forward]:[animation-name:damsko-from-end] data-[entering=forward]:rtl:[animation-name:damsko-from-start] data-[entering=back]:[animation-name:damsko-from-start] data-[entering=back]:rtl:[animation-name:damsko-from-end]",
  // Not shown: laid over the same room, so it keeps its size and its scroll place, unseen.
  levelAway: "absolute inset-0 invisible",
  levelHeader: "shrink-0 pt-1",
  collapsible: "grid w-full min-w-0",
  // A level's name in a row's box, in the ink read first: a heading, so nothing answers the pointer.
  levelTitle:
    "h-sidebar-menu-button-height coarse:h-sidebar-menu-button-height border-0 forced-colors:border-0 text-sidebar-foreground hover:text-sidebar-foreground bg-transparent hover:bg-transparent cursor-default",
};

// ---- State ---------------------------------------------------------------------------------------

/** What `useSidebar()` gives: the sidebar's state, and what changes it. */
interface SidebarApi {
  /** `expanded` or `collapsed`, on a wide window. */
  state: "expanded" | "collapsed";
  /** Open on a wide window. */
  open: boolean;
  /** Opens or folds it on a wide window. */
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
  /** The sheet is open, on a narrow window. */
  openMobile: boolean;
  /** Opens or closes the sheet, on a narrow window. */
  setOpenMobile: (open: boolean | ((open: boolean) => boolean)) => void;
  /** The window is narrow (under the lg breakpoint): the sidebar is a sheet. */
  isMobile: boolean;
  /** Folds or opens it, or opens or closes the sheet on a narrow window. */
  toggleSidebar: () => void;
}

interface SidebarState extends SidebarApi {
  /** The id of the sidebar's panel, which the trigger controls. */
  id: string;
  /** The keys, as `aria-keyshortcuts` names them and as a person reads them; none when off. */
  keys: { aria: string; text: string } | undefined;
  /** Where the person's choices are kept, when they are. */
  storageKey: string | undefined;
}

const SidebarContext = createContext<SidebarState | null>(null);

const useSidebarState = (part: string): SidebarState => {
  const state = use(SidebarContext);
  if (state === null) {
    throw new Error(`${part} belongs inside a SidebarProvider.`);
  }
  return state;
};

/** The sidebar's state and what changes it, inside a SidebarProvider. */
export const useSidebar = (): SidebarApi => {
  const {
    id: _id,
    keys: _keys,
    storageKey: _storageKey,
    ...api
  } = useSidebarState("useSidebar");
  return api;
};

/** The side the sidebar stands on, for its parts (the tooltips open away from it). */
type Side = "start" | "end";
const SideContext = createContext<Side>("start");

// The kept choice, read where it can be: on the server, and while the page wakes, there is none.
const readKept = (key?: string): boolean | undefined => {
  if (key === undefined) {
    return undefined;
  }
  try {
    const kept = localStorage.getItem(key);
    if (kept === "true") {
      return true;
    }
    return kept === "false" ? false : undefined;
  } catch {
    return undefined;
  }
};

const keep = (key: string | undefined, open: boolean) => {
  if (key === undefined) {
    return;
  }
  try {
    localStorage.setItem(key, String(open));
  } catch {
    // Storage refused (a private window, a full disk): the choice lasts the page.
  }
};

// Another tab's choice shows here too, until the person chooses on this page.
const watchKept = (change: () => void) => {
  window.addEventListener("storage", change);
  return () => {
    window.removeEventListener("storage", change);
  };
};

const watchMobile = (change: () => void) => {
  const query = window.matchMedia(MOBILE);
  query.addEventListener("change", change);
  return () => {
    query.removeEventListener("change", change);
  };
};
const onMobile = () => window.matchMedia(MOBILE).matches;
const notOnMobile = () => false;
const nothingKept = () => readKept();

// Every provider on the page, so that only one answers the keys.
const providers = new Set<HTMLElement>();

/** Whether this provider answers the keys: the one holding focus, else the first on the page. */
const answers = (element: HTMLElement | null) => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.isContentEditable) {
    // In rich text the same keys make text bold.
    return false;
  }
  const all = [
    ...document.querySelectorAll<HTMLElement>('[data-slot="sidebar-wrapper"]'),
  ].filter((each) => providers.has(each));
  const holder = all.find((each) => active !== null && each.contains(active));
  return (holder ?? all[0]) === element;
};

/** A value or an updater of it, applied. */
const applied = (
  value: boolean | ((open: boolean) => boolean),
  now: boolean
) => (typeof value === "function" ? value(now) : value);

/** Every prop a SidebarProvider takes. */
export interface SidebarProviderProps {
  /** The Sidebar and the SidebarInset beside it. */
  children: ReactNode;
  /** Open now. Pass it with `onOpenChange` to keep the state yourself (a cookie read on the server). */
  open?: boolean;
  /**
   * Open at first, when you do not keep the state and nothing is kept under `storageKey`.
   * @default true
   */
  defaultOpen?: boolean;
  /** Runs with the new state when the trigger, the rail or the keys fold or open it. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Where the person's choices are kept in localStorage, so they stay as they left them: whether
   * it is open, and which SidebarCollapsible groups are folded (each under `storageKey:name`). Put
   * `sidebarStateScript(storageKey)` in the page's head to draw them so before the page wakes.
   * Without it nothing is read or kept.
   */
  storageKey?: string;
  /**
   * The keys that fold and open it from anywhere on the page: `mod` is Cmd on a Mac and Ctrl
   * elsewhere. `false` turns them off. Not in rich text, where the same keys make text bold.
   * @default "mod+b"
   */
  keyboardShortcut?: string | false;
  /** Layout only: its height, in a frame of its own. It fills the window's height by default. */
  className?: LayoutClass;
}

/** Holds whether the sidebar is open, and the row the sidebar and the page stand in. */
export const SidebarProvider = ({
  children,
  open: given,
  defaultOpen = true,
  onOpenChange,
  storageKey,
  keyboardShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
  className,
}: SidebarProviderProps) => {
  const { toggle } = useI18n().sidebar;
  const [own, setOwn] = useState<boolean>();
  const [openMobile, setOpenMobile] = useState(false);
  const kept = useSyncExternalStore(
    watchKept,
    () => readKept(storageKey),
    nothingKept
  );
  const isMobile = useSyncExternalStore(watchMobile, onMobile, notOnMobile);
  const open = given ?? own ?? kept ?? defaultOpen;
  const id = useId();
  const element = useRef<HTMLDivElement | null>(null);

  // The state set in this event and not drawn yet, so an updater builds on the call before it
  // (two in one event apply twice, as React's setState); cleared once the change is drawn.
  const unseen = useRef<boolean | null>(null);
  // Folded off the canvas while focus was inside it: once the fold is drawn, focus goes to the
  // trigger that is still in reach (the page's, which may only show while the sidebar is away).
  const stranded = useRef(false);
  useEffect(() => {
    unseen.current = null;
    if (stranded.current) {
      stranded.current = false;
      const wrapper = element.current;
      const triggers =
        wrapper?.querySelectorAll<HTMLElement>(
          '[data-slot="sidebar-trigger"]'
        ) ?? [];
      [...triggers]
        .find(
          (trigger) =>
            trigger.closest(
              '[data-slot="sidebar"][data-collapsible="offcanvas"]'
            ) === null
        )
        ?.focus();
    }
  });
  const setOpen = (value: boolean | ((now: boolean) => boolean)) => {
    const now = applied(value, unseen.current ?? open);
    unseen.current = now;
    keep(storageKey, now);
    setOwn(now);
    onOpenChange?.(now);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile((now) => !now);
      return;
    }
    // Folded off the canvas, what holds focus inside goes out of reach.
    const away = element.current?.querySelector(
      '[data-slot="sidebar"][data-collapsible="offcanvas"]'
    );
    stranded.current = open && away?.contains(document.activeElement) === true;
    setOpen(!open);
  };

  const shortcut = keyboardShortcut === false ? "" : keyboardShortcut;
  // The hint formats a real shortcut only: with none, the default's is read and never shown.
  const hint = useShortcutHint(
    shortcut === "" ? SIDEBAR_KEYBOARD_SHORTCUT : shortcut
  );
  useShortcut(shortcut === "" ? null : shortcut, toggleSidebar, {
    when: () => answers(element.current),
    description: toggle,
  });

  const watch = (node: HTMLDivElement | null) => {
    element.current = node;
    if (node !== null) {
      providers.add(node);
    }
    return () => {
      if (node !== null) {
        providers.delete(node);
      }
    };
  };

  const state: SidebarState = {
    state: open ? "expanded" : "collapsed",
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    id,
    keys:
      shortcut === ""
        ? undefined
        : { aria: hint.ariaKeyshortcuts, text: hint.text },
    storageKey,
  };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
    <SidebarContext value={state}>
      <div
        ref={watch}
        data-slot="sidebar-wrapper"
        data-sidebar-key={storageKey}
        className={cn(styles.wrapper, className)}
      >
        {children}
      </div>
    </SidebarContext>
  );
};

// A string as a script's literal: JSON's, with `<` escaped too, so no key can close the script tag.
const literal = (text: string) =>
  JSON.stringify(text).replaceAll("<", String.raw`\u003c`);

/** Where a SidebarCollapsible's fold is kept: under the provider's key, by its name. */
const foldKey = (storageKey: string | undefined, name: string) =>
  storageKey === undefined ? undefined : `${storageKey}:${name}`;

/**
 * The head script that draws the kept state before the page wakes, as the theme's does: pass the
 * SidebarProvider's `storageKey`. It sets each of that provider's sidebars folded or open, and each
 * SidebarCollapsible's panel shown or hidden (its label saying so), as the parser reaches them, so
 * nothing moves when React takes over. Run once the page is read (a client router running it again), it sets them
 * once and watches nothing.
 *
 *   <script is:inline set:html={sidebarStateScript("app-sidebar")} />                    Astro
 *   <script dangerouslySetInnerHTML={{ __html: sidebarStateScript("app-sidebar") }} />   React
 */
export const sidebarStateScript = (storageKey: string): string =>
  "(()=>{try{" +
  `const k=${literal(storageKey)},w=${literal(`[data-sidebar-key=${JSON.stringify(storageKey)}] `)},` +
  'g=(n)=>{const v=localStorage.getItem(n);return v==="true"||v==="false"?v:null;},' +
  "d=()=>{const v=g(k);" +
  'if(v)for(const e of document.querySelectorAll(w+"[data-slot=sidebar]"))e.dataset.state=v==="true"?"expanded":"collapsed";' +
  'for(const e of document.querySelectorAll(w+"[data-sidebar-fold]")){' +
  'const f=g(k+":"+e.dataset.sidebarFold);if(!f)continue;' +
  'const p=e.querySelector("[data-slot=collapsible-content],[data-slot=collapsible-panel]"),t=e.querySelector("[aria-expanded]");' +
  'if(p)p[f==="true"?"removeAttribute":"setAttribute"]("hidden","until-found");' +
  'if(t)t.setAttribute("aria-expanded",f);}};' +
  'if(document.readyState!=="loading"){d();return;}' +
  "const o=new MutationObserver(d);o.observe(document,{childList:true,subtree:true});" +
  'addEventListener("DOMContentLoaded",()=>{d();o.disconnect();},{once:true});' +
  "}catch(e){}})()";

// ---- The sidebar ---------------------------------------------------------------------------------

/** Every prop a Sidebar takes. */
export interface SidebarProps {
  /** Its SidebarHeader, SidebarContent, SidebarFooter and SidebarRail, top to bottom. */
  children: ReactNode;
  /**
   * The side it stands on. Both follow the reading direction: `start` is the left in English.
   * Put it after the SidebarInset for `end`.
   * @default "start"
   */
  side?: Side;
  /**
   * `sidebar` stands on its own ground beside the page; `floating` is a raised panel a little in
   * from the window's edges; `inset` leaves the page as a card on the sidebar's ground.
   * @default "sidebar"
   */
  variant?: "sidebar" | "floating" | "inset";
  /**
   * How it folds: `offcanvas` slides it off the side, whole; `icon` folds it to a rail of its
   * icons (each row's words show in a tooltip); `none` never folds, on a phone too.
   * @default "offcanvas"
   */
  collapsible?: "offcanvas" | "icon" | "none";
  /**
   * What the sidebar is, said as a landmark.
   * @default the I18nProvider's `sidebar.name` ("Sidebar")
   */
  "aria-label"?: string;
  /** Layout only. */
  className?: LayoutClass;
}

/** The sidebar: an aside beside the page, or a sheet from its side on a narrow window. */
export const Sidebar = ({
  children,
  side = "start",
  variant = "sidebar",
  collapsible = "offcanvas",
  "aria-label": named,
  className,
}: SidebarProps) => {
  const { name } = useI18n().sidebar;
  const { state, openMobile, setOpenMobile, isMobile, id } =
    useSidebarState("Sidebar");
  const label = named ?? name;
  const floating = variant === "floating";

  if (collapsible === "none") {
    return (
      <SideContext value={side}>
        <aside
          aria-label={label}
          data-slot="sidebar"
          data-side={side}
          data-variant={variant}
          data-collapsible="none"
          className={cn(styles.aside, styles.asideFixed, className)}
        >
          <div
            data-sidebar="sidebar"
            className={cn(
              styles.inner,
              variant === "sidebar" &&
                (side === "start" ? styles.edgeStart : styles.edgeEnd)
            )}
          >
            {children}
          </div>
        </aside>
      </SideContext>
    );
  }

  if (isMobile) {
    return (
      <SideContext value={side}>
        <Sheet
          open={openMobile}
          onOpenChange={(open) => {
            setOpenMobile(open);
          }}
        >
          <SheetContent side={side} showCloseButton={false} aria-label={label}>
            <div
              data-slot="sidebar"
              data-sidebar="sidebar"
              data-mobile="true"
              data-side={side}
              className={cn(styles.sheet)}
            >
              {children}
            </div>
          </SheetContent>
        </Sheet>
      </SideContext>
    );
  }

  return (
    <SideContext value={side}>
      <aside
        aria-label={label}
        data-slot="sidebar"
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        // The head script may have set the kept state before React woke.
        suppressHydrationWarning
        className={cn(
          styles.aside,
          floating && styles.asideFloating,
          className
        )}
      >
        <div
          id={id}
          data-slot="sidebar-container"
          className={cn(
            styles.container,
            collapsible === "offcanvas" && styles.offcanvas,
            collapsible === "offcanvas" &&
              side === "start" &&
              styles.offcanvasStart,
            floating && styles.roomy,
            variant === "sidebar" &&
              (side === "start" ? styles.edgeStart : styles.edgeEnd)
          )}
        >
          <div
            data-sidebar="sidebar"
            className={cn(styles.inner, floating && styles.floating)}
          >
            {children}
          </div>
        </div>
      </aside>
    </SideContext>
  );
};

/** Every prop a SidebarTrigger takes. */
export interface SidebarTriggerProps {
  /** Runs when it is pressed, before it folds or opens the sidebar. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Its name.
   * @default the I18nProvider's `sidebar.toggle` ("Show or hide the sidebar")
   */
  "aria-label"?: string;
  /** Layout only. */
  className?: LayoutClass;
}

/**
 * The button that folds and opens the sidebar, or opens its sheet on a narrow window: a round icon
 * button in the rows' colours. It says whether the sidebar is open and its keys. Put it in the
 * sidebar's head, and in the page's bar for while the sidebar is away.
 */
export const SidebarTrigger = ({
  onClick,
  "aria-label": named,
  className,
}: SidebarTriggerProps) => {
  const { toggle } = useI18n().sidebar;
  const { open, openMobile, isMobile, toggleSidebar, id, keys } =
    useSidebarState("SidebarTrigger");
  const label = named ?? toggle;
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      data-sidebar="trigger"
      aria-label={label}
      aria-expanded={isMobile ? openMobile : open}
      aria-controls={isMobile ? undefined : id}
      aria-keyshortcuts={keys?.aria}
      title={keys === undefined ? label : `${label} (${keys.text})`}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      className={cn(styles.button, styles.icon, "focus-ring-inset", className)}
    >
      <Icon icon={PanelLeftIcon} />
    </button>
  );
};

/** Every prop a SidebarRail takes. */
export interface SidebarRailProps {
  /** Layout only. */
  className?: LayoutClass;
}

/**
 * The thin rail along the sidebar's inner edge: a press folds or opens it. For a pointer: the
 * keyboard has the trigger and the keys, so it is no tab stop.
 */
export const SidebarRail = ({ className }: SidebarRailProps) => {
  const { toggle } = useI18n().sidebar;
  const { open, toggleSidebar, id, keys } = useSidebarState("SidebarRail");
  const side = use(SideContext);
  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-label={toggle}
      aria-expanded={open}
      aria-controls={id}
      aria-keyshortcuts={keys?.aria}
      tabIndex={-1}
      title={keys === undefined ? toggle : `${toggle} (${keys.text})`}
      onClick={toggleSidebar}
      className={cn(
        styles.rail,
        side === "start" ? styles.railStart : styles.railEnd,
        className
      )}
    />
  );
};

/** Every prop a SidebarInset takes. */
export interface SidebarInsetProps {
  /** The page: its bar, with the SidebarTrigger, and its content. */
  children: ReactNode;
  /** Layout only. */
  className?: LayoutClass;
}

/** The page beside the sidebar: the main landmark, a card on its ground beside an inset sidebar. */
export const SidebarInset = ({ children, className }: SidebarInsetProps) => (
  <main data-slot="sidebar-inset" className={cn(styles.inset, className)}>
    {children}
  </main>
);

// ---- The parts -----------------------------------------------------------------------------------

/** What a layout part takes. */
interface PartProps {
  children?: ReactNode;
  /** Layout only. */
  className?: LayoutClass;
}

/** A part's own element's props, less what the part sets itself. */
type Own<Tag extends "a" | "button" | "div" | "h2" | "li" | "nav" | "ul"> =
  Omit<ComponentProps<Tag>, "className" | "style" | "children">;

/**
 * A part that is its element and its look (SidebarHeader, SidebarMenu, …): the element with
 * its slot names (`sidebar-header`, `data-sidebar="header"`) and the caller's props on it.
 */
const part = <Tag extends "div" | "li" | "ul">(
  tag: Tag,
  name: string,
  look: string | string[],
  { children, className, ...rest }: PartProps & Own<Tag>
) =>
  createElement(
    tag,
    {
      ...rest,
      "data-slot": `sidebar-${name}`,
      "data-sidebar": name,
      className: cn(look, className),
    },
    children
  );

/** Every prop a SidebarHeader takes. */
export interface SidebarHeaderProps extends PartProps, Own<"div"> {
  /** What stands at the top: a workspace's switcher, a search, a SidebarInput. */
  children: ReactNode;
}

/** The top of the sidebar, which stays while the content scrolls. */
export const SidebarHeader = (props: SidebarHeaderProps) =>
  part("div", "header", styles.header, props);

/** Every prop a SidebarFooter takes. */
export interface SidebarFooterProps extends PartProps, Own<"div"> {
  /** What stands at the foot: the person signed in and their menu, a theme control. */
  children: ReactNode;
}

/** The foot of the sidebar, which stays while the content scrolls. */
export const SidebarFooter = (props: SidebarFooterProps) =>
  part("div", "footer", styles.footer, props);

/** Every prop a SidebarContent takes. */
export interface SidebarContentProps extends PartProps, Own<"nav"> {
  /** Its SidebarGroups, top to bottom. */
  children: ReactNode;
  /**
   * What its places are, said as a navigation landmark.
   * @default the I18nProvider's `sidebar.main` ("Main")
   */
  "aria-label"?: string;
}

/** The groups between the header and the footer: a navigation, and the one part that scrolls. */
export const SidebarContent = ({
  children,
  "aria-label": named,
  className,
  ...rest
}: SidebarContentProps) => {
  const { main } = useI18n().sidebar;
  return (
    <nav
      {...rest}
      aria-label={named ?? main}
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(styles.content, "scrollbar-hidden", className)}
    >
      {children}
    </nav>
  );
};

/** Every prop a SidebarSeparator takes. */
export interface SidebarSeparatorProps {
  /** Layout only. */
  className?: LayoutClass;
}

/** A hairline between the sidebar's parts, as far in as the rows: over the footer, between groups. */
export const SidebarSeparator = ({ className }: SidebarSeparatorProps) => (
  <div
    role="none"
    data-slot="sidebar-separator"
    data-sidebar="separator"
    className={cn(styles.separator, className)}
  />
);

/** Every prop a SidebarInput takes: those of Input. Name it, by `aria-label`. */
export type SidebarInputProps = InputProps;

/** A small field in the sidebar's header: a filter of its rows, a search. */
export const SidebarInput = (props: SidebarInputProps) => (
  <div data-slot="sidebar-input" className={cn(styles.input)}>
    <Input size="sm" {...props} />
  </div>
);

/** What a part that can draw its child instead takes. */
interface SlotPartProps extends PartProps {
  /**
   * Draw the one element given as the child (a link, a CollapsibleTrigger's button) as this part,
   * with the part's look.
   * @default false
   */
  asChild?: boolean;
}

/** A part's own element, or with `asChild` the caller's, with the part's props merged onto it. */
const drawn = (
  tag: string,
  asChild: boolean | undefined,
  children: ReactNode,
  rest: Record<string, unknown>,
  own: Record<string, unknown>
) => {
  const slot = slotProps(asChild, children);
  return renderElement(
    tag,
    mergeProps(rest, own, { children: slot.children }),
    slot.render
  );
};

/**
 * A row's children with its own words (bare text) in one element that ends in an ellipsis where the
 * row does, and those words as one string. An icon, a mark and any element the caller wrote stay as
 * given: StyleX gives a part no selector for its children.
 */
const withLabel = (children: ReactNode) => {
  const parts: ReactNode[] = [];
  let words = "";
  let run = "";
  const flush = () => {
    if (run === "") {
      return;
    }
    parts.push(
      <span
        key={parts.length}
        data-slot="sidebar-menu-label"
        className={cn(styles.label)}
      >
        {run}
      </span>
    );
    words += run;
    run = "";
  };
  for (const child of listOf(children)) {
    if (typeof child === "string" || typeof child === "number") {
      run += String(child);
    } else {
      flush();
      parts.push(<Fragment key={parts.length}>{child}</Fragment>);
    }
  }
  flush();
  return { parts, words };
};

/** Whether a row's own words run past their box. */
const isCut = (row: HTMLElement | null) => {
  const label = row?.querySelector<HTMLElement>(
    ':scope > [data-slot="sidebar-menu-label"]'
  );
  return (
    label !== null &&
    label !== undefined &&
    label.scrollWidth > label.clientWidth
  );
};

interface RowElementProps {
  tag: "a" | "button";
  /** The caller's element, with `asChild`. */
  render: ReactElement<Record<string, unknown>> | undefined;
  /** The row's own props and the caller's, merged. */
  base: Record<string, unknown>;
  /** The tooltip repeats the row's own words: it describes nothing new. */
  repeats: boolean;
  children: ReactNode;
}

/** A row's element as its tooltip's trigger: the trigger's props arrive here, merged onto the row. */
const RowElement = ({
  tag,
  render,
  base,
  repeats,
  children,
  ...trigger
}: RowElementProps & Record<string, unknown>) => {
  const { "aria-describedby": description, ...plain } = trigger;
  return renderElement(
    tag,
    mergeProps(
      base,
      repeats ? plain : { ...plain, "aria-describedby": description },
      { children }
    ),
    render
  );
};

interface RowProps {
  tag: "a" | "button";
  asChild: boolean | undefined;
  children: ReactNode;
  /** The row's own props and the caller's, merged. */
  base: Record<string, unknown>;
  /** The caller's name for it, shown while the sidebar is folded to its icons. */
  tooltip?: ReactNode;
}

/**
 * A row of the menu (SidebarMenuButton, SidebarMenuSubButton): its words cut where the row ends,
 * and a tooltip at the row's far side that shows them whole while they are cut, or, folded to its
 * icons, the caller's `tooltip`. Not on a narrow window, where nothing hovers.
 */
const Row = ({ tag, asChild, children, base, tooltip }: RowProps) => {
  const { state, isMobile } = useSidebarState("SidebarMenuButton");
  const side = use(SideContext);
  const element = useRef<HTMLElement | null>(null);
  const slot = slotWords(asChild, children);
  const { parts, words } = withLabel(slot.children);
  const named = state === "collapsed" && tooltip !== undefined;
  if (!named && words === "") {
    return renderElement(
      tag,
      mergeProps(base, { children: parts }),
      slot.render
    );
  }
  const onlyWhileCut: TooltipProps["onOpenChange"] = (open, details) => {
    if (open && !named && !isCut(element.current)) {
      details.cancel();
    }
  };
  return (
    <Tooltip disabled={isMobile} onOpenChange={onlyWhileCut}>
      <TooltipTrigger
        asChild
        ref={(node: HTMLElement | null) => {
          element.current = node;
        }}
      >
        <RowElement tag={tag} render={slot.render} base={base} repeats={!named}>
          {parts}
        </RowElement>
      </TooltipTrigger>
      <TooltipContent side={side === "start" ? "end" : "start"}>
        {named ? tooltip : words}
      </TooltipContent>
    </Tooltip>
  );
};

/** Every prop a SidebarGroup takes. */
export interface SidebarGroupProps extends PartProps, Own<"div"> {
  /** Its SidebarGroupLabel, SidebarGroupAction and SidebarGroupContent. */
  children: ReactNode;
}

/** A group of places: a label over a menu. */
export const SidebarGroup = (props: SidebarGroupProps) =>
  part("div", "group", styles.group, props);

/** Every prop a SidebarCollapsible takes. */
export interface SidebarCollapsibleProps {
  /** A SidebarGroup whose SidebarGroupLabel is a CollapsibleTrigger and whose rows stand in a CollapsibleContent. */
  children: ReactNode;
  /**
   * What its fold is kept under, unique among the provider's: with the SidebarProvider's
   * `storageKey`, the person's choice stays as they left it, in every level.
   */
  name: string;
  /** Whether it is open. Pass it with `onOpenChange` to keep the state yourself. */
  open?: boolean;
  /**
   * Open at first, when you do not keep the state and nothing is kept for it.
   * @default true
   */
  defaultOpen?: boolean;
  /** Runs with the new state when its trigger is pressed. */
  onOpenChange?: (open: boolean) => void;
}

const awake = () => true;
const asleep = () => false;

/** What takes focus inside an element, in the page's order. */
const stopsIn = (element: HTMLElement | null): HTMLElement[] => [
  ...(element?.querySelectorAll<HTMLElement>(
    "a[href], button, input, [tabindex]"
  ) ?? []),
];

/**
 * A group that folds: a Collapsible whose state the sidebar keeps by `name`, as it keeps whether
 * it is open. The server and the waking page draw `defaultOpen`, and `sidebarStateScript` shows or
 * hides the panel as kept before that; once awake, a kept fold that differs is drawn anew in one
 * step, so nothing opens or folds in front of the person.
 */
export const SidebarCollapsible = ({
  children,
  name,
  open: given,
  defaultOpen = true,
  onOpenChange,
}: SidebarCollapsibleProps) => {
  const key = foldKey(useSidebarState("SidebarCollapsible").storageKey, name);
  const kept = useSyncExternalStore(
    watchKept,
    () => readKept(key),
    nothingKept
  );
  const isAwake = useSyncExternalStore(watchKept, awake, asleep);
  const [own, setOwn] = useState<boolean>();
  // Whether the fold kept differed from the one first drawn, said once, as the page wakes: the
  // Collapsible is then a new one (its key), which starts as kept with nothing to move.
  const [start, setStart] = useState<"first" | "same" | "kept">("first");
  if (isAwake && start === "first") {
    setStart(kept !== undefined && kept !== defaultOpen ? "kept" : "same");
  }
  // Drawn anew, the group's elements are new ones: focus that stood in it before the page woke
  // (on its label, most often) is put back on the same stop, or on the first when that one is
  // now folded away.
  const box = useRef<HTMLDivElement>(null);
  const stood = useRef(-1);
  useLayoutEffect(() => {
    const focused = document.activeElement;
    stood.current =
      focused instanceof HTMLElement
        ? stopsIn(box.current).indexOf(focused)
        : -1;
  }, []);
  useLayoutEffect(() => {
    if (start !== "kept" || stood.current === -1) {
      return;
    }
    const stops = stopsIn(box.current);
    const stop = stops[stood.current];
    stood.current = -1;
    stop?.focus();
    if (document.activeElement !== stop) {
      stops[0]?.focus();
    }
  }, [start]);
  return (
    <Collapsible
      key={start === "kept" ? "kept" : "first"}
      asChild
      open={given ?? own ?? kept ?? defaultOpen}
      onOpenChange={(now: boolean) => {
        keep(key, now);
        setOwn(now);
        onOpenChange?.(now);
      }}
    >
      <div
        ref={box}
        data-slot="sidebar-collapsible"
        data-sidebar-fold={name}
        className={cn(styles.collapsible)}
      >
        {children}
      </div>
    </Collapsible>
  );
};

/** Every prop a SidebarGroupLabel takes: these, and the rest of a <div>. */
export interface SidebarGroupLabelProps extends SlotPartProps, Own<"div"> {
  /** The label ("Projects"); with `asChild`, the element that holds it. */
  children: ReactNode;
}

/** The small label over a group's menu, in the rows' ink. Folded to its icons, it gives its room up. */
export const SidebarGroupLabel = ({
  asChild,
  children,
  className,
  ...rest
}: SidebarGroupLabelProps) =>
  drawn("div", asChild, children, rest, {
    "data-slot": "sidebar-group-label",
    "data-sidebar": "group-label",
    // As a SidebarCollapsible's trigger, the head script may have set whether it says it is open
    // before the page woke: that is not a fault.
    suppressHydrationWarning: true,
    className: cn(styles.groupLabel, "focus-ring-inset", className),
  });

/** Every prop a SidebarGroupAction takes: these, and the rest of a <button>. */
export interface SidebarGroupActionProps extends SlotPartProps, Own<"button"> {
  /** Its icon; name it by `aria-label`. With `asChild`, the element drawn. */
  children: ReactNode;
}

/** A small button at the end of a group's label ("Add a project"). */
export const SidebarGroupAction = ({
  asChild,
  children,
  className,
  ...rest
}: SidebarGroupActionProps) =>
  drawn(
    "button",
    asChild,
    children,
    asChild === true ? rest : { type: "button", ...rest },
    {
      "data-slot": "sidebar-group-action",
      "data-sidebar": "group-action",
      className: cn(
        styles.action,
        styles.groupAction,
        "focus-ring-inset",
        className
      ),
    }
  );

/** Every prop a SidebarGroupContent takes. */
export interface SidebarGroupContentProps extends PartProps, Own<"div"> {
  /** Its SidebarMenu. */
  children: ReactNode;
}

/** What a group holds, under its label. */
export const SidebarGroupContent = (props: SidebarGroupContentProps) =>
  part("div", "group-content", styles.groupContent, props);

/** Every prop a SidebarMenu takes. */
export interface SidebarMenuProps extends PartProps, Own<"ul"> {
  /** Its SidebarMenuItems, in order. */
  children: ReactNode;
}

/** A list of places: links, not a menu of commands, so Tab and Enter do what they do on a page. */
export const SidebarMenu = (props: SidebarMenuProps) =>
  part("ul", "menu", styles.menu, props);

/** Every prop a SidebarMenuItem takes. */
export interface SidebarMenuItemProps extends PartProps, Own<"li"> {
  /** Its SidebarMenuButton, and its SidebarMenuAction, SidebarMenuBadge or SidebarMenuSub. */
  children: ReactNode;
}

/** One place in the menu. */
export const SidebarMenuItem = (props: SidebarMenuItemProps) =>
  part("li", "menu-item", styles.menuItem, props);

/** Every prop a SidebarMenuButton takes: these, and the rest of a <button>. */
export interface SidebarMenuButtonProps extends SlotPartProps, Own<"button"> {
  /**
   * An `<Icon />` and the words, as bare text; with `asChild`, the link that holds them
   * (`<a href>`, a router's link). The words end in an ellipsis where the row does, and a tooltip
   * shows them whole while they are cut. An element you write (a `<span>` of two lines, a count, a
   * product's working mark) is drawn as given.
   */
  children: ReactNode;
  /**
   * The page you are on: filled, and said as the current page (`aria-current`).
   * @default false
   */
  isActive?: boolean;
  /**
   * What its tooltip says while the sidebar is folded to its icons, when not its own words (a
   * row with a picture and no bare text). Not shown on a narrow window.
   * @default its own words
   */
  tooltip?: ReactNode;
  /**
   * `sm` 28px, `default` 32px, `lg` 46px for a row with a picture and two lines (a workspace, a
   * person), `icon` a round 28px button that is only its icon, named by `aria-label` (a search in
   * the header). On a touch screen all but `lg` are 44px.
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * `default` lies on the sidebar's ground; `outline` stands on the page's ground with a hairline.
   * @default "default"
   */
  variant?: "default" | "outline";
}

/** A place: a link (with `asChild`) or a button, with its icon and its words. */
export const SidebarMenuButton = ({
  asChild,
  children,
  isActive = false,
  tooltip,
  size: sized = "default",
  variant = "default",
  className,
  ...rest
}: SidebarMenuButtonProps) => {
  const own = {
    "data-slot": "sidebar-menu-button",
    "data-sidebar": "menu-button",
    "data-size": sized,
    "data-active": isActive ? "true" : undefined,
    "aria-current": isActive ? "page" : undefined,
    className: cn(
      styles.button,
      sized === "sm" && styles.sm,
      sized === "lg" && styles.lg,
      sized === "icon" && styles.icon,
      variant === "outline" && styles.outline,
      isActive && styles.active,
      "focus-ring-inset",
      className
    ),
  };
  return (
    <Row
      tag="button"
      asChild={asChild}
      base={mergeProps(
        asChild === true ? rest : { type: "button", ...rest },
        own
      )}
      tooltip={tooltip}
    >
      {children}
    </Row>
  );
};

/** Every prop a SidebarMenuAction takes: these, and the rest of a <button>. */
export interface SidebarMenuActionProps extends SlotPartProps, Own<"button"> {
  /** Its icon; name it by `aria-label` ("More for Weekly numbers"). With `asChild`, the element drawn. */
  children: ReactNode;
  /**
   * Shown only while the pointer is on its row, focus is in the row or its menu is open; always
   * on a touch screen.
   * @default false
   */
  showOnHover?: boolean;
}

/** A small button at a row's end: its menu, most often (a DropdownMenuTrigger's `asChild`). */
export const SidebarMenuAction = ({
  asChild,
  children,
  showOnHover = false,
  className,
  ...rest
}: SidebarMenuActionProps) =>
  drawn(
    "button",
    asChild,
    children,
    asChild === true ? rest : { type: "button", ...rest },
    {
      "data-slot": "sidebar-menu-action",
      "data-sidebar": "menu-action",
      className: cn(
        styles.action,
        styles.menuAction,
        showOnHover && styles.showOnHover,
        "focus-ring-inset",
        className
      ),
    }
  );

/** Every prop a SidebarMenuBadge takes. */
export interface SidebarMenuBadgeProps extends PartProps, Own<"div"> {
  /** A count of what waits there. */
  children: ReactNode;
}

/** A count at a row's end. */
export const SidebarMenuBadge = (props: SidebarMenuBadgeProps) =>
  part("div", "menu-badge", styles.badge, props);

/** Every prop a SidebarMenuSkeleton takes. */
export interface SidebarMenuSkeletonProps {
  /**
   * A square where the row's icon will be.
   * @default false
   */
  showIcon?: boolean;
  /** Layout only. */
  className?: LayoutClass;
}

/** A width between half and nine tenths of the row, the same on the server and in the browser. */
const widthOf = (id: string) => {
  let sum = 0;
  for (const letter of id) {
    sum = (sum * 31 + (letter.codePointAt(0) ?? 0)) % 997;
  }
  return `${50 + (sum % 41)}%`;
};

/**
 * Quiet bars in a row's own box, before the rows arrive. Hidden from a screen reader: say what is
 * loading where the menu stands (`aria-busy`).
 */
export const SidebarMenuSkeleton = ({
  showIcon = false,
  className,
}: SidebarMenuSkeletonProps) => {
  const id = useId();
  return (
    <div
      aria-hidden="true"
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn(styles.skeleton, className)}
    >
      {showIcon && (
        <span className={cn(styles.skeletonIcon)}>
          <Skeleton variant="rectangular" animation={false} />
        </span>
      )}
      <span
        className={styles.skeletonWords}
        style={{ "--damsko-skeleton-words": widthOf(id) }}
      >
        <Skeleton animation={false} />
      </span>
    </div>
  );
};

/** Every prop a SidebarMenuSub takes. */
export interface SidebarMenuSubProps extends PartProps, Own<"ul"> {
  /** Its SidebarMenuSubItems, in order. */
  children: ReactNode;
}

/** The places within a place, under its row, their words in line with its words. Folded to its icons, they go. */
export const SidebarMenuSub = (props: SidebarMenuSubProps) =>
  part("ul", "menu-sub", styles.sub, props);

/** Every prop a SidebarMenuSubItem takes. */
export interface SidebarMenuSubItemProps extends PartProps, Own<"li"> {
  /** Its SidebarMenuSubButton. */
  children: ReactNode;
}

/** One place within a place. */
export const SidebarMenuSubItem = (props: SidebarMenuSubItemProps) =>
  part("li", "menu-sub-item", styles.subItem, props);

/** Every prop a SidebarMenuSubButton takes: these, and the rest of an <a>. */
export interface SidebarMenuSubButtonProps extends SlotPartProps, Own<"a"> {
  /**
   * Its words, as bare text; with `asChild`, the link that holds them (a router's link). They end
   * in an ellipsis where the row does, and a tooltip shows them whole while they are cut.
   */
  children: ReactNode;
  /**
   * The page you are on: filled, and said as the current page (`aria-current`).
   * @default false
   */
  isActive?: boolean;
  /**
   * `sm` in the small words, `default` in the rows' own.
   * @default "default"
   */
  size?: "sm" | "default";
}

/** A place within a place: a link. */
export const SidebarMenuSubButton = ({
  asChild,
  children,
  isActive = false,
  size: sized = "default",
  className,
  ...rest
}: SidebarMenuSubButtonProps) => (
  <Row
    tag="a"
    asChild={asChild}
    base={mergeProps(rest, {
      "data-slot": "sidebar-menu-sub-button",
      "data-sidebar": "menu-sub-button",
      "data-size": sized,
      "data-active": isActive ? "true" : undefined,
      "aria-current": isActive ? "page" : undefined,
      className: cn(
        styles.button,
        styles.subButton,
        sized === "sm" && styles.subSm,
        isActive && styles.active,
        "focus-ring-inset",
        className
      ),
    })}
  >
    {children}
  </Row>
);

// ---- Levels --------------------------------------------------------------------------------------

interface LevelsState {
  /** The level shown. */
  value: string;
  setValue: (value: string) => void;
  /** A SidebarLevel's element, kept under its value while it is in the page. */
  register: (value: string, element: HTMLElement) => () => void;
}

const LevelsContext = createContext<LevelsState | null>(null);

const useLevels = (name: string): LevelsState => {
  const levels = use(LevelsContext);
  if (levels === null) {
    throw new Error(`${name} belongs inside a SidebarLevels.`);
  }
  return levels;
};

/** Whether focus can go to it now: drawn (not in a folded group), and not out of reach. */
const inReach = (element: HTMLElement) =>
  element.isConnected &&
  element.checkVisibility({ visibilityProperty: true }) &&
  element.closest("[inert]") === null;

/**
 * Where focus lands in a level it is moved into: what held it there before, on the way back; else
 * the page you are on; else its first stop. One that cannot take focus now (its group folded,
 * its row gone) is passed over.
 */
const landingIn = (level: HTMLElement, opener: HTMLElement | undefined) =>
  [
    opener !== undefined && level.contains(opener) ? opener : null,
    level.querySelector<HTMLElement>('[aria-current="page"]'),
    ...level.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"),
  ].find((stop) => stop !== null && inReach(stop));

/** Every prop a SidebarLevels takes. */
export interface SidebarLevelsProps {
  /** Its SidebarLevels, the main one first and each deeper one after it. */
  children: ReactNode;
  /**
   * The level shown, when you keep it: the router's (`"settings"` under `/settings`). Pair it
   * with `onValueChange` where a SidebarLevelTrigger changes it.
   */
  value?: string;
  /** The level shown at first, when you do not keep it. One of `value` and `defaultValue` is needed. */
  defaultValue?: string;
  /** Runs with the level a SidebarLevelTrigger asks for. */
  onValueChange?: (value: string) => void;
  /** Layout only. */
  className?: LayoutClass;
}

/**
 * The levels of a sidebar, between its header and its footer, which stay: the main list, and one
 * for each area that has a navigation of its own. One is shown at a time, the one `value` names;
 * the rest stay in the page, unseen and out of reach, each with its scroll place. A level moves in
 * from the way the person went, by the order the levels stand in the page. When focus was in the
 * level left, it goes to the new one's current row, and on the way back to what held it there
 * before; the new level's name (its SidebarContent's) is said once.
 */
export const SidebarLevels = ({
  children,
  value: given,
  defaultValue,
  onValueChange,
  className,
}: SidebarLevelsProps) => {
  const [own, setOwn] = useState(defaultValue);
  const value = given ?? own;
  if (value === undefined) {
    throw new Error("SidebarLevels needs a `value` or a `defaultValue`.");
  }
  const setValue = (next: string) => {
    setOwn(next);
    onValueChange?.(next);
  };

  // Each level's element, by its value: wherever it stands under here, a wrapper round it or not.
  const elements = useRef(new Map<string, HTMLElement>());
  const register = (name: string, element: HTMLElement) => {
    elements.current.set(name, element);
    return () => {
      if (elements.current.get(name) === element) {
        elements.current.delete(name);
      }
    };
  };
  const shown = useRef(value);
  // What held focus in each level as it was left, for the way back to it.
  const held = useRef(new Map<string, HTMLElement>());
  // The name waiting to be said: a level left again before it was said is never said.
  const saying = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Before the browser paints the new level, and before it takes focus off what is now out of
  // reach: whether focus was in the level left is read while it still says so.
  useLayoutEffect(() => {
    const before = shown.current;
    shown.current = value;
    const from = elements.current.get(before);
    const to = elements.current.get(value);
    if (before === value || to === undefined) {
      return;
    }
    const back =
      from !== undefined &&
      // oxlint-disable-next-line no-bitwise -- the DOM's own flags
      (from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_PRECEDING) !==
        0;
    if (from !== undefined) {
      delete from.dataset.entering;
    }
    to.dataset.entering = back ? "back" : "forward";
    const name = to
      .querySelector('[data-slot="sidebar-content"]')
      ?.getAttribute("aria-label");
    clearTimeout(saying.current ?? undefined);
    saying.current = null;
    if (name !== null && name !== undefined) {
      saying.current = setTimeout(() => {
        announce(name);
      }, durations.ui);
    }
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || from?.contains(active) !== true) {
      // Focus is elsewhere (the page, the footer's menu): it is not the levels' to move.
      return;
    }
    held.current.set(before, active);
    const target = landingIn(to, back ? held.current.get(value) : undefined);
    held.current.delete(value);
    // The level keeps the scroll place it was left with; only a ring the keys would show out of
    // sight brings its row into view.
    target?.focus({ preventScroll: true });
    if (target?.matches(":focus-visible") === true) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [value]);
  useEffect(
    () => () => {
      clearTimeout(saying.current ?? undefined);
    },
    []
  );

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
    <LevelsContext value={{ value, setValue, register }}>
      <div data-slot="sidebar-levels" className={cn(styles.levels, className)}>
        {children}
      </div>
    </LevelsContext>
  );
};

/** Every prop a SidebarLevel takes. */
export interface SidebarLevelProps extends PartProps {
  /** Its SidebarLevelHeader, when it is not the main one, and its SidebarContent. */
  children: ReactNode;
  /** What the SidebarLevels' `value` calls it (`"main"`, `"settings"`). */
  value: string;
}

/** One level: a navigation of its own between the header and the footer, shown while it is the SidebarLevels' `value`. */
export const SidebarLevel = ({
  children,
  value,
  className,
}: SidebarLevelProps) => {
  const levels = useLevels("SidebarLevel");
  const shown = levels.value === value;
  return (
    <div
      ref={(element) =>
        element === null ? undefined : levels.register(value, element)
      }
      data-slot="sidebar-level"
      data-state={shown ? "active" : "inactive"}
      inert={!shown}
      onAnimationEnd={(event) => {
        // Arrived: nothing is left that could run again when the sidebar is drawn anew.
        if (event.target === event.currentTarget) {
          delete event.currentTarget.dataset.entering;
        }
      }}
      className={cn(styles.level, !shown && styles.levelAway, className)}
    >
      {children}
    </div>
  );
};

/** Every prop a SidebarLevelHeader takes. */
export interface SidebarLevelHeaderProps extends PartProps, Own<"div"> {
  /** The row that leads back, in a SidebarMenu, then the SidebarLevelTitle. */
  children: ReactNode;
}

/** The top of a level, which stays while its content scrolls: the way back, then its name. */
export const SidebarLevelHeader = (props: SidebarLevelHeaderProps) =>
  part("div", "level-header", [styles.group, styles.levelHeader], props);

/** Every prop a SidebarLevelTitle takes: these, and the rest of an <h2>. */
export interface SidebarLevelTitleProps extends PartProps, Own<"h2"> {
  /**
   * An `<Icon />` and the level's name, as bare text ("Settings"). Folded to its icons, the
   * sidebar shows the icon alone.
   */
  children: ReactNode;
}

/** A level's name: a heading in a row's box, under the way back. */
export const SidebarLevelTitle = ({
  children,
  className,
  ...rest
}: SidebarLevelTitleProps) => (
  <h2
    {...rest}
    data-slot="sidebar-level-title"
    data-sidebar="level-title"
    className={cn(styles.button, styles.levelTitle, className)}
  >
    {withLabel(children).parts}
  </h2>
);

/** Every prop a SidebarLevelTrigger takes: a SidebarMenuButton's, and the level it shows. */
export interface SidebarLevelTriggerProps extends Omit<
  SidebarMenuButtonProps,
  "value"
> {
  /** The level it shows: that SidebarLevel's `value`. */
  value: string;
}

/**
 * A row that shows another level, in a sidebar that keeps the level itself: a SidebarMenuButton, a
 * link with `asChild`. The row into a level and the row that leads back are both one. Where the
 * address says which level is shown, a plain SidebarMenuButton link does.
 */
export const SidebarLevelTrigger = ({
  value,
  onClick,
  ...rest
}: SidebarLevelTriggerProps) => {
  const { setValue } = useLevels("SidebarLevelTrigger");
  return (
    <SidebarMenuButton
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setValue(value);
        }
      }}
    />
  );
};
