// Spinner: says that something is working, in Tailwind: Hugeicons' loader (through lib/icons),
// turning in the colour of the words around it, so it works as a Button's child. With reduced
// motion it stands still and breathes.
//
//   <Spinner aria-label="Loading the report" />            alone: a status that says its label
//   <p role="status"><Spinner /> Loading the report</p>    beside words: they are the status
//   <Button disabled><Spinner /> Saving</Button>           in a button: the button's words say it
//
// A caller may set layout only (`className`). A part round it may set `--damsko-spinner-floor` and
// `--damsko-spinner-stroke`.
import { cva } from "class-variance-authority";

import { Icon, LoaderIcon } from "../lib-tw/icons";
import { cn } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";

export type SpinnerSize = "sm" | "default" | "lg";

/** Every prop a Spinner takes. */
export interface SpinnerProps {
  /**
   * What is working, said once to a screen reader ("Loading the report"), never shown: the spinner
   * is then a status. Give it when no words beside it say so; leave it out when they do, and make
   * those words the status.
   */
  "aria-label"?: string;
  /**
   * `sm` beside small text and in a button, `default` beside body text, `lg` alone in a panel.
   * @default "sm"
   */
  size?: SpinnerSize;
  /** Layout only: margins and alignment. The look belongs to the spinner. */
  className?: LayoutClass;
}

// The fade: each bar a step fainter than the one ahead of it, down to the floor, so the turn reads
// as a chase. A mask over the icon: no bar is drawn by hand.
const spinnerVariants = cva(
  "inline-flex shrink-0 animate-[damsko-spin_var(--damsko-duration-spin)_linear_infinite] [mask-image:conic-gradient(oklch(0_0_none/var(--damsko-spinner-floor)),oklch(0_0_none))] align-middle text-inherit [--damsko-icon-stroke-width:var(--damsko-spinner-stroke)] motion-reduce:animate-[damsko-breathe_var(--damsko-spinner-breath)_var(--damsko-spinner-ease)_infinite]",
  {
    variants: {
      size: {
        sm: "[--damsko-icon-size:var(--damsko-icon-sm)]",
        default: "[--damsko-icon-size:var(--damsko-icon-default)]",
        lg: "[--damsko-icon-size:var(--damsko-spinner-lg)]",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

export const Spinner = ({
  "aria-label": label,
  size = "sm",
  className,
}: SpinnerProps) => {
  const spinner = (
    <span
      aria-hidden="true"
      data-slot="spinner"
      className={cn(
        spinnerVariants({ size }),
        label === undefined && className
      )}
    >
      <Icon icon={LoaderIcon} />
    </span>
  );
  if (label === undefined) {
    return spinner;
  }
  // A live region reads its text, not a name: the label is hidden text inside the status.
  return (
    <span role="status" className={className}>
      {spinner}
      <span className="sr-only">{label}</span>
    </span>
  );
};
