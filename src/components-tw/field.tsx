// Field: a control with its label, its description and the error it shows,
// in Tailwind, built on UI SDK's Field,
// which wires the label's `for`, `aria-labelledby`, `aria-describedby` and `aria-invalid` itself:
// a control of ours inside a Field needs no ids and no spread.
//
//   <Field name="email">
//     <FieldLabel>Work email</FieldLabel>
//     <Input type="email" autoComplete="email" required />
//     <FieldDescription>We send the invite here.</FieldDescription>
//     <FieldError match="valueMissing">Enter your work email.</FieldError>
//   </Field>
//
// Three ways to stand. `vertical`: label, control, description and error one under the other.
// `horizontal`: a checkbox or a radio first and its words (a FieldContent) after it, or the words
// first and a switch at the end, on one row at least 44px tall. `responsive`: a setting, its words
// at the start and its control on an end edge every row in its FieldGroup shares, the control going
// under the words when the row is narrower than 34rem; a FieldStatus beside it says where a save
// on change is.
//
//   <FieldSet>
//     <FieldLegend variant="label">Organization</FieldLegend>
//     <FieldGroup>
//       <Field orientation="responsive">
//         <FieldContent>
//           <FieldLabel>Time zone</FieldLabel>
//           <FieldDescription>For schedules and the times shown.</FieldDescription>
//         </FieldContent>
//         <Select …/>
//         <FieldStatus status={status} onRetry={save} />
//       </Field>
//     </FieldGroup>
//   </FieldSet>
//
// Inside a CheckboxGroup or a RadioGroup, each choice is a horizontal Field of its own, a row wired
// to its control by id, so the group's Field keeps the group's validity and error. Anywhere else a
// horizontal Field is a field of its own, inside another Field too.
//
// The label shows the required mark when its control is `required`. An error shows after a submit
// finds the control wrong, or at once with `data-invalid` on the Field (an error from the server).
"use client";

