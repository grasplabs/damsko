"use client";

import { Alert, AlertDescription } from "@grasp-os/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@grasp-os/ui/components/alert-dialog";
import { Badge } from "@grasp-os/ui/components/badge";
import type { BadgeVariant } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationDetails,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@grasp-os/ui/components/confirmation";
import type { ConfirmationProps } from "@grasp-os/ui/components/confirmation";
import {
  DataTable,
  DataTableFilters,
} from "@grasp-os/ui/components/data-table";
import type {
  DataTableFilterCondition,
  DataTableFilterField,
} from "@grasp-os/ui/components/data-table";
import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
import { SectionHeader } from "@grasp-os/ui/components/section-header";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@grasp-os/ui/components/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { useAction } from "@grasp-os/ui/hooks/use-action";
import {
  ChevronRightIcon,
  CircleUserIcon,
  CoinsIcon,
  FileIcon,
  Icon,
  InboxIcon,
  ServerIcon,
  TypeIcon,
  WandSparklesIcon,
  XIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { fadeIn } from "@grasp-os/ui/lib/styles";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { requests as start } from "./approvals-data";
import type {
  ApprovalDecision,
  ApprovalEffect,
  ApprovalItem,
  ApprovalStatus,
} from "./approvals-data";

// The approvals inbox: everything agents are waiting for you to answer, made only of finished
// components. A Data table of requests under Tabs for waiting, decided and expired, narrowed by the
// Data table's filters; choosing one opens its Confirmation beside the table (in a Sheet on a
// phone) with its DiffViewer. How a yes is confirmed follows docs/patterns/confirmations.mdx: what
// can be undone happens at once, with Undo in the answer; what cannot is held; a grave one asks
// in an Alert dialog. Several waiting requests can be declined at once, with Undo in a Toast.
//
// Calm on a press: the request settles in place, and its row stays in the table until the request
// is closed, so nothing below it moves while you read the answer.

/** Wide enough for the table and the request side by side: the rail breakpoint, 84rem. */
const WIDE = "@container (width >= 84rem)";
/** Room enough for the screen's own padding to grow: the tablet breakpoint, 48rem. */
const ROOMY = "@container (width >= 48rem)";

const layout = stylex.create({
  screen: {
    containerType: "inline-size",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    alignContent: "start",
    rowGap: space["5"],
    // The window's width less the preview frame's room at each side (space-6), never more than
    // what holds it: the whole frame on its own, the stage on the pattern page. A container gives
    // no width from its content, so it needs one of its own.
    width: `calc(100vw - 2 * ${space["6"]})`,
    maxWidth: "100%",
    minHeight: "100%",
    boxSizing: "border-box",
    padding: { default: space["4"], [ROOMY]: space["6"] },
    backgroundColor: colors.background,
    color: colors.foreground,
    fontFamily: font.sans,
  },
  // As tall as the window less the frame's room at each side. The frame centres what it holds, so a
  // screen that got shorter after an answer moved the table down; at the window's height it has
  // nothing to centre, and nothing moves.
  full: { minHeight: `calc(100svh - 2 * ${space["6"]})` },
  bar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["3"],
    minWidth: 0,
  },
  chosen: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    marginInlineStart: "auto",
  },
  count: {
    color: colors.mutedForeground,
    fontSize: font.textSm,
    fontVariantNumeric: "tabular-nums",
  },
  // One column until a request is open: the list has the whole width.
  panes: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    alignItems: "start",
    gap: space["5"],
    paddingBlockStart: space["4"],
  },
  panesOpen: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [WIDE]: `minmax(0, 1fr) min(${size.confirmationWidth}, 46%)`,
    },
  },
  side: {
    position: "sticky",
    top: space["4"],
    display: "grid",
    rowGap: space["3"],
    minWidth: 0,
  },
  sideTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },
  request: { display: "grid", rowGap: space["3"], minWidth: 0 },
  // Who asked and when, over the request: one quiet line.
  asked: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
  failed: {
    display: "grid",
    justifyItems: "center",
    rowGap: space["3"],
    paddingBlockStart: space["4"],
  },
});

