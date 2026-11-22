import { Badge } from "@grasp-os/ui/components/badge";
import type { BadgeVariant } from "@grasp-os/ui/components/badge";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const reports: { name: string; status: string; variant: BadgeVariant }[] = [
  { name: "Quarterly summary", status: "Ready", variant: "success" },
  {
    name: "Supplier list for the spring",
    status: "Needs review",
    variant: "warning",
  },
  { name: "Team survey results", status: "Draft", variant: "default" },
];

const layout = stylex.create({
  list: {
    display: "grid",
    gap: space["3"],
    width: "100%",
    maxWidth: 360,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },
  badge: { flexShrink: 0 },
});

export default function BadgeInARow() {
  return (
    <ul {...stylex.props(layout.list)}>
      {reports.map((report) => (
        <li key={report.name} {...stylex.props(layout.row)}>
          <span>{report.name}</span>
          <Badge variant={report.variant} style={layout.badge}>
            {report.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
