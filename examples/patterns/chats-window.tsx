"use client";

import {
  AppShell,
  AppShellHeader,
  AppShellPage,
} from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  CommandDialog,
  CommandEmpty,
  CommandHighlight,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
import type {
  CommandItemData,
  CommandItems,
} from "@grasp-os/ui/components/command";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components/dialog";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  ArchiveIcon,
  FolderKanbanIcon,
  HouseIcon,
  Icon,
  InboxIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  font,
  radius,
  size,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const layout = stylex.create({
  frame: {
    width: "100%",
    maxWidth: 960,
    height: 600,
    overflow: "hidden",
    borderRadius: radius.md,
    cornerShape: radius.shape,
    boxShadow: `0 0 0 ${size.hairline} ${colors.border}`,
  },
  shell: { height: "100%", minHeight: 0 },
  time: {
    color: colors.mutedForeground,
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
  },
});

/** A chat, as the server keeps it: its title, when it was last written in, and what was said. */
interface Chat {
  id: string;
  title: string;
  /** The day it falls under: today, yesterday, this week, or its month. */
  group: string;
  /** When, at the row's end: the clock time under Today and Yesterday, the weekday under this week,
   * the day under a month ("12 Oct"), so it never repeats its heading. */
  when: string;
  /** What was said in it, for search to find. */
  said: string;
  working?: boolean;
  archived?: boolean;
}

// Fixed days, so the page drawn on the server and in the browser is the same.
const firstChats: Chat[] = [
  {
    id: "c1",
    title: "Spring launch plan",
    group: "Today",
    when: "14:02",
    said: "We move the launch to 24 March so the agency has the brief a week earlier.",
    working: true,
  },
  {
    id: "c2",
    title: "Supplier invoices, late ones first",
    group: "Today",
    when: "09:40",
    said: "Three invoices from Van Dijk Bouw are past their due date; the oldest is 41 days late.",
  },
  {
    id: "c3",
    title: "Weekly numbers",
    group: "Yesterday",
    when: "16:20",
    said: "Revenue rose 6% on last week, mostly from Tailspin Logistics.",
  },
  {
    id: "c4",
    title: "Onboarding checklist for new finance staff",
    group: "Earlier this week",
    when: "Tue",
    said: "Each new person gets the expense policy and a login on their first day.",
  },
  {
    id: "c5",
    title: "Board deck outline",
    group: "Earlier this week",
    when: "Mon",
    said: "The board wants the cash position and the late invoices on one slide.",
  },
  {
    id: "c6",
    title: "Expense policy questions",
    group: "October",
    when: "28 Oct",
    said: "Train travel is paid in full; taxis only after 22:00.",
  },
  {
    id: "c7",
    title: "Q3 close",
    group: "October",
    when: "3 Oct",
    said: "The quarter closes on 10 October; invoices after that go to Q4.",
  },
  {
    id: "c8",
    title: "Hiring plan",
    group: "September",
    when: "12 Sep",
    said: "Two controllers by January; the job post goes out next week.",
    archived: true,
  },
];

const ORDER = [
  "Today",
  "Yesterday",
  "Earlier this week",
  "October",
  "September",
];

/** The sentence around the first hit, the matched words marked, cut to a line. */
const snippet = (text: string, words: string) => {
  const at = text.toLowerCase().indexOf(words.toLowerCase());
  if (at === -1) {
    return text;
  }
  // A few words before the hit, starting on a whole word.
  const from = Math.max(0, at - 24);
  const gap = text.indexOf(" ", from);
  const start = from === 0 || gap === -1 || gap >= at ? from : gap + 1;
  return (
    <>
      {start > 0 ? "…" : ""}
      {text.slice(start, at)}
      <CommandHighlight>{text.slice(at, at + words.length)}</CommandHighlight>
      {text.slice(at + words.length)}
    </>
  );
};

