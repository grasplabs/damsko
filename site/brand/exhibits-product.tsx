"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
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
  Message,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@grasp-os/ui/components/reasoning";
import { Shimmer } from "@grasp-os/ui/components/shimmer";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@grasp-os/ui/components/sidebar";
import {
  ArrowRightIcon,
  BrainIcon,
  FileIcon,
  FolderKanbanIcon,
  Icon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  RepeatIcon,
} from "@grasp-os/ui/lib/icons";
import {
  colors,
  media,
  radius,
  shadow,
  space,
} from "@grasp-os/ui/lib/tokens.stylex";
// The exhibits of rooms 10 (Layout) and 11 (The brand in the product). Layout is drawn: a page
// small enough to see whole (night, paper, night), and a wide window beside a phone, each with its
// column and gutters. The product stands on a plinth as live components from the library: the
// sidebar beside a conversation, its prompt working under the moving light; an agent asking before
// it acts.
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layoutWords, productWords } from "./content";
import { MarkInline } from "./exhibits";
import { Glass } from "./glass";

const rowIcons = [
  MessageSquareIcon,
  BrainIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  RepeatIcon,
];

const wait = (ms: number) =>
  new Promise<void>((done) => window.setTimeout(done, ms));

const s = stylex.create({
  // ---- The rhythm: a page drawn small
  page: {
    display: "grid",
    width: { default: "15rem", [media.maxSm]: "12rem" },
    overflow: "hidden",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.brandPaper,
    boxShadow: shadow.lg,
  },
  night: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    isolation: "isolate",
    backgroundColor: colors.brandNight,
  },
  hero: { height: { default: "8.5rem", [media.maxSm]: "7rem" } },
  close: { height: { default: "4.5rem", [media.maxSm]: "3.5rem" } },
  foot: {
    height: "2.5rem",
    boxShadow: `inset 0 1px 0 color-mix(in oklch, ${colors.primaryForegroundOnColor} 8%, transparent)`,
  },
  heroWords: { display: "grid", gap: 4, justifyItems: "center", zIndex: 1 },
  section: {
    display: "grid",
    gap: 5,
    paddingBlock: { default: "1.1rem", [media.maxSm]: "0.8rem" },
    paddingInline: "1.1rem",
  },
  bar: (width: string, height: number) => ({
    width,
    height: `${height}px`,
    borderRadius: radius.full,
  }),
  barTitle: { backgroundColor: colors.brandInk },
  barText: {
    backgroundColor: `color-mix(in oklch, ${colors.brandInk} 22%, transparent)`,
  },
  barLight: { backgroundColor: colors.primaryForegroundOnColor },
  barLime: { backgroundColor: colors.brandLime },
  // ---- The column: a wide window and a phone
  windows: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) 5.5rem",
      [media.maxSm]: "minmax(0, 1fr) 4rem",
    },
    alignItems: "end",
    gap: { default: space["8"], [media.maxSm]: space["4"] },
    width: "100%",
    maxWidth: "46rem",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  window: {
    display: "grid",
    overflow: "hidden",
    borderRadius: radius.mark,
    cornerShape: radius.shape,
    backgroundColor: colors.card,
    boxShadow: shadow.md,
    colorScheme: "light",
  },
  wide: { gridTemplateColumns: "1fr 7fr 1fr", aspectRatio: "16 / 10" },
  phone: { gridTemplateColumns: "1fr 10fr 1fr", aspectRatio: "9 / 19" },
  gutter: {
    backgroundColor: `color-mix(in oklch, ${colors.mintDeep} 14%, transparent)`,
  },
  column: {
    display: "grid",
    alignContent: "start",
    gap: 6,
    paddingBlock: "12%",
    boxShadow: `inset 1px 0 0 color-mix(in oklch, ${colors.mintDeep} 55%, transparent), inset -1px 0 0 color-mix(in oklch, ${colors.mintDeep} 55%, transparent)`,
  },
  columnInner: { display: "grid", gap: 6, paddingInline: "8%" },
  // ---- The screen
  screenFrame: {
    width: "100%",
    display: "grid",
    placeItems: "center",
    padding: { default: space["10"], [media.maxSm]: space["4"] },
  },
  screen: {
    display: "grid",
    width: "100%",
    maxWidth: "58rem",
    height: { default: "36rem", [media.maxSm]: "30rem" },
    overflow: "hidden",
    borderRadius: radius.base,
    cornerShape: radius.shape,
    backgroundColor: colors.background,
    boxShadow: shadow.lg,
  },
  // The sidebar and the conversation in one row, as tall as the screen.
  screenProvider: { height: "100%", minHeight: 0 },
  screenSide: {
    display: { default: null, [media.maxMd]: "none" },
  },
  // The working light and its words, in the prompt's head.
  working: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
  },
  screenMark: { width: 22, height: 19, color: colors.foreground },
  screenMain: {
    display: "grid",
    flexGrow: 1,
    gridTemplateRows: "minmax(0, 1fr) auto",
    gap: space["4"],
    minWidth: 0,
    padding: { default: space["6"], [media.maxSm]: space["4"] },
  },
  thread: {
    display: "grid",
    alignContent: "start",
    gap: space["5"],
    minHeight: 0,
    overflow: "hidden",
  },
  // ---- The ask
  ask: {
    display: "grid",
    justifyItems: "center",
    width: "100%",
    padding: { default: space["8"], [media.maxSm]: space["4"] },
    colorScheme: "light",
  },
});

const Bar = ({
  width,
  height = 5,
  tone,
}: {
  width: string;
  height?: number;
  tone: "title" | "text" | "light" | "lime";
}) => (
  <span
    {...stylex.props(
      s.bar(width, height),
      tone === "title" && s.barTitle,
      tone === "text" && s.barText,
      tone === "light" && s.barLight,
      tone === "lime" && s.barLime
    )}
  />
);

