import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 480 },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
  },
  rows: {
    display: "grid",
    gap: space["3"],
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
  name: { fontSize: font.textSm, color: colors.foreground },
  due: { fontSize: font.textSm, color: colors.mutedForeground },
});

const requests = [
  { name: "Q3 budget review", due: "Due Friday" },
  { name: "Brand refresh brief", due: "Due Monday" },
];

// Where several outlined buttons would be too many edges: a row of filters, and an action on each
// row of a card that already has its own edge. Each is `secondary`, flat, a step quieter than
// `outline`. Each press says what it would do.
export default function ButtonDense() {
  const [toast] = useState(() => createToaster());
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Open requests</CardTitle>
            <CardDescription>Waiting on someone in the team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div {...stylex.props(layout.filters)}>
              {["Status", "Owner", "Due date"].map((filter) => (
                <Button
                  key={filter}
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    toast(`The ${filter.toLowerCase()} filter would open here`)
                  }
                >
                  {filter}
                  <Icon icon={ChevronDownIcon} />
                </Button>
              ))}
            </div>
          </CardContent>
          <CardContent>
            <ul {...stylex.props(layout.rows)}>
              {requests.map((request) => (
                <li key={request.name} {...stylex.props(layout.row)}>
                  <span>
                    <span {...stylex.props(layout.name)}>{request.name}</span>{" "}
                    <span {...stylex.props(layout.due)}>{request.due}</span>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Remind ${request.name}`}
                    onClick={() => toast(`Reminder sent for ${request.name}`)}
                  >
                    Remind
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </section>
      </Card>
      <Toaster toaster={toast} />
    </div>
  );
}
