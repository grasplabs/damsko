import { TabsLink, TabsNav } from "@grasp-os/ui/components/tabs";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  nav: { width: "100%", maxWidth: 480 },
});

// Views of one run, each its own address: links that look like tabs, the one you are on marked.
// With a router, pass its link as the child, with `asChild`.
export default function TabsLinks() {
  return (
    <TabsNav aria-label="Run" variant="line" style={layout.nav}>
      <TabsLink href="#overview" current>
        Overview
      </TabsLink>
      <TabsLink href="#logs">Logs</TabsLink>
      <TabsLink href="#settings">Settings</TabsLink>
    </TabsNav>
  );
}
