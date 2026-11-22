import { Separator } from "@grasp-os/ui/components/separator";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

const people = ["Aleksandra Wiśniewska", "Joost van Dijk", "Mei Tanaka"];

const layout = stylex.create({
  list: { display: "grid", gap: space["3"], width: "100%", maxWidth: 360 },
});

// Between the rows of a list, not after the last one.
export default function SeparatorInAList() {
  return (
    <div {...stylex.props(layout.list)}>
      {people.map((name, index) => (
        <Fragment key={name}>
          {index > 0 && <Separator />}
          <span>{name}</span>
        </Fragment>
      ))}
    </div>
  );
}
