"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupClear,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import * as drawings from "@grasp-os/ui/lib/icons";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { focusRing } from "@grasp-os/ui/lib/styles";
import {
  colors,
  duration,
  font,
  media,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import { iconVars } from "@grasp-os/ui/lib/vars.stylex";
// Icons, scene: the whole set, calm and large enough to read. Type to find one by its name or what
// it does; a click copies its name, ready for `import { Name } from "lib/icons"`. Without script the
// full set still shows. Brand marks are the product's, drawn with BrandIcon: not in this set.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import type { KeyboardEvent } from "react";

const styles = stylex.create({
  panel: {
    display: "grid",
    rowGap: space["6"],
    paddingBlock: space["8"],
    paddingInline: { default: space["8"], [media.maxSm]: space["5"] },
  },
  bar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
  },
  // Beside the tools it takes the room left; on a row of its own it runs to the grid's edge (it
  // stopped 230px short of it, under a count that reached the edge).
  search: { flexGrow: 1, flexBasis: "14rem" },
  tools: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["4"],
    flexGrow: 1,
  },
  scroller: {
    display: "grid",
    rowGap: space["6"],
    maxHeight: "30rem",
    overflowY: "auto",
    overscrollBehavior: "auto",
    // No bar (CONTRIBUTING.md); the rows below the edge fade under it.
    scrollbarWidth: "none",
    maskImage: `linear-gradient(to bottom, black calc(100% - ${space["8"]}), transparent)`,
    marginInline: `calc(-1 * ${space["2"]})`,
    paddingInline: space["2"],
    paddingBlockStart: space["1"],
    // Room for the fade under the last row, so at the end it stands clear.
    paddingBlockEnd: space["8"],
  },
  status: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    whiteSpace: "nowrap",
  },
  group: { display: "grid", rowGap: space["3"] },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(6rem, 1fr))",
    gap: space["1"],
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  cell: {
    [iconVars.size]: size.iconDefault,
    display: "grid",
    justifyItems: "center",
    alignContent: "center",
    rowGap: space["3"],
    width: "100%",
    minWidth: 0,
    paddingBlock: space["4"],
    paddingInline: space["1"],
    border: "none",
    borderRadius: radius.mark,
    backgroundColor: {
      default: "transparent",
      [media.hover]: { default: "transparent", ":hover": colors.muted },
    },
    color: {
      default: colors.bodyForeground,
      [media.hover]: {
        default: colors.bodyForeground,
        ":hover": colors.foreground,
      },
    },
    fontFamily: font.sans,
    cursor: "pointer",
    transitionProperty: "background-color, color",
    transitionDuration: duration.mark,
    transitionTimingFunction: duration.ease,
  },
  name: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
  },
  copied: { color: colors.foreground },
  empty: {
    margin: 0,
    paddingBlock: space["8"],
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

// What people look for, when it is not the icon's name.
const meanings: Record<string, string> = {
  PlusIcon: "add new create",
  XIcon: "close cancel remove dismiss",
  CheckIcon: "tick confirm yes",
  CircleCheckIcon: "done complete success finished",
  CircleAlertIcon: "failed error problem",
  TrashIcon: "delete remove bin",
  PencilIcon: "edit rename write",
  SendIcon: "submit",
  LoaderIcon: "spinner loading working",
  EllipsisIcon: "more menu options",
  EyeIcon: "show visible",
  EyeOffIcon: "hide hidden",
  SettingsIcon: "preferences gear",
  WandSparklesIcon: "agent ai assistant bot",
  LightbulbIcon: "thought thinking reasoning",
  WrenchIcon: "tool run",
  CircleIcon: "waiting pending approval",
  RefreshCwIcon: "retry again refresh",
  BellIcon: "notification alert",
  CircleUserIcon: "person user account",
  UsersIcon: "people team members",
  PaperclipIcon: "attach file",
  MicIcon: "voice microphone",
  ClockIcon: "time schedule",
  ArchiveIcon: "store box",
  LinkIcon: "url chain",
  ArrowUpRightIcon: "external open new tab",
  ChartLineIcon: "measure",
  TypeIcon: "words text",
};

const all = Object.entries(drawings as Record<string, unknown>)
  .filter(
    (entry): entry is [string, IconData] =>
      entry[0].endsWith("Icon") && Array.isArray(entry[1])
  )
  .map(([name, icon]) => ({
    name,
    icon,
    find: `${name} ${meanings[name] ?? ""}`.toLowerCase(),
  }))
  // In name order, so the server and the browser draw the same list.
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export default function IconsSet() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [missed, setMissed] = useState<string | null>(null);
  const words = query.trim().toLowerCase();
  const list = words ? all.filter((entry) => entry.find.includes(words)) : all;
  const found = list.length;
  // One stop for the whole grid: Tab comes to one icon (the last one visited, or the first shown)
  // and leaves again; the arrows move inside, Home and End go to the ends, a letter to the next
  // icon that begins with it. A hundred and fifty stops kept the keyboard from the rest of the page.
  const [visited, setVisited] = useState<string | null>(null);
  const shown = list.map((entry) => entry.name);
  const stop = visited !== null && shown.includes(visited) ? visited : shown[0];

  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = (event.target as Element).closest<HTMLButtonElement>(
      "button[data-icon-name]"
    );
    if (!from || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const cells = [
      ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button[data-icon-name]"
      ),
    ];
    const at = cells.indexOf(from);
    // As many across as stand on the first row.
    const across =
      cells.filter((cell) => cell.offsetTop === cells[0]?.offsetTop).length ||
      1;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const steps: Record<string, number> = {
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      ArrowDown: across,
      ArrowUp: -across,
      Home: -at,
      End: cells.length - 1 - at,
    };
    let next =
      steps[event.key] === undefined ? -1 : at + (steps[event.key] ?? 0);
    if (
      steps[event.key] === undefined &&
      event.key.length === 1 &&
      /\S/u.test(event.key)
    ) {
      const letter = event.key.toLowerCase();
      const names = cells.map((cell) =>
        (cell.textContent ?? "").trim().toLowerCase()
      );
      next =
        [...names.keys()]
          .slice(at + 1)
          .concat([...names.keys()].slice(0, at + 1))
          .find((index) => names[index]?.startsWith(letter)) ?? -1;
    }
    const to = cells[next];
    if (!to) {
      return;
    }
    event.preventDefault();
    to.focus();
  };

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(name);
      setMissed(null);
    } catch {
      // The browser said no: still say the name, so it can be typed.
      setCopied(null);
      setMissed(name);
    }
  };

  return (
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.bar)}>
        <div {...stylex.props(styles.search)}>
          <InputGroup>
            <InputGroupAddon>
              <Icon icon={SearchIcon} />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              aria-label="Search the icons"
              placeholder="Search by name or use"
              onValueChange={(value) => {
                setQuery(String(value ?? ""));
              }}
            />
            <InputGroupClear aria-label="Clear search" />
          </InputGroup>
        </div>
        <div {...stylex.props(styles.tools)}>
          <p role="status" {...stylex.props(styles.status)}>
            {copied
              ? `Copied ${copied}`
              : missed
                ? `Could not copy ${missed}`
                : `${found} ${found === 1 ? "icon" : "icons"}`}
          </p>
        </div>
      </div>
      {/* The keys of a grid, on the grid's holder: its cells stay plain buttons. */}
      <div onKeyDown={move} {...stylex.props(styles.scroller)}>
        {found > 0 && (
          <section aria-label="Icons" {...stylex.props(styles.group)}>
            <ul {...stylex.props(styles.grid)}>
              {list.map((entry) => (
                <li key={entry.name}>
                  <button
                    type="button"
                    aria-label={`Copy ${entry.name}`}
                    data-icon-name={entry.name}
                    tabIndex={entry.name === stop ? 0 : -1}
                    onFocus={() => {
                      setVisited(entry.name);
                    }}
                    onClick={() => copy(entry.name)}
                    {...stylex.props(styles.cell, focusRing)}
                  >
                    <Icon icon={entry.icon} />
                    {/* A long name ends in an ellipsis; its title shows it whole, as Text's truncate does. */}
                    <span
                      title={entry.name}
                      {...stylex.props(
                        styles.name,
                        copied === entry.name && styles.copied
                      )}
                    >
                      {entry.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {found === 0 && (
          <p {...stylex.props(styles.empty)}>
            No icon by that name. Try what it does, such as close or send.
          </p>
        )}
      </div>
    </div>
  );
}
