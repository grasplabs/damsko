// App shell: the frame a product's pages stand in, composed of Sidebar, SidePanel, Sheet and
// Resizable. The product's sidebar down the start, its head drawn by the shell (the product's mark,
// a search, the fold); beside it the page (the main landmark) as a card on the sidebar's ground,
// which scrolls on its own. Each page draws its own bar across the card's top (AppShellHeader: the
// fold while the sidebar is away, where the page is, its actions), which stays as the page scrolls
// under it, and its body (AppShellPage). At the end, one panel the person resizes by its handle, by
// pointer or the arrow keys.
//
//   <AppShell
//     storageKey="app.sidebar"
//     mark={<a href="/"><Icon icon={Logo} label="Acme" /></a>}
//     onSearch={() => setSearching(true)}
//     sidebar={<SidebarContent>…</SidebarContent>}
//     panel={<SidePanel aria-label="Details">…</SidePanel>}
//   >
//     <AppShellHeader
//       breadcrumb={[{ label: "Projects", render: <Link to="/projects" /> }]}
//       title={name}
//       onRename={setName}
//       actions={<Button size="sm">Share</Button>}
//     />
//     <AppShellPage>
//       <PageHeader title={name} />
//     </AppShellPage>
//   </AppShell>
//
// On a narrow window (under lg) the sidebar is Sidebar's own sheet from the start, and the panel a
// Sheet from the end, opened by the bar's panel button; a plain link followed in the sidebar's sheet
// closes it. On a phone the bar says the page and the step before it. A block: install it and edit
// it.
//
// It is a window's frame: as tall as the window unless `style` gives it its frame's height, and
// its two sheets are fixed to the window (the breakpoint is the window's width too). In a box of
// its own, such as a gallery's card, the box gives it a height (`style` with `height: "100%"` and
// `minHeight: 0` fills it) and is the containing block of what is fixed (`contain: layout`, or a
// transform), so the sheets open in the box.
"use client";

import * as stylex from "@stylexjs/stylex";
import { renderElement } from "@ui-sdk/react/primitive";
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts";
import {
  createContext,
  Fragment,
  use,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode } from "react";

import { alertVars } from "../../components/alert.stylex";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/breadcrumb";
import { breadcrumbVars } from "../../components/breadcrumb.stylex";
import { Button } from "../../components/button";
import { InlineEdit } from "../../components/inline-edit";
import { pageBandVars } from "../../components/page-header.stylex";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/resizable";
import { Sheet, SheetContent } from "../../components/sheet";
import { SidePanelPlacementProvider } from "../../components/side-panel";
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../components/sidebar";
import { Skeleton } from "../../components/skeleton";
import { Icon, PanelRightIcon, SearchIcon, XIcon } from "../../lib/icons";
import { focusRingText } from "../../lib/styles";
import {
  colors,
  font,
  media,
  radius,
  size,
  space,
} from "../../lib/tokens.stylex";
import { px } from "../../lib/tokens.values";
import { isBlank } from "../../lib/utils";
import type { LayoutStyle } from "../../lib/utils";
import { iconVars } from "../../lib/vars.stylex";

/** The words an AppShell says, for a screen reader: English here; pass the product's as `labels`. */
export interface AppShellLabels {
  /** The name of the page's crumbs. */
  breadcrumb: string;
  /** The name of the title's field while the page is renamed in place. */
  rename: string;
  /** The name of the page's panel's sheet on a narrow window. */
  pagePanel: string;
  /** The name of the handle between the page and the panel. */
  resize: string;
  /** The bar's button that shows the panel and sets it aside. */
  togglePanel: string;
  /** The name of the button that closes the sidebar's sheet on a narrow window. */
  close: string;
  /** The name of the search button in the sidebar's head. */
  search: string;
  /** Said once while a page loads (AppShellPageSkeleton). */
  loading: string;
}

const LABELS: AppShellLabels = {
  breadcrumb: "Breadcrumb",
  close: "Close",
  loading: "Loading…",
  pagePanel: "Details",
  rename: "Rename",
  resize: "Resize the panel",
  search: "Search",
  togglePanel: "Show or hide the panel",
};

