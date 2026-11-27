import {
  Meter,
  MeterLabel,
  MeterValue,
} from "@grasp-os/ui/components/progress";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  column: { display: "grid", gap: space["6"], width: "100%", maxWidth: 400 },
});

// A reading, not a task: how much of something is used, against what there is. The words say the
// reading; a tone only when it says something too, and then the words say it as well.
export default function ProgressMeter() {
  return (
    <div {...stylex.props(layout.column)}>
      <Meter value={68} max={100}>
        <MeterLabel>Storage used</MeterLabel>
        <MeterValue>{(_, value) => `${String(value)} of 100 GB`}</MeterValue>
      </Meter>
      <Meter
        value={6}
        max={6}
        getAriaValueText={(value) => `${String(value)} of 6 up to date`}
      >
        <MeterLabel>Companies on the latest release</MeterLabel>
        <MeterValue>{(_, value) => `${String(value)} of 6`}</MeterValue>
      </Meter>
      <Meter
        value={23}
        max={25}
        variant="warning"
        getAriaValueText={(value) =>
          `${String(value)} of 25 seats, nearly full`
        }
      >
        <MeterLabel>Seats, nearly full</MeterLabel>
        <MeterValue>{(_, value) => `${String(value)} of 25`}</MeterValue>
      </Meter>
    </div>
  );
}
