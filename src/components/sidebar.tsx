// Sidebar: an app's main places down one side, from shadcn's (registry/bases/base/ui/sidebar.tsx),
// converted from Tailwind to StyleX: a provider that holds whether it is open, the sidebar with its
// header, its content in groups of menus and its footer, a trigger and a rail that fold it, and the
// page beside it (SidebarInset).
// Adapted from shadcn/ui (MIT), see THIRD_PARTY_NOTICES.md.
//
//   <SidebarProvider>
//     <Sidebar collapsible="icon">
//       <SidebarHeader>…</SidebarHeader>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Workspace</SidebarGroupLabel>
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton asChild isActive tooltip="Inbox">
//                 <a href="/inbox"><Icon icon={InboxIcon} /><span>Inbox</span></a>
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
// `collapsible` folds it off the canvas or down to its icons, where each SidebarMenuButton's
// `tooltip` names it. Under the lg breakpoint it is a Sheet from its side, which holds Tab inside
// and gives focus back to the trigger. Cmd+B on a Mac, Ctrl+B elsewhere, folds and opens it from
// anywhere on the page (`keyboardShortcut`); where a page holds several, the one holding focus
// answers, else the first. `storageKey` keeps the person's choice in localStorage, and
// `sidebarStateScript` draws it before the page wakes. Nothing here knows a product: a profile, a
// theme control or a working mark is the caller's, composed into the parts.
"use client";

