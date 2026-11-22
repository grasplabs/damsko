"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  BreadcrumbItem,
  BreadcrumbLink,
} from "@grasp-os/ui/components/breadcrumb";
import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import type { ChainOfThoughtStepStatus } from "@grasp-os/ui/components/chain-of-thought";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
import {
  Message,
  MessageActions,
  MessageAction,
  MessageContent,
  MessageError,
  MessageFooter,
  MessageResponse,
  MessageSkeleton,
} from "@grasp-os/ui/components/message";
import type { MessageStatus } from "@grasp-os/ui/components/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputNote,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import type { PromptInputProps } from "@grasp-os/ui/components/prompt-input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
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
import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  EllipsisIcon,
  FolderKanbanIcon,
  HouseIcon,
  Icon,
  InboxIcon,
  LinkIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import {
  answer,
  chats,
  plan,
  question,
  sources,
  sourcesOneGone,
  title,
  today,
} from "./chat-page-data";

const layout = stylex.create({
  stage: { display: "grid", rowGap: space["3"], width: "100%" },
  switch: { width: "14rem" },
  // The app's window: the whole screen on its own page, a tall stage in the docs.
  window: {
    width: "100%",
    height: `calc(100dvh - 2 * ${space["6"]})`,
    minHeight: "36rem",
    maxHeight: "56rem",
    overflow: "clip",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  fill: { height: "100%", minHeight: 0 },
  // The chat in a column the prompt input's width: the conversation over the box.
  column: {
    display: "grid",
    gridTemplateRows: "minmax(0, 1fr) auto",
    rowGap: space["4"],
    boxSizing: "border-box",
    width: "100%",
    maxWidth: size.promptInputWidth,
    height: "100%",
    minHeight: 0,
    marginInline: "auto",
  },
  // The assistant's message: its steps, then its answer, then its sources.
  answer: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["3"],
    minWidth: 0,
  },
  skeletons: { display: "grid", rowGap: space["6"] },
  time: { color: colors.mutedForeground },
});

/** The states the page shows, each one a product meets. */
type ChatState =
  | "empty"
  | "loading"
  | "streaming"
  | "done"
  | "failed-answer"
  | "failed-send"
  | "unavailable";

const states: { value: ChatState; label: string }[] = [
  { value: "done", label: "Answered" },
  { value: "streaming", label: "Answering" },
  { value: "loading", label: "Loading the chat" },
  { value: "empty", label: "A new chat" },
  { value: "failed-answer", label: "The answer failed" },
  { value: "failed-send", label: "A send failed" },
  { value: "unavailable", label: "A source is gone" },
];

const isState = (value: unknown): value is ChatState =>
  states.some((each) => each.value === value);

/** The state to show first: the page's own `?state=`, so each state has an address. */
const stateFromAddress = (): ChatState | null => {
  const asked = new URLSearchParams(window.location.search).get("state");
  return isState(asked) ? asked : null;
};

type Phase = "working" | "answering" | "done" | "failed" | "stopped";

interface Typed {
  id: string;
  text: string;
}

/** Where a step is when `step` of them have started. */
const stepStatus = (
  index: number,
  phase: Phase,
  step: number
): ChainOfThoughtStepStatus => {
  if (phase !== "working" || index < step) {
    return "complete";
  }
  return index === step ? "active" : "pending";
};

/**
 * The run: the assistant's steps one by one, then the answer's words as a network hands them over.
 * It starts answered (the whole chat in the first HTML, readable without script) unless the state
 * is a live answer; Try again and the Answering state play it from the start.
 */