/** A stand-in for the server's search: ranked, the title's hits first, after a moment. */
const searchServer = (chats: readonly Chat[], query: string, fail: boolean) =>
  new Promise<{ chat: Chat; inTitle: boolean }[]>((resolve, reject) => {
    const words = query.trim().toLowerCase();
    setTimeout(() => {
      if (fail) {
        reject(new Error("The search did not answer"));
        return;
      }
      const hits = chats
        .filter((chat) => !chat.archived)
        .map((chat) => ({
          chat,
          inTitle: chat.title.toLowerCase().includes(words),
          inSaid: chat.said.toLowerCase().includes(words),
        }))
        .filter((hit) => hit.inTitle || hit.inSaid)
        .sort((a, b) => Number(b.inTitle) - Number(a.inTitle));
      resolve(hits.map(({ chat, inTitle }) => ({ chat, inTitle })));
    }, 900);
  });

const ROW_ACTIONS: CommandItemData["actions"] = [
  { value: "rename", label: "Rename", icon: PencilIcon },
  { value: "archive", label: "Archive", icon: ArchiveIcon },
  { value: "delete", label: "Delete", icon: TrashIcon, variant: "destructive" },
];

/** A chat as a row: its title, the time at its end or the working mark while it answers. */
const rowOf = (
  chat: Chat,
  current: string,
  description?: ReactNode
): CommandItemData => ({
  value: chat.id,
  label: chat.title,
  description,
  current: chat.id === current,
  end:
    chat.working === true ? (
      <AgentIndicator />
    ) : (
      <span {...stylex.props(layout.time)}>{chat.when}</span>
    ),
  actions: ROW_ACTIONS,
});

/** At rest: New chat first, the chats by day, Archived last. */
const restingItems = (
  chats: readonly Chat[],
  current: string
): CommandItems => {
  const shown = chats.filter((chat) => !chat.archived);
  const archived = chats.length - shown.length;
  return [
    { value: "new", label: "New chat", icon: PlusIcon },
    ...ORDER.flatMap((group) => {
      const inGroup = shown.filter((chat) => chat.group === group);
      return inGroup.length === 0
        ? []
        : [
            {
              type: "group" as const,
              label: group,
              items: inGroup.map((chat) => rowOf(chat, current)),
            },
          ];
    }),
    { type: "separator" as const },
    {
      value: "archived",
      label: "Archived",
      icon: ArchiveIcon,
      description: archived === 1 ? "1 chat" : `${archived} chats`,
    },
  ];
};

type Search =
  | { state: "idle" }
  | { state: "searching" }
  | { state: "found"; items: CommandItems }
  | { state: "failed" };

/** Typing asks the stand-in server; its answer, or that it failed, comes back as rows. */
const useSearch = (
  chats: readonly Chat[],
  query: string,
  current: string,
  failOnce: boolean
) => {
  const [search, setSearch] = useState<Search>({ state: "idle" });
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (query.trim() === "") {
      return undefined;
    }
    let live = true;
    const ask = async () => {
      try {
        const hits = await searchServer(chats, query, failOnce && tries === 0);
        if (live) {
          setSearch({
            state: "found",
            items: hits.map(({ chat, inTitle }) =>
              rowOf(
                chat,
                current,
                inTitle ? chat.said : snippet(chat.said, query.trim())
              )
            ),
          });
        }
      } catch {
        if (live) {
          setSearch({ state: "failed" });
        }
      }
    };
    void ask();
    return () => {
      live = false;
    };
  }, [chats, query, current, failOnce, tries]);
  return {
    search,
    setSearch,
    retry: () => {
      setTries((count) => count + 1);
    },
  };
};

const places = [
  { id: "home", name: "Home", icon: HouseIcon },
  { id: "inbox", name: "Inbox", icon: InboxIcon },
  { id: "projects", name: "Projects", icon: FolderKanbanIcon },
];

/**
 * All chats in one window over the page: opened by mod+K, or by the sidebar's "All chats". New
 * chat first, the chats by day with their time (or the working mark while one answers) and the
 * open one marked, Archived last. Typing searches the server: ranked results, each with a line
 * saying where the words were, marked. A row's actions (the right arrow or More): Rename, Archive,
 * and Delete with Undo. `failSearch` makes the first search fail, to show it.
 */
