import { NumberField } from "@grasp-os/ui/components/number-field";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 12, width: "100%", maxWidth: 200 },
});

// 32, 36 and 44px, as Input's, so the two stand level in a row.
export default function NumberFieldSizes() {
  return (
    <div {...stylex.props(layout.stack)}>
      <NumberField aria-label="Small" size="sm" defaultValue={3} />
      <NumberField aria-label="Default" defaultValue={3} />
      <NumberField aria-label="Large" size="lg" defaultValue={3} />
    </div>
  );
}