const useChatRun = (state: ChatState) => {
  const live = state === "streaming";
  const [phase, setPhase] = useState<Phase>(
    state === "failed-answer" ? "failed" : live ? "working" : "done"
  );
  const [count, setCount] = useState(live ? 0 : answer.length);
  const [typed, setTyped] = useState<Typed[]>([]);
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    setPhase(state === "failed-answer" ? "failed" : live ? "working" : "done");
    setCount(live ? 0 : answer.length);
    setTyped([]);
  }

  useEffect(() => {
    let timer = 0;
    if (phase === "working") {
      const step = plan[count];
      timer = window.setTimeout(
        () => {
          if (count + 1 > plan.length) {
            setPhase("answering");
            setCount(0);
          } else {
            setCount(count + 1);
          }
        },
        step === undefined ? 300 : step.ms
      );
    } else if (phase === "answering") {
      // A few characters at a time, as a network hands them over; the response paces them out.
      timer = window.setTimeout(() => {
        if (count >= answer.length) {
          setPhase("done");
        } else {
          setCount(Math.min(answer.length, count + 18));
        }
      }, 60);
    }
    return () => {
      window.clearTimeout(timer);
    };
  }, [phase, count]);

  return {
    phase,
    count,
    typed,
    retry: () => {
      setPhase("working");
      setCount(0);
    },
    // Stop keeps what was written so far: nothing if the assistant was still working.
    stop: () => {
      setCount(phase === "answering" ? count : 0);
      setPhase("stopped");
    },
    send: (text: string) => {
      setTyped((all) => [...all, { id: `typed-${all.length}`, text }]);
    },
  };
};

type ChatRun = ReturnType<typeof useChatRun>;

/** The message's status as far as the run has come. */
const statusOf = (phase: Phase): MessageStatus => {
  if (phase === "failed") {
    return "error";
  }
  if (phase === "stopped") {
    return "stopped";
  }
  if (phase === "working") {
    return "thinking";
  }
  return phase === "done" ? "done" : "streaming";
};

/** The steps' line: what was done, or that they were stopped. */
const summaryOf = (phase: Phase, count: number) => {
  if (phase === "stopped" && count === 0) {
    return "Stopped while working";
  }
  if (phase === "failed") {
    return "Did not finish";
  }
  return "Read 2 files, searched the web";
};

/** The answer's sources as a pile under it, opened to the list. */
const AnswerSources = ({ gone }: { gone: boolean }) => {
  const shown = gone ? sourcesOneGone : sources;
  return (
    <Sources>
      <SourcesTrigger count={shown.length}>
        {shown.map((source) => (
          <SourceIcon key={source.title}>
            <Icon icon={source.icon} />
          </SourceIcon>
        ))}
      </SourcesTrigger>
      <SourcesContent>
        {shown.map((source) => (
          <Source
            key={source.title}
            title={source.title}
            origin={source.origin}
            href={source.href}
            access={source.gone === true ? "gone" : "open"}
          >
            <SourceIcon>
              <Icon icon={source.icon} />
            </SourceIcon>
          </Source>
        ))}
      </SourcesContent>
    </Sources>
  );
};

/** The assistant's message: working, writing, failed with Try again, stopped or done with its actions. */
const AssistantTurn = ({
  run,
  gone,
  rating,
  onRate,
}: {
  run: ChatRun;
  gone: boolean;
  rating: string | null;
  onRate: (rating: string | null) => void;
}) => {
  const { phase, count } = run;
  const writing = phase === "answering";
  const stopped = phase === "stopped";
  const shown = writing || stopped ? answer.slice(0, count) : answer;
  // Stopped, the answer keeps its actions: copy what was written, rate it, or write it again.
  const settled = phase === "done" || stopped;
  return (
    <Message status={statusOf(phase)}>
      <MessageContent>
        {phase === "failed" ? (
          <MessageError onRetry={run.retry}>
            Could not answer. The connection dropped while it was working.
          </MessageError>
        ) : (
          <>
            <div {...stylex.props(layout.answer)}>
              <ChainOfThought aria-label="Steps to the answer">
                <ChainOfThoughtHeader>
                  {summaryOf(phase, count)}
                </ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {plan.map((step, index) => {
                    const status = stepStatus(index, phase, count);
                    return (
                      <ChainOfThoughtStep
                        key={step.id}
                        label={status === "active" ? step.active : step.title}
                        description={step.summary}
                        status={status}
                      />
                    );
                  })}
                </ChainOfThoughtContent>
              </ChainOfThought>
              {phase === "working" || shown === "" ? null : (
                <MessageResponse streaming={writing}>{shown}</MessageResponse>
              )}
              {settled && shown !== "" ? <AnswerSources gone={gone} /> : null}
            </div>
            <MessageActions>
              <CopyButton value={shown} />
              <MessageAction
                label="Good answer"
                pressed={rating === "good"}
                disabled={!settled}
                onClick={() => {
                  onRate(rating === "good" ? null : "good");
                }}
              >
                <Icon icon={ThumbsUpIcon} />
              </MessageAction>
              <MessageAction
                label="Poor answer"
                pressed={rating === "poor"}
                disabled={!settled}
                onClick={() => {
                  onRate(rating === "poor" ? null : "poor");
                }}
              >
                <Icon icon={ThumbsDownIcon} />
              </MessageAction>
              <MessageAction
                label="Write it again"
                disabled={!settled}
                onClick={run.retry}
              >
                <Icon icon={RefreshCwIcon} />
              </MessageAction>
            </MessageActions>
            <MessageFooter>
              <time dateTime={today}>09:12</time>
            </MessageFooter>
          </>
        )}
      </MessageContent>
    </Message>
  );
};

