"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMention,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@grasp-os/ui/components/prompt-input";
import type {
  PromptInputMentionData,
  PromptInputMentionTrigger,
} from "@grasp-os/ui/components/prompt-input";
import {
  FileIcon,
  SearchIcon,
  SparklesIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { layout } from "./layout";

// Made-up names, for the example only.
const people: PromptInputMentionData[] = [
  { value: "amara", label: "Amara Okafor", description: "Design lead" },
  { value: "tomas", label: "Tomas Varga", description: "Finance" },
  { value: "lin", label: "Lin Hayashi", description: "Operations" },
];

const files: PromptInputMentionData[] = [
  {
    value: "budget",
    label: "budget-2027.xlsx",
    icon: FileIcon,
    description: "Plans",
  },
  {
    value: "brief",
    label: "brief.pdf",
    icon: FileIcon,
    description: "Spring launch",
  },
];

const commands: PromptInputMentionData[] = [
  {
    value: "search",
    label: "search",
    icon: SearchIcon,
    description: "Search the workspace",
  },
  {
    value: "summary",
    label: "summary",
    icon: SparklesIcon,
    description: "Summarise this thread",
  },
];

// The people and files come from a pretend server, a moment after typing pauses. A short query
// matches more and takes it longer, and it answers even once the menu has moved on: a newer query
// aborts the older load, and an answer that comes late is set aside.
const look = async (query: string): Promise<PromptInputMentionData[]> =>
  await new Promise((resolve) => {
    setTimeout(
      () => {
        const found = (item: PromptInputMentionData) =>
          item.label.toLowerCase().includes(query.toLowerCase());
        resolve([
          ...people.filter(found).map((item) => ({ ...item, group: "People" })),
          ...files.filter(found).map((item) => ({ ...item, group: "Files" })),
        ]);
      },
      query.length < 2 ? 900 : 150
    );
  });

// Channels never load here: the menu says so, in place of saying that nothing matched.
const offline = async (): Promise<PromptInputMentionData[]> =>
  await new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("offline"));
    }, 150);
  });

// What @ can mention, as the menu's first level: a kind goes one level in.
const kinds: PromptInputMentionData[] = [
  {
    value: "people",
    label: "People",
    icon: UsersIcon,
    description: "Someone in the workspace",
  },
  {
    value: "files",
    label: "Files",
    icon: FileIcon,
    description: "A document or a sheet",
  },
];

const triggers: PromptInputMentionTrigger[] = [
  { char: "@", type: "mention", description: "mention", items: look, kinds },
  {
    char: "/",
    boundary: "line",
    type: "command",
    description: "command",
    items: commands,
    toToken: (item) => ({ value: item.value, label: `/${item.label}` }),
  },
  { char: "#", type: "channel", description: "channel", items: offline },
];

// @ mentions a person or a file: first the kinds, then the things of the kind picked, or type to
// search both at once. / at a line's start is a command; # a channel, which fails to load. Each
// pick is a token in the text: the arrows cross it in one step, and Backspace takes it out whole.
export default function PromptInputMentions() {
  const [sent, setSent] = useState("");
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput
        onSubmit={({ text, tokens }) => {
          setSent(`${text} (${tokens.map((token) => token.label).join(", ")})`);
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask anything, @ to mention, / for commands"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputSubmit />
        </PromptInputFooter>
        <PromptInputMention triggers={triggers} />
      </PromptInput>
      <p aria-live="polite" {...stylex.props(layout.sent)}>
        {sent === "" ? "Nothing sent yet." : `Sent: ${sent}`}
      </p>
    </div>
  );
}
