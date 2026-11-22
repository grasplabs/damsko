"use client";

import { Shimmer } from "@grasp-os/ui/components/shimmer";
import { font, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
  },
});

// The three variants, on a short line and a long one: they sweep at the same apparent speed.
// The long one wraps where there is no room for it.
export default function ShimmerVariants() {
  return (
    <div {...stylex.props(styles.column)}>
      <Shimmer variant="soft">Thinking</Shimmer>
      <Shimmer>Thinking</Shimmer>
      <Shimmer variant="bright">Thinking</Shimmer>
      <Shimmer variant="soft">
        Reading the supplier contract and last year's invoices
      </Shimmer>
      <Shimmer>Reading the supplier contract and last year's invoices</Shimmer>
      <Shimmer variant="bright">
        Reading the supplier contract and last year's invoices
      </Shimmer>
    </div>
  );
}
