import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: 20, width: "100%", maxWidth: 384 },
});

export default function TextareaFieldStates() {
  return (
    <div {...stylex.props(layout.stack)}>
      <Field data-invalid>
        <FieldLabel>Summary</FieldLabel>
        <Textarea defaultValue="Ok" />
        <FieldError match>
          Write a sentence or two, so reviewers can follow.
        </FieldError>
      </Field>
      <Field disabled>
        <FieldLabel>Reply</FieldLabel>
        <Textarea defaultValue="Replies are closed for this thread." />
        <FieldDescription>The owner closed this thread.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel>Brief</FieldLabel>
        <Textarea
          readOnly
          defaultValue="Agreed with the client on 3 November. Changes go through the owner."
        />
      </Field>
    </div>
  );
}