export default function ChatsWindow({
  startOpen = false,
  failSearch = false,
}: {
  startOpen?: boolean;
  failSearch?: boolean;
}) {
  const [toast] = useState(() => createToaster());
  const [chats, setChats] = useState(firstChats);
  const [current, setCurrent] = useState("c1");
  const [open, setOpen] = useState(startOpen);
  const [query, setQuery] = useState("");
  const [renaming, setRenaming] = useState<Chat | null>(null);
  const [name, setName] = useState("");
  const { search, setSearch, retry } = useSearch(
    chats,
    query,
    current,
    failSearch
  );

  const searching = query.trim() !== "";
  const failedItems: CommandItems = [
    {
      value: "retry-search",
      label: "Try the search again",
      icon: RefreshCwIcon,
      description: "The search did not answer. Nothing was changed.",
    },
  ];
  let items: CommandItems = restingItems(chats, current);
  if (searching) {
    items =
      search.state === "found"
        ? search.items
        : search.state === "failed"
          ? failedItems
          : [];
  }

  const act = (value: string) => {
    if (value === "retry-search") {
      setSearch({ state: "searching" });
      retry();
      return false;
    }
    if (value === "new") {
      toast("New chat started");
    } else if (value !== "archived") {
      setCurrent(value);
    }
    setQuery("");
    return undefined;
  };
  const itemAction = (value: string, action: string) => {
    const chat = chats.find((each) => each.id === value);
    if (chat === undefined) {
      return;
    }
    if (action === "rename") {
      // The window gives way to the rename dialog, so focus has one place to go.
      setOpen(false);
      setQuery("");
      setName(chat.title);
      setRenaming(chat);
    } else if (action === "archive") {
      setChats((all) =>
        all.map((each) =>
          each.id === value ? { ...each, archived: true } : each
        )
      );
      toast(`${chat.title} archived`);
    } else if (action === "delete") {
      // Deleted at once; a toast offers Undo (the Confirmations pattern), so nothing asks first.
      const before = chats;
      setChats((all) => all.filter((each) => each.id !== value));
      toast(`${chat.title} deleted`, {
        action: {
          label: "Undo",
          onAction: () => {
            setChats(before);
          },
        },
      });
    }
  };

  const recent = chats.filter((chat) => !chat.archived).slice(0, 4);
  const shownChat = chats.find((chat) => chat.id === current);

  return (
    <div {...stylex.props(layout.frame)}>
      <AppShell
        style={layout.shell}
        sidebar={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {places.map((place) => (
                    <SidebarMenuItem key={place.id}>
                      <SidebarMenuButton asChild>
                        <a href={`#${place.id}`}>
                          <Icon icon={place.icon} />
                          {place.name}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recent.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton asChild isActive={chat.id === current}>
                        <a
                          href={`#chat-${chat.id}`}
                          onClick={() => {
                            setCurrent(chat.id);
                          }}
                        >
                          <Icon icon={MessageSquareIcon} />
                          {chat.title}
                          {chat.working === true && <AgentIndicator />}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      All chats
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
      >
        <AppShellHeader title={shownChat?.title ?? "Chat"} />
        <AppShellPage>
          <PageHeader
            title={shownChat?.title ?? "Chat"}
            description="mod+K or All chats opens every chat."
          />
        </AppShellPage>
      </AppShell>
      <CommandDialog
        aria-label="Search chats"
        trigger={null}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
          }
        }}
        items={items}
        onAction={act}
        inputValue={query}
        onInputValueChange={(next) => {
          setQuery(next);
          setSearch(
            next.trim() === "" ? { state: "idle" } : { state: "searching" }
          );
        }}
        filter={!searching}
        loading={searching && search.state === "searching"}
        onItemAction={itemAction}
      >
        <CommandInput placeholder="Search chats" />
        <CommandEmpty>
          {searching ? "No chat has those words" : "No chats yet"}
        </CommandEmpty>
        <CommandList />
      </CommandDialog>
      <Dialog
        open={renaming !== null}
        onOpenChange={(next) => {
          if (!next) {
            setRenaming(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field name="chat-name">
              <FieldLabel>Name</FieldLabel>
              <Input
                value={name}
                onValueChange={(value: string) => {
                  setName(value);
                }}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose
              variant="default"
              onClick={() => {
                const chat = renaming;
                if (chat !== null && name.trim() !== "") {
                  setChats((all) =>
                    all.map((each) =>
                      each.id === chat.id
                        ? { ...each, title: name.trim() }
                        : each
                    )
                  );
                }
              }}
            >
              Rename
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster toaster={toast} />
    </div>
  );
}