/** The chat's messages: the question and its answer, then anything typed here with its reply. */
const ChatConversation = ({
  run,
  state,
}: {
  run: ChatRun;
  state: ChatState;
}) => {
  const [rating, setRating] = useState<string | null>(null);
  return (
    <MessageScrollerProvider autoScroll>
      <MessageScroller>
        <MessageScrollerViewport aria-label={`Chat: ${title}`}>
          <MessageScrollerContent>
            {state === "loading" ? (
              <MessageScrollerItem key="thread">
                <div {...stylex.props(layout.skeletons)}>
                  <MessageSkeleton align="end" lines={2} />
                  <MessageSkeleton lines={5} />
                </div>
              </MessageScrollerItem>
            ) : (
              <MessageScrollerItem key="thread">
                <Message align="end">
                  <MessageContent>
                    <Bubble variant="muted" align="end">
                      <BubbleContent>{question}</BubbleContent>
                    </Bubble>
                    <MessageActions>
                      <CopyButton value={question} />
                    </MessageActions>
                  </MessageContent>
                </Message>
                <AssistantTurn
                  run={run}
                  gone={state === "unavailable"}
                  rating={rating}
                  onRate={setRating}
                />
                {run.typed.map((each) => [
                  <Message key={each.id} align="end">
                    <MessageContent>
                      <Bubble variant="muted" align="end">
                        <BubbleContent>{each.text}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>,
                  <Message key={`${each.id}-reply`}>
                    <MessageContent>
                      <MessageResponse>
                        This page plays one set answer, so this is all it says
                        to what you typed.
                      </MessageResponse>
                    </MessageContent>
                  </Message>,
                ])}
              </MessageScrollerItem>
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
};

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** A follow-up that did not go, kept in the box (A send failed). */
const unsent =
  "And what would 13 a seat do to churn among teams of fewer than ten?";

type Status = NonNullable<PromptInputProps["status"]>;

/**
 * The prompt input following the run: streaming while the assistant works, so Submit is Stop, and
 * a send that failed, with its words kept.
 */
const ChatBox = ({ run, state }: { run: ChatRun; state: ChatState }) => {
  const [failed, setFailed] = useState(state === "failed-send");
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    setFailed(state === "failed-send");
  }
  const working = run.phase === "working" || run.phase === "answering";
  let status: Status = working ? "streaming" : "ready";
  if (failed) {
    status = "error";
  }
  return (
    <PromptInput
      // A state picked anew starts its box anew, with the unsent words or none.
      key={state}
      aria-label="Message the assistant"
      compact
      status={status}
      disabled={state === "loading"}
      defaultValue={state === "failed-send" ? [unsent] : undefined}
      onValueChange={() => {
        setFailed(false);
      }}
      onSubmit={async ({ text }) => {
        await wait(700);
        run.send(text);
      }}
    >
      <PromptInputBody>
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask a follow-up"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          {failed && (
            <PromptInputNote>
              Could not send. Your message is kept.
            </PromptInputNote>
          )}
        </PromptInputTools>
        <PromptInputSubmit onStop={run.stop} />
      </PromptInputFooter>
    </PromptInput>
  );
};

