// The docs site's frame: the library's Sidebar, Breadcrumb, Button, Tooltip and ThemeToggle,
// installed the way a product installs them (from "@grasp-os/ui/components/…"), composed here as the
// app-shell-01 block composes them: the sidebar down the start, and beside it the page as a card on
// the sidebar's ground, a header across its top, the page under it scrolling on its own. Composed
// directly rather than through the block, because the docs keep the sidebar's state across pages
// (`storageKey`) and fold their runs, which the block does not offer. The layout
// (site/layouts/Docs.astro) draws it as an Astro island and passes the page in as children, which
// Astro hands over as the server's HTML, so the words are never drawn by React.
//
// Every prop is plain data, because an island's props travel as JSON. Search is the site's own
// dialog (site/behaviour/search.ts): the header's search button carries the data attribute it
// listens for, so it opens the same dialog as ⌘K. The theme is the site's own (site/behaviour/
// theme.ts); the header's ThemeToggle reads and changes it.
//
// The sidebar: the mark (the link home) and the fold in its head; then the Start run as plain rows,
// and the two parts (Docs, Components), each under a rule, its name the link to its overview, its
// runs groups that fold from their label, which carries a count. The run holding this page is open;
// what a person opens or folds is kept across pages (site/chrome/nav-folds.ts). The start page
// (`bleed`) keeps the header and folds the sidebar away.
"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@grasp-os/ui/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@grasp-os/ui/components/sidebar";
import { ThemeToggle } from "@grasp-os/ui/components/theme-toggle";
import type { ThemeMode } from "@grasp-os/ui/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@grasp-os/ui/components/tooltip";
import { ChevronRightIcon, Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { focusRingInset } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { chooseTheme, currentChoice, watchChoice } from "../behaviour/theme";
import { navOpenKey } from "../system/name";
import { useFolds } from "./nav-folds";

// The docs rail's TableOfContents (site/chrome/Toc.astro) hydrates from this island's own module,
// so the rail on every docs page costs no request of its own: no entry chunk for it, and its code
// is in the shared islands chunk (site/system/vite.ts) that every docs page loads for the shell.
export { TableOfContents } from "@grasp-os/ui/components/table-of-contents";

/** One page in the navigation. */
export interface DocsShellPage {
  route: string;
  label: string;
}

/** A run of pages under a label, as the sidebar lists them. */
export interface DocsShellGroup {
  /** Stable across builds: the sidebar keeps whether it is folded under it. */
  id: string;
  label: string;
  /** The section the run belongs to: the sidebar names each section once, over its first run. */
  part: "docs" | "components";
  pages: DocsShellPage[];
}

export interface DocsShellProps {
  /** Which section the page is in. */
  section: "docs" | "components";
  /** Every page of the site, in runs, the docs' then the components'. */
  groups: DocsShellGroup[];
  /** The page's own route, to mark it current. */
  route: string;
  /** The page's title, the last crumb. */
  title: string;
  /** The library's name, from site/system/name.ts. */
  libraryName: string;
  /** The Grasp mark as SVG markup, its ink already currentColor, so it follows light and dark. */
  mark: string;
  /** The deployment's base path, without a trailing slash. */
  base: string;
  /** Full bleed: the sidebar folded, the page across the card's whole width (the start page). */
  bleed?: boolean;
  children?: ReactNode;
}

const sections = [
  { id: "docs", label: "Docs", route: "/docs" },
  { id: "components", label: "Components", route: "/components" },
] as const;
const partNames = { docs: "Docs", components: "Components" } as const;
// Each part's name leads to its overview (the name is the link, no Overview row).
const partRoutes = { docs: "/docs", components: "/components" } as const;

const styles = stylex.create({
  // The shell is one window high: the page scrolls in its card, so the frame itself never does.
  provider: { height: "100dvh", minHeight: 0 },
  // What the card holds, laid over the SidebarInset's box (as app-shell-01 lays it): the inset is
  // as tall as the window, so the header stays and the page scrolls under it.
  frame: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "clip",
    borderRadius: "inherit",
  },
  header: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
    height: size.appShellBar,
    paddingInline: space["3"],
  },
  where: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    minWidth: 0,
    overflow: "hidden",
  },
  tools: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: space["1"],
    marginInlineStart: "auto",
  },
  page: {
    boxSizing: "border-box",
    flexGrow: 1,
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
    scrollbarWidth: "none",
    paddingBlockStart: space["7"],
    paddingBlockEnd: size.appShellPageRoomBelow,
    // The site's gutter: space-6, space-4 on a phone, so a stage keeps its width there.
    paddingInline: { default: space["6"], [media.maxSm]: space["4"] },
  },
  // Full bleed: the page's room and its padding go, so the start page reaches the card's edges.
  pageBleed: { padding: 0 },
  // The sidebar's head: the mark where the rows' words start, the fold's icon where they end.
  head: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: size.sidebarIconButton,
    paddingInlineStart: space["2"],
    paddingInlineEnd: `calc(${size.sidebarRowInline} - (${size.sidebarIconButton} - ${size.sidebarIcon}) / 2)`,
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    color: colors.foreground,
    borderRadius: radius.sidebarRadius,
  },
  mark: {
    display: "block",
    width: size.appShellMark,
    height: size.appShellMark,
  },
  // A part (Docs, Components): its name and its runs, a row's gap apart.
  part: {
    display: "flex",
    flexDirection: "column",
    gap: size.sidebarRowGap,
  },
  // A part's head: a rule over its name, with room above and below it.
  partHead: {
    marginBlockStart: space["2"],
    paddingBlockStart: space["3"],
    boxShadow: {
      default: `inset 0 ${size.hairline} 0 ${colors.border}`,
      [media.forcedColors]: `inset 0 ${size.hairline} 0 CanvasText`,
    },
  },
  // A part's name, the link to its overview: a row in the ink read first, a heading over its runs.
  partName: {
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    height: {
      default: size.sidebarMenuButtonHeight,
      [media.pointerCoarse]: size.tapTarget,
    },
    paddingInline: size.sidebarRowInline,
    borderRadius: radius.sidebarRadius,
    color: colors.sidebarText,
    backgroundColor: {
      default: "transparent",
      [media.hover]: { default: null, ":hover": colors.sidebarHover },
    },
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    textDecoration: "none",
    transitionProperty: "background-color",
    transitionDuration: duration.hover,
  },
  partNameActive: { backgroundColor: colors.sidebarAccent },
  // A run's label: its name takes the room, its count and chevron stand at the end.
  runName: {
    flexGrow: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  count: { flexShrink: 0, fontVariantNumeric: "tabular-nums" },
  // A run's pages stand a step in from its label, and a row's gap under it: Collapsible's panel
  // keeps a step of room above and below what it holds, which a list of rows takes back, and the
  // group's own gap goes with the panel, so a folded run is its label alone.
  runPanel: { marginBlockStart: `calc(-1 * ${size.sidebarRowGap})` },
  runPages: {
    width: "auto",
    marginBlockStart: `calc(${size.sidebarRowGap} - ${space["2"]})`,
    marginBlockEnd: `calc(-1 * ${space["2"]})`,
    marginInlineStart: space["3"],
  },
});

