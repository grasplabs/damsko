// The showcase's live pieces (site/pages/index.astro): the library's components doing their own
// work. One small island per piece, so a piece loads as its part of the page nears. Where a piece
// has a loop of its own (a button pressed again and again), it runs only while the piece is on
// screen (data-seen, set by the page's script) and with motion wanted; otherwise it rests on its
// finished state.
"use client";

import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@grasp-os/ui/components/avatar";
import { Badge } from "@grasp-os/ui/components/badge";
import type { BadgeVariant } from "@grasp-os/ui/components/badge";
import { Bubble, BubbleContent } from "@grasp-os/ui/components/bubble";
import { Button } from "@grasp-os/ui/components/button";
import { Calendar } from "@grasp-os/ui/components/calendar";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@grasp-os/ui/components/chain-of-thought";
import type { ChainOfThoughtStepStatus } from "@grasp-os/ui/components/chain-of-thought";
import { CopyButton } from "@grasp-os/ui/components/copy-button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import {
  Message,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@grasp-os/ui/components/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@grasp-os/ui/components/message-scroller";
import { Progress, ProgressCircle } from "@grasp-os/ui/components/progress";
import { Reasoning, ReasoningTrigger } from "@grasp-os/ui/components/reasoning";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Shimmer as TextShimmer } from "@grasp-os/ui/components/shimmer";
import { Stepper } from "@grasp-os/ui/components/stepper";
import { Switch } from "@grasp-os/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { AppBuilding } from "./app-building/app-building";

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const reduced = () =>
  typeof matchMedia === "function" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True while the piece round `inside` is on screen (its data-seen) and motion is wanted. */
const useOnScreen = (inside: RefObject<HTMLElement | null>): boolean => {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const piece = inside.current?.closest("[data-piece]");
    if (!piece || reduced()) {
      return undefined;
    }
    const read = () => {
      setSeen(piece.hasAttribute("data-seen"));
    };
    read();
    const watch = new MutationObserver(read);
    watch.observe(piece, { attributes: true, attributeFilter: ["data-seen"] });
    return () => {
      watch.disconnect();
    };
  }, [inside]);
  return seen;
};

/** A count that goes up every `every` ms while `on`. */
const useTicks = (on: boolean, every: number): number => {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (!on) {
      return undefined;
    }
    const timer = setInterval(() => {
      setTicks((now) => now + 1);
    }, every);
    return () => {
      clearInterval(timer);
    };
  }, [on, every]);
  return ticks;
};

/** A button pressed again and again while on screen: working, then done, then at rest. */
export const PressedButton = ({
  words,
  done,
}: {
  words: string;
  done: string;
}) => {
  const box = useRef<HTMLSpanElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 3200);
  const save = () => wait(1100);
  // Pressed as a person would: the Button follows the Promise its press gives.
  useEffect(() => {
    if (ticks > 0) {
      box.current?.querySelector("button")?.click();
    }
  }, [ticks]);
  return (
    <span ref={box}>
      <Button
        size="lg"
        onClick={save}
        successLabel={done}
        errorLabel="Could not save"
      >
        {words}
      </Button>
    </span>
  );
};

/** A setting that turns on and off while on screen, saving each time. */
export const TurningSwitch = ({ label }: { label: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 2600);
  const [mine, setMine] = useState(true);
  const checked = on ? ticks % 2 === 0 : mine;
  return (
    <div ref={box} className="sc-switch">
      <Field orientation="horizontal">
        <FieldLabel>{label}</FieldLabel>
        <Switch
          checked={checked}
          onCheckedChange={(next) => {
            setMine(next);
          }}
          onSave={() => wait(400)}
          errorLabel="Could not save"
        />
      </Field>
    </div>
  );
};

/** Steps done one after another while on screen, the stepper's light moving on. */
export const MovingStepper = ({ steps }: { steps: readonly string[] }) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 1800);
  const current = on ? ticks % (steps.length + 1) : 1;
  return (
    <div ref={box} className="sc-stepper">
      <Stepper
        aria-label="Setting up"
        steps={steps.map((label) => ({ label }))}
        value={current}
      />
    </div>
  );
};