const variantOf: Record<ApprovalStatus, BadgeVariant> = {
  waiting: "warning",
  approved: "success",
  declined: "default",
  expired: "default",
};
const wordsOf: Record<ApprovalStatus, string> = {
  waiting: "Waiting",
  approved: "Approved",
  declined: "Declined",
  expired: "Expired",
};
const iconOf: Record<ApprovalEffect["kind"], IconData> = {
  file: FileIcon,
  person: CircleUserIcon,
  money: CoinsIcon,
  system: ServerIcon,
};

type Tab = "waiting" | "decided" | "expired";
const tabOf = (status: ApprovalStatus): Tab => {
  if (status === "waiting") {
    return "waiting";
  }
  if (status === "expired") {
    return "expired";
  }
  return "decided";
};

const agents = [...new Set(start.map((request) => request.agent))].map(
  (name) => ({ id: name, label: name, icon: WandSparklesIcon })
);
const fields: DataTableFilterField[] = [
  {
    id: "agent",
    label: "Agent",
    icon: WandSparklesIcon,
    operators: [
      { id: "is", label: "is" },
      { id: "is-not", label: "is not" },
    ],
    defaultOperatorId: "is",
    value: { type: "select", options: agents },
  },
  {
    id: "kind",
    label: "Touches",
    icon: FileIcon,
    operators: [{ id: "is", label: "is" }],
    defaultOperatorId: "is",
    value: {
      type: "select",
      options: [
        { id: "files", label: "Files", icon: FileIcon },
        { id: "people", label: "People", icon: CircleUserIcon },
        { id: "money", label: "Money", icon: CoinsIcon },
        { id: "systems", label: "Systems", icon: ServerIcon },
      ],
    },
  },
  {
    id: "title",
    label: "Request",
    icon: TypeIcon,
    operators: [{ id: "contains", label: "contains" }],
    defaultOperatorId: "contains",
    value: { type: "text" },
  },
];

const passes = (request: ApprovalItem, condition: DataTableFilterCondition) => {
  const { fieldId, operatorId, value } = condition;
  if (!fieldId || value === null || value === "") {
    return true;
  }
  if (fieldId === "agent") {
    return operatorId === "is-not"
      ? request.agent !== value
      : request.agent === value;
  }
  if (fieldId === "kind") {
    return request.kind === value;
  }
  return request.title.toLowerCase().includes(String(value).toLowerCase());
};

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

const countsOf = (items: readonly ApprovalItem[]) => {
  const all = { waiting: 0, decided: 0, expired: 0 };
  for (const item of items) {
    all[tabOf(item.decision.status)] += 1;
  }
  return all;
};

/** The first row's Open button, then the tab shown: the nearest controls that are always there. */
const firstOpen = (screen: HTMLElement | null) =>
  screen?.querySelector<HTMLElement>("[data-opens-request]") ?? null;
const shownTab = (screen: HTMLElement | null) =>
  screen?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]') ??
  null;
/** Where focus goes when the request closes: the button that opened it, or, if its row left, the nearest one. */
const backFrom = (opener: HTMLElement | null, screen: HTMLElement | null) =>
  opener?.isConnected === true
    ? opener
    : (firstOpen(screen) ?? shownTab(screen));

/** The Confirmation's state for a decision: waiting asks, approved and declined say so. */
const confirmationOf = (
  decision: ApprovalDecision
): Pick<ConfirmationProps, "state"> & { approved?: boolean } => {
  if (decision.status === "approved") {
    return { state: "approval-responded", approved: true };
  }
  if (decision.status === "declined") {
    return { state: "output-denied", approved: false };
  }
  return { state: "approval-requested" };
};

interface Answers {
  approve: (item: ApprovalItem) => Promise<void>;
  undo: (id: string) => void;
  decline: (item: ApprovalItem) => Promise<void>;
  askFirst: (item: ApprovalItem) => Promise<boolean>;
}

