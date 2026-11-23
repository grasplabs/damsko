// Label: the name of a control you can see,
// in Tailwind, built on UI SDK's Label, which names any control by
// `htmlFor` (an input, and also a radio group or a slider) and passes a press on to it.
//
//   <Label htmlFor="team-name">Team name</Label>
//   <Label htmlFor="team-name" required>Team name</Label>      the required mark, for the eye
"use client";

import { Label as LabelPrimitive } from "@ui-sdk/react/label";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";

const styles = {
  // A long name breaks inside the word, hyphenated where its language allows. Never cut off. A
  // control that is out of use takes its label with it.
  label:
    "block min-w-0 m-0 font-sans text-sm font-medium text-foreground wrap-anywhere hyphenate cursor-default opacity-100 data-disabled:opacity-(--damsko-opacity-disabled)",
  // The required mark: a quiet asterisk after the words, drawn by the label itself (::after), so it
  // is never in the label's text or the name it gives its control. For the eye only.
  required:
    "after:content-['*'_/_''] after:ms-1 after:font-normal after:text-muted-foreground",
};

type LabelPrimitiveProps = ComponentProps<typeof LabelPrimitive>;

/** Every prop a Label takes: these, and the rest of UI SDK's Label and a <label>. */
export interface LabelProps extends Omit<
  LabelPrimitiveProps,
  "className" | "style" | "children" | "render"
> {
  /** The words: what the control is, in sentence case ("Work email"). Never a question. */
  children: ReactNode;
  /** The `id` of the control it names. Leave it out when the label wraps its control. */
  htmlFor?: string;
  /**
   * Shows the required mark. Use it when the control it names is `required`.
   * @default false
   */
  required?: boolean;
  /** Where it sits: margins and alignment. Type and colour belong to the label. */
  className?: LayoutClass;
}

export const Label = ({
  children,
  required = false,
  className,
  ...rest
}: LabelProps) => (
  <LabelPrimitive
    {...rest}
    data-slot="label"
    className={cn(styles.label, required && styles.required, className)}
  >
    {children}
  </LabelPrimitive>
);
