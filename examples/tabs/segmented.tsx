import { Tabs, TabsList, TabsTrigger } from "@grasp-os/ui/components/tabs";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  bar: { display: "grid", gap: 16, justifyItems: "start" },
  view: { margin: 0, fontSize: 14, lineHeight: "20px" },
});

// A small switch in a toolbar: the view it chooses is drawn elsewhere on the page.
export default function TabsSegmented() {
  const [view, setView] = useState("board");
  return (
    <div {...stylex.props(layout.bar)}>
      <Tabs value={view} onValueChange={(next) => next && setView(next)}>
        <TabsList aria-label="View">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
      </Tabs>
      <p {...stylex.props(layout.view)}>Showing the projects as a {view}.</p>
    </div>
  );
}
