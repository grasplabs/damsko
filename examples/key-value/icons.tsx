"use client";

import { KeyValueList } from "@grasp-os/ui/components/key-value";
import type { KeyValueItem } from "@grasp-os/ui/components/key-value";
import {
  BrainIcon,
  ClockIcon,
  FileIcon,
  MessageCircleIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  forms: { display: "flex", flexWrap: "wrap", gap: 32, width: "100%" },
  rail: { width: "100%", maxWidth: "22rem" },
  tight: { width: "100%", maxWidth: "16rem" },
  models: { display: "grid", gap: 4, margin: 0, padding: 0, listStyle: "none" },
});

const facts: KeyValueItem[] = [
  {
    id: "knows",
    label: "Knows",
    icon: FileIcon,
    value: "2 files",
    group: "what",
    detail: "Invoice policy 2026.pdf and Approvers.xlsx.",
  },
  {
    id: "model",
    label: "Model",
    icon: BrainIcon,
    value: "Claude Sonnet 5.5",
    group: "what",
    detail: "The default: quick, and careful with numbers.",
  },
  {
    id: "answers-in",
    label: "Answers in",
    icon: MessageCircleIcon,
    value: "Grasp",
    group: "where",
  },
  {
    id: "runs",
    label: "Runs",
    icon: ClockIcon,
    value: "On request",
    group: "where",
    detail: "It answers when someone asks it. It never runs on its own.",
  },
  {
    id: "shared-with",
    label: "Shared with",
    value: "Finance team",
    group: "whose",
  },
];

// The rail with icons, two ways: each icon before its name, and, for a tight rail, the icons
// alone, each naming its row for a screen reader and in a Tooltip on hover and focus. Shared with
// has no icon: it keeps the icon's room, and shows its name in both.
export default function KeyValueIcons() {
  return (
    <div {...stylex.props(layout.forms)}>
      <KeyValueList
        orientation="horizontal"
        valueAlign="start"
        items={facts}
        style={layout.rail}
      />
      <KeyValueList
        orientation="horizontal"
        valueAlign="start"
        labelDisplay="icon"
        items={facts}
        style={layout.tight}
      />
    </div>
  );
}
