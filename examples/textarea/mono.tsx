import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Textarea } from "@grasp-os/ui/components/textarea";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  form: { display: "grid", gap: space[5], width: "100%", maxWidth: 440 },
});

const body = `{
  "report": "weekly-numbers",
  "send_to": ["finance@contoso.example"],
  "include_late_invoices": true
}`;

// Words a machine reads, in the mono face: a workflow's schedule as a cron line, and the JSON it
// sends. A step smaller on the same lines, so each field keeps the height of its sans neighbours.
export default function TextareaMono() {
  return (
    <div {...stylex.props(layout.form)}>
      <Field name="schedule">
        <FieldLabel>Schedule</FieldLabel>
        <Input mono defaultValue="0 8 * * 1" />
        <FieldDescription>Every Monday at 08:00, in cron.</FieldDescription>
      </Field>
      <Field name="body">
        <FieldLabel>Request body</FieldLabel>
        <Textarea mono rows={5} defaultValue={body} />
        <FieldDescription>Sent as JSON with each run.</FieldDescription>
      </Field>
    </div>
  );
}
