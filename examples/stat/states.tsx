import { Stat } from "@grasp-os/ui/components/stat";
import type { StatProps } from "@grasp-os/ui/components/stat";
import { TrendingUpIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// Every state of a stat, side by side: it has no pointer or keyboard states (nothing in it
// is pressed), so its states are its variants, a figure without a change, an icon, and loading. Each
// is the real Stat with those props.
const states: { label: string; props: StatProps }[] = [
  {
    label: "Default",
    props: {
      label: "Open tickets",
      value: "128",
      change: "+4",
      variant: "default",
    },
  },
  {
    label: "Success",
    props: {
      label: "Total revenue",
      value: "€124,567",
      change: "+12%",
      variant: "success",
    },
  },
  {
    label: "Destructive",
    props: {
      label: "Returns",
      value: "312",
      change: "+18%",
      variant: "destructive",
    },
  },
  {
    label: "Warning",
    props: {
      label: "Conversion rate",
      value: "3.45%",
      change: "−0.2%",
      variant: "warning",
    },
  },
  {
    label: "Info",
    props: {
      label: "Active users",
      value: "8,429",
      change: "+5%",
      variant: "info",
    },
  },
  { label: "No change", props: { label: "Team size", value: "24" } },
  {
    label: "With an icon",
    props: {
      label: "Total revenue",
      value: "€124,567",
      change: "+12%",
      variant: "success",
      icon: TrendingUpIcon,
    },
  },
  {
    label: "Loading",
    props: {
      label: "Total revenue",
      value: "€124,567",
      change: "+12%",
      loading: true,
    },
  },
];

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 12rem), 1fr))",
    gap: space["6"],
    // A definite width: the stage centres its content, which would otherwise shrink to one column.
    width: "52rem",
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  cell: {
    display: "grid",
    alignContent: "start",
    rowGap: space["3"],
    minWidth: 0,
  },
  label: {
    fontSize: font.textXs,
    lineHeight: font.textXsLine,
    color: colors.mutedForeground,
    textAlign: "center",
  },
});

export default function StatStates() {
  return (
    <ul data-state-stills="" {...stylex.props(styles.grid)}>
      {states.map((state) => (
        <li key={state.label} {...stylex.props(styles.cell)}>
          <span data-state-caption="" {...stylex.props(styles.label)}>
            {state.label}
          </span>
          <div data-state-still="" inert>
            <Stat {...state.props} />
          </div>
        </li>
      ))}
    </ul>
  );
}