/** The sidebar: the places, then the Chats group with this chat current. */
const ChatSidebar = ({ current }: { current: string }) => (
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#home">
                <Icon icon={HouseIcon} />
                Home
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#inbox">
                <Icon icon={InboxIcon} />
                Inbox
              </a>
            </SidebarMenuButton>
            <SidebarMenuBadge>2</SidebarMenuBadge>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#projects">
                <Icon icon={FolderKanbanIcon} />
                Projects
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup>
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild isActive={chat.id === current}>
                <a href={`#chat-${chat.id}`}>
                  <Icon icon={MessageSquareIcon} />
                  {chat.title}
                  {chat.working === true && <AgentIndicator />}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#chats">All chats</a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
);

/** The chat's own menu at the header's end: copy its link, delete with Undo. */
const ChatMenu = ({
  onToast,
}: {
  onToast: (words: string, undo?: boolean) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon-sm" aria-label="Chat actions">
        <Icon icon={EllipsisIcon} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        icon={LinkIcon}
        onSelect={() => {
          onToast("Link copied");
        }}
      >
        Copy link
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        icon={TrashIcon}
        onSelect={() => {
          onToast("Chat deleted", true);
        }}
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

/** A chat with nothing in it is not this page: it begins where the product starts a chat. */
const NewChat = () => (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>Nothing asked yet</EmptyTitle>
      <EmptyDescription>
        A new chat opens where the product starts one, with the box to ask in at
        the middle of the page.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" size="sm" asChild>
        <a href="#new-chat">Start a new chat</a>
      </Button>
    </EmptyContent>
  </Empty>
);

// A chat as a page of its own, at its own address: the App shell with the sidebar and its Chats
// group, the header with the chat's title (renamed in place) and its menu, the MessageScroller in a
// column the prompt input's width, and the PromptInput at the foot. The assistant's answer shows
// its steps (ChainOfThought), then its words streaming in, then its sources and its actions. The
// switch above shows each state a product meets; Answering plays the answer live, and Stop stops
// it. The assistant's thinking is left out: Reasoning is not in the library yet.
export default function ChatPage() {
  const [state, setState] = useState<ChatState>("done");
  const [toast] = useState(() => createToaster());
  const [name, setName] = useState(title);
  const run = useChatRun(state);

  useEffect(() => {
    const asked = stateFromAddress();
    // The address is read once the page runs, so the first HTML is the same everywhere.
    if (asked !== null) {
      setState(asked);
    }
  }, []);

  const onToast = (words: string, undo = false) => {
    toast(
      words,
      undo
        ? { action: { label: "Undo", onAction: () => undefined } }
        : undefined
    );
  };

  return (
    <div {...stylex.props(layout.stage)}>
      <Select
        items={states}
        value={state}
        onValueChange={(next) => {
          setState(isState(next) ? next : "done");
        }}
      >
        <SelectTrigger size="sm" aria-label="State shown" style={layout.switch}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent />
      </Select>
      <div {...stylex.props(layout.window)}>
        <AppShell
          style={layout.fill}
          sidebar={<ChatSidebar current="price" />}
          breadcrumb={
            <BreadcrumbItem>
              <BreadcrumbLink href="#chats">Chats</BreadcrumbLink>
            </BreadcrumbItem>
          }
          title={state === "empty" ? "New chat" : name}
          onRename={state === "empty" ? undefined : setName}
          actions={
            state === "empty" ? undefined : <ChatMenu onToast={onToast} />
          }
        >
          {state === "empty" ? (
            <NewChat />
          ) : (
            <div {...stylex.props(layout.column)}>
              <ChatConversation run={run} state={state} />
              <ChatBox run={run} state={state} />
            </div>
          )}
        </AppShell>
      </div>
      <Toaster toaster={toast} />
    </div>
  );
}