/** The search's keys by default: Cmd+K on a Mac, Ctrl+K elsewhere. */
const SEARCH_SHORTCUT = "mod+k";

/** What the shell tells the parts inside it: its words, and its panel when it has one. */
interface ShellState {
  words: AppShellLabels;
  panel?: { open: boolean; setOpen: (open: boolean) => void };
}

const ShellContext = createContext<ShellState>({ words: LABELS });

/** Every prop an AppShell takes. */
export interface AppShellProps {
  /**
   * The product's sidebar under its head: its SidebarContent (or SidebarLevels), then its
   * SidebarFooter.
   */
  sidebar: ReactNode;
  /** The page: its AppShellHeader, then its AppShellPage. It scrolls under its header. */
  children: ReactNode;
  /** At the sidebar head's start: the product's mark, most often a link home. */
  mark?: ReactNode;
  /**
   * Opens the product's own search: a search button in the sidebar's head, and its keys
   * (`searchShortcut`) from anywhere on the page. On a narrow window the sidebar's sheet closes
   * first.
   */
  onSearch?: () => void;
  /**
   * The keys that open the search: `mod` is Cmd on a Mac and Ctrl elsewhere. `false` turns them
   * off.
   * @default "mod+k"
   */
  searchShortcut?: string | false;
  /**
   * Where the person's choices are kept in localStorage: whether the sidebar is folded, and which
   * of its SidebarCollapsible groups are. Without it nothing is kept.
   */
  storageKey?: string;
  /** Whether the sidebar is open, when you keep it: pass it with `onOpenChange`. */
  open?: boolean;
  /** Runs when the fold or its keys fold or open the sidebar. */
  onOpenChange?: (open: boolean) => void;
  /** One panel at the end of the page, resizable: a SidePanel, seated unframed. A Sheet on a narrow window. */
  panel?: ReactNode;
  /**
   * Whether the panel shows, when you keep it: pass it with `onPanelOpenChange`. Unset, it shows
   * beside a wide page and waits closed on a narrow window.
   */
  panelOpen?: boolean;
  /** Runs when the bar's panel button, or the panel's sheet, opens or closes the panel. */
  onPanelOpenChange?: (open: boolean) => void;
  /** Above the page and its bar, across the card: a notice for the whole product, such as a Banner. */
  banner?: ReactNode;
  /** Its words in the product's language; each one left out keeps its English. */
  labels?: Partial<AppShellLabels>;
  /**
   * Layout only: its height, in a frame of its own (`{ height: "100%", minHeight: 0 }`). It fills
   * the window's height by default.
   */
  style?: LayoutStyle;
}

// The panel's first width, and its least, in pixels: Resizable takes lengths, not variables, so
// these restate the side-panel-width token (420px) and a floor a SidePanel's sections still read at.
const PANEL_WIDTH = "420px";
const PANEL_MIN = "320px";
const PANEL_MAX = "50%";

// The room a crumb's link keeps round its words for its focus ring on a phone, given back by a
// negative margin, and the reach of that ring past the words, which the trail's clip keeps clear of.
const CRUMB_ROOM = `calc(${space["1"]} - ${size.hairline})`;
const RING_REACH = `calc(${size.ringWidth} + ${size.ringOffsetText} + ${CRUMB_ROOM})`;

