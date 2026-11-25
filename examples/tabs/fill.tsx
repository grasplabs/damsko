import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import { BellIcon, HouseIcon } from "@grasp-os/ui/lib/icons";
import { font } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { width: "100%", maxWidth: 240 },
  view: { margin: 0, fontSize: font.textSm, lineHeight: font.textSmLine },
});

// A switch across a narrow column (`fullWidth`): the track takes the column's width and shares it
// equally between its tabs, each an icon a step before its words.
export default function TabsFill() {
  return (
    <div {...stylex.props(layout.column)}>
      <Tabs defaultValue="overview">
        <TabsList aria-label="Panel" fullWidth>
          <TabsTrigger value="overview" icon={HouseIcon}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="updates" icon={BellIcon}>
            Updates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <p {...stylex.props(layout.view)}>What stands open.</p>
        </TabsContent>
        <TabsContent value="updates">
          <p {...stylex.props(layout.view)}>What changed since you looked.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
