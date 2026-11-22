"use client";

import {
  Source,
  SourceIcon,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@grasp-os/ui/components/sources";
import {
  FileDocIcon,
  GlobeIcon,
  Icon,
  SearchIcon,
} from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  answer: { display: "grid", gap: space["4"], width: "100%", maxWidth: 640 },
  words: {
    margin: 0,
    fontSize: font.textBase,
    lineHeight: font.textBaseLine,
    color: colors.bodyForeground,
  },
});

// The page hears when a source is opened (`onOpen`): a source with an address is still a link and
// goes there; one without is a button that only runs it.
export default function SourcesOpen() {
  const [opened, setOpened] = useState("Nothing opened yet");
  return (
    <div {...stylex.props(layout.answer)}>
      <p {...stylex.props(layout.words)}>
        The team plan costs €12 a seat, the call asked to hold it, and a search
        compared the plans.
      </p>
      <Sources defaultOpen>
        <SourcesTrigger count={3}>
          <SourceIcon>
            <Icon icon={GlobeIcon} />
          </SourceIcon>
          <SourceIcon>
            <Icon icon={FileDocIcon} />
          </SourceIcon>
          <SourceIcon>
            <Icon icon={SearchIcon} />
          </SourceIcon>
        </SourcesTrigger>
        <SourcesContent>
          <Source
            title="Pricing page"
            origin="Pricing / Plans"
            href="#pricing"
            onOpen={() => {
              setOpened("Opened 1: Pricing page");
            }}
          >
            <SourceIcon>
              <Icon icon={GlobeIcon} />
            </SourceIcon>
          </Source>
          <Source
            title="Notes from the pricing call"
            origin="Shared notes"
            onOpen={() => {
              setOpened("Opened 2: Notes from the pricing call");
            }}
          >
            <SourceIcon>
              <Icon icon={FileDocIcon} />
            </SourceIcon>
          </Source>
          <Source
            title="Price check"
            origin="Search across four plans"
            href="#run"
            onOpen={() => {
              setOpened("Opened 3: Price check");
            }}
          >
            <SourceIcon>
              <Icon icon={SearchIcon} />
            </SourceIcon>
          </Source>
        </SourcesContent>
      </Sources>
      <output {...stylex.props(layout.words)}>{opened}</output>
    </div>
  );
}
