import { TabsLink, TabsNav } from "@grasp-os/ui/components/tabs";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  heads: { display: "grid", gap: space["6"], width: "100%" },
  // An item's head: its name keeps its room, the views take what is left and fold when it is too little.
  head: {
    display: "flex",
    alignItems: "center",
    gap: space["4"],
    minWidth: 0,
  },
  name: {
    flexShrink: 0,
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    fontWeight: font.weightMedium,
    color: colors.bodyForeground,
    whiteSpace: "nowrap",
  },
  nav: { flexGrow: 1 },
});

const few = ["Overview", "Flow", "Settings"];
const many = ["Overview", "Flow", "Runs", "Logs", "Members", "Settings"];

// Beside an item's name, the views fold to one button with the current view when they no longer
// fit: the menu holds the same links. They never wrap and never scroll sideways.
export default function TabsLinksFold() {
  return (
    <div {...stylex.props(layout.heads)}>
      {[
        ["few", few],
        ["many", many],
      ].map(([key, views]) => (
        <div
          key={String(key)}
          data-head={String(key)}
          {...stylex.props(layout.head)}
        >
          <h3 {...stylex.props(layout.name)}>Onboarding pipeline</h3>
          <TabsNav aria-label="Pipeline" style={layout.nav}>
            {(views as string[]).map((view) => (
              <TabsLink
                key={view}
                href={`#${view.toLowerCase()}`}
                current={view === "Flow"}
              >
                {view}
              </TabsLink>
            ))}
          </TabsNav>
        </div>
      ))}
    </div>
  );
}