/**
 * The request opened, with its change. Once answered it settles into its decision, which takes
 * focus (Confirmation does so itself): it stays where it is, beside the table or in the Sheet.
 */
const RequestView = ({
  open,
  answers: { approve, undo, decline, askFirst },
}: {
  open: ApprovalItem;
  answers: Answers;
}) => {
  const { state, approved } = confirmationOf(open.decision);
  const approveWords = open.approveLabel ?? "Approve";
  return (
    <div {...stylex.props(layout.request)}>
      <p {...stylex.props(layout.asked)}>
        {[open.agent, open.askedAt, open.expiresIn]
          .filter((part) => part !== undefined)
          .join(" · ")}
      </p>
      {open.decision.status === "expired" ? (
        <Alert>
          <AlertDescription>
            {`${open.title}: it expired ${open.decision.at}, and nothing was done.`}
          </AlertDescription>
        </Alert>
      ) : (
        <Confirmation state={state} approval={{ id: open.id, approved }}>
          <ConfirmationTitle>
            <ConfirmationRequest>{open.title}</ConfirmationRequest>
            <ConfirmationAccepted>{`Approved: ${open.title}`}</ConfirmationAccepted>
            <ConfirmationRejected>{`Declined: ${open.title}`}</ConfirmationRejected>
          </ConfirmationTitle>
          {open.stake === "undoable" && (
            <ConfirmationAccepted>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  undo(open.id);
                }}
              >
                Undo
              </Button>
            </ConfirmationAccepted>
          )}
          <ConfirmationDetails
            items={open.affects.map((effect) => ({
              icon: iconOf[effect.kind],
              label: effect.label,
              detail:
                effect.irreversible === true
                  ? [effect.detail, "Cannot be undone"]
                      .filter((part) => part !== undefined)
                      .join(". ")
                  : effect.detail,
            }))}
          />
          <ConfirmationActions>
            <ConfirmationAction
              variant="outline"
              errorLabel="Could not decline"
              onClick={() => decline(open)}
            >
              Decline
            </ConfirmationAction>
            <ConfirmationAction
              hold={open.stake === "moderate"}
              errorLabel="Could not approve"
              onClick={async () => {
                if (open.stake === "grave" && !(await askFirst(open))) {
                  return;
                }
                await approve(open);
              }}
            >
              {approveWords}
            </ConfirmationAction>
          </ConfirmationActions>
        </Confirmation>
      )}
      {open.diff && (
        <DiffViewer
          title={open.diff.title}
          oldValue={open.diff.before}
          newValue={open.diff.after}
        />
      )}
    </div>
  );
};

interface BodySetup {
  failed: boolean;
  loaded: boolean;
  empty: boolean;
  tab: Tab;
  retry: ReactNode;
  panes: ReactNode;
}

