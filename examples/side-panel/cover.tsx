"use client";

import { IconTile } from "@grasp-os/ui/components/icon-tile";
import {
  Item,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
} from "@grasp-os/ui/components/side-panel";
import {
  ChartColumnIcon,
  CircleUserIcon,
  DatabaseIcon,
  Icon,
} from "@grasp-os/ui/lib/icons";
import { colors, size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: size.sidePanelWidth, height: 420 },
  // The product's own cover: here a soft wash of the muted ground, fading down from the top.
  cover: {
    width: "100%",
    height: "100%",
    backgroundImage: `linear-gradient(to bottom, ${colors.muted}, transparent)`,
  },
});

// A cover behind the head of the one thing the page is about. Here no bar stands above the head
// (no actions, no close, no views), so the cover starts at the head's own top.
export default function SidePanelCover() {
  return (
    <div {...stylex.props(layout.box)}>
      <SidePanel
        aria-label="Report details"
        cover={<div {...stylex.props(layout.cover)} />}
      >
        <SidePanelHeader
          icon={<IconTile icon={ChartColumnIcon} variant="tinted" />}
          title="Quarterly delivery review"
          description="How each project moved this quarter, against its plan."
          meta={["By Jonas Weber", "Updated Tuesday"]}
        />
        <SidePanelContent>
          <SidePanelSection
            title="Owner"
            description="The one person who answers for the report."
          >
            <ItemGroup>
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={CircleUserIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Jonas Weber
                    <ItemDetail>Delivery lead</ItemDetail>
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </SidePanelSection>
          <SidePanelSection
            title="Linked sources"
            description="Where its numbers come from."
          >
            <ItemGroup>
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={DatabaseIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Project records
                    <ItemDetail>Table</ItemDetail>
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </SidePanelSection>
        </SidePanelContent>
      </SidePanel>
    </div>
  );
}
