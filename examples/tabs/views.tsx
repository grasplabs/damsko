"use client";

import { TabsLink, TabsNav } from "@grasp-os/ui/components/tabs";
import {
  CodeIcon,
  DatabaseIcon,
  EyeIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const views = [
  { id: "preview", name: "Preview", icon: EyeIcon },
  { id: "code", name: "Code", icon: CodeIcon },
  { id: "data", name: "Data", icon: DatabaseIcon },
  { id: "settings", name: "Settings", icon: SettingsIcon },
] as const;

const layout = stylex.create({
  nav: { width: "100%", maxWidth: 480 },
});

// A view switch over an app, each view its own address, in a narrow bar: `size="sm"` shows the
// current view's words and the others' icons alone, their words their tooltips. Here a press only
// changes the current view; in a product each link is a route, `current` set from its match.
export default function TabsViews() {
  const [view, setView] = useState<string>("preview");
  return (
    <TabsNav aria-label="App" size="sm" style={layout.nav}>
      {views.map((each) => (
        <TabsLink
          key={each.id}
          icon={each.icon}
          current={view === each.id}
          asChild
        >
          <a
            href={`#${each.id}`}
            onClick={(event) => {
              event.preventDefault();
              setView(each.id);
            }}
          >
            {each.name}
          </a>
        </TabsLink>
      ))}
    </TabsNav>
  );
}