const styles = stylex.create({
  // What the page holds, laid over the SidebarInset's box: the inset is as tall as the shell (the
  // window's height, or the frame's), never as tall as the page, so the page scrolls inside it and
  // its bar stays. The card's own ground at every width: beside the sidebar, and filling the window
  // on a phone. A layer of its own, so the line inside the card's edge stands over all of it, the
  // page's bar too.
  frame: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "clip",
    backgroundColor: colors.sidebarCard,
    borderRadius: "inherit",
    cornerShape: "inherit",
  },
  body: { flexGrow: 1, minHeight: 0 },
  // Across the card's top a banner Alert is a band: no corner of its own (alertVars).
  banner: { flexShrink: 0, [alertVars.bannerCorner]: "0px" },
  // The page under the banner: its bar, then its body. It scrolls up and down only; what is wider
  // than the card is cut at its edge.
  page: {
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    height: "100%",
    minHeight: 0,
    overflowX: "clip",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  panel: { height: "100%", minHeight: 0 },
  contents: { display: "contents" },

  // ---- The sidebar's head ----
  // The mark at the start, the search and the fold at the end, in one row the icon buttons'
  // height; the fold's glyph ends where the rows' ink does.
  head: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: size.sidebarRowGap,
    minHeight: size.sidebarIconButton,
  },
  // In the sheet the head stands a step under the sheet's top: SidebarHeader keeps its room less
  // the sheet's own inset there, which would put it lower.
  headInSheet: {
    marginBlockStart: `calc(${space["1"]} - (${space["4"]} - ${size.sheetPadding}))`,
  },
  mark: {
    [iconVars.size]: size.appShellMark,
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    height: size.sidebarIconButton,
    paddingInlineStart: size.sidebarRowInline,
    color: colors.sidebarForeground,
  },
  tools: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    marginInlineStart: "auto",
    marginInlineEnd: `calc(${size.sidebarRowInline} - (${size.sidebarIconButton} - ${size.sidebarIcon}) / 2)`,
  },

  // ---- The page's bar ----
  // One row the bar's height, across the page's column from edge to edge at the top of the page,
  // which scrolls under it: on the card's own ground, a hairline at its foot. On a phone the line is
  // the frame's own neutral rule, the card's edge, not the page's tinted one.
  bar: {
    position: "sticky",
    insetBlockStart: 0,
    zIndex: 20,
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["2"],
    boxSizing: "border-box",
    minWidth: 0,
    height: size.appShellBar,
    paddingInline: size.appShellPageInline,
    backgroundColor: colors.sidebarCard,
    borderBlockEndWidth: size.hairline,
    borderBlockEndStyle: "solid",
    borderBlockEndColor: {
      default: colors.border,
      [media.maxSm]: colors.sidebarCardBorder,
      [media.forcedColors]: "CanvasText",
    },
  },
  // Where the page is, then what trails it: they give way to the actions, never the other way
  // round. The path in the sidebar's neutral inks (the steps back in its rows' words, the slashes
  // quieter, the page in its ink); what trails it keeps the page's.
  where: {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    gap: space["3"],
    minWidth: 0,
    // Cut along the bar, never across it: a link's 44px reach on a touch screen stands past the
    // words' line. Room at the end for the renamable name's own padding, or its ring is cut.
    overflowX: "clip",
    paddingInlineEnd: space["1"],
    [breadcrumbVars.mutedForeground]: colors.sidebarSecondaryForeground,
    [breadcrumbVars.subtleForeground]: colors.sidebarTertiaryForeground,
    [breadcrumbVars.foreground]: colors.sidebarForeground,
    // A slash stands a step from each step, as far as the steps' words are from a chevron's box.
    [breadcrumbVars.separatorInset]: space["1"],
  },
  // The fold's empty rim hangs out past the bar's room, so its glyph stands where the page's words
  // begin. On a phone it is the bar's menu button: in the page's ink, not the sidebar's greys.
  trigger: {
    display: "flex",
    flexShrink: 0,
    marginInlineStart: `calc((${size.sidebarIcon} - ${size.sidebarIconButton}) / 2)`,
    marginInlineEnd: `calc(-1 * ${size.sidebarRowGap})`,
    "--damsko-sidebar-secondary-foreground": {
      default: null,
      [media.maxSm]: colors.foreground,
    },
  },
  // A step that leads nowhere: in the page's ink and weight, as the page's own name.
  step: {
    display: "block",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: breadcrumbVars.foreground,
    fontWeight: font.weightMedium,
  },
  // The renamable name in the page's ink and weight, as BreadcrumbPage draws it.
  rename: {
    minWidth: 0,
    color: breadcrumbVars.foreground,
    fontWeight: font.weightMedium,
  },
  actions: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["2"],
    marginInlineStart: "auto",
  },

  // ---- A phone's trail ----
  // The page and the step before it, a slash between, on one line. Laid end to start, the page
  // first to take its room and the step after it, whole or not at all: a step that does not fit
  // beside the page at its least wraps onto a second line, which the trail's clip hides, so the
  // page stands alone.
  phoneTrail: {
    display: "flex",
    minWidth: `calc(${space["8"]} + 2 * ${RING_REACH})`,
    overflow: "clip",
    padding: RING_REACH,
    margin: `calc(-1 * ${RING_REACH})`,
    marginInlineEnd: `calc(2 * ${space["3"]} - ${space["2"]} - ${RING_REACH})`,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  phoneCrumbs: {
    display: "flex",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    alignContent: "flex-start",
    columnGap: space["2"],
    rowGap: RING_REACH,
    blockSize: {
      default: font.textSmLine,
      [media.pointerCoarse]: size.tapTarget,
    },
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // The step: its link, then the slash before the page, whole.
  phoneStep: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["2"],
    minBlockSize: { default: null, [media.pointerCoarse]: size.tapTarget },
    color: colors.sidebarSecondaryForeground,
  },
  phoneSlash: {
    display: "flex",
    flexShrink: 0,
    color: colors.sidebarTertiaryForeground,
  },
  // The step's link: the sidebar's secondary words, its own ink under the pointer, a finger's
  // height on a touch screen.
  phoneLink: {
    display: "inline-flex",
    minWidth: 0,
    alignItems: "center",
    minHeight: { default: null, [media.pointerCoarse]: size.tapTarget },
    borderRadius: radius.sm,
    cornerShape: radius.shape,
    color: {
      default: colors.sidebarSecondaryForeground,
      ":hover": { default: null, [media.hover]: colors.sidebarForeground },
    },
    textDecoration: "none",
    whiteSpace: "nowrap",
    paddingInline: CRUMB_ROOM,
    marginInline: `calc(-1 * ${CRUMB_ROOM})`,
  },
  // The page: first on the line, whole beside its step, cut to fit alone, never under a stub of
  // its first letters.
  phonePage: {
    order: -100,
    display: "flex",
    flexShrink: 1,
    minWidth: space["8"],
  },
  phonePageWords: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: colors.sidebarForeground,
    fontWeight: font.weightMedium,
  },

  // ---- The page's body ----
  // A column as wide as the card in the page's room, its parts a step apart: one width through the
  // product, so every page's edges stand under the bar's and a banner's. It fills what the bar
  // leaves, so a state that stands for the page (an Empty that grows) takes the card's middle. The
  // room is told to a banner PageHeader (pageBandVars), which takes it back to stand flush.
  pageBody: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    gap: space["6"],
    boxSizing: "border-box",
    width: "100%",
    paddingBlockStart: space["7"],
    paddingInline: size.appShellPageInline,
    paddingBlockEnd: size.appShellPageRoomBelow,
    [pageBandVars.top]: space["7"],
    [pageBandVars.inline]: size.appShellPageInline,
  },
  // The page while it loads: a heading and its line, then lines of content, from the top left.
  skeleton: {
    display: "flex",
    flexDirection: "column",
    gap: space["6"],
    padding: space["6"],
  },
  skeletonHeading: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
  },
  skeletonTitle: { width: "12rem", maxWidth: "100%" },
  skeletonLead: { width: "18rem", maxWidth: "100%" },
  skeletonLines: {
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    width: "100%",
  },
  skeletonLastLine: { width: "66%" },
});

