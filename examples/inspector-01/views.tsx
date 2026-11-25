"use client";

import { Inspector } from "@grasp-os/ui/blocks/inspector-01/inspector-01";
import { Badge } from "@grasp-os/ui/components/badge";
import { IconTile } from "@grasp-os/ui/components/icon-tile";
import { Text } from "@grasp-os/ui/components/text";
import {
  ChartColumnIcon,
  CircleUserIcon,
  ClockIcon,
  FileDocIcon,
  FileIcon,
  SettingsIcon,
  UsersIcon,
} from "@grasp-os/ui/lib/icons";
import { size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  panel: { width: "100%", maxWidth: size.sidePanelWidth, height: 560 },
  text: { margin: 0 },
  footer: { marginInline: space.sidePanelPadding },
});

// A report's details in two views: the tabs fold into the bar as icons once the panel scrolls. Long
// words fold with a fade and a button that opens them. A view has a footer of its own.
export default function InspectorViews() {
  return (
    <Inspector
      aria-label="Report details"
      style={layout.panel}
      icon={<IconTile icon={ChartColumnIcon} variant="gradient" />}
      title="Churn by region, Q3"
      description="How many customers left in each region, and what changed."
      meta={["Updated 2 days ago"]}
      views={[
        { value: "details", label: "Details", icon: SettingsIcon },
        {
          value: "activity",
          label: "Activity",
          icon: ClockIcon,
          footer: (
            <Text as="p" size="sm" color="muted" style={layout.footer}>
              Activity older than 90 days is removed.
            </Text>
          ),
        },
      ]}
      sections={[
        {
          id: "people",
          view: "details",
          title: "People",
          description: "Who can open the report.",
          rows: [
            {
              id: "amara",
              icon: CircleUserIcon,
              name: "Amara Okafor",
              detail: <Badge size="sm">Owner</Badge>,
            },
            {
              id: "team",
              icon: UsersIcon,
              name: "Customer success",
              detail: "Can read",
            },
          ],
        },
        {
          id: "summary",
          view: "details",
          title: "Summary",
          description: "What the report found, in a few lines.",
          text: (
            <>
              <p {...stylex.props(layout.text)}>
                The third quarter closed with churn in the north at its lowest
                in two years. Most of the change came after new teams started
                getting a guided first week in August.
              </p>
              <p {...stylex.props(layout.text)}>
                Two regions are still above the company's average. Both changed
                their account owner during the quarter, and both are expected to
                settle by the end of the year.
              </p>
              <p {...stylex.props(layout.text)}>
                The next report adds the first month of the new pricing, and
                splits the north by team size, so a change in one large team no
                longer hides the rest.
              </p>
            </>
          ),
        },
        {
          id: "sources",
          view: "details",
          title: "Sources",
          description: "What the report was written from.",
          rows: [
            {
              id: "export",
              icon: FileIcon,
              name: "Accounts export, September",
              detail: "Sheet",
            },
            {
              id: "plan",
              icon: FileDocIcon,
              name: "Onboarding plan, autumn",
              detail: "Doc",
            },
          ],
        },
        {
          id: "recent",
          view: "activity",
          title: "Recent",
          rows: [
            {
              id: "a1",
              icon: ClockIcon,
              name: "Amara Okafor shared it with Customer success",
              detail: "2d",
            },
            {
              id: "a2",
              icon: ClockIcon,
              name: "The first draft was written",
              detail: "3d",
            },
          ],
        },
      ]}
    />
  );
}
