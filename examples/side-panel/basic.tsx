"use client";

import { Button } from "@grasp-os/ui/components/button";
import { IconTile } from "@grasp-os/ui/components/icon-tile";
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
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelSection,
} from "@grasp-os/ui/components/side-panel";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  ChartColumnIcon,
  CircleUserIcon,
  ClockIcon,
  DatabaseIcon,
  EllipsisIcon,
  FileDocIcon,
  Globe2Icon,
  Icon,
  PlusIcon,
  SettingsIcon,
  ShareIcon,
  TrashIcon,
} from "@grasp-os/ui/lib/icons";
import type { IconData } from "@grasp-os/ui/lib/icons";
import { size } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

const layout = stylex.create({
  // A panel's own height, so it scrolls here: scroll it to see the head fold.
  box: { width: "100%", maxWidth: size.sidePanelWidth, height: 560 },
});

const sources: { icon: IconData; name: string; kind: string }[] = [
  { icon: DatabaseIcon, name: "Project records", kind: "Table" },
  { icon: FileDocIcon, name: "Quarterly plan", kind: "Document" },
  { icon: Globe2Icon, name: "Public roadmap", kind: "Page" },
];

// Scroll the panel: the bar stays and gains its hairline, and the views slide into it as icons.
export default function SidePanelBasic() {
  const [toast] = useState(() => createToaster());
  return (
    <div {...stylex.props(layout.box)}>
      <SidePanel aria-label="Report details" defaultValue="details">
        <SidePanelHeader
          icon={<IconTile icon={ChartColumnIcon} variant="tinted" />}
          title="Quarterly delivery review"
          description="How each project moved this quarter, against its plan."
          meta={["By Jonas Weber", "Updated Tuesday"]}
          actions={
            <>
              <Button
                size="sm"
                onClick={() => {
                  toast("Opening the report", {
                    description:
                      "Quarterly delivery review opens in its own page.",
                  });
                }}
              >
                Open
              </Button>
              <Button size="sm" variant="outline">
                <Icon icon={ShareIcon} />
                Share
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <Icon icon={EllipsisIcon} />
              </Button>
            </>
          }
          onClose={() => {}}
          views={[
            { value: "details", label: "Details", icon: SettingsIcon },
            { value: "activity", label: "Activity", icon: ClockIcon },
          ]}
        />
        <SidePanelContent value="details">
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
            action={
              <Button variant="ghost" size="xs">
                <Icon icon={PlusIcon} />
                Add
              </Button>
            }
          >
            <ItemGroup>
              {sources.map((source, index) => (
                <Fragment key={source.name}>
                  {index > 0 && <ItemSeparator />}
                  <Item size="xs">
                    <ItemMedia>
                      <Icon icon={source.icon} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        {source.name}
                        <ItemDetail>{source.kind}</ItemDetail>
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions showOnHover>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${source.name}`}
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
            title="People with access"
            description="Who can open the report."
            emptyLabel="Add people"
          />
        </SidePanelContent>
        <SidePanelContent value="activity">
          <SidePanelSection
            title="This week"
            description="What happened to it, the newest first."
          >
            <ItemGroup>
              <Item size="xs">
                <ItemMedia>
                  <Icon icon={ClockIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    Jonas Weber published it
                    <ItemDetail>Tue</ItemDetail>
                  </ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </SidePanelSection>
        </SidePanelContent>
      </SidePanel>
      <Toaster toaster={toast} />
    </div>
  );
}