/** Whether a press follows a link to its page here: not a new tab, a new window or a download. */
const followsLink = (event: globalThis.MouseEvent): boolean => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return false;
  }
  const link =
    event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (link === null || link.hasAttribute("download")) {
    return false;
  }
  const target = link.getAttribute("target") ?? "";
  return target === "" || target === "_self";
};

/** The search: a round button in the sidebar's head, and its keys from anywhere on the page. */
const ShellSearch = ({
  onSearch,
  shortcut,
  label,
}: {
  onSearch: () => void;
  shortcut: string | false;
  label: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const keys = shortcut === false ? "" : shortcut;
  // The hint formats a real shortcut only: with none, the default's is read and never shown.
  const hint = useShortcutHint(keys === "" ? SEARCH_SHORTCUT : keys);
  // The search opens over the page: the sidebar's sheet goes first.
  const search = () => {
    setOpenMobile(false);
    onSearch();
  };
  useShortcut(keys === "" ? null : keys, search, { description: label });
  return (
    <SidebarMenuButton
      size="icon"
      aria-label={label}
      aria-keyshortcuts={keys === "" ? undefined : hint.ariaKeyshortcuts}
      title={keys === "" ? label : `${label} (${hint.text})`}
      onClick={search}
    >
      <Icon icon={SearchIcon} />
    </SidebarMenuButton>
  );
};

/** The sidebar: its head, then what the product gives; in its sheet, a link followed closes it. */
const ShellSidebar = ({
  children,
  mark,
  onSearch,
  searchShortcut,
}: {
  children: ReactNode;
  mark: ReactNode;
  onSearch: (() => void) | undefined;
  searchShortcut: string | false;
}) => {
  const { words } = use(ShellContext);
  const { isMobile, setOpenMobile } = useSidebar();
  // Heard on the way up from the links inside, which are the keyboard's stops themselves (Enter on
  // a link is a click too).
  const watch = (node: HTMLDivElement) => {
    const press = (event: globalThis.MouseEvent) => {
      if (isMobile && followsLink(event)) {
        setOpenMobile(false);
      }
    };
    node.addEventListener("click", press);
    return () => {
      node.removeEventListener("click", press);
    };
  };
  return (
    <Sidebar variant="inset">
      <div ref={watch} {...stylex.props(styles.contents)}>
        <SidebarHeader>
          <div
            data-slot="app-shell-head"
            {...stylex.props(styles.head, isMobile && styles.headInSheet)}
          >
            <span {...stylex.props(styles.mark)}>{mark}</span>
            <div {...stylex.props(styles.tools)}>
              {onSearch === undefined ? null : (
                <ShellSearch
                  onSearch={onSearch}
                  shortcut={searchShortcut}
                  label={words.search}
                />
              )}
              {/* The fold stays here while the sidebar is open; in its sheet, the way out. */}
              {isMobile ? (
                <SidebarMenuButton
                  size="icon"
                  aria-label={words.close}
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                >
                  <Icon icon={XIcon} />
                </SidebarMenuButton>
              ) : (
                <SidebarTrigger />
              )}
            </div>
          </div>
        </SidebarHeader>
        {children}
      </div>
    </Sidebar>
  );
};

type ShellPageProps = Pick<
  AppShellProps,
  "children" | "panel" | "panelOpen" | "onPanelOpenChange" | "banner"
>;

/** The page beside the sidebar: the banner, then the page and its panel. */
const ShellPage = ({
  children,
  panel,
  panelOpen,
  onPanelOpenChange,
  banner,
}: ShellPageProps) => {
  const shell = use(ShellContext);
  const { isMobile } = useSidebar();
  const [own, setOwn] = useState<boolean>();
  const hasPanel = panel !== undefined && panel !== null && panel !== false;
  // Unset, open beside a wide page and closed on a narrow window, where it would cover the page.
  const open = hasPanel && (panelOpen ?? own ?? !isMobile);
  const setOpen = (next: boolean) => {
    setOwn(next);
    onPanelOpenChange?.(next);
  };
  const { words } = shell;
  return (
    <ShellContext
      // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
      value={{ words, panel: hasPanel ? { open, setOpen } : undefined }}
    >
      <SidebarInset>
        <div {...stylex.props(styles.frame)}>
          {isBlank(banner) ? null : (
            <div data-slot="app-shell-banner" {...stylex.props(styles.banner)}>
              {banner}
            </div>
          )}
          {/* One group always, the page its first panel: the panel coming and going never draws
            the page anew, so it keeps its scroll place and what was typed in it. */}
          <div {...stylex.props(styles.body)}>
            <ResizablePanelGroup>
              <ResizablePanel>
                <div data-slot="app-shell-page" {...stylex.props(styles.page)}>
                  {children}
                </div>
              </ResizablePanel>
              {open && !isMobile && (
                <>
                  <ResizableHandle aria-label={words.resize} />
                  <ResizablePanel
                    defaultSize={PANEL_WIDTH}
                    minSize={PANEL_MIN}
                    maxSize={PANEL_MAX}
                  >
                    <div
                      data-slot="app-shell-panel"
                      {...stylex.props(styles.panel)}
                    >
                      <SidePanelPlacementProvider value="beside">
                        {panel}
                      </SidePanelPlacementProvider>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
          {hasPanel && isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetContent aria-label={words.pagePanel}>
                <SidePanelPlacementProvider value="sheet">
                  {panel}
                </SidePanelPlacementProvider>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </SidebarInset>
    </ShellContext>
  );
};

/** The frame a product's pages stand in: the sidebar with its head, the page as a card, one end panel. */
export const AppShell = ({
  sidebar,
  mark,
  onSearch,
  searchShortcut = SEARCH_SHORTCUT,
  storageKey,
  open,
  onOpenChange,
  labels,
  style,
  ...page
}: AppShellProps) => (
  <ShellContext
    // oxlint-disable-next-line react/jsx-no-constructed-context-values -- compiled
    value={{ words: { ...LABELS, ...labels } }}
  >
    <SidebarProvider
      storageKey={storageKey}
      open={open}
      onOpenChange={onOpenChange}
      style={style}
    >
      <ShellSidebar
        mark={mark}
        onSearch={onSearch}
        searchShortcut={searchShortcut}
      >
        {sidebar}
      </ShellSidebar>
      <ShellPage {...page} />
    </SidebarProvider>
  </ShellContext>
);

// ---- The page's bar ------------------------------------------------------------------------------

/** One step on the way to the page: its name, and where it leads. */
export interface AppShellCrumb {
  /** The step's name, as its own page's title says it. */
  label: string;
  /** Where the step leads. Without it (and without `render`) the step is its name alone. */
  href?: string;
  /**
   * The element the step's link is drawn as, for a router's link (`render: <Link to="/projects" />`):
   * it takes the step's look and its name, and keeps its own props.
   */
  render?: ReactElement<Record<string, unknown>>;
}

/** Every prop an AppShellHeader takes. */
export interface AppShellHeaderProps {
  /** The steps before the page, from the top down. The bar writes a slash between each two. */
  breadcrumb?: readonly AppShellCrumb[];
  /** The page's name: the last step. */
  title?: string;
  /** Renames the page in place (InlineEdit): a press on the title, Enter or F2. Keep the name in your state. */
  onRename?: (name: string) => void;
  /** Whether the title's field is open, when you keep it (a menu's Rename opens it): pass it with `onRenamingChange`. */
  renaming?: boolean;
  /** Runs when the title's field opens or closes. */
  onRenamingChange?: (renaming: boolean) => void;
  /**
   * After the path: where the page's subject stands, a status or its link. It gives way to the
   * actions; an item that hides itself on a narrow bar (`display: none`) leaves the path its room.
   */
  trailing?: ReactNode;
  /** At the bar's end: the page's own buttons, `sm`. */
  actions?: ReactNode;
}

const NO_STEPS: readonly AppShellCrumb[] = [];

// A phone's window, under 640px: the bar keeps only the page and the step before it.
const PHONE = `(width < ${px.sm}px)`;

const onPhoneChange = (changed: () => void): (() => void) => {
  const list = matchMedia(PHONE);
  list.addEventListener("change", changed);
  return () => {
    list.removeEventListener("change", changed);
  };
};

/** Whether the window is a phone's now, followed as it changes; never on the server. */
const usePhone = (): boolean =>
  useSyncExternalStore(
    onPhoneChange,
    () => matchMedia(PHONE).matches,
    () => false
  );

/** A step's link with its name, in the look given: the router's element, or an `<a>`. */
const stepLink = (
  crumb: AppShellCrumb,
  look: Record<string, unknown> = {}
): ReactElement | undefined =>
  crumb.render === undefined && crumb.href === undefined
    ? undefined
    : renderElement(
        "a",
        { href: crumb.href, ...look, children: crumb.label },
        crumb.render
      );

/**
 * Puts a phone trail's step away while it wrapped out of sight: out of the tab order and the
 * accessibility tree too (`inert`). It stays laid out, so the next resize finds whether it fits
 * again.
 */
const watchStep = (item: HTMLLIElement | null): (() => void) | undefined => {
  const list = item?.parentElement;
  if (item === null || list === null || list === undefined) {
    return undefined;
  }
  const place = () => {
    item.inert =
      item.getBoundingClientRect().top >= list.getBoundingClientRect().bottom;
  };
  place();
  const observer = new ResizeObserver(place);
  observer.observe(list);
  return () => {
    observer.disconnect();
  };
};

/**
 * Where the page is on a phone: the page and the step before it, the step dropped where both do
 * not fit. Breadcrumb's own narrow form keeps only the step back, without the page.
 */
const PhoneTrail = ({
  step,
  page,
  label,
}: {
  step: AppShellCrumb | undefined;
  page: ReactNode;
  label: string;
}) => {
  const link =
    step === undefined
      ? undefined
      : stepLink(step, stylex.props(styles.phoneLink, focusRingText));
  return (
    <nav
      aria-label={label}
      data-slot="breadcrumb"
      {...stylex.props(styles.phoneTrail)}
    >
      <ol {...stylex.props(styles.phoneCrumbs)}>
        {step === undefined ? null : (
          <li ref={watchStep} {...stylex.props(styles.phoneStep)}>
            {link ?? (
              <span title={step.label} {...stylex.props(styles.phonePageWords)}>
                {step.label}
              </span>
            )}
            <span aria-hidden="true" {...stylex.props(styles.phoneSlash)}>
              /
            </span>
          </li>
        )}
        <li {...stylex.props(styles.phonePage)}>{page}</li>
      </ol>
    </nav>
  );
};

/**
 * The bar across the page's top, which the page draws: the sidebar's fold while the sidebar is away
 * (folded, or a sheet on a narrow window; otherwise its head holds it), where the page is (a slash
 * between the steps; on a phone the page and the step before it), what trails it, and at its end
 * the page's actions, and the panel's button when the shell has a panel.
 */
export const AppShellHeader = ({
  breadcrumb = NO_STEPS,
  title,
  onRename,
  renaming,
  onRenamingChange,
  trailing,
  actions,
}: AppShellHeaderProps) => {
  const { words, panel } = use(ShellContext);
  const { state, isMobile } = useSidebar();
  const away = isMobile || state === "collapsed";
  const phone = usePhone();
  const bar = useRef<HTMLElement>(null);
  // This bar's fold opened the sidebar (pressed, or held focus as the keys opened it) and went as it
  // did: focus goes on to the fold in the sidebar's head, and never stays on a button that is gone.
  const handing = useRef(false);
  useLayoutEffect(() => {
    if (away || !handing.current) {
      return () => {
        // Nothing to hand on.
      };
    }
    handing.current = false;
    const sidebar = bar.current
      ?.closest('[data-slot="sidebar-wrapper"]')
      ?.querySelector<HTMLElement>('[data-slot="sidebar-container"]');
    const fold = sidebar?.querySelector<HTMLElement>(
      '[data-slot="sidebar-trigger"]'
    );
    let left = false;
    // Hidden until it has slid in (none of it with reduced motion): the fold takes focus once the
    // sidebar's own transitions are over, done or cut off, unless it is folded again first.
    const slid = Promise.allSettled(
      (sidebar?.getAnimations() ?? []).map(
        async ({ finished }) => await finished
      )
    );
    const handOn = async () => {
      await slid;
      if (!left) {
        fold?.focus();
      }
    };
    void handOn();
    return () => {
      left = true;
    };
  }, [away]);
  let name: ReactNode = title;
  if (title !== undefined && onRename !== undefined) {
    name = (
      <InlineEdit
        aria-label={words.rename}
        value={title}
        onSubmit={onRename}
        editing={renaming}
        onEditingChange={onRenamingChange}
      />
    );
  }
  // Where the page is: the steps before it, then the page itself, a slash between each two. The bar
  // writes every separator, so each is the same.
  const steps = [
    ...breadcrumb.map((crumb, at) => {
      const link = stepLink(crumb);
      return (
        <BreadcrumbItem key={`step-${String(at)}`}>
          {link === undefined ? (
            <span {...stylex.props(styles.step)}>{crumb.label}</span>
          ) : (
            <BreadcrumbLink asChild>{link}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      );
    }),
    ...(title === undefined
      ? []
      : [
          <BreadcrumbItem key="page">
            {/* BreadcrumbPage repeats its words in a tooltip when cut: a field is never repeated. */}
            {onRename === undefined ? (
              <BreadcrumbPage>{name}</BreadcrumbPage>
            ) : (
              <span aria-current="page" {...stylex.props(styles.rename)}>
                {name}
              </span>
            )}
          </BreadcrumbItem>,
        ]),
  ];
  let where: ReactNode = null;
  if (phone) {
    where = title !== undefined && (
      <PhoneTrail
        step={breadcrumb.at(-1)}
        label={words.breadcrumb}
        page={
          // A field is never cut by the words' box: its finger's reach stands past them.
          onRename === undefined ? (
            <span
              aria-current="page"
              title={title}
              {...stylex.props(styles.phonePageWords)}
            >
              {name}
            </span>
          ) : (
            <span aria-current="page" {...stylex.props(styles.rename)}>
              {name}
            </span>
          )
        }
      />
    );
  } else if (steps.length > 0) {
    where = (
      <Breadcrumb aria-label={words.breadcrumb}>
        <BreadcrumbList>
          {steps.map((step, at) => (
            <Fragment key={step.key}>
              {at > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
              {step}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
  return (
    <header
      ref={bar}
      data-slot="app-shell-header"
      onFocus={({ target }) => {
        handing.current =
          !isMobile && target.dataset.slot === "sidebar-trigger";
      }}
      onBlur={() => {
        handing.current = false;
      }}
      {...stylex.props(styles.bar)}
    >
      {away && (
        <span {...stylex.props(styles.trigger)}>
          <SidebarTrigger
            onClick={() => {
              // The sheet takes focus itself, and gives it back as it closes.
              handing.current = !isMobile;
            }}
          />
        </span>
      )}
      <div {...stylex.props(styles.where)}>
        {where}
        {trailing}
      </div>
      {(actions !== undefined || panel !== undefined) && (
        <div {...stylex.props(styles.actions)}>
          {actions}
          {panel !== undefined && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={words.togglePanel}
              aria-expanded={panel.open}
              onClick={() => {
                panel.setOpen(!panel.open);
              }}
            >
              <Icon icon={PanelRightIcon} />
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

// ---- The page's body -----------------------------------------------------------------------------

/** Every prop an AppShellPage takes. */
export interface AppShellPageProps {
  /** The page under its bar: its PageHeader, then its parts. A state that stands for the page is an Empty that grows (`flexGrow: 1`). */
  children: ReactNode;
  /** Layout only. */
  style?: LayoutStyle;
}

/**
 * The page's body under its bar: a column as wide as the card, its sides in the page's room, its
 * parts a step apart, room under the last. What should stay narrower (a form, a line of text) holds
 * its own measure inside it.
 */
export const AppShellPage = ({ children, style }: AppShellPageProps) => (
  <div
    data-slot="app-shell-page-body"
    {...stylex.props(styles.pageBody, style)}
  >
    {children}
  </div>
);

/** Every prop an AppShellPageSkeleton takes. */
export interface AppShellPageSkeletonProps {
  /**
   * How many lines of content stand under the heading.
   * @default 4
   */
  lines?: number;
}

/**
 * The page's body while a slow read comes: the pages' usual layout (a heading, a line under it,
 * then lines of content) as skeletons, said once as loading. Put it under the page's bar.
 */
export const AppShellPageSkeleton = ({
  lines = 4,
}: AppShellPageSkeletonProps) => {
  const { words } = use(ShellContext);
  return (
    <div data-slot="app-shell-page-skeleton" {...stylex.props(styles.skeleton)}>
      <div {...stylex.props(styles.skeletonHeading)}>
        <div {...stylex.props(styles.skeletonTitle)}>
          <Skeleton size="lg" />
        </div>
        <div {...stylex.props(styles.skeletonLead)}>
          <Skeleton size="default" />
        </div>
      </div>
      <output
        aria-busy="true"
        aria-label={words.loading}
        {...stylex.props(styles.skeletonLines)}
      >
        {Array.from({ length: lines }, (_, line) => (
          <div
            key={line}
            {...stylex.props(line === lines - 1 && styles.skeletonLastLine)}
          >
            <Skeleton size="default" />
          </div>
        ))}
      </output>
    </div>
  );
};
