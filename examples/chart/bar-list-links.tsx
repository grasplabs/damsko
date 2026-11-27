import { ChartBarList } from "@grasp-os/ui/components/chart";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  wide: { width: "100%", maxWidth: 560 },
});

// What each team spent on AI this month and last, each team's name a link to its own page
// (`rowLink`). A router's link goes in as `render` (`render: <Link to="/teams/$id" params={…} />`).
const data = [
  { id: "finance", team: "Finance", now: 1240, before: 980 },
  { id: "sales", team: "Sales", now: 860, before: 910 },
  { id: "support", team: "Support", now: 610, before: 420 },
  { id: "legal", team: "Legal", now: 190, before: 230 },
];

export default function ChartBarListLinks() {
  return (
    <ChartBarList
      aria-label="AI spend by team, November and October"
      summary="Finance spent the most in November, €1,240."
      data={data}
      nameKey="team"
      config={{ now: { label: "November" }, before: { label: "October" } }}
      rowLink={(row) => ({ href: `#team-${String(row.id)}` })}
      valueFormatter={(value) => `€${value.toLocaleString("en-GB")}`}
      style={layout.wide}
    />
  );
}
