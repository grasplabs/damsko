import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "@grasp-os/ui/components/tabs";
import * as stylex from "@stylexjs/stylex";

const views = [
  "Overview",
  "Activity",
  "Members",
  "Files",
  "Reports",
  "Settings",
  "Billing",
];

const layout = stylex.create({
  tabs: { width: "100%", maxWidth: 360 },
});

// More tabs than room: the row scrolls sideways inside itself, and the page never does.
export default function TabsMany() {
  return (
    <Tabs defaultValue="Overview" style={layout.tabs}>
      <TabsList aria-label="Workspace" variant="line">
        {views.map((view) => (
          <TabsTrigger key={view} value={view} disabled={view === "Billing"}>
            {view}
          </TabsTrigger>
        ))}
      </TabsList>
      {views.map((view) => (
        <TabsContent key={view} value={view}>
          {view === "Billing"
            ? "Only owners see billing."
            : `The workspace's ${view.toLowerCase()}.`}
        </TabsContent>
      ))}
    </Tabs>
  );
}
