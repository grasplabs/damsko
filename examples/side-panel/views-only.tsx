"use client";

import {
  Item,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
} from "@grasp-os/ui/components/side-panel";
import {
  ClockIcon,
  Icon,
  LinkIcon,
  MessageCircleIcon,
} from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: size.sidePanelWidth, height: 420 },
});

// A note's side panel: the note is the page, so the panel has no title of its own. Its views stand
// alone at its top, and the SidePanel's own name says what it is.
export default function SidePanelViewsOnly() {
  return (
    <div {...stylex.props(layout.box)}>
      <SidePanel aria-label="About this note" defaultValue="links">
        <SidePanelHeader
          viewsText="About this note"
          views={[
            { value: "links", label: "Links", icon: LinkIcon },
            { value: "comments", label: "Comments", icon: MessageCircleIcon },
            { value: "history", label: "History", icon: ClockIcon },
          ]}
        />
        <SidePanelContent value="links">
          <SidePanelSection
            title="Linked from"
            description="Notes that point here."
          >
            <ItemGroup>
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={LinkIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Quarterly plan
                    <ItemDetail>Note</ItemDetail>
                  </ItemTitle>
                </ItemContent>
              </Item>
              <ItemSeparator />
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={LinkIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Hiring tracker
                    <ItemDetail>Note</ItemDetail>
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </SidePanelSection>
        </SidePanelContent>
        <SidePanelContent value="comments">
          <SidePanelSection
            title="Comments"
            description="What people said about it."
            emptyText="No comments yet"
          />
        </SidePanelContent>
        <SidePanelContent value="history">
          <SidePanelSection
            title="History"
            description="Its changes, the newest first."
            emptyText="No changes yet"
          />
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