/** A task coming along while on screen. */
export const FillingProgress = ({ label }: { label: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 700);
  const value = on ? (ticks * 9) % 108 : 64;
  return (
    <div ref={box} className="sc-progress">
      <Progress
        label={label}
        value={Math.min(100, value)}
        variant={value >= 100 ? "success" : "default"}
      />
    </div>
  );
};

/** Faces in a row: an island, as an avatar's picture shows once a script has seen it load. */
export const Faces = ({
  people,
}: {
  people: readonly { name: string; picture: string }[];
}) => (
  <>
    {people.map((person) => (
      <Avatar key={person.name} size="xl" name={person.name} decorative>
        <AvatarImage src={person.picture} />
        <AvatarFallback />
      </Avatar>
    ))}
  </>
);

/** A range being picked while on screen: its end runs on a day at a time, then it starts again. */
export const PickingRange = ({ months }: { months: number }) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 650);
  const end = on ? 11 + (ticks % 9) : 14;
  return (
    <div ref={box}>
      <Calendar
        mode="range"
        numberOfMonths={months}
        value={["2026-11-10", `2026-11-${end}`]}
      />
    </div>
  );
};

const reportsNow = [
  {
    name: "Quarterly summary",
    states: ["Ready", "Ready", "Ready", "Ready"],
  },
  {
    name: "Supplier list",
    states: ["Needs review", "Needs review", "Ready", "Ready"],
  },
  {
    name: "Old projects",
    states: ["Draft", "Draft", "Draft", "Needs review"],
  },
] as const;
const variantOf = (state: string): BadgeVariant => {
  if (state === "Ready") {
    return "success";
  }
  return state === "Needs review" ? "warning" : "default";
};

