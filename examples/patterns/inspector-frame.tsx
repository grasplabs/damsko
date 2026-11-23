"use client";

// The window the inspector examples stand in (inspector-report.tsx, inspector-record.tsx): the App
// shell, a plain main area, and the inspector as the shell's panel, beside the page on a wide
// window and a Sheet from the end on a narrow one. The headers' Share and More actions are here
// too, and the window's toasts that say what they did.

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@grasp-os/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@grasp-os/ui/components/sidebar";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  ChartColumnIcon,
  CircleUserIcon,
  ClockIcon,
  CopyIcon,
  EllipsisIcon,
  HouseIcon,
  Icon,
  InboxIcon,
  LinkIcon,
  SettingsIcon,
  ShareIcon,
  TagIcon,
  TrashIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";

const layout = stylex.create({
  // The whole frame on its own page, the stage on the pattern page.
  // The window less the preview frame's room at each side (space-6), never more than what holds
  // it, in the system's corner and edge, so it reads as a window on the stage.
  window: {
    width: `calc(100vw - 2 * ${space["6"]})`,
    maxWidth: "100%",
    height: `calc(100dvh - 2 * ${space["6"]})`,
    minHeight: 560,
    overflow: "clip",
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
    backgroundColor: colors.background,
  },
  fill: { height: "100%", minHeight: 0 },
  main: {
    display: "grid",
    alignContent: "start",
    rowGap: space["6"],
    minWidth: 0,
  },
  // The plain main area: a ground where the object's own page would be.
  plain: {
    minHeight: 320,
    borderRadius: radius.xl,
    cornerShape: radius.shape,
    backgroundColor: colors.muted,
  },
});

type Place = "home" | "inbox" | "reports" | "people" | "settings";

const places: {
  group: string;
  items: { id: Place; name: string; icon: IconData; count?: number }[];
}[] = [
  {
    group: "",
    items: [
      { id: "home", name: "Home", icon: HouseIcon },
      { id: "inbox", name: "Inbox", icon: InboxIcon, count: 4 },
    ],
  },
  {
    group: "Work",
    items: [
      { id: "reports", name: "Reports", icon: ChartColumnIcon },
      { id: "people", name: "People", icon: UsersIcon },
      { id: "settings", name: "Settings", icon: SettingsIcon },
    ],
  },
];

