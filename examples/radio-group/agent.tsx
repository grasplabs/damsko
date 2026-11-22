import { Field, FieldLabel, FieldError } from "@grasp-os/ui/components/field";
import {
  RadioGroupItem,
  RadioGroup,
} from "@grasp-os/ui/components/radio-group";
import * as stylex from "@stylexjs/stylex";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, driven by tests/radio-group.spec.ts. It puts UI SDK's
// agent bridge on the window, so the spec can ask what an agent sees (the group by its name, its
// choices, its value) and choose by name. The form is for the required check and what it sends.
pageAgent();

// The two groups side by side, their headings on one line: each from the top, not centred against
// the other's height.
const layout = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 32 },
});

export default function RadioGroupAgent() {
  return (
    <div {...stylex.props(layout.row)}>
      <Field>
        <FieldLabel>Summary email</FieldLabel>
        <RadioGroup name="summary" defaultValue="weekly">
          <Field orientation="horizontal">
            <RadioGroupItem value="daily" />
            <FieldLabel>Daily</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem value="weekly" />
            <FieldLabel>Weekly</FieldLabel>
          </Field>
          <Field orientation="horizontal" disabled>
            <RadioGroupItem value="never" />
            <FieldLabel>Never</FieldLabel>
          </Field>
        </RadioGroup>
      </Field>
      <form
        id="export"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <Field>
          <FieldLabel>File type</FieldLabel>
          <RadioGroup name="format" required>
            <Field orientation="horizontal">
              <RadioGroupItem value="csv" />
              <FieldLabel>CSV</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="xlsx" />
              <FieldLabel>Excel</FieldLabel>
            </Field>
          </RadioGroup>
          <FieldError>Choose a file type.</FieldError>
        </Field>
      </form>
    </div>
  );
}