import * as stylex from "@stylexjs/stylex";
import { mergeProps, renderElement } from "@ui-sdk/react/primitive";
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts";
import {
  createContext,
  createElement,
  Fragment,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  ComponentProps,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { useI18n } from "../lib/i18n";
import { Icon, PanelLeftIcon } from "../lib/icons";
import { focusRingInset, scrollbarHidden } from "../lib/styles";
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
import { px } from "../lib/tokens.values";
import { listOf, slotProps, slotWords } from "../lib/utils";
import type { LayoutStyle } from "../lib/utils";
import { iconVars, motionVars } from "../lib/vars.stylex";
import { Button } from "./button";
import { Input } from "./input";
import type { InputProps } from "./input";
import { Separator } from "./separator";
import { Sheet, SheetContent } from "./sheet";
import { sidebarMarker, sidebarMenuItemMarker } from "./sidebar.stylex";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/** The keys that fold the sidebar and open it again: Cmd+B on a Mac, Ctrl+B elsewhere. */
export const SIDEBAR_KEYBOARD_SHORTCUT = "mod+b";

// Under the lg breakpoint the sidebar is a sheet: the page is too narrow to stand beside it.
const MOBILE = `(width < ${px.lg}px)`;

// ---- The look ------------------------------------------------------------------------------------

const HOVER = media.hover;
const COARSE = media.pointerCoarse;
const FORCED = media.forcedColors;
const BELOW = media.maxLg;
const ROW = size.sidebarMenuButtonHeight;
const ICON = size.sidebarIcon;
const ACTION = size.sidebarIconButton;
// Folded to its icons, a row is a square the row's height, in the middle of the rail.
const SQUARE_MARGIN = `calc((${size.sidebarRailWidth} - 2 * ${space["2"]} - ${ROW}) / 2)`;
const SQUARE_PADDING = `calc((${ROW} - ${ICON}) / 2)`;
const styles = stylex.create({
  // The row the sidebar and the page stand in: the window's height unless the frame sets its own.
  // What slides off the canvas is cut at its edges. Under an inset page, the sidebar's ground.
  wrapper: {
    display: "flex",
    width: "100%",
    minHeight: "100svh",
    overflowX: "clip",
    backgroundColor: {
      default: null,
      ":has(> [data-variant=inset])": colors.sidebar,
    },
  },

  // The aside holds its room in the row; its width follows the fold.
  aside: {
    position: "relative",
    display: { default: "flex", [BELOW]: "none" },
    flexShrink: 0,
    alignSelf: "stretch",
    width: {
      default: size.sidebarWidth,
      ':is([data-state="collapsed"][data-collapsible="offcanvas"])': 0,
      ':is([data-state="collapsed"][data-collapsible="icon"])':
        size.sidebarRailWidth,
    },
    color: colors.sidebarText,
    transitionProperty: "width",
    transitionDuration: motionVars.ui,
    transitionTimingFunction: duration.ease,
  },
  // Floating or inset, the panel stands in by space-2: the rail grows by as much on each side.
  asideRoomy: {
    width: {
      default: size.sidebarWidth,
      ':is([data-state="collapsed"][data-collapsible="offcanvas"])': 0,
      ':is([data-state="collapsed"][data-collapsible="icon"])': `calc(${size.sidebarRailWidth} + 2 * ${space["2"]})`,
    },
  },
  // Never folding: as wide as the sidebar, on a phone too, beside what it stands with.
  asideFixed: {
    display: "flex",
    width: size.sidebarWidth,
  },

  // The panel: as tall as the window at most, held in view while the page scrolls past.
  container: {
    position: "sticky",
    insetBlockStart: 0,
    display: "flex",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    maxHeight: "100svh",
    transitionProperty: "translate, visibility",
    transitionDuration: motionVars.ui,
    transitionTimingFunction: duration.ease,
  },
  // Off the canvas it keeps its width and slides out past its side, and once gone it is out of
  // reach: hidden, so no tab stop lands on what cannot be seen.
  offcanvas: {
    flexShrink: 0,
    width: size.sidebarWidth,
    visibility: {
      default: null,
      [stylex.when.ancestor('[data-state="collapsed"]', sidebarMarker)]:
        "hidden",
    },
  },
  offcanvasStart: {
    translate: {
      default: null,
      [stylex.when.ancestor('[data-state="collapsed"]', sidebarMarker)]: {
        default: "-100% 0",
        ":dir(rtl)": "100% 0",
      },
    },
  },
  // At the end the aside shrinks towards the end and the panel goes with it.
  edgeStart: {
    borderInlineEndWidth: size.hairline,
    borderInlineEndStyle: "solid",
    borderInlineEndColor: { default: colors.border, [FORCED]: "CanvasText" },
  },
  edgeEnd: {
    borderInlineStartWidth: size.hairline,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: { default: colors.border, [FORCED]: "CanvasText" },
  },
  roomy: { padding: space["2"] },

  // What it holds: the header, the content and the footer, top to bottom.
  inner: {
    [iconVars.size]: ICON,
    [iconVars.stroke]: size.iconStroke,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    minHeight: 0,
    backgroundColor: colors.sidebar,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  floating: {
    borderRadius: radius.sidebarCardRadius,
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.border, [FORCED]: "CanvasText" },
    boxShadow: shadow.sm,
  },
  // In a sheet, on a narrow window: it fills the sheet.
  sheet: {
    [iconVars.size]: ICON,
    [iconVars.stroke]: size.iconStroke,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    color: colors.sidebarText,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },

  // The rail along its inner edge: pressed, it folds or opens the sidebar. A line shows under the
  // pointer. It stays in reach while the sidebar is off the canvas, at the window's edge.
  rail: {
    position: "absolute",
    insetBlock: 0,
    zIndex: 1,
    width: space["4"],
    padding: 0,
    borderWidth: 0,
    visibility: "visible",
    cursor: "ew-resize",
    backgroundColor: "transparent",
    backgroundImage: {
      default: null,
      ":hover": `linear-gradient(to right, transparent calc(50% - ${size.hairline}), ${colors.border} calc(50% - ${size.hairline}), ${colors.border} calc(50% + ${size.hairline}), transparent calc(50% + ${size.hairline}))`,
    },
    display: { default: "block", [BELOW]: "none" },
  },
  railStart: { insetInlineEnd: `calc(-1 * ${space["2"]})` },
  railEnd: { insetInlineStart: `calc(-1 * ${space["2"]})` },

  // The page beside it.
  inset: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
    backgroundColor: colors.background,
    // Beside an inset sidebar it is a card on the sidebar's ground, from the lg breakpoint.
    margin: {
      default: null,
      [stylex.when.anySibling('[data-variant="inset"]', sidebarMarker)]: {
        default: null,
        [media.lg]: space["2"],
      },
    },
    marginInlineStart: {
      default: null,
      [stylex.when.siblingBefore(
        '[data-variant="inset"][data-state="expanded"]',
        sidebarMarker
      )]: { default: null, [media.lg]: 0 },
    },
    marginInlineEnd: {
      default: null,
      [stylex.when.siblingAfter(
        '[data-variant="inset"][data-state="expanded"]',
        sidebarMarker
      )]: { default: null, [media.lg]: 0 },
    },
    borderRadius: {
      default: null,
      [stylex.when.anySibling('[data-variant="inset"]', sidebarMarker)]: {
        default: null,
        [media.lg]: radius.sidebarCardRadius,
      },
    },
    boxShadow: {
      default: null,
      [stylex.when.anySibling('[data-variant="inset"]', sidebarMarker)]: {
        default: null,
        [media.lg]: shadow.sidebarCardShadow,
      },
    },
    transitionProperty: "margin",
    transitionDuration: motionVars.ui,
    transitionTimingFunction: duration.ease,
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    padding: space["2"],
  },
  // The one part that scrolls, its bar hidden; folded to its icons, nothing scrolls sideways.
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: space["2"],
    minHeight: 0,
    overflow: {
      default: "auto",
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: "hidden",
    },
    overscrollBehavior: "contain",
  },
  separator: {
    display: "flex",
    flexDirection: "column",
    marginInline: space["2"],
  },
  input: { display: "flex", flexDirection: "column" },

  group: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    padding: space["2"],
  },
  // The small label over a group's menu; folded to its icons, it gives its room up.
  groupLabel: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["2"],
    boxSizing: "border-box",
    width: "100%",
    height: ROW,
    margin: 0,
    paddingInline: size.sidebarRowInline,
    borderWidth: 0,
    borderRadius: radius.sidebarRadius,
    backgroundColor: "transparent",
    color: colors.sidebarTextTertiary,
    fontFamily: font.sans,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    textAlign: "start",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textDecoration: "none",
    opacity: {
      default: 1,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: 0,
    },
    marginBlockStart: {
      default: 0,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: `calc(-1 * ${ROW})`,
    },
    transitionProperty: "margin-block-start, opacity",
    transitionDuration: motionVars.ui,
    transitionTimingFunction: duration.ease,
  },
  groupContent: { width: "100%", fontSize: font.textSm },

  // A small button at the end of a row or a group's label.
  action: {
    position: "absolute",
    display: {
      default: "flex",
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: "none",
    },
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    width: ACTION,
    height: ACTION,
    padding: 0,
    borderWidth: { default: 0, [FORCED]: size.hairline },
    borderStyle: "solid",
    borderColor: "ButtonText",
    borderRadius: radius.sidebarRadius,
    color: {
      default: colors.sidebarTextSecondary,
      [HOVER]: { default: null, ":hover": colors.sidebarText },
    },
    backgroundColor: {
      default: "transparent",
      [HOVER]: { default: null, ":hover": colors.sidebarHover },
      ":is([aria-expanded=true])": colors.sidebarHover,
    },
    cursor: "pointer",
    transitionProperty: "color, background-color, opacity",
    transitionDuration: duration.hover,
  },
  groupAction: {
    insetBlockStart: `calc(${space["2"]} + (${ROW} - ${ACTION}) / 2)`,
    insetInlineEnd: `calc(${space["2"]} + (${ROW} - ${ACTION}) / 2)`,
  },
  menuAction: {
    insetBlockStart: {
      default: `calc((${ROW} - ${ACTION}) / 2)`,
      [COARSE]: `calc((${size.tapTarget} - ${ACTION}) / 2)`,
    },
    insetInlineEnd: `calc((${ROW} - ${ACTION}) / 2)`,
  },
  // Shown while the pointer is on its row, focus is in the row or its menu is open; on a touch
  // screen, always.
  showOnHover: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(":hover", sidebarMenuItemMarker)]: 1,
      [stylex.when.ancestor(":focus-within", sidebarMenuItemMarker)]: 1,
      ":is([aria-expanded=true])": 1,
      [COARSE]: 1,
    },
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: size.sidebarRowGap,
    width: "100%",
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  menuItem: { position: "relative" },

  // A row: its icon and its words, quiet until the pointer is on it or it is the page you are on.
  button: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: size.sidebarIconGap,
    boxSizing: "border-box",
    minWidth: 0,
    // Folded to its icons: a square the row's height, in the middle of the rail, its words cut away.
    width: {
      default: "100%",
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: ROW,
    },
    height: {
      default: ROW,
      [COARSE]: size.tapTarget,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: ROW,
    },
    marginBlock: 0,
    marginInline: {
      default: 0,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: SQUARE_MARGIN,
    },
    paddingBlock: 0,
    paddingInlineStart: {
      default: size.sidebarRowInline,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: SQUARE_PADDING,
    },
    // Room at its end for an action or a badge beside it, while its words show.
    paddingInlineEnd: {
      default: size.sidebarRowInline,
      ":has(~ [data-slot=sidebar-menu-action], ~ [data-slot=sidebar-menu-badge])":
        {
          default: `calc(${ACTION} + ${space["2"]})`,
          [stylex.when.ancestor(
            '[data-state="collapsed"][data-collapsible="icon"]',
            sidebarMarker
          )]: SQUARE_PADDING,
        },
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: SQUARE_PADDING,
    },
    borderWidth: { default: 0, [FORCED]: size.hairline },
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: radius.sidebarRadius,
    overflow: "hidden",
    color: {
      default: colors.sidebarTextSecondary,
      [HOVER]: { default: null, ":hover": colors.sidebarText },
    },
    backgroundColor: {
      default: "transparent",
      [HOVER]: { default: null, ":hover": colors.sidebarHover },
    },
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    letterSpacing: size.sidebarTracking,
    textAlign: "start",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    outlineOffset: `calc(-1 * ${size.ringWidth})`,
    transitionProperty:
      "color, background-color, width, height, padding, margin",
    transitionDuration: duration.hover,
  },
  // A row's name: it takes the room the row has left and gives way before anything beside it;
  // longer than that, it ends in an ellipsis.
  name: {
    flexShrink: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sm: {
    height: {
      default: size.controlXs,
      [COARSE]: size.tapTarget,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: ROW,
    },
    fontSize: font.textXs,
  },
  // A large row (a person, a workspace) folds to its picture alone.
  lg: {
    height: {
      default: size.controlLg,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: ROW,
    },
    paddingInlineStart: {
      default: size.sidebarRowInline,
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: 0,
    },
    paddingInlineEnd: {
      default: size.sidebarRowInline,
      ":has(~ [data-slot=sidebar-menu-action], ~ [data-slot=sidebar-menu-badge])":
        {
          default: `calc(${ACTION} + ${space["2"]})`,
          [stylex.when.ancestor(
            '[data-state="collapsed"][data-collapsible="icon"]',
            sidebarMarker
          )]: 0,
        },
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: 0,
    },
  },
  outline: {
    backgroundColor: {
      default: colors.background,
      [HOVER]: { default: null, ":hover": colors.sidebarHover },
    },
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.border}`,
  },
  // The page you are on: raised, in the words' own ink. In forced colours a border marks it.
  active: {
    color: colors.sidebarText,
    backgroundColor: colors.sidebarAccent,
    // Its edge is drawn inside its box: a row often ends where its holder clips (a group or a
    // list under a row that folds), which would cut an edge drawn outside it.
    boxShadow: `inset 0 0 0 ${size.hairline} ${colors.sidebarRule}`,
    borderColor: { default: "transparent", [FORCED]: "Highlight" },
  },

  // A count at a row's end, quiet, never pressed.
  badge: {
    position: "absolute",
    insetBlockStart: {
      default: `calc((${ROW} - ${font.textXsLine}) / 2)`,
      [COARSE]: `calc((${size.tapTarget} - ${font.textXsLine}) / 2)`,
    },
    insetInlineEnd: space["2"],
    display: {
      default: "flex",
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: "none",
    },
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    minWidth: font.textXsLine,
    height: font.textXsLine,
    paddingInline: size.sidebarCountInline,
    borderWidth: size.hairline,
    borderStyle: "solid",
    borderColor: { default: colors.sidebarRule, [FORCED]: "CanvasText" },
    borderRadius: radius.full,
    backgroundColor: colors.sidebarCard,
    color: colors.sidebarTextSecondary,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    fontWeight: font.weightMedium,
    fontVariantNumeric: "tabular-nums",
    pointerEvents: "none",
    userSelect: "none",
  },

  // Quiet bars in a row's own box, before the rows arrive.
  skeleton: {
    display: "flex",
    alignItems: "center",
    gap: size.sidebarIconGap,
    height: ROW,
    paddingInline: size.sidebarRowInline,
  },
  // The icon's square: the Skeleton inside cut to the icon's box, with its corner.
  skeletonIcon: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: ICON,
    height: ICON,
    overflow: "hidden",
    borderRadius: radius.mark,
  },

  // The rows under a row, on a stem from it; folded to its icons, they go.
  sub: {
    display: {
      default: "flex",
      [stylex.when.ancestor(
        '[data-state="collapsed"][data-collapsible="icon"]',
        sidebarMarker
      )]: "none",
    },
    flexDirection: "column",
    gap: size.sidebarRowGap,
    minWidth: 0,
    marginBlock: 0,
    marginInlineStart: `calc(${size.sidebarRowInline} + ${ICON} / 2)`,
    marginInlineEnd: 0,
    paddingBlock: size.sidebarRowGap,
    paddingInlineStart: `calc(${size.sidebarIconGap} + ${ICON} / 2 - ${size.hairline})`,
    paddingInlineEnd: 0,
    borderInlineStartWidth: size.hairline,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: {
      default: colors.sidebarRule,
      [FORCED]: "CanvasText",
    },
    listStyle: "none",
  },
  subItem: { position: "relative" },
  subButton: {
    height: { default: size.controlXs, [COARSE]: size.tapTarget },
    fontWeight: font.weightNormal,
  },
  subSm: { fontSize: font.textXs },
});

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
  const { id: _id, keys: _keys, ...api } = useSidebarState("useSidebar");
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
   * Where the person's choice is kept in localStorage, so it stays as they left it. Put
   * `sidebarStateScript(storageKey)` in the page's head to draw it so before the page wakes.
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
  style?: LayoutStyle;
}

/** Holds whether the sidebar is open, and the row the sidebar and the page stand in. */
export const SidebarProvider = ({
  children,
  open: given,
  defaultOpen = true,
  onOpenChange,
  storageKey,
  keyboardShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
  style,
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
  useEffect(() => {
    unseen.current = null;
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
    // Folded off the canvas, what holds focus inside goes out of reach: focus goes to the trigger.
    const wrapper = element.current;
    const away = wrapper?.querySelector(
      '[data-slot="sidebar"][data-collapsible="offcanvas"]'
    );
    const strands = open && away?.contains(document.activeElement) === true;
    setOpen(!open);
    if (strands) {
      wrapper
        ?.querySelector<HTMLElement>('[data-slot="sidebar-trigger"]')
        ?.focus();
    }
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
  };

  return (
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
    <SidebarContext value={state}>
      <div
        ref={watch}
        data-slot="sidebar-wrapper"
        data-sidebar-key={storageKey}
        {...stylex.props(styles.wrapper, style)}
      >
        {children}
      </div>
    </SidebarContext>
  );
};

// A string as a script's literal: JSON's, with `<` escaped too, so no key can close the script tag.
const literal = (text: string) =>
  JSON.stringify(text).replaceAll("<", String.raw`\u003c`);

/**
 * The head script that draws the kept state before the page wakes, as the theme's does: pass the
 * SidebarProvider's `storageKey`. It sets each of that provider's sidebars folded or open as the
 * parser reaches them, so nothing moves when React takes over. Run once the page is read (a client
 * router running it again), it sets them once and watches nothing.
 *
 *   <script is:inline set:html={sidebarStateScript("app-sidebar")} />                    Astro
 *   <script dangerouslySetInnerHTML={{ __html: sidebarStateScript("app-sidebar") }} />   React
 */
export const sidebarStateScript = (storageKey: string): string =>
  "(()=>{try{" +
  `const v=localStorage.getItem(${literal(storageKey)});if(v!=="true"&&v!=="false")return;` +
  'const s=v==="true"?"expanded":"collapsed",' +
  `q=${literal(`[data-sidebar-key=${JSON.stringify(storageKey)}] [data-slot=sidebar]`)},` +
  "d=()=>{for(const e of document.querySelectorAll(q))e.dataset.state=s;};" +
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
   * `sidebar` stands on its own ground with a hairline at its edge; `floating` is a raised panel a
   * little in from the window's edges; `inset` leaves the page as a card on the sidebar's ground.
   * @default "sidebar"
   */
  variant?: "sidebar" | "floating" | "inset";
  /**
   * How it folds: `offcanvas` slides it off the side, `icon` folds it to its icons (each row's
   * `tooltip` names it), `none` never folds, on a phone too.
   * @default "offcanvas"
   */
  collapsible?: "offcanvas" | "icon" | "none";
  /**
   * What the sidebar is, said as a landmark.
   * @default the I18nProvider's `sidebar.name` ("Sidebar")
   */
  "aria-label"?: string;
  /** Layout only. */
  style?: LayoutStyle;
}

/** The sidebar: an aside beside the page, or a sheet from its side on a narrow window. */
export const Sidebar = ({
  children,
  side = "start",
  variant = "sidebar",
  collapsible = "offcanvas",
  "aria-label": named,
  style,
}: SidebarProps) => {
  const { name } = useI18n().sidebar;
  const { state, openMobile, setOpenMobile, isMobile, id } =
    useSidebarState("Sidebar");
  const label = named ?? name;
  const roomy = variant !== "sidebar";

  if (collapsible === "none") {
    return (
      <SideContext value={side}>
        <aside
          aria-label={label}
          data-slot="sidebar"
          data-side={side}
          data-variant={variant}
          data-collapsible="none"
          {...stylex.props(styles.aside, styles.asideFixed, style)}
        >
          <div
            data-sidebar="sidebar"
            {...stylex.props(
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
              {...stylex.props(styles.sheet)}
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
        {...stylex.props(
          sidebarMarker,
          styles.aside,
          roomy && styles.asideRoomy,
          style
        )}
      >
        <div
          id={id}
          data-slot="sidebar-container"
          {...stylex.props(
            styles.container,
            collapsible === "offcanvas" && styles.offcanvas,
            collapsible === "offcanvas" &&
              side === "start" &&
              styles.offcanvasStart,
            roomy && styles.roomy,
            variant === "sidebar" &&
              (side === "start" ? styles.edgeStart : styles.edgeEnd)
          )}
        >
          <div
            data-sidebar="sidebar"
            {...stylex.props(
              styles.inner,
              variant === "floating" && styles.floating
            )}
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
  style?: LayoutStyle;
}

/**
 * The button that folds and opens the sidebar, or opens its sheet on a narrow window. It says
 * whether the sidebar is open and its keys. Put it in the page's bar, beside the sidebar.
 */
export const SidebarTrigger = ({
  onClick,
  "aria-label": named,
  style,
}: SidebarTriggerProps) => {
  const { toggle } = useI18n().sidebar;
  const { open, openMobile, isMobile, toggleSidebar, id, keys } =
    useSidebarState("SidebarTrigger");
  const label = named ?? toggle;
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      aria-expanded={isMobile ? openMobile : open}
      aria-controls={isMobile ? undefined : id}
      aria-keyshortcuts={keys?.aria}
      title={keys === undefined ? label : `${label} (${keys.text})`}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      style={style}
    >
      <Icon icon={PanelLeftIcon} />
    </Button>
  );
};

/** Every prop a SidebarRail takes. */
export interface SidebarRailProps {
  /** Layout only. */
  style?: LayoutStyle;
}

/**
 * The thin rail along the sidebar's inner edge: a press folds or opens it. For a pointer: the
 * keyboard has the trigger and the keys, so it is no tab stop.
 */
export const SidebarRail = ({ style }: SidebarRailProps) => {
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
      {...stylex.props(
        styles.rail,
        side === "start" ? styles.railStart : styles.railEnd,
        style
      )}
    />
  );
};

/** Every prop a SidebarInset takes. */
export interface SidebarInsetProps {
  /** The page: its bar, with the SidebarTrigger, and its content. */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** The page beside the sidebar: the main landmark, a card on its ground beside an inset sidebar. */
export const SidebarInset = ({ children, style }: SidebarInsetProps) => (
  <main data-slot="sidebar-inset" {...stylex.props(styles.inset, style)}>
    {children}
  </main>
);

// ---- The parts -----------------------------------------------------------------------------------

/** What a layout part takes. */
interface PartProps {
  children?: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/** A part's own element's props, less what the part sets itself. */
type Own<Tag extends "a" | "button" | "div" | "li" | "nav" | "ul"> = Omit<
  ComponentProps<Tag>,
  "className" | "style" | "children"
>;

/**
 * A part that is its element and its look (SidebarHeader, SidebarMenu, …): the element with
 * shadcn's slots (`sidebar-header`, `data-sidebar="header"`) and the caller's props on it.
 */
const part = <Tag extends "div" | "li" | "ul">(
  tag: Tag,
  name: string,
  look: stylex.StyleXStyles,
  { children, style, ...rest }: PartProps & Own<Tag>
) =>
  createElement(
    tag,
    {
      ...rest,
      "data-slot": `sidebar-${name}`,
      "data-sidebar": name,
      ...stylex.props(look, style),
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
  part("div", "footer", styles.header, props);

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
  style,
  ...rest
}: SidebarContentProps) => {
  const { main } = useI18n().sidebar;
  return (
    <nav
      {...rest}
      aria-label={named ?? main}
      data-slot="sidebar-content"
      data-sidebar="content"
      {...stylex.props(styles.content, scrollbarHidden, style)}
    >
      {children}
    </nav>
  );
};

/** Every prop a SidebarSeparator takes. */
export interface SidebarSeparatorProps {
  /** Layout only. */
  style?: LayoutStyle;
}

/** A hairline between the sidebar's parts. */
export const SidebarSeparator = ({ style }: SidebarSeparatorProps) => (
  <div
    data-slot="sidebar-separator"
    data-sidebar="separator"
    {...stylex.props(styles.separator, style)}
  >
    <Separator />
  </div>
);

/** Every prop a SidebarInput takes: those of Input. Name it, by `aria-label`. */
export type SidebarInputProps = InputProps;

/** A small field in the sidebar's header: a filter of its rows, a search. */
export const SidebarInput = (props: SidebarInputProps) => (
  <div data-slot="sidebar-input" {...stylex.props(styles.input)}>
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

/** A cut name shows whole under the pointer, as the browser's own tip; one that fits shows none. */
const tellWhenCut = (event: PointerEvent<HTMLSpanElement>) => {
  const name = event.currentTarget;
  if (name.scrollWidth > name.clientWidth) {
    name.title = name.textContent;
  } else {
    name.removeAttribute("title");
  }
};

/** A row's child as the row draws it: plain words in the name's span, an element as given. */
const rowChild = (child: ReactNode): ReactNode =>
  typeof child === "string" || typeof child === "number" ? (
    <span onPointerEnter={tellWhenCut} {...stylex.props(styles.name)}>
      {child}
    </span>
  ) : (
    child
  );

/**
 * As `drawn`, for a row of the menu. The words written straight into the row are its name: the
 * row draws them in a span of its own, which ends in an ellipsis where the row does. Every element
 * the caller gives (an icon, a mark, a span of its own) stays as given.
 */
const drawnRow = (
  tag: string,
  asChild: boolean | undefined,
  children: ReactNode,
  rest: Record<string, unknown>,
  own: Record<string, unknown>
) => {
  const slot = slotWords(asChild, children);
  // Given as the fragment's own children, not as a list: nothing of the caller's needs a key.
  const named = createElement(
    Fragment,
    null,
    ...listOf(slot.children).map(rowChild)
  );
  return renderElement(
    tag,
    mergeProps(rest, own, { children: named }),
    slot.render
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

/** Every prop a SidebarGroupLabel takes: these, and the rest of a <div>. */
export interface SidebarGroupLabelProps extends SlotPartProps, Own<"div"> {
  /** The label ("Projects"); with `asChild`, the element that holds it. */
  children: ReactNode;
}

/** The small label over a group's menu. Folded to its icons, it gives its room up. */
export const SidebarGroupLabel = ({
  asChild,
  children,
  style,
  ...rest
}: SidebarGroupLabelProps) =>
  drawn("div", asChild, children, rest, {
    "data-slot": "sidebar-group-label",
    "data-sidebar": "group-label",
    ...stylex.props(styles.groupLabel, focusRingInset, style),
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
  style,
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
      ...stylex.props(styles.action, styles.groupAction, focusRingInset, style),
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
  part("li", "menu-item", [sidebarMenuItemMarker, styles.menuItem], props);

/** Every prop a SidebarMenuButton takes: these, and the rest of a <button>. */
export interface SidebarMenuButtonProps extends SlotPartProps, Own<"button"> {
  /**
   * An `<Icon />` and its name as plain words; with `asChild`, the link that holds them
   * (`<a href>`, a router's link). A name longer than the row ends in an ellipsis. A product's
   * mark (a working indicator) goes in here too, with `flexShrink: 0` to keep its size.
   */
  children: ReactNode;
  /**
   * The page you are on: raised, and said as the current page (`aria-current`).
   * @default false
   */
  isActive?: boolean;
  /**
   * Its name, shown beside it while the sidebar is folded to its icons. Not shown otherwise, nor
   * on a narrow window.
   */
  tooltip?: ReactNode;
  /**
   * `sm` 28px, `default` 32px, `lg` 44px for a row with a picture and two lines (a workspace, a
   * person). On a touch screen `sm` and `default` are 44px.
   * @default "default"
   */
  size?: "default" | "sm" | "lg";
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
  style,
  ...rest
}: SidebarMenuButtonProps) => {
  const { state, isMobile } = useSidebarState("SidebarMenuButton");
  const side = use(SideContext);
  const button = drawnRow(
    "button",
    asChild,
    children,
    asChild === true ? rest : { type: "button", ...rest },
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": sized,
      "data-active": isActive ? "true" : undefined,
      "aria-current": isActive ? "page" : undefined,
      ...stylex.props(
        styles.button,
        sized === "sm" && styles.sm,
        sized === "lg" && styles.lg,
        variant === "outline" && styles.outline,
        isActive && styles.active,
        focusRingInset,
        style
      ),
    }
  );
  if (tooltip === undefined) {
    return button;
  }
  return (
    <Tooltip disabled={state !== "collapsed" || isMobile}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={side === "start" ? "end" : "start"}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
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
  style,
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
      ...stylex.props(
        styles.action,
        styles.menuAction,
        showOnHover && styles.showOnHover,
        focusRingInset,
        style
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
  style?: LayoutStyle;
}

const skeletonWidth = stylex.create({
  words: (width: string) => ({
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: width,
  }),
});

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
  style,
}: SidebarMenuSkeletonProps) => {
  const id = useId();
  return (
    <div
      aria-hidden="true"
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      {...stylex.props(styles.skeleton, style)}
    >
      {showIcon && (
        <span {...stylex.props(styles.skeletonIcon)}>
          <Skeleton variant="rectangular" animation={false} />
        </span>
      )}
      <span {...stylex.props(skeletonWidth.words(widthOf(id)))}>
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

/** The places within a place, under its row on a stem. Folded to its icons, they go. */
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
  /** Its words; with `asChild`, the link that holds them (a router's link). */
  children: ReactNode;
  /**
   * The page you are on: raised, and said as the current page (`aria-current`).
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
  style,
  ...rest
}: SidebarMenuSubButtonProps) =>
  drawnRow("a", asChild, children, rest, {
    "data-slot": "sidebar-menu-sub-button",
    "data-sidebar": "menu-sub-button",
    "data-size": sized,
    "data-active": isActive ? "true" : undefined,
    "aria-current": isActive ? "page" : undefined,
    ...stylex.props(
      styles.button,
      styles.subButton,
      sized === "sm" && styles.subSm,
      isActive && styles.active,
      focusRingInset,
      style
    ),
  });