/** The week's reports moving on while on screen: one is reviewed, the draft goes for review. */
export const ReportsLive = () => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 1600);
  const at = on ? ticks % 4 : 0;
  return (
    <div ref={box}>
      <Table caption="Reports this week.">
        <TableHeader>
          <TableRow>
            <TableHead>Report</TableHead>
            <TableHead align="end">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportsNow.map((report) => (
            <TableRow key={report.name}>
              <TableCell rowHeader>{report.name}</TableCell>
              <TableCell align="end">
                <Badge variant={variantOf(report.states[at] ?? "")}>
                  {report.states[at]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

/** The week's work filling its ring while on screen. */
export const FillingRing = ({ label }: { label: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 600);
  const value = on ? (ticks * 7) % 112 : 72;
  return (
    <div ref={box}>
      <ProgressCircle
        label={label}
        value={Math.min(100, value)}
        showLabel={false}
        variant={value >= 100 ? "success" : "default"}
      />
    </div>
  );
};

/** What the agent is doing, shimmering (its own motion), only while on screen. */
export const Shimmer = ({ words }: { words: string }) => {
  const box = useRef<HTMLSpanElement>(null);
  const on = useOnScreen(box);
  return (
    <span ref={box}>
      {on ? (
        <TextShimmer>{words}</TextShimmer>
      ) : (
        <span className="sc-shimmer-rest">{words}</span>
      )}
    </span>
  );
};

/** The agent's working mark, large, only while on screen. */
export const Working = ({ label }: { label: string }) => {
  const box = useRef<HTMLSpanElement>(null);
  const on = useOnScreen(box);
  return (
    <span ref={box} className="sc-working">
      {on ? <AgentIndicator aria-label={label} /> : null}
    </span>
  );
};

/**
 * An agent answering in a real MessageScroller while on screen: the question is there, the agent
 * thinks on its shimmering line, its words stream in, the line settles to how long it thought;
 * then again. At rest (no script, reduced motion, off screen) the finished conversation.
 */
export const ThreadLive = ({
  question,
  working,
  answer,
}: {
  question: string;
  working: readonly string[];
  answer: string;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 400);
  // Beats of 400ms: 0 to 7 thinking, 8 to 12 writing, then done until 22, then again.
  const t = on ? ticks % 22 : 22;
  const thinking = t < 8;
  const streaming = t >= 8 && t < 13;
  const label = working[Math.min(working.length - 1, Math.floor(t / 3))] ?? "";
  const words = answer.split(" ");
  const shown = streaming
    ? words.slice(0, Math.ceil(((t - 7) * words.length) / 5)).join(" ")
    : answer;
  return (
    <div ref={box} className="sc-thread">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport aria-label="An agent answering">
            <MessageScrollerContent>
              <MessageScrollerItem key="question" messageId="question">
                <Message align="end">
                  <MessageContent>
                    <Bubble variant="muted" align="end">
                      <BubbleContent>{question}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
              <MessageScrollerItem key="answer" messageId="answer">
                <Message status={thinking || streaming ? "streaming" : "done"}>
                  <MessageContent>
                    <Reasoning isStreaming={thinking} duration={3}>
                      <ReasoningTrigger>
                        {thinking ? (
                          <TextShimmer>{label}</TextShimmer>
                        ) : undefined}
                      </ReasoningTrigger>
                    </Reasoning>
                    {thinking ? null : (
                      <MessageResponse streaming={streaming}>
                        {shown}
                      </MessageResponse>
                    )}
                    {thinking || streaming ? null : (
                      <MessageActions>
                        <CopyButton value={answer} />
                      </MessageActions>
                    )}
                  </MessageContent>
                </Message>
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>
    </div>
  );
};

/** An agent's steps, each done in turn while on screen; at rest, all done. */
export const ActivityLive = ({
  head,
  steps,
}: {
  head: string;
  steps: readonly { id: string; title: string; active: string }[];
}) => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 1300);
  const at = on ? ticks % (steps.length + 2) : steps.length;
  const statusOf = (index: number): ChainOfThoughtStepStatus => {
    if (index < at) {
      return "complete";
    }
    return index === at ? "active" : "pending";
  };
  return (
    <div ref={box} className="sc-activity">
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>{head}</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {steps.map((step, index) => (
            <ChainOfThoughtStep
              key={step.id}
              label={statusOf(index) === "active" ? step.active : step.title}
              status={statusOf(index)}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    </div>
  );
};

const roles = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor" },
];
const members = [
  { name: "Noor Haddad", role: "Editor", state: "Active" },
  { name: "Sam Okafor", role: "Viewer", state: "Active" },
  { name: "Lena Vos", role: "Editor", state: "Invited" },
  { name: "Ari Brandt", role: "Viewer", state: "Active" },
] as const;

/** The finished screen the ending hands over to: real parts, working. */
const InviteScreen = () => {
  const invite = () => wait(900);
  return (
    <div className="sc-screen">
      <Card>
        <CardTitle>Invite a teammate</CardTitle>
        <CardDescription>
          They get a link that works for seven days.
        </CardDescription>
        <form
          className="sc-screen-form"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <Field name="invite-email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="name@example.com" />
          </Field>
          <Field name="invite-role">
            <FieldLabel>Role</FieldLabel>
            <Select items={roles} defaultValue="editor">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </Field>
          <Button
            onClick={invite}
            loadingLabel="Sending"
            successLabel="Sent"
            errorLabel="Could not send"
          >
            Send invite
          </Button>
        </form>
      </Card>
      <div className="sc-screen-table">
        <Table caption="People in the workspace.">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead align="end">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.name}>
                <TableCell rowHeader>{member.name}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell align="end">
                  <Badge
                    variant={member.state === "Active" ? "success" : "default"}
                  >
                    {member.state}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

/**
 * The ending: App building's cursors put a screen together, and after a while on screen they hand
 * over and the real screen stands in their place, and works. Each time it comes back on screen it
 * is built again. At rest (no script, reduced motion) the finished screen.
 */
export const Finale = () => {
  const box = useRef<HTMLDivElement>(null);
  const on = useOnScreen(box);
  const ticks = useTicks(on, 4500);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (!on) {
      setRound((now) => now + 1);
    }
  }, [on]);
  const building = on && ticks === 0;
  return (
    <div ref={box} className="sc-building sc-finale">
      <AppBuilding
        key={round}
        done={!building}
        step="Putting the screen together"
        seed={21}
      >
        <InviteScreen />
      </AppBuilding>
    </div>
  );
};
