import { Button } from "@grasp-os/ui/components/button";
import { PageHeader } from "@grasp-os/ui/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  header: { width: "100%", maxWidth: 720 },
});

// A page with views carries its tabs under the title; each tab shows a view of the same page.
export default function PageHeaderTabs() {
  return (
    <PageHeader
      title="Spring launch"
      description="Everything the team ships in March."
      actions={<Button>New task</Button>}
      tabs={
        <Tabs defaultValue="overview">
          <TabsList aria-label="Spring launch" variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      style={layout.header}
    />
  );
}
