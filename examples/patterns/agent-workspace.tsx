"use client";

import { AppShell } from "@grasp-os/ui/blocks/app-shell-01/app-shell-01";
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
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@grasp-os/ui/components/command";
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
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { DiffViewer } from "@grasp-os/ui/components/diff-viewer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@grasp-os/ui/components/empty";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
} from "@grasp-os/ui/components/side-panel";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import {
  FileIcon,
  FolderKanbanIcon,
  Icon,
  InboxIcon,
  MessageSquareIcon,
  RedoIcon,
  SearchIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { radius, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef, useState } from "react";

import {
  answer,
  change,
  chats,
  done,
  drafted,
  plan,
  published,
  question,
  sources,
  today,
  typedReply,
} from "./agent-workspace-data";

// The agent workspace: one whole screen made only of finished components, the proof that they are
// one family. The Sidebar in an App shell; a MessageScroller of Messages, the agent's with its steps
// (ChainOfThought) and Sources; a Confirmation waiting in the conversation; the PromptInput at the
// foot; and the App shell's panel beside them with the DiffViewer of what the agent asks to change
// (a Sheet when the window is narrow). It opens with the agent's request waiting for a yes; Replay
// plays the run from the start: a question, the agent working, its answer with sources, the change
// asked for and, once you say yes, published. A message typed in the PromptInput shows as yours,
// and the agent answers that it plays a set run. The agent's thinking is left out: Reasoning is
// not in the library yet.

const AGENT = "Research agent";

const layout = stylex.create({
  // The app's window: the whole frame on its own, the stage on the pattern page.
  window: {
    width: `calc(100vw - 2 * ${space["6"]})`,
    maxWidth: "100%",
    height: `calc(100dvh - 2 * ${space["6"]})`,
    minHeight: "36rem",
    maxHeight: "56rem",
    overflow: "clip",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    boxShadow: size.borderStrong,
  },
  fill: { height: "100%", minHeight: 0 },
  // The conversation over the box, in a column the prompt input's width.
  conversation: {
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
  // What the agent's message holds: its steps, then its answer and sources.
  agentBody: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    rowGap: space["3"],
    minWidth: 0,
  },
  request: { maxWidth: size.confirmationWidth },
  change: { paddingInline: space.sidePanelPadding },
});

type Phase =
  | "waiting"
  | "working"
  | "answering"
  | "asking"
  | "publishing"
  | "finished";

const answerWords = answer.split(" ");
const doneWords = done.split(" ");
const replyWords = typedReply.split(" ");

/** Where the steps are when `step` of them have started. */
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

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/** The answer's sources as a pile under it, opened to the list. */
const AnswerSources = () => (
  <Sources>
    <SourcesTrigger count={sources.length}>
      {sources.map((source) => (
        <SourceIcon key={source.title}>
          <Icon icon={source.icon} />
        </SourceIcon>
      ))}
    </SourcesTrigger>
    <SourcesContent>
      {sources.map((source) => (
        <Source
          key={source.title}
          title={source.title}
          origin={source.origin}
          href={source.href}
        >
          <SourceIcon>
            <Icon icon={source.icon} />
          </SourceIcon>
        </Source>
      ))}
    </SourcesContent>
  </Sources>
);

/** The agent's words as far as they have come, a few at a time. */
const AgentWords = ({
  words,
  count,
  status,
}: {
  words: string[];
  count: number;
  status: MessageStatus;
}) => (
  <Message aria-label={AGENT} status={status}>
    <MessageContent>
      <MessageResponse>{words.slice(0, count).join(" ")}</MessageResponse>
      <MessageActions>
        <CopyButton value={words.join(" ")} />
      </MessageActions>
    </MessageContent>
  </Message>
);

const AgentWorkspace = () => {
  const [run, setRun] = useState(0);
  // It opens with the request waiting, so the whole conversation is in the first HTML and can be
  // read without script; Replay plays the run from the question.
  const [phase, setPhase] = useState<Phase>("asking");
  // Steps started while working; words shown while answering or publishing.
  const [count, setCount] = useState(0);
  const [decision, setDecision] = useState<boolean | undefined>();
  const [panelOpen, setPanelOpen] = useState<boolean | undefined>(undefined);
  // Search chats, and the chat it last opened: its name stands in the crumbs.
  const [searching, setSearching] = useState(false);
  const [chat, setChat] = useState(chats[0]?.value);
  // What the person typed here, oldest first, and the words of the newest reply shown so far.
  const [typed, setTyped] = useState<string[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const replayButton = useRef<HTMLButtonElement>(null);
  const replying = typed.length > 0 && replyCount < replyWords.length;

  // The script's clock: each phase moves on by itself, except asking, which waits for a yes.
  useEffect(() => {
    let next: (() => void) | null = null;
    let ms = 0;
    if (phase === "waiting") {
      next = () => {
        setPhase("working");
      };
      ms = 700;
    } else if (phase === "working") {
      const step = plan[count];
      ms = step === undefined ? 300 : step.ms;
      next = () => {
        if (count + 1 > plan.length) {
          setPhase("answering");
          setCount(0);
        } else {
          setCount(count + 1);
        }
      };
    } else if (phase === "answering") {
      ms = 90;
      next = () => {
        if (count >= answerWords.length) {
          setPhase("asking");
          setCount(0);
        } else {
          setCount(count + 2);
        }
      };
    } else if (phase === "publishing") {
      ms = 90;
      next = () => {
        if (count >= doneWords.length) {
          setPhase("finished");
        } else {
          setCount(count + 2);
        }
      };
    }
    if (next === null) {
      return undefined;
    }
    const timer = setTimeout(next, ms);
    return () => {
      clearTimeout(timer);
    };
  }, [phase, count]);

  // The reply to a typed message: a moment's pause, then its words a few at a time.
  useEffect(() => {
    if (!replying) {
      return undefined;
    }
    const timer = setTimeout(
      () => {
        setReplyCount(replyCount + 2);
      },
      replyCount === 0 ? 600 : 90
    );
    return () => {
      clearTimeout(timer);
    };
  }, [replying, replyCount]);

  const replay = () => {
    setCount(0);
    setPhase("waiting");
    setDecision(undefined);
    setRun(run + 1);
    setTyped([]);
    setReplyCount(0);
    requestAnimationFrame(() => replayButton.current?.focus());
  };

  const approve = async () => {
    await wait(800);
    setDecision(true);
    setCount(0);
    setPhase("publishing");
  };
  const decline = async () => {
    await wait(500);
    setDecision(false);
  };

  const allowed = phase === "publishing" || phase === "finished";
  const asked = phase === "asking" || allowed;
  // The message says it is writing from the moment the last step is done.
  const writing =
    phase === "answering" || (phase === "working" && count >= plan.length);
  const answerCount = phase === "answering" ? count : answerWords.length;
  const doneCount = phase === "publishing" ? count : doneWords.length;
  let workStatus: MessageStatus = writing ? "streaming" : "done";
  if (phase === "working" && !writing) {
    workStatus = "thinking";
  }
  let state: ConfirmationProps["state"] = "approval-requested";
  if (decision === true) {
    state = "approval-responded";
  } else if (decision === false) {
    state = "output-denied";
  }

  const panel = (
    <SidePanel aria-label="The change">
      <SidePanelHeader
        title="The change"
        onClose={() => {
          setPanelOpen(false);
        }}
      />
      <SidePanelContent>
        <SidePanelSection
          title={change.title}
          description="What the agent asks to change, before and after."
        >
          <div {...stylex.props(layout.change)}>
            {asked ? (
              <DiffViewer
                title={change.title}
                oldValue={change.before}
                newValue={change.after}
                contextLines={2}
              />
            ) : (
              <Empty size="sm">
                <EmptyHeader>
                  <EmptyTitle>Nothing to review</EmptyTitle>
                  <EmptyDescription>
                    What the agent asks to change shows here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </SidePanelSection>
      </SidePanelContent>
    </SidePanel>
  );

  return (
    <div {...stylex.props(layout.window)}>
      <AppShell
        style={layout.fill}
        sidebar={
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        setSearching(true);
                      }}
                    >
                      <Icon icon={SearchIcon} />
                      <span>Search chats</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive>
                      <a href="#chat">
                        <Icon icon={MessageSquareIcon} />
                        <span>Chat</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#inbox">
                        <Icon icon={InboxIcon} />
                        <span>Inbox</span>
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>1</SidebarMenuBadge>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#projects">
                        <Icon icon={FolderKanbanIcon} />
                        <span>Projects</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#settings">
                        <Icon icon={SettingsIcon} />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        }
        breadcrumb={
          <BreadcrumbItem>
            <BreadcrumbLink href="#chat">Chat</BreadcrumbLink>
          </BreadcrumbItem>
        }
        title={chats.find((each) => each.value === chat)?.label ?? ""}
        actions={
          <Button ref={replayButton} variant="ghost" size="sm" onClick={replay}>
            <Icon icon={RedoIcon} />
            Replay
          </Button>
        }
        panel={panel}
        panelOpen={panelOpen}
        onPanelOpenChange={setPanelOpen}
      >
        <div {...stylex.props(layout.conversation)}>
          <MessageScrollerProvider key={run} autoScroll>
            <MessageScroller>
              <MessageScrollerViewport
                aria-label={`Conversation with the ${AGENT.toLowerCase()}`}
              >
                <MessageScrollerContent>
                  {phase === "waiting" ? null : (
                    <MessageScrollerItem key="question">
                      <Message align="end">
                        <MessageContent>
                          <Bubble variant="muted" align="end">
                            <BubbleContent>{question}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                      <Message aria-label={AGENT} status={workStatus}>
                        <MessageContent>
                          <div {...stylex.props(layout.agentBody)}>
                            <ChainOfThought aria-label="Steps to the change">
                              <ChainOfThoughtHeader>
                                {allowed ? published : drafted}
                              </ChainOfThoughtHeader>
                              <ChainOfThoughtContent>
                                {plan.map((step, index) => {
                                  const status = stepStatus(
                                    index,
                                    phase,
                                    count
                                  );
                                  return (
                                    <ChainOfThoughtStep
                                      key={step.id}
                                      label={
                                        status === "active"
                                          ? step.active
                                          : step.title
                                      }
                                      description={step.summary}
                                      status={status}
                                    />
                                  );
                                })}
                              </ChainOfThoughtContent>
                            </ChainOfThought>
                            {phase === "working" ? null : (
                              <MessageResponse
                                streaming={phase === "answering"}
                              >
                                {answerWords.slice(0, answerCount).join(" ")}
                              </MessageResponse>
                            )}
                            {phase === "working" ||
                            phase === "answering" ? null : (
                              <AnswerSources />
                            )}
                          </div>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                  {asked && (
                    <MessageScrollerItem key={`request-${run}`}>
                      <Confirmation
                        state={state}
                        approval={{ id: `publish-${run}`, approved: decision }}
                        style={layout.request}
                      >
                        <ConfirmationTitle>
                          <ConfirmationRequest>
                            Publish the new pricing page
                          </ConfirmationRequest>
                          <ConfirmationAccepted>
                            Approved: the new pricing page is published.
                          </ConfirmationAccepted>
                          <ConfirmationRejected>
                            Declined: the pricing page stays as it is.
                          </ConfirmationRejected>
                        </ConfirmationTitle>
                        <ConfirmationDetails
                          items={[
                            {
                              icon: FileIcon,
                              label: "pricing.md",
                              detail:
                                "Team from 12 to 13 a seat, from 1 January",
                            },
                          ]}
                        />
                        <ConfirmationActions>
                          <ConfirmationAction
                            variant="outline"
                            errorLabel="Could not decline"
                            onClick={decline}
                          >
                            Decline
                          </ConfirmationAction>
                          <ConfirmationAction
                            errorLabel="Could not approve"
                            onClick={approve}
                          >
                            Approve
                          </ConfirmationAction>
                        </ConfirmationActions>
                      </Confirmation>
                    </MessageScrollerItem>
                  )}
                  {phase === "asking" && decision === undefined && (
                    <MessageScrollerItem key="see">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPanelOpen(true);
                        }}
                      >
                        See the change
                      </Button>
                    </MessageScrollerItem>
                  )}
                  {allowed && (
                    <MessageScrollerItem key="done">
                      <AgentWords
                        words={doneWords}
                        count={doneCount}
                        status={phase === "publishing" ? "streaming" : "done"}
                      />
                    </MessageScrollerItem>
                  )}
                  {typed.map((text, turn) => [
                    <MessageScrollerItem
                      key={`typed-${turn}`}
                      messageId={`typed-${turn}`}
                      scrollAnchor
                    >
                      <Message align="end">
                        <MessageContent>
                          <Bubble variant="muted" align="end">
                            <BubbleContent>{text}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>,
                    <MessageScrollerItem
                      key={`reply-${turn}`}
                      messageId={`reply-${turn}`}
                    >
                      <AgentWords
                        words={replyWords}
                        count={
                          turn === typed.length - 1
                            ? replyCount
                            : replyWords.length
                        }
                        status={
                          turn === typed.length - 1 &&
                          replyCount < replyWords.length
                            ? "streaming"
                            : "done"
                        }
                      />
                    </MessageScrollerItem>,
                  ])}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <PromptInput
            aria-label="Message the research agent"
            compact
            status={
              replying || phase === "working" || phase === "answering"
                ? "streaming"
                : "ready"
            }
            onSubmit={({ text }) => {
              // A typed message is the person's own turn, and the agent answers it honestly.
              setTyped([...typed, text]);
              setReplyCount(0);
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                aria-label="Message"
                placeholder="Ask the agent"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>{null}</PromptInputTools>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </AppShell>
      <CommandDialog
        aria-label="Search chats"
        trigger={null}
        open={searching}
        onOpenChange={setSearching}
        items={[
          {
            type: "group",
            label: "Recent",
            items: chats.map((each) => ({
              ...each,
              icon: MessageSquareIcon,
            })),
          },
        ]}
        onAction={(value) => {
          setChat(value);
          setSearching(false);
        }}
      >
        <CommandInput placeholder="Search chats" />
        <CommandEmpty>No chat matches</CommandEmpty>
        <CommandList />
      </CommandDialog>
    </div>
  );
};

export default AgentWorkspace;