const sidebar = (current: Place) => (
  <SidebarContent>
    {places.map((group) => (
      <SidebarGroup key={group.group}>
        {group.group !== "" && (
          <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map((place) => (
              <SidebarMenuItem key={place.id}>
                <SidebarMenuButton asChild isActive={place.id === current}>
                  <a href={`#${place.id}`}>
                    <Icon icon={place.icon} />
                    {place.name}
                  </a>
                </SidebarMenuButton>
                {place.count !== undefined && (
                  <SidebarMenuBadge>{place.count}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    ))}
  </SidebarContent>
);

/** The window's own toasts: each example keeps its own queue, so its toasts stay its own. */
export type InspectorToast = ReturnType<typeof createToaster>;

/** What the frame gives its inspector. */
export interface InspectorOptions {
  /** Closes the panel. */
  onClose: () => void;
  /** The window's toasts, for what the header's actions did. */
  toast: InspectorToast;
}

/** Copies the link, then says so; a refused copy fails the action, which says so itself. */
const copyLink = async (href: string, toast: InspectorToast) => {
  await navigator.clipboard.writeText(href);
  toast("Link copied", { description: href });
};

/** Share, in an inspector's header: a popover that says who can open the link, and copies it. */
export const InspectorShare = ({
  name,
  href,
  toast,
}: {
  name: string;
  href: string;
  toast: InspectorToast;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button size="sm" variant="outline">
        <Icon icon={ShareIcon} />
        Share
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end">
      <PopoverTitle>Share {name}</PopoverTitle>
      <PopoverDescription>
        Anyone in the workspace with the link can open it.
      </PopoverDescription>
      <PopoverFooter>
        <PopoverClose>Cancel</PopoverClose>
        <Button
          size="sm"
          variant="default"
          onClick={() => copyLink(href, toast)}
          errorLabel="Could not copy"
        >
          <Icon icon={LinkIcon} />
          Copy link
        </Button>
      </PopoverFooter>
    </PopoverContent>
  </Popover>
);

/**
 * More actions, in an inspector's header: copy the link, duplicate, move to the trash. Each says
 * what it did in a toast; the trash can be undone from its toast, and focus comes back to the menu.
 */
export const InspectorMore = ({
  name,
  href,
  toast,
}: {
  name: string;
  href: string;
  toast: InspectorToast;
}) => {
  const [trashed, setTrashed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const undo = () => {
    setTrashed(false);
    toast(`${name} is back`);
    trigger.current?.focus();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={trigger}
          size="icon-sm"
          variant="ghost"
          aria-label="More actions"
        >
          <Icon icon={EllipsisIcon} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          icon={LinkIcon}
          onSelect={() => {
            copyLink(href, toast).catch(() => {
              toast.error("Could not copy the link");
            });
          }}
        >
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={CopyIcon}
          onSelect={() => {
            toast(`A copy of ${name} was made`);
          }}
        >
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={TrashIcon}
          disabled={trashed}
          onSelect={() => {
            setTrashed(true);
            toast(`${name} moved to the trash`, {
              action: { label: "Undo", onAction: undo },
            });
          }}
        >
          Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ---- Lists that change -----------------------------------------------------------------------------

/** One row an example keeps in state. */
export interface ListRow {
  id: string;
  icon: IconData;
  name: string;
  detail?: ReactNode;
}

/** A section of the inspector on screen, by its title. */
const sectionOf = (title: string) =>
  [
    ...document.querySelectorAll<HTMLElement>(
      "[data-slot=inspector] section[aria-labelledby]"
    ),
  ].find(
    (section) =>
      document
        .getElementById(section.getAttribute("aria-labelledby") ?? "")
        ?.textContent?.trim() === title
  );

/** A section's bins, in order. */
const binsOf = (section: HTMLElement | undefined) =>
  section === undefined
    ? []
    : [
        ...section.querySelectorAll<HTMLElement>(
          'button[aria-label^="Remove "]'
        ),
      ];

/** A section's Add: the first button in it that is not a bin (the head's Add, or the empty row). */
const addOf = (section: HTMLElement | undefined) =>
  section === undefined
    ? null
    : ([...section.querySelectorAll<HTMLElement>("button")].find(
        (button) => !button.getAttribute("aria-label")?.startsWith("Remove ")
      ) ?? null);

/** Whether focus has fallen to the page. */
const adrift = () => {
  const active = document.activeElement;
  return active === null || active === document.body || !active.isConnected;
};

// How long after Undo focus is looked at again: past the toast's own leaving.
const FOCUS_AGAIN = 400;

/**
 * A section's rows in state: Remove takes a row out, with Undo in a toast; Add puts in the next
 * of `spare`, and says so in a toast when none is left. Focus never falls to the page: after
 * Remove it goes to the next row's bin (else the one before, else Add), after Add it stays on Add,
 * and after Undo it goes to the row that came back.
 */
export const useListRows = (options: {
  /** The section's title, to find it on screen. */
  title: string;
  rows: readonly ListRow[];
  /** What Add puts in, in order. */
  spare: readonly ListRow[];
  /** Said when Add has nothing left ("Every suggested source is linked"). */
  full: string;
  toast: InspectorToast;
}) => {
  const { title, toast } = options;
  const [rows, setRows] = useState(options.rows);
  const [spare, setSpare] = useState(options.spare);
  const binFor = (name: string) => `Remove ${name}`;
  const putBack = (row: ListRow, at: number) => {
    flushSync(() => {
      setRows((was) =>
        was.some((had) => had.id === row.id)
          ? was
          : [...was.slice(0, at), row, ...was.slice(at)]
      );
    });
    const back = () =>
      binsOf(sectionOf(title)).find(
        (bin) => bin.getAttribute("aria-label") === binFor(row.name)
      );
    back()?.focus();
    // Undo's toast closes after its press and can drop focus to the page: put it back once more.
    setTimeout(() => {
      if (adrift()) {
        back()?.focus();
      }
    }, FOCUS_AGAIN);
    toast(`${row.name} is back`);
  };
  const remove = (row: ListRow) => {
    const at = rows.findIndex((had) => had.id === row.id);
    const bin = binsOf(sectionOf(title)).findIndex(
      (each) => each.getAttribute("aria-label") === binFor(row.name)
    );
    flushSync(() => {
      setRows((was) => was.filter((had) => had.id !== row.id));
    });
    const section = sectionOf(title);
    const left = binsOf(section);
    (left[bin] ?? left[bin - 1] ?? addOf(section))?.focus();
    toast(`${row.name} removed`, {
      action: {
        label: "Undo",
        onAction: () => {
          putBack(row, at);
        },
      },
    });
  };
  const add = () => {
    const next = spare[0];
    if (next === undefined) {
      toast(options.full);
      return;
    }
    flushSync(() => {
      setRows((was) => [...was, next]);
      setSpare((was) => was.slice(1));
    });
    // The empty card's own row has gone with the first one in: the head's Add takes focus.
    if (adrift()) {
      addOf(sectionOf(title))?.focus();
    }
    toast(`${next.name} added`);
  };
  return {
    rows: rows.map((row) => ({
      ...row,
      onRemove: () => {
        remove(row);
      },
    })),
    onAdd: add,
  };
};

/** One answer in an inspector's dialog: its words, its work, and what it says when that fails. */
export interface InspectorDialogAction {
  label: string;
  /** The work; it may throw, and the dialog then stays open and the button says so. */
  run: () => void | Promise<void>;
  errorLabel: string;
  /** @default "default" */
  variant?: ButtonVariant;
}

/** A dialog's answer: it runs its work and closes the dialog once that is done. */
const DialogAnswer = ({
  action,
  onDone,
}: {
  action: InspectorDialogAction;
  onDone: () => void;
}) => (
  <Button
    size="sm"
    variant={action.variant ?? "default"}
    onClick={async () => {
      await action.run();
      onDone();
    }}
    errorLabel={action.errorLabel}
  >
    {action.label}
  </Button>
);

/**
 * A dialog an inspector opens from its state, with no trigger of its own: drawn while `open`, and
 * focus goes back to what opened it when it closes (the Dialog sees to that). With no `actions`,
 * Done alone closes it; with them, Cancel stands before them unless `cancel` is false.
 */
export const InspectorDialog = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  cancel = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  actions?: InspectorDialogAction[];
  cancel?: boolean;
}) => (
  <Dialog
    open={open}
    onOpenChange={(next: boolean) => {
      if (!next) {
        onClose();
      }
    }}
  >
    {open && (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description !== undefined && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        <DialogFooter>
          {actions === undefined ? (
            <DialogClose>Done</DialogClose>
          ) : (
            <>
              {cancel && <DialogClose>Cancel</DialogClose>}
              {actions.map((action) => (
                <DialogAnswer
                  key={action.label}
                  action={action}
                  onDone={onClose}
                />
              ))}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    )}
  </Dialog>
);

export interface InspectorFrameProps {
  /** The page's title, where the object's own page would be. */
  title: string;
  /** One line under it. */
  description: string;
  /** Which sidebar link is the page's. */
  current: "reports" | "people";
  /** The inspector, the shell's panel. `onClose` closes the panel. */
  inspector: (options: InspectorOptions) => ReactNode;
}

export function InspectorFrame({
  title,
  description,
  current,
  inspector,
}: InspectorFrameProps) {
  const [toast] = useState(() => createToaster());
  const [panelOpen, setPanelOpen] = useState<boolean | undefined>(undefined);
  useEffect(() => () => toast.dismiss(), [toast]);
  return (
    <div {...stylex.props(layout.window)}>
      <AppShell
        style={layout.fill}
        sidebar={sidebar(current)}
        title={title}
        panel={inspector({
          onClose: () => {
            setPanelOpen(false);
          },
          toast,
        })}
        panelOpen={panelOpen}
        onPanelOpenChange={setPanelOpen}
      >
        <div {...stylex.props(layout.main)}>
          <PageHeader title={title} description={description} />
          <div aria-hidden {...stylex.props(layout.plain)} />
        </div>
      </AppShell>
      <Toaster toaster={toast} />
    </div>
  );
}

const someDetails: ListRow[] = [
  { id: "owner", icon: CircleUserIcon, name: "Owner", detail: "Person" },
  { id: "due", icon: ClockIcon, name: "Due date", detail: "Date" },
  { id: "label", icon: TagIcon, name: "Label", detail: "Category" },
];

// The frame alone, with an inspector that holds one empty section: the window the screens share
// (the build renders every file here as an example of its own).
const EmptyInspector = ({ onClose, toast }: InspectorOptions) => {
  const details = useListRows({
    title: "Details",
    rows: [],
    spare: someDetails,
    full: "Every suggested detail is in",
    toast,
  });
  return (
    <Inspector
      aria-label="Details"
      onClose={onClose}
      title="Untitled"
      description="Nothing chosen yet."
      sections={[
        {
          id: "details",
          title: "Details",
          emptyLabel: "Add a detail",
          ...details,
        },
      ]}
    />
  );
};

const InspectorFrameAlone = () => (
  <InspectorFrame
    title="Reports"
    description="Every report in the workspace."
    current="reports"
    inspector={(options) => <EmptyInspector {...options} />}
  />
);

export default InspectorFrameAlone;