/** The kept choice of light, dark or system, for the header's ThemeToggle. */
const useThemeChoice = (): ThemeMode =>
  useSyncExternalStore(watchChoice, currentChoice, () => "system");

/** The header's trigger shows only where the sidebar's own does not: folded, or on a phone. */
const BarTrigger = () => {
  const { state, isMobile } = useSidebar();
  if (!isMobile && state === "expanded") {
    return null;
  }
  return <SidebarTrigger />;
};

/** The sidebar's trigger in its head, on a wide window (in the phone's sheet it would close it). */
const HeadTrigger = () => {
  const { isMobile } = useSidebar();
  return isMobile ? null : <SidebarTrigger />;
};

interface RunProps {
  group: DocsShellGroup;
  route: string;
  link: (path: string) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** A run that folds: a group whose label, with its count, is the trigger, its pages under it. */
const Run = ({ group, route, link, open, onOpenChange }: RunProps) => (
  <Collapsible open={open} onOpenChange={onOpenChange}>
    <SidebarGroup>
      <CollapsibleTrigger asChild>
        <SidebarGroupLabel asChild>
          <button type="button">
            <span {...stylex.props(styles.runName)}>{group.label}</span>
            <span {...stylex.props(styles.count)}>{group.pages.length}</span>
            <span className="site-run-chevron" aria-hidden="true">
              <Icon icon={ChevronRightIcon} />
            </span>
          </button>
        </SidebarGroupLabel>
      </CollapsibleTrigger>
      <CollapsibleContent style={styles.runPanel}>
        <SidebarGroupContent>
          <SidebarMenu style={styles.runPages}>
            {group.pages.map((page) => (
              <Page key={page.route} page={page} route={route} link={link} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
);

const Page = ({
  page,
  route,
  link,
}: {
  page: DocsShellPage;
  route: string;
  link: (path: string) => string;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={page.route === route}>
      <a href={link(page.route)}>{page.label}</a>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export default function DocsShell({
  section,
  groups,
  route,
  title,
  libraryName,
  mark,
  base,
  bleed = false,
  children,
}: DocsShellProps) {
  const link = (path: string) => `${base}${path}`;
  const here = groups.find((group) =>
    group.pages.some((page) => page.route === route)
  )?.id;
  const [folds, setFold] = useFolds();
  const mode = useThemeChoice();
  // Awake, the runs a reader kept open have opened: the sidebar's script brings this page's link
  // back into sight (site/system/head-scripts.ts, sidebarScroll), a frame on, once they stand.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.dispatchEvent(new Event("site:nav-woke"));
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  // The start page opens with the sidebar folded and keeps nothing: the page has the whole width.
  const [bleedOpen, setBleedOpen] = useState(false);

  const sectionItem =
    sections.find((item) => item.id === section) ?? sections[0];
  const start = groups.filter((group) => group.id === "start");
  const parts = (["docs", "components"] as const).map((part) => ({
    part,
    runs: groups.filter((group) => group.id !== "start" && group.part === part),
  }));

  return (
    <SidebarProvider
      style={styles.provider}
      {...(bleed
        ? { open: bleedOpen, onOpenChange: setBleedOpen }
        : { storageKey: navOpenKey })}
    >
      <Sidebar variant="inset">
        <SidebarHeader>
          <div {...stylex.props(styles.head)}>
            {/* The mark alone, the link home, named and titled "Damsko, home"; the name stays in
                the site's words (titles, headlines). */}
            <a
              href={link("/")}
              aria-label={`${libraryName}, home`}
              title={`${libraryName}, home`}
              className="site-shell-brand"
              {...stylex.props(styles.brand)}
            >
              <span
                aria-hidden="true"
                {...stylex.props(styles.mark)}
                dangerouslySetInnerHTML={{ __html: mark }}
              />
            </a>
            <HeadTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent aria-label="Pages" data-site-nav="">
          {start.length > 0 && (
            <SidebarGroup>
              <SidebarMenu>
                {start.flatMap((group) =>
                  group.pages.map((page) => (
                    <Page
                      key={page.route}
                      page={page}
                      route={route}
                      link={link}
                    />
                  ))
                )}
              </SidebarMenu>
            </SidebarGroup>
          )}
          {parts.map(({ part, runs }) =>
            runs.length === 0 ? null : (
              <div key={part} {...stylex.props(styles.part)}>
                <SidebarGroup>
                  <div {...stylex.props(styles.partHead)}>
                    <a
                      href={link(partRoutes[part])}
                      aria-current={
                        route === partRoutes[part] ? "page" : undefined
                      }
                      {...stylex.props(
                        styles.partName,
                        route === partRoutes[part] && styles.partNameActive,
                        focusRingInset
                      )}
                    >
                      {partNames[part]}
                    </a>
                  </div>
                </SidebarGroup>
                {runs.map((group) =>
                  group.pages.length === 1 && group.pages[0] ? (
                    <SidebarGroup key={group.id}>
                      <SidebarMenu>
                        <Page page={group.pages[0]} route={route} link={link} />
                      </SidebarMenu>
                    </SidebarGroup>
                  ) : (
                    <Run
                      key={group.id}
                      group={group}
                      route={route}
                      link={link}
                      open={
                        folds[group.id] === undefined
                          ? group.id === here
                          : !folds[group.id]
                      }
                      onOpenChange={(open) => {
                        setFold(group.id, !open);
                      }}
                    />
                  )
                )}
              </div>
            )
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div {...stylex.props(styles.frame)}>
          <header {...stylex.props(styles.header)}>
            <BarTrigger />
            {!bleed && (
              <div {...stylex.props(styles.where)}>
                <Breadcrumb>
                  <BreadcrumbList>
                    {route !== sectionItem.route && (
                      <>
                        <BreadcrumbItem>
                          <BreadcrumbLink href={link(sectionItem.route)}>
                            {sectionItem.label}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}
            <div {...stylex.props(styles.tools)}>
              {/* One search on the site: here, at the header's end beside the theme, at every
                  width. ⌘K / Ctrl+K open it from anywhere. It opens the dialog through its
                  [data-site-search] hook (site/behaviour/search.ts). */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Search the docs"
                    aria-keyshortcuts="Meta+K Control+K"
                    data-site-search=""
                  >
                    <Icon icon={SearchIcon} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search the docs (⌘K)</TooltipContent>
              </Tooltip>
              <ThemeToggle
                variant="icon"
                size="sm"
                mode={mode}
                onModeChange={chooseTheme}
              />
            </div>
          </header>
          <div
            data-site-scroller=""
            {...stylex.props(styles.page, bleed && styles.pageBleed)}
          >
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