/** A page drawn small: it opens in the night under the glass, explains on paper, and closes in the night. */
export const Rhythm = () => (
  <div
    role="img"
    aria-label={layoutWords.rhythmLabel}
    {...stylex.props(s.page)}
  >
    <div {...stylex.props(s.night, s.hero)}>
      <Glass />
      <span {...stylex.props(s.heroWords)}>
        <Bar width="5.5rem" height={7} tone="light" />
        <Bar width="3.5rem" height={7} tone="lime" />
      </span>
    </div>
    {["70%", "55%", "62%"].map((title) => (
      <div key={title} {...stylex.props(s.section)}>
        <Bar width={title} height={7} tone="title" />
        <Bar width="92%" tone="text" />
        <Bar width="80%" tone="text" />
      </div>
    ))}
    <div {...stylex.props(s.night, s.close)}>
      <Glass />
      <span {...stylex.props(s.heroWords)}>
        <Bar width="4.5rem" height={6} tone="light" />
      </span>
    </div>
    <div {...stylex.props(s.night, s.foot)} />
  </div>
);

const Lines = () => (
  <span {...stylex.props(s.columnInner)}>
    <Bar width="60%" height={7} tone="title" />
    <Bar width="100%" tone="text" />
    <Bar width="88%" tone="text" />
    <Bar width="94%" tone="text" />
  </span>
);

/** A wide window and a phone, each with its one column and the gutters either side. */
export const Column = () => (
  <div
    role="img"
    aria-label={layoutWords.columnLabel}
    {...stylex.props(s.windows)}
  >
    <div {...stylex.props(s.window, s.wide)}>
      <span {...stylex.props(s.gutter)} />
      <span {...stylex.props(s.column)}>
        <Lines />
      </span>
      <span {...stylex.props(s.gutter)} />
    </div>
    <div {...stylex.props(s.window, s.phone)}>
      <span {...stylex.props(s.gutter)} />
      <span {...stylex.props(s.column)}>
        <Lines />
      </span>
      <span {...stylex.props(s.gutter)} />
    </div>
  </div>
);

/** The product as people know it: the Sidebar beside a conversation whose prompt is working under
 * the moving light, live, drawn large. It takes the ground's scheme, so the same screen shows on
 * paper and at night. */
export const Screen = () => (
  <div {...stylex.props(s.screenFrame)}>
    <div
      role="img"
      aria-label={productWords.screenLabel}
      {...stylex.props(s.screen)}
    >
      <SidebarProvider style={s.screenProvider}>
        <Sidebar collapsible="none" style={s.screenSide}>
          <SidebarHeader>
            <MarkInline style={s.screenMark} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {productWords.rows.map((label, index) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild isActive={index === 0}>
                      <a href={`#${label.toLowerCase()}`}>
                        <Icon icon={rowIcons[index] ?? MessageSquareIcon} />
                        {label}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div {...stylex.props(s.screenMain)}>
          <div {...stylex.props(s.thread)}>
            <Message align="end">
              <MessageContent>
                <Bubble variant="muted" align="end">
                  <BubbleContent>{productWords.question}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
            <Message aria-label={productWords.agent}>
              <MessageContent>
                <Reasoning duration={4}>
                  <ReasoningTrigger />
                  <ReasoningContent>{productWords.thoughts}</ReasoningContent>
                </Reasoning>
                <MessageResponse>{productWords.answer}</MessageResponse>
              </MessageContent>
            </Message>
          </div>
          <PromptInput
            aria-label={productWords.message}
            status="streaming"
            onSubmit={() => undefined}
          >
            <PromptInputHeader>
              <span {...stylex.props(s.working)}>
                <AgentIndicator />
                <Shimmer>{productWords.mapping}</Shimmer>
              </span>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                aria-label={productWords.message}
                placeholder={productWords.followUp}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <span />
              <PromptInputSubmit onStop={() => undefined} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </SidebarProvider>
    </div>
  </div>
);

export const ComponentsPickup = () => (
  <Button variant="outline" size="sm" asChild>
    <a href={productWords.componentsHref}>
      {productWords.components}
      <Icon icon={ArrowRightIcon} />
    </a>
  </Button>
);

type AskState = ConfirmationProps["state"];

/** An agent asks before it acts: the Confirmation at its own width, the sentence, what it touches,
 * and the two answers. */
export const Ask = () => {
  const [state, setState] = useState<AskState>("approval-requested");
  const [approved, setApproved] = useState<boolean | undefined>();
  const respond = async (yes: boolean) => {
    await wait(yes ? 900 : 600);
    setApproved(yes);
    setState("approval-responded");
  };
  return (
    <div {...stylex.props(s.ask)}>
      <Confirmation state={state} approval={{ id: "ask", approved }}>
        <ConfirmationTitle>
          <ConfirmationRequest>{productWords.askTitle}</ConfirmationRequest>
          <ConfirmationAccepted>
            {productWords.askApproved}
          </ConfirmationAccepted>
          <ConfirmationRejected>
            {productWords.askDeclined}
          </ConfirmationRejected>
        </ConfirmationTitle>
        <ConfirmationDetails
          items={productWords.affects.map((item) => ({
            icon: FileIcon,
            label: item.label,
            detail: item.detail,
          }))}
        />
        <ConfirmationActions>
          <ConfirmationAction
            variant="outline"
            onClick={async () => await respond(false)}
          >
            {productWords.decline}
          </ConfirmationAction>
          <ConfirmationAction onClick={async () => await respond(true)}>
            {productWords.approve}
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </div>
  );
};
