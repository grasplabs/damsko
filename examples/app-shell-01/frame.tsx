"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import {
  AppShellLevelHeader,
  AppShellNav,
  AppShellNavEmpty,
  AppShellProfile,
  AppShellSwitch,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01-sidebar";
import type {
  AppShellNavGroup,
  AppShellNavRow,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01-sidebar";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { SidebarLevel, SidebarLevels } from "@grasp-os/ui/components/sidebar";
import {
  ArrowLeftRightIcon,
  AudioWaveformIcon,
  BellIcon,
  BuildingIcon,
  CircleHelpIcon,
  ContrastIcon,
  FlaskConicalIcon,
  HouseIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PencilIcon,
  ServerIcon,
  SettingsIcon,
  SparklesIcon,
  SunIcon,
  TrashIcon,
  UsersIcon,
  WrenchIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, media, radius, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // The app's window: the card's corner plus the room round it, so the two corners nest.
  frame: {
    width: "100%",
    height: 640,
    overflow: "hidden",
    borderRadius: `calc(${radius.md} + ${size.sidebarCardGap})`,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  home: { display: "flex", color: "inherit" },
  mark: {
    display: "block",
    width: size.appShellMark,
    height: size.appShellMark,
    backgroundColor: {
      default: "currentColor",
      [media.forcedColors]: "CanvasText",
    },
    forcedColorAdjust: "none",
    maskImage: 'url("/media/sample-workspace-logo.svg")',
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "contain",
  },
});

type View = "home" | "inbox";

const waiting = [
  "Bring in the first conversation with the sponsor.",
  "The agreement on handling data is not signed yet.",
  "The company has not signed off its look at the risks yet.",
];

// A whole frame from the shell's sidebar parts: under the head the Home | Inbox switch, the Inbox's
// count a dot on its bell; the rows as data in groups that fold, with counts, quiet rows with their
// time at the end, an unread dot, the Working mark and a menu that renames in place; an
// organisation's own level, with Back and its name as one raised row; the person at the foot with
// their menu, the theme as segments at the end of its row.
export default function AppShellFrame() {
  const [view, setView] = useState<View>("home");
  const [place, setPlace] = useState("home");
  const [theme, setTheme] = useState("system");
  const [notes, setNotes] = useState([
    { id: "q3", name: "Q3 numbers", end: "2h", working: true },
    { id: "kickoff", name: "Kickoff notes", end: "1d", unread: true },
    { id: "hiring", name: "Hiring plan", end: "3d" },
  ]);
  const inOrganisation = place.startsWith("acme");
  const go = (to: string): AppShellNavRow["onClick"] =>
    function goTo() {
      setPlace(to);
    };
  const row = (
    id: string,
    label: string,
    rest: Partial<AppShellNavRow> = {}
  ): AppShellNavRow => ({
    id,
    label,
    href: `#${id}`,
    current: place === id,
    onClick: go(id),
    ...rest,
  });
  const home: AppShellNavGroup[] = [
    {
      id: "places",
      rows: [
        row("home", "Home", { icon: HouseIcon }),
        row("platform", "Platform", {
          icon: ServerIcon,
          count: 1,
          countText: "1 company needs a look",
        }),
        row("asked", "Apps asked for", { icon: WrenchIcon }),
      ],
    },
    {
      id: "organisations",
      label: "Organisations",
      landmark: "Organisations",
      collapsible: true,
      count: 1,
      rows: [
        row("acme", "Answering Acme", {
          icon: BuildingIcon,
          count: 3,
          countText: "3 things wait",
        }),
      ],
    },
    {
      id: "labs",
      label: "Labs",
      collapsible: true,
      rows: [
        row("ask", "Ask", { icon: SparklesIcon }),
        row("lab", "Interview lab", { icon: FlaskConicalIcon }),
        row("voice", "Voice lab", { icon: AudioWaveformIcon }),
      ],
    },
    {
      id: "notes",
      label: "Notes",
      rows: notes.map((note) =>
        row(note.id, note.name, {
          quiet: true,
          end: note.end,
          endText: `${note.end} ago`,
          working: note.working,
          workingText: "Being written",
          unread: note.unread,
          unreadText: "Unread",
          actions: [
            { value: "rename", label: "Rename", icon: PencilIcon },
            "separator",
            {
              value: "delete",
              label: "Delete",
              icon: TrashIcon,
              destructive: true,
            },
          ],
          actionsLabel: `More for ${note.name}`,
          onAction: (value) => {
            if (value === "delete") {
              setNotes((all) => all.filter((each) => each.id !== note.id));
            }
          },
          onRename: (name) => {
            setNotes((all) =>
              all.map((each) =>
                each.id === note.id ? { ...each, name } : each
              )
            );
          },
          renameLabel: `Rename ${note.name}`,
          renameHint: "Double-click or press F2 to rename",
        })
      ),
      more: { label: "All notes", href: "#notes" },
    },
  ];
  const inbox: AppShellNavGroup[] = [
    {
      id: "inbox-acme",
      label: "Answering Acme",
      count: waiting.length,
      rows: waiting.map((text, at) =>
        row(`acme-${String(at)}`, text, { quiet: true })
      ),
    },
  ];
  const organisation: AppShellNavGroup[] = [
    { id: "overview", rows: [row("acme", "Overview", { icon: HouseIcon })] },
    {
      id: "work",
      label: "Work",
      rows: [
        row("acme-people", "People", { icon: UsersIcon, count: 2 }),
        row("acme-settings", "Settings", { icon: SettingsIcon }),
      ],
    },
  ];
  const titles: Record<string, string> = {
    home: "Home",
    acme: "Answering Acme",
  };
  const title = titles[place] ?? "Page";
  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        mark={
          <a
            href="#home"
            aria-label="Home"
            onClick={() => {
              setView("home");
              setPlace("home");
            }}
            {...stylex.props(layout.home)}
          >
            <span aria-hidden="true" {...stylex.props(layout.mark)} />
          </a>
        }
        onSearch={() => {
          setPlace("home");
        }}
        // This site keeps Cmd+K for its own search.
        searchShortcut={false}
        sidebar={
          <>
            <SidebarLevels value={inOrganisation ? "acme" : "main"}>
              <SidebarLevel value="main">
                <AppShellSwitch
                  aria-label="Views"
                  tabs={[
                    { value: "home", label: "Home", icon: HouseIcon },
                    {
                      value: "inbox",
                      label: "Inbox",
                      icon: BellIcon,
                      count: waiting.length,
                      countText: `${String(waiting.length)} things wait`,
                    },
                  ]}
                  value={view}
                  onValueChange={(next) => {
                    setView(next === "inbox" ? "inbox" : "home");
                  }}
                >
                  <AppShellNav
                    aria-label={view === "inbox" ? "Inbox" : "Main"}
                    groups={view === "inbox" ? inbox : home}
                  >
                    {view === "inbox" && inbox.length === 0 && (
                      <AppShellNavEmpty>
                        Nothing waits for you.
                      </AppShellNavEmpty>
                    )}
                  </AppShellNav>
                </AppShellSwitch>
              </SidebarLevel>
              <SidebarLevel value="acme">
                <AppShellLevelHeader
                  back={{
                    label: "Back",
                    // A router's link goes here: `render: <Link to="/" />`.
                    render: (
                      <a
                        href="#home"
                        onClick={() => {
                          setPlace("home");
                        }}
                      />
                    ),
                  }}
                  href="#acme"
                  current={place === "acme"}
                  icon={BuildingIcon}
                >
                  Answering Acme
                </AppShellLevelHeader>
                <AppShellNav
                  aria-label="Answering Acme"
                  groups={organisation}
                />
              </SidebarLevel>
            </SidebarLevels>
            <AppShellProfile
              name="Anna de Vries"
              detail="Northwind Finance"
              entries={[
                {
                  action: {
                    label: "Settings",
                    icon: SettingsIcon,
                    href: "#settings",
                  },
                },
                {
                  theme: {
                    label: "Appearance",
                    icon: ContrastIcon,
                    value: theme,
                    choices: [
                      { label: "Light", value: "light", icon: SunIcon },
                      { label: "Dark", value: "dark", icon: MoonIcon },
                      { label: "System", value: "system", icon: MonitorIcon },
                    ],
                    onValueChange: setTheme,
                  },
                },
                {
                  action: {
                    label: "Support",
                    icon: CircleHelpIcon,
                    href: "#support",
                  },
                },
                "separator",
                {
                  choices: {
                    label: "Switch organisation",
                    icon: ArrowLeftRightIcon,
                    choices: [
                      {
                        label: "Northwind Finance",
                        value: "northwind",
                        avatar: true,
                      },
                    ],
                    value: "northwind",
                  },
                },
                {
                  action: {
                    label: "Sign out",
                    icon: LogOutIcon,
                    destructive: true,
                    href: "#signed-out",
                  },
                },
              ]}
            />
          </>
        }
      >
        <AppShellHeader title={title} />
        <AppShellPage>
          <PageHeader
            title={title}
            description="Every organisation, from its first conversation on."
          />
        </AppShellPage>
      </AppShell>
    </div>
  );
}
