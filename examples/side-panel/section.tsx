"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import {
  SidePanelSection,
  SidePanelSectionAdd,
} from "@grasp-os/ui/components/side-panel";
import {
  ClockIcon,
  Icon,
  MailIcon,
  PlusIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

const layout = stylex.create({
  box: {
    display: "grid",
    rowGap: space.sidePanelGap,
    width: "100%",
    maxWidth: 372,
  },
});

const triggers: { icon: IconData; name: string; kind: string }[] = [
  { icon: ClockIcon, name: "Every Monday at 08:00", kind: "Schedule" },
  { icon: MailIcon, name: "A request arrives in Inbox", kind: "Event" },
];

// The title explains itself in a tooltip; the one action sits at the end of its row; the card
// holds the rows. Empty, the card is one row that adds the first.
export default function SidePanelSectionExample() {
  return (
    <div {...stylex.props(layout.box)}>
      <SidePanelSection
        title="Triggers"
        description="What starts the agent: a schedule, an event or a person."
        action={
          <Button variant="ghost" size="xs">
            <Icon icon={PlusIcon} />
            Add
          </Button>
        }
      >
        <ItemGroup>
          {triggers.map((trigger, index) => (
            <Fragment key={trigger.name}>
              {index > 0 && <ItemSeparator />}
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={trigger.icon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {trigger.name}
                    <ItemDetail>{trigger.kind}</ItemDetail>
                  </ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${trigger.name}`}
                  >
                    <Icon icon={TrashIcon} />
                  </Button>
                </ItemActions>
              </Item>
            </Fragment>
          ))}
        </ItemGroup>
      </SidePanelSection>
      <SidePanelSection
        title="Context"
        description="Files and notes the agent reads before it starts."
      >
        <SidePanelSectionAdd>Add context</SidePanelSectionAdd>
      </SidePanelSection>
    </div>
  );
}