import {
  Field as FieldPrimitive,
  FieldDescription as FieldDescriptionPrimitive,
  FieldError as FieldErrorPrimitive,
  FieldGroup as FieldGroupPrimitive,
  FieldLabel as FieldLabelPrimitive,
  FieldLegend as FieldLegendPrimitive,
  FieldSet as FieldSetPrimitive,
  useFieldControl as useFieldControlPrimitive,
} from "@ui-sdk/react/field";
import { Label as LabelPrimitive } from "@ui-sdk/react/label";
import { createContext, use, useContext, useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { CheckIcon, Icon } from "../lib-tw/icons";
import { ChoiceGroupContext, cn, isBlank, isInvalid } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";
import { Button } from "./button";
import { Spinner } from "./spinner";

// Every Field is `group/field`, so its parts answer its own state (StyleX's fieldControlMarker):
// `group-data-[orientation=responsive]/field:` in a setting, `group-has-required/field:` for the
// label's mark. A row narrower than 34rem puts its control under its words: the container query
// `@max-[34rem]/field:` on the Field's own width.

// ---- Grouped rows -------------------------------------------------------------------------------
//
// A horizontal Field inside a CheckboxGroup or a RadioGroup (which say so through
// ChoiceGroupContext) is a row of the group, whose Field round the group holds the group's
// validity and shows its error. UI SDK gives a field the controls
// whose nearest field it is, so a row that were a field of its own would take its control's
// validity from the group's (a required RadioGroup would never show its error). The row is a plain
// row instead: it hands its control and its words one id, by which they wire each other, and
// useFieldControl hands the control that wiring.

/** The id a grouped row hands its control and its words. Unset outside such a row. */
const FieldControlIdContext = createContext<string | undefined>(undefined);
/** A grouped row out of use: its words dim, its control is disabled. */
const FieldDisabledContext = createContext(false);
/** A grouped row shown as wrong: its control says `aria-invalid`. */
const FieldInvalidContext = createContext(false);

/** The ids a grouped row's words take, from the row's one id. */
const getFieldIds = (id: string) => ({
  label: `${id}-label`,
  description: `${id}-description`,
  error: `${id}-error`,
});

// ---- Field --------------------------------------------------------------------------------------

const styles = {
  field: "group/field min-w-0 m-0",
  // Label, control, description and error, one under the other, 8px apart.
  vertical: "grid grid-cols-[minmax(0,1fr)] content-start gap-y-2",
  // A control and its words on one row, at least 44px tall: the control first, or, holding a
  // switch, the words first and the switch at the end. Read from the page itself (:has).
  horizontal:
    "relative isolate grid items-start grid-cols-[auto_minmax(0,1fr)] has-[>[role=switch],>*>[role=switch]]:grid-cols-[minmax(0,1fr)_auto] gap-x-3 has-[>[role=switch],>*>[role=switch]]:gap-x-4 py-[calc((var(--damsko-tap-target)-var(--damsko-text-sm-line))/2)]",
  // A setting: its own width is what its narrow form measures. A hairline over every row but the
  // first, so the rows of one group stand apart.
  responsive:
    "@container/field box-border [border-top-style:solid] border-t-border border-t-[length:var(--damsko-hairline)] first:border-t-0 font-sans",
  // Inside a responsive Field: the words, and the control on the shared end edge. A narrow `fit`
  // row is a wrapping line (the FieldGroup sets the --damsko-field-* variables).
  row: "relative box-border min-h-field-row py-2 px-table-cell-inline grid @max-[34rem]/field:[display:var(--damsko-field-display-narrow)] flex-wrap grid-cols-(--damsko-field-columns) @max-[34rem]/field:grid-cols-(--damsko-field-columns-narrow) items-center justify-items-end gap-x-6 gap-y-2",
};

/** How a Field's parts stand: one under the other, a control and its words on one row, or a setting. */
export type FieldOrientation = "vertical" | "horizontal" | "responsive";

/** Every prop a Field takes: these, and the rest of UI SDK's Field and a <div>. */
export interface FieldProps extends Omit<
  ComponentProps<typeof FieldPrimitive>,
  "className" | "style" | "render" | "invalid"
> {
  /** The label, the control, its description and its error, in that order. */
  children: ReactNode;
  /** The name the control is sent under in a form, when the control has no `name` of its own. */
  name?: string;
  /**
   * Out of use: the control, its label and its description, at half strength. Say why near it.
   * @default false
   */
  disabled?: boolean;
  /**
   * Shows the field as wrong now, for an error your code decides (the server said no):
   * its control says `aria-invalid` with it. Leave it out and the field shows the browser's
   * own check after a submit.
   */
  "data-invalid"?: boolean;
  /**
   * How its parts stand. `vertical`: label, control, description and error, one under the other.
   * `horizontal`: a Checkbox or a Radio first, then its words (a FieldContent), on one row at least
   * 44px tall; or the words first and a Switch at the end. Inside a CheckboxGroup or a
   * RadioGroup, a horizontal Field is a row of the group, its words wired to its control by id,
   * and the group's Field keeps the group's validity. `responsive`: a setting in a FieldGroup,
   * its words (a FieldContent) at the start and its control on the group's shared end edge, under
   * the words when the row is narrower than 34rem.
   * @default "vertical"
   */
  orientation?: FieldOrientation;
  /** Layout only: margins, alignment and width. The look belongs to the field. */
  className?: LayoutClass;
}

/** A row of a CheckboxGroup or a RadioGroup: a plain row, its control and its words wired by id. */
const GroupedRow = ({
  disabled = false,
  invalid = false,
  className,
  children,
}: Pick<FieldProps, "disabled" | "className" | "children"> & {
  invalid?: boolean;
}) => {
  const id = `field${useId()}`;
  return (
    <FieldControlIdContext value={id}>
      <FieldDisabledContext value={disabled}>
        <FieldInvalidContext value={invalid}>
          <div
            data-orientation="horizontal"
            data-disabled={disabled || undefined}
            data-invalid={invalid || undefined}
            className={cn(styles.field, styles.horizontal, className)}
          >
            {children}
          </div>
        </FieldInvalidContext>
      </FieldDisabledContext>
    </FieldControlIdContext>
  );
};

export const Field = ({
  orientation = "vertical",
  "data-invalid": invalid,
  className,
  children,
  ...rest
}: FieldProps) => {
  const grouped = use(ChoiceGroupContext) !== null;
  if (orientation === "horizontal" && grouped) {
    return (
      <GroupedRow
        disabled={rest.disabled}
        invalid={invalid}
        className={className}
      >
        {children}
      </GroupedRow>
    );
  }
  return (
    <FieldPrimitive
      {...rest}
      invalid={invalid}
      data-orientation={orientation}
      className={cn(
        styles.field,
        orientation === "vertical" && styles.vertical,
        orientation === "horizontal" && styles.horizontal,
        orientation === "responsive" && styles.responsive,
        className
      )}
    >
      {orientation === "responsive" ? (
        <div className={cn(styles.row)}>{children}</div>
      ) : (
        children
      )}
    </FieldPrimitive>
  );
};

// ---- FieldContent -------------------------------------------------------------------------------

// In a setting the words stand at the top of the row, in a band one small control tall where the
// name sits centred. In a narrow fit row they keep a floor of 8rem. Placed, so a FieldStatus's
// failure can stand in the help's place over it.
const content =
  "grid grid-cols-[minmax(0,1fr)] gap-y-1 group-data-[orientation=responsive]/field:gap-y-0 min-w-0 justify-self-stretch group-data-[orientation=responsive]/field:self-start group-data-[orientation=responsive]/field:content-center group-data-[orientation=responsive]/field:min-h-control-sm grow shrink-0 basis-[8rem] group-data-[orientation=responsive]/field:row-[1] group-data-[orientation=responsive]/field:col-[1]";

/** Every prop a FieldContent takes. */
export interface FieldContentProps {
  /** The words beside a control in a horizontal or responsive Field: its FieldLabel, FieldDescription and FieldError. */
  children: ReactNode;
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/** The words beside a control in a horizontal or responsive Field, one under the other. */
export const FieldContent = ({ children, className }: FieldContentProps) => (
  <div data-slot="field-content" className={cn(content, className)}>
    {children}
  </div>
);

// ---- FieldLabel and FieldTitle ------------------------------------------------------------------

// The label's look, the same as Label's (label.tsx keeps its own private).
const labelStyles = {
  // A long name breaks inside the word, hyphenated where its language allows. A field out of use
  // takes its label with it, and a radio or checkbox group out of use the labels of its rows.
  label:
    "block min-w-0 m-0 font-sans text-sm font-medium text-foreground wrap-anywhere hyphenate cursor-default opacity-100 data-disabled:opacity-(--damsko-opacity-disabled) [&:is([data-slot=radio-group][data-disabled]_*,[data-slot=checkbox-group][data-disabled]_*)]:opacity-(--damsko-opacity-disabled)",
  // The required mark shows when the field holds a required control, read from the page (:has).
  // For the eye only: never in the label's text or the name it gives its control.
  mark: "after:content-none group-has-required/field:after:content-['*'_/_''] after:ms-1 after:font-normal after:text-muted-foreground",
};

/** Every prop a FieldLabel takes. */
export interface FieldLabelProps extends Omit<
  ComponentProps<typeof FieldLabelPrimitive>,
  "className" | "style" | "children" | "render"
> {
  /** The words: what goes in the control, in sentence case ("Work email"). Never a question. */
  children: ReactNode;
  /** Where it sits: margins and alignment. Type and colour belong to the label. */
  className?: LayoutClass;
}

/** The field's label. It names the control, and shows the required mark when it is `required`. */
export const FieldLabel = ({
  children,
  className,
  ...rest
}: FieldLabelProps) => {
  const row = useContext(FieldControlIdContext);
  const off = useContext(FieldDisabledContext);
  // In a grouped row: a plain label, named by id. The group is what is required: no mark.
  if (row !== undefined) {
    return (
      <LabelPrimitive
        id={getFieldIds(row).label}
        htmlFor={rest.htmlFor ?? row}
        data-disabled={off || undefined}
        className={cn(labelStyles.label, className)}
      >
        {children}
      </LabelPrimitive>
    );
  }
  return (
    <FieldLabelPrimitive
      {...rest}
      className={cn(labelStyles.label, labelStyles.mark, className)}
    >
      {children}
    </FieldLabelPrimitive>
  );
};

/** Every prop a FieldTitle takes. */
export interface FieldTitleProps {
  /** The words: what the field is about, in sentence case ("Data location"). */
  children: ReactNode;
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/**
 * A field's name in the label's look, when it names no control: a fact in a setting's columns, or
 * the title over a choice drawn as a card.
 */
export const FieldTitle = ({ children, className }: FieldTitleProps) => (
  <div data-slot="field-title" className={cn(labelStyles.label, className)}>
    {children}
  </div>
);

// ---- FieldDescription and FieldError ------------------------------------------------------------

const noteStyles = {
  // A sentence under the control. In a setting, the help line under the name, at the name's size.
  note: "m-0 min-w-0 font-sans text-xs group-data-[orientation=responsive]/field:text-sm font-normal wrap-anywhere hyphenate text-pretty justify-self-stretch",
  // A setting whose save failed: the failure takes the help's place (FieldStatus).
  description:
    "text-muted-foreground opacity-100 data-disabled:opacity-(--damsko-opacity-disabled) [&:is([data-slot=radio-group][data-disabled]_*,[data-slot=checkbox-group][data-disabled]_*)]:opacity-(--damsko-opacity-disabled) group-[[data-orientation=responsive]:has([data-status=error])]/field:invisible",
  // What is wrong, in words, in the destructive colour. In a setting it runs across the row.
  error:
    "text-destructive group-data-[orientation=responsive]/field:col-[1/-1] group-data-[orientation=responsive]/field:order-1",
  list: "m-0 ps-4",
};

/** Every prop a FieldDescription takes. */
export interface FieldDescriptionProps extends Omit<
  ComponentProps<typeof FieldDescriptionPrimitive>,
  "className" | "style" | "children" | "render"
> {
  /** One sentence: what the field is for. A screen reader says it after the control's name. */
  children: ReactNode;
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/**
 * A sentence under the control. A screen reader says it after the control's name; right inside a
 * FieldSet, it describes the set, said as focus enters it.
 */
export const FieldDescription = ({
  children,
  className,
  ...rest
}: FieldDescriptionProps) => {
  const row = useContext(FieldControlIdContext);
  const off = useContext(FieldDisabledContext);
  // In a grouped row: a plain sentence its control names by id.
  if (row !== undefined) {
    return (
      <p
        id={getFieldIds(row).description}
        data-slot="field-description"
        data-disabled={off || undefined}
        className={cn(noteStyles.note, noteStyles.description, className)}
      >
        {children}
      </p>
    );
  }
  return (
    <FieldDescriptionPrimitive
      {...rest}
      className={cn(noteStyles.note, noteStyles.description, className)}
    >
      {children}
    </FieldDescriptionPrimitive>
  );
};

/** Every prop a FieldError takes. */
export interface FieldErrorProps extends Omit<
  ComponentProps<typeof FieldErrorPrimitive>,
  "className" | "style" | "children" | "render"
> {
  /**
   * What is wrong and how to put it right ("Enter your work email"). Always your own words: the
   * browser's own message never shows.
   */
  children?: ReactNode;
  /**
   * The errors a form library reports, each with its message: shown at once, one as a sentence,
   * several as a list. Give the Field `data-invalid` with them. `children` wins when both are given.
   */
  errors?: readonly ({ message?: string } | undefined)[];
  /**
   * When it shows: `"valueMissing"`, `"typeMismatch"` or another of the browser's checks for that
   * problem only, `true` always (an error from your code, with `data-invalid` on the Field). Without it,
   * any problem shows it.
   */
  match?: ComponentProps<typeof FieldErrorPrimitive>["match"];
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/** The messages of a form library's errors, each once, in order. */
const messagesOf = (errors: FieldErrorProps["errors"]): string[] => [
  ...new Set(
    (errors ?? []).flatMap((each) =>
      each?.message === undefined || each.message === "" ? [] : [each.message]
    )
  ),
];

/** The words an error shows: its own, or a form library's messages. */
const wordsOf = (children: ReactNode, messages: string[]): ReactNode => {
  if (!isBlank(children)) {
    return children;
  }
  if (messages.length > 1) {
    return (
      <ul className={cn(noteStyles.list)}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    );
  }
  return messages[0];
};

/** The error under the control, while the field is wrong. A screen reader says it with the control. */
export const FieldError = ({
  children,
  errors,
  match,
  className,
  ...rest
}: FieldErrorProps) => {
  const row = useContext(FieldControlIdContext);
  const messages = messagesOf(errors);
  const words = wordsOf(children, messages);
  // Without words of its own, nothing: UI SDK would fill in the browser's sentence.
  if (isBlank(words)) {
    return null;
  }
  // In a grouped row: the row's own error, said with its control by id, as the group's Field holds
  // the group's.
  if (row !== undefined) {
    return (
      <p
        id={getFieldIds(row).error}
        data-slot="field-error"
        className={cn(noteStyles.note, noteStyles.error, className)}
      >
        {words}
      </p>
    );
  }
  return (
    <FieldErrorPrimitive
      {...rest}
      match={
        match ?? (isBlank(children) && messages.length > 0 ? true : undefined)
      }
      className={cn(noteStyles.note, noteStyles.error, className)}
    >
      {words}
    </FieldErrorPrimitive>
  );
};

// ---- FieldStatus --------------------------------------------------------------------------------

const statusStyles = {
  // Beside a vertical or horizontal field's control: the mark and the words on one line. In a
  // setting it takes no box of its own.
  status:
    "flex group-data-[orientation=responsive]/field:contents items-center gap-2 min-w-0",
  // Where the save is, beside the control and never under the name, in the room between the words
  // and the control, so no row changes size. In a narrow row it stands over the control's end.
  mark: "inline-flex items-center justify-center shrink-0 size-icon-sm text-success pointer-events-none static group-data-[orientation=responsive]/field:absolute group-data-[orientation=responsive]/field:row-[1] group-data-[orientation=responsive]/field:@max-[34rem]/field:row-[2] group-data-[orientation=responsive]/field:col-[2] group-data-[orientation=responsive]/field:@max-[34rem]/field:col-[1] group-data-[orientation=responsive]/field:end-full group-data-[orientation=responsive]/field:@max-[34rem]/field:end-0 group-data-[orientation=responsive]/field:top-1/2 group-data-[orientation=responsive]/field:@max-[34rem]/field:top-auto group-data-[orientation=responsive]/field:bottom-auto group-data-[orientation=responsive]/field:@max-[34rem]/field:bottom-[calc(100%+var(--damsko-space-2))] group-data-[orientation=responsive]/field:me-1 group-data-[orientation=responsive]/field:@max-[34rem]/field:me-0 group-data-[orientation=responsive]/field:[transform:translateY(-50%)] group-data-[orientation=responsive]/field:@max-[34rem]/field:transform-none",
  // Saved: the tick stands as long as any result holds, then leaves; with reduced motion at once.
  leaves:
    "animate-[damsko-leave_var(--damsko-motion-leave)_var(--damsko-ease)_var(--damsko-duration-hold)_forwards]",
  // The words: said, in a setting under the name in the help's place. Only a failure shows there.
  line: "flex flex-wrap items-center gap-x-2 min-w-0 col-[1] group-[[data-orientation=responsive]:has([data-slot=field-description])]/field:row-[1] group-[[data-orientation=responsive]:has([data-slot=field-description])]/field:self-end justify-self-stretch font-sans text-sm text-muted-foreground",
  // Shown only when it failed; tailwind-merge does not know sr-only sets the margin, so the margin
  // is given only where sr-only is not.
  failed: "m-0 text-destructive",
  // Try again, in a box one line tall: its button may be taller, the row never is.
  retry: "inline-flex items-center h-(--damsko-text-sm-line)",
};

/** Where a save on change is: at rest, saving, saved, or failed with the value kept. */
export type FieldStatusValue = "idle" | "loading" | "success" | "error";

/** Every prop a FieldStatus takes. */
export interface FieldStatusProps {
  /**
   * Where the save is. `loading`: a spinner beside the control. `success`: a tick that leaves after
   * a moment. `error`: the save failed; the person's value is kept, and Try again saves it. Each is
   * said once, politely.
   */
  status: FieldStatusValue;
  /** Called by Try again, after a failed save. Without it there is no Try again. */
  onRetry?: () => void;
}

/** Says where a field's save on change is: a spinner, then a tick that leaves, or that it failed. */
export const FieldStatus = ({ status, onRetry }: FieldStatusProps) => {
  const { field: words } = useI18n();
  const said = {
    idle: "",
    loading: words.statusLoading,
    success: words.statusSuccess,
    error: words.statusError,
  }[status];
  return (
    <div
      data-slot="field-status"
      data-status={status}
      className={cn(statusStyles.status)}
    >
      {status === "loading" && (
        <span aria-hidden="true" className={cn(statusStyles.mark)}>
          <Spinner />
        </span>
      )}
      {status === "success" && (
        <span
          aria-hidden="true"
          className={cn(statusStyles.mark, statusStyles.leaves)}
        >
          <Icon icon={CheckIcon} />
        </span>
      )}
      {/* Always there, so a screen reader hears it change. Not every one treats <output> as a live
          region. Only a failure is shown; saving and saved are said. */}
      <p
        role="status"
        className={cn(
          statusStyles.line,
          status === "error" ? statusStyles.failed : "sr-only"
        )}
      >
        {said}
        {status === "error" && onRetry !== undefined && (
          <span className={cn(statusStyles.retry)}>
            <Button size="xs" variant="ghost" onClick={onRetry}>
              {words.statusRetry}
            </Button>
          </span>
        )}
      </p>
    </div>
  );
};

// ---- FieldSet, FieldLegend, FieldGroup and FieldSeparator ---------------------------------------

const setStyles = {
  // A set after another stands under a hairline, with room under it.
  set: "block min-w-0 m-0 p-0 border-0 [border-top-style:solid] border-t-border not-first:border-t-[length:var(--damsko-hairline)] not-first:pt-4",
  // A legend floated the full width takes its place in the flow like any heading.
  legend: "float-start w-full m-0 p-0 font-sans font-medium",
  legendLook: "pb-3 text-base text-foreground",
  // A small muted name over a group of settings, on the rows' own start edge.
  labelLook: "pb-1 px-table-cell-inline text-xs text-muted-foreground",
  // Fields one under the other; settings meet, each under its hairline.
  group:
    "clear-both flex flex-col gap-y-form-gap has-[>[data-orientation=responsive]]:gap-y-0 min-w-0",
  // Each control its own width, beside its words while the name keeps its floor.
  fit: "[--damsko-field-columns:minmax(0,1fr)_auto] [--damsko-field-columns-narrow:minmax(0,1fr)_auto] [--damsko-field-display-narrow:flex]",
  separator:
    "clear-both relative flex items-center gap-3 min-h-hairline my-2 text-muted-foreground font-sans text-xs before:content-[''] before:grow before:h-hairline before:bg-border after:content-[''] after:grow after:h-hairline after:bg-border",
  // Without words, one line: the second half is not drawn.
  bare: "after:content-none",
};

/** Every prop a FieldSet takes: these, and the rest of UI SDK's FieldSet and a <fieldset>. */
export interface FieldSetProps extends Omit<
  ComponentProps<typeof FieldSetPrimitive>,
  "className" | "style" | "render"
> {
  /** A FieldLegend first, then a FieldDescription if it helps, then a FieldGroup of its Fields. */
  children: ReactNode;
  /**
   * Every field in it out of use at once, before any script runs.
   * @default false
   */
  disabled?: boolean;
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/**
 * Fields that belong together, under a legend, as a <fieldset>: a screen reader says the legend
 * with each field. A set after another stands under a hairline.
 */
export const FieldSet = ({ children, className, ...rest }: FieldSetProps) => (
  <FieldSetPrimitive {...rest} className={cn(setStyles.set, className)}>
    {children}
  </FieldSetPrimitive>
);

/** Every prop a FieldLegend takes. */
export interface FieldLegendProps {
  /** What the fields are about, in sentence case ("Notifications"). */
  children: ReactNode;
  /**
   * `legend`: the set's heading, in the body's size. `label`: a small muted name over a group of
   * settings, on the rows' start edge.
   * @default "legend"
   */
  variant?: "legend" | "label";
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/** Names a FieldSet. Keep it the set's first child. */
export const FieldLegend = ({
  children,
  variant = "legend",
  className,
}: FieldLegendProps) => (
  <FieldLegendPrimitive
    data-variant={variant}
    className={cn(
      setStyles.legend,
      variant === "legend" ? setStyles.legendLook : setStyles.labelLook,
      className
    )}
  >
    {children}
  </FieldLegendPrimitive>
);

/** Every prop a FieldGroup takes. */
export interface FieldGroupProps {
  /** Its Fields, one under the other. Responsive Fields meet, a hairline between them. */
  children: ReactNode;
  /**
   * How wide its responsive Fields' controls are: `column`, each fills the shared control column
   * and goes under its words in a narrow row; `fit`, each its own width on the end edge, beside its
   * words at any width while the name keeps its floor, as a settings page of selects, switches
   * and quiet actions has it.
   * @default "column"
   */
  controls?: "column" | "fit";
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/** Fields one under the other; settings in it share one end edge for their controls. */
export const FieldGroup = ({
  children,
  controls = "column",
  className,
}: FieldGroupProps) => (
  <FieldGroupPrimitive
    data-controls={controls}
    className={cn(
      setStyles.group,
      controls === "fit" && setStyles.fit,
      className
    )}
  >
    {children}
  </FieldGroupPrimitive>
);

/** Every prop a FieldSeparator takes. */
export interface FieldSeparatorProps {
  /** A word or two on the line, when it helps ("Or"). */
  children?: ReactNode;
  /** Where it sits: margins and alignment. */
  className?: LayoutClass;
}

/** A hairline between fields of one form, with a word on it if it helps. Not read: it only draws. */
export const FieldSeparator = ({
  children,
  className,
}: FieldSeparatorProps) => (
  <div
    data-slot="field-separator"
    aria-hidden={children === undefined ? true : undefined}
    className={cn(
      setStyles.separator,
      children === undefined && setStyles.bare,
      className
    )}
  >
    {children}
  </div>
);

// ---- useFieldControl ----------------------------------------------------------------------------

/** What the Field round a control hands it: its id, the words that describe it, and its state. */
export interface FieldControlProps {
  /** The id its FieldLabel names. */
  id?: string;
  /** The ids of its FieldDescription and of the FieldError that shows. */
  "aria-describedby"?: string;
  /** Its FieldLabel, for a control that is not a labelable element. */
  "aria-labelledby"?: string;
  /** Wrong, while the field shows an error. */
  "aria-invalid"?: boolean;
  /** Out of use, with its Field or FieldSet. */
  disabled?: boolean;
  /** The name it is sent under, when it has none of its own. */
  name?: string;
}

/** A string attribute UI SDK gave, or nothing. */
const stringOf = (value: unknown) =>
  typeof value === "string" && value !== "" ? value : undefined;

/**
 * The wiring of the Field round a control that is not one of ours (ours read it themselves): spread
 * it on the control. Null outside a Field.
 */
export const useFieldControl = (): FieldControlProps | null => {
  const field = useFieldControlPrimitive();
  const row = useContext(FieldControlIdContext);
  const off = useContext(FieldDisabledContext);
  const wrong = useContext(FieldInvalidContext);
  // In a grouped row: the row's id, its words by their ids, and its own state.
  if (row !== undefined) {
    const ids = getFieldIds(row);
    return {
      id: row,
      "aria-labelledby": ids.label,
      "aria-describedby": `${ids.description} ${ids.error}`,
      "aria-invalid": wrong || undefined,
      disabled: off || undefined,
    };
  }
  if (field === null) {
    return null;
  }
  const wired: Record<string, unknown> = field.props({});
  return {
    id: stringOf(wired.id),
    "aria-describedby": stringOf(wired["aria-describedby"]),
    "aria-labelledby": stringOf(wired["aria-labelledby"]),
    "aria-invalid": isInvalid(wired["aria-invalid"]) || undefined,
    disabled: field.disabled,
    name: field.name,
  };
};
