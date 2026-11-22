import { Button } from "@grasp-os/ui/components/button";
import type { ButtonVariant } from "@grasp-os/ui/components/button";
import { Spinner } from "@grasp-os/ui/components/spinner";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

// In a row; on a phone one under the other, each as wide as the column, so none is left alone on
// a second line beside a hole.
const layout = stylex.create({
  row: {
    display: "grid",
    gridAutoFlow: { default: "column", [media.maxSm]: "row" },
    gridAutoColumns: "max-content",
    gridTemplateColumns: {
      default: null,
      [media.maxSm]: "minmax(0, 1fr)",
    },
    gap: space["3"],
    alignItems: "center",
  },
});

const buttons: { variant: ButtonVariant; words: string }[] = [
  { variant: "default", words: "Save changes" },
  { variant: "secondary", words: "Approve" },
  { variant: "destructive", words: "Delete" },
];

// A working spinner on each fill it meets in a button: the default, the secondary and the
// destructive. The whole ring is seen turning on each, not the lead bar alone.
export default function SpinnerOnFills() {
  return (
    <div {...stylex.props(layout.row)}>
      {buttons.map(({ variant, words }) => (
        <Button
          key={variant}
          variant={variant}
          disabled
          focusableWhenDisabled
          aria-busy
        >
          <Spinner size="sm" />
          {words}
        </Button>
      ))}
    </div>
  );
}