/** What stands under the bar: the failure, the placeholders, nothing to show, or the requests. */
const bodyFor = ({ failed, loaded, empty, tab, retry, panes }: BodySetup) => {
  if (failed) {
    return (
      <div {...stylex.props(layout.failed)}>
        <Empty variant="destructive">
          <EmptyHeader>
            <EmptyMedia />
            <EmptyTitle>The requests did not load</EmptyTitle>
            <EmptyDescription>
              Your agents keep waiting; nothing was answered.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        {retry}
      </div>
    );
  }
  // Loading: the table itself, in its own loading rows, its columns as they will stand.
  if (!loaded) {
    return panes;
  }
  if (empty) {
    const waiting = tab === "waiting";
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia icon={InboxIcon} />
          <EmptyTitle>
            {waiting ? "Nothing waits for you" : "Nothing here yet"}
          </EmptyTitle>
          <EmptyDescription>
            {waiting
              ? "When an agent needs your yes, its request appears here."
              : "Requests you answer, and those that run out, appear here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return panes;
};

/** The whole screen. `state` shows it empty, loading or failed, for the pattern page. */
export default function ApprovalsInbox({
  state = "ready",
}: {
  state?: "ready" | "empty" | "loading" | "failed";
}) {
  const [items, setItems] = useState<ApprovalItem[]>(() =>
    state === "empty"
      ? start.filter((request) => request.decision.status !== "waiting")
      : start
  );
  const [tab, setTab] = useState<Tab>("waiting");
  const [condition, setCondition] = useState<DataTableFilterCondition>({
    fieldId: null,
    operatorId: null,
    value: null,
  });
  const [chosen, setChosen] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  // The first look loads, then the requests fade in where the placeholders stood.
  const [loaded, setLoaded] = useState(state === "failed");
  const [failed, setFailed] = useState(state === "failed");
  const [toast] = useState(() => createToaster());
  const [asking, setAsking] = useState<{
    item: ApprovalItem;
    answer: (yes: boolean) => void;
  } | null>(null);
  const [wide, setWide] = useState(true);
  const screen = useRef<HTMLDivElement>(null);
  // The row's Open button that opened the request shown: focus goes back to it when it closes.
  const opener = useRef<HTMLElement | null>(null);
  // Set by Try again: once the requests are drawn in its place, the tab shown takes focus.
  const toTab = useRef(false);
  // Try again works on its button, which keeps focus meanwhile, until the requests take its place.
  const retry = useAction(() => wait(900), {
    loadingLabel: "Loading the requests",
    successLabel: "Loaded",
    errorLabel: "Not loaded",
  });

  useEffect(() => {
    if (state === "loading" || state === "failed") {
      return;
    }
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 900);
    return () => {
      clearTimeout(timer);
    };
  }, [state]);
  useEffect(() => () => toast.dismiss(), [toast]);
  // A wide screen takes the request beside the table; a narrower one, in a Sheet from the side.
  useEffect(() => {
    const element = screen.current;
    if (!element) {
      return;
    }
    // 84rem, as WIDE: below it the table needs the whole width, and the request opens in a Sheet.
    const watch = new ResizeObserver(([entry]) => {
      setWide((entry?.contentRect.width ?? 0) >= 84 * 16);
    });
    watch.observe(element);
    return () => {
      watch.disconnect();
    };
  }, []);
  // Every draw: after Try again the button is gone, so focus goes to the tab, never to the page.
  useEffect(() => {
    if (!toTab.current) {
      return;
    }
    toTab.current = false;
    shownTab(screen.current)?.focus();
  });

  const decide = (id: string, decision: ApprovalDecision) => {
    setItems((was) =>
      was.map((item) => (item.id === id ? { ...item, decision } : item))
    );
  };

  // The open request's row stays where it is until the request closes, even once answered.
  const shown = items.filter(
    (item) =>
      (tabOf(item.decision.status) === tab || item.id === openId) &&
      passes(item, condition)
  );
  const counts = countsOf(items);
  const known = loaded && !failed;
  const open = items.find((item) => item.id === openId) ?? null;
  const back = () => backFrom(opener.current, screen.current);

  /** Closes the request beside the table; focus goes back to the row's Open button. */
  const closeRequest = () => {
    setOpenId(null);
    requestAnimationFrame(() => back()?.focus());
  };
  /**
   * Escape closes it too, from the request or from the table beside it (focus stays on the row's
   * button when a request opens), unless a part inside used Escape itself.
   */
  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || event.defaultPrevented || openId === null) {
      return;
    }
    // Only from inside the table or the request, not from a popup drawn elsewhere in the page.
    if (
      !(event.target instanceof Node) ||
      !event.currentTarget.contains(event.target)
    ) {
      return;
    }
    event.preventDefault();
    closeRequest();
  };
  /** Another tab shows other requests, so the one open closes: it may not be in the tab shown. */
  const changeTab = (value: string | null) => {
    if (value !== "waiting" && value !== "decided" && value !== "expired") {
      return;
    }
    setTab(value);
    setChosen([]);
    setOpenId(null);
  };
  const tryAgain = async () => {
    const result = await retry.run();
    if (!result.ok) {
      return;
    }
    toTab.current = true;
    setFailed(false);
    setLoaded(true);
  };

  /** Approve: what can be undone happens at once; its Undo is in the answer. */
  const approve = async (item: ApprovalItem) => {
    await wait(500);
    decide(item.id, { status: "approved", by: "You", at: new Date() });
  };
  const undo = (id: string) => {
    decide(id, { status: "waiting" });
  };
  const decline = async (item: ApprovalItem) => {
    await wait(400);
    decide(item.id, { status: "declined", by: "You", at: new Date() });
  };
  /**
   * Decline: it can be undone, so it happens at once, with Undo. The Decline button leaves with
   * the rows chosen, so focus goes to the first request left, or the tab when none is.
   */
  const declineAll = (ids: string[]) => {
    const was = items.filter((item) => ids.includes(item.id));
    for (const id of ids) {
      decide(id, { status: "declined", by: "You", at: new Date() });
    }
    setChosen([]);
    toast(
      ids.length === 1
        ? "Declined 1 request"
        : `Declined ${ids.length} requests`,
      {
        action: {
          label: "Undo",
          onAction: () => {
            setItems((all) =>
              all.map((item) => was.find((back) => back.id === item.id) ?? item)
            );
          },
        },
      }
    );
    requestAnimationFrame(() =>
      (firstOpen(screen.current) ?? shownTab(screen.current))?.focus()
    );
  };
  /**
   * A grave yes asks in an Alert dialog first. The dialog is opened from here, with no trigger of
   * its own, so what had focus is kept: after "Not yet" focus goes back to the button that asked.
   */
  const asker = useRef<HTMLElement | null>(null);
  const askFirst = (item: ApprovalItem) =>
    new Promise<boolean>((answer) => {
      asker.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setAsking({ item, answer });
    });

  const request =
    open === null ? null : (
      <RequestView
        key={open.id}
        open={open}
        answers={{ approve, undo, decline, askFirst }}
      />
    );

  const table = (
    <DataTable
      aria-label="Requests"
      rows={loaded ? shown : []}
      loading={!loaded}
      getRowId={(item) => item.id}
      defaultSort={{ key: "asked", order: "ascending" }}
      selectable={tab === "waiting"}
      selection={chosen}
      onSelectionChange={setChosen}
      pageSize={8}
      unit={{ one: "request", other: "requests" }}
      columns={[
        { id: "title", header: "Request", value: (item) => item.title },
        {
          id: "agent",
          header: "Agent",
          value: (item) => item.agent,
          sortable: true,
        },
        { id: "touches", header: "Touches", value: (item) => item.touches },
        {
          id: "asked",
          header: "Asked",
          value: (item) => item.minutes,
          cell: (item) => item.askedAt,
          sortable: true,
        },
        // Every row in Waiting waits: a State column there only repeats one word. Elsewhere it says how each ended.
        ...(tab === "waiting"
          ? []
          : [
              {
                id: "state",
                header: "State",
                value: (item: ApprovalItem) => wordsOf[item.decision.status],
                cell: (item: ApprovalItem) => (
                  <Badge variant={variantOf[item.decision.status]}>
                    {wordsOf[item.decision.status]}
                  </Badge>
                ),
              },
            ]),
        {
          id: "open",
          header: "Open",
          value: () => "",
          // Data table has no row to choose, so each row ends in a button that opens its request.
          cell: (item) => (
            <Button
              variant={item.id === openId ? "outline" : "ghost"}
              size="icon-sm"
              aria-label={`Open: ${item.title}`}
              aria-pressed={item.id === openId}
              data-opens-request=""
              onClick={(event) => {
                opener.current = event.currentTarget;
                setOpenId(item.id);
              }}
            >
              <Icon icon={ChevronRightIcon} />
            </Button>
          ),
        },
      ]}
    />
  );

  const panes = (
    <div
      {...stylex.props(
        layout.panes,
        wide && request !== null && layout.panesOpen,
        fadeIn
      )}
      onKeyDown={closeOnEscape}
    >
      {table}
      {wide && open !== null && (
        <div {...stylex.props(layout.side)}>
          <div {...stylex.props(layout.sideTop)}>
            <SectionHeader title={open.agent} size="sm" headingLevel={3} />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close the request"
              onClick={closeRequest}
            >
              <Icon icon={XIcon} />
            </Button>
          </div>
          {request}
        </div>
      )}
    </div>
  );

  const body = bodyFor({
    failed,
    loaded,
    empty: shown.length === 0 && condition.value === null,
    tab,
    retry: (
      <Button
        variant="outline"
        status={retry.status}
        onClick={() => void tryAgain()}
        loadingLabel="Loading the requests"
        successLabel="Loaded"
        errorLabel="Not loaded"
      >
        Try again
      </Button>
    ),
    panes,
  });
  // Only the screen that holds requests stands at the window's height; the others keep their own.
  const full = state === "ready" || (state === "failed" && !failed);

  return (
    <div ref={screen} {...stylex.props(layout.screen, full && layout.full)}>
      <SectionHeader
        title="Approvals"
        description="What your agents are waiting for you to answer."
        headingLevel={2}
      />
      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList aria-label="Requests" variant="line">
          {/* Counts only once the requests are there: loading or failed, there is nothing to count. */}
          <TabsTrigger value="waiting">
            {known ? `Waiting ${counts.waiting}` : "Waiting"}
          </TabsTrigger>
          <TabsTrigger value="decided">
            {known ? `Decided ${counts.decided}` : "Decided"}
          </TabsTrigger>
          <TabsTrigger value="expired">
            {known ? `Expired ${counts.expired}` : "Expired"}
          </TabsTrigger>
        </TabsList>
        {(["waiting", "decided", "expired"] as const).map((name) => (
          <TabsContent key={name} value={name}>
            {tab === name && (
              <>
                <div {...stylex.props(layout.bar)}>
                  <DataTableFilters
                    fields={fields}
                    condition={condition}
                    onConditionChange={setCondition}
                    aria-label="Filter the requests"
                  />
                  {chosen.length > 0 && (
                    <div {...stylex.props(layout.chosen)}>
                      <span {...stylex.props(layout.count)}>
                        {chosen.length} chosen
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => {
                          declineAll(chosen);
                        }}
                      >
                        <Icon icon={XIcon} />
                        {chosen.length === 1
                          ? "Decline 1"
                          : `Decline ${chosen.length}`}
                      </Button>
                    </div>
                  )}
                </div>
                {body}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
      {!wide && request !== null && open !== null && (
        <Sheet
          open
          onOpenChange={(next) => {
            if (!next) {
              setOpenId(null);
              requestAnimationFrame(() => back()?.focus());
            }
          }}
        >
          <SheetContent size="lg">
            <SheetHeader>
              <SheetTitle>{open.agent}</SheetTitle>
            </SheetHeader>
            <SheetBody>{request}</SheetBody>
          </SheetContent>
        </Sheet>
      )}
      <AlertDialog
        open={asking !== null}
        onOpenChange={(next, details) => {
          if (next || !asking) {
            return;
          }
          asking.answer(details.returnValue === "confirm");
          setAsking(null);
          // Once the dialog has let go of focus: back to where it was asked from, if that is still there.
          requestAnimationFrame(() => {
            if (asker.current?.isConnected === true) {
              asker.current.focus();
            }
          });
        }}
      >
        {asking && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{`${asking.item.approveLabel ?? "Approve"}?`}</AlertDialogTitle>
              <AlertDialogDescription>
                {`${asking.item.title}. ${asking.item.agent} goes ahead at once, and this cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction value="confirm">
                {asking.item.approveLabel ?? "Approve"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
      <Toaster toaster={toast} />
    </div>
  );
}
