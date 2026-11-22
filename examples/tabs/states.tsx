import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";

// One tab in one state, in either look. The docs draw it once per state; hover and keyboard focus
// are forced from the tab's own CSS. In a product, Tabs chooses the tab and `disabled` is its own.
export default function TabsState({
  variant = "line",
  chosen = false,
  disabled = false,
}: {
  variant?: "default" | "line";
  chosen?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tabs value={chosen ? "activity" : "overview"}>
      <TabsList aria-label="Project" variant={variant}>
        <TabsTrigger value="activity" disabled={disabled}>
          Activity
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
