import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  tabs: { width: "100%", maxWidth: 480 },
});

export default function TabsBasic() {
  return (
    <Tabs defaultValue="overview" style={layout.tabs}>
      <TabsList aria-label="Project" variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        What the project is for, its owner and its next date.
      </TabsContent>
      <TabsContent value="activity">Every change, newest first.</TabsContent>
      <TabsContent value="members">
        Who can see and edit the project.
      </TabsContent>
    </Tabs>
  );
}
