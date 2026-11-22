import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import { colors, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  tabs: { width: "100%", maxWidth: 480 },
  // Clear room under the tabs' line, so the view never touches it.
  text: {
    margin: 0,
    paddingBlockStart: space["5"],
    color: colors.bodyForeground,
  },
});

// Views of one thing: the tabs switch what you see of it without leaving the page.
export default function NavigationWithin() {
  return (
    <Tabs defaultValue="overview" style={layout.tabs}>
      <TabsList aria-label="Spring launch" variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p {...stylex.props(layout.text)}>
          What the project is for and where it stands.
        </p>
      </TabsContent>
      <TabsContent value="activity">
        <p {...stylex.props(layout.text)}>
          Everything that changed, newest first.
        </p>
      </TabsContent>
      <TabsContent value="files">
        <p {...stylex.props(layout.text)}>The files the project holds.</p>
      </TabsContent>
    </Tabs>
  );
}
