import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Textarea } from "@grasp-os/ui/components/textarea";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  form: { width: "100%", maxWidth: 384 },
});

// Cmd or Ctrl+Enter sends the form it is in. Press it while empty: the error shows and the field
// keeps focus.
export default function TextareaSend() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      {...stylex.props(layout.form)}
    >
      <Field name="reason">
        <FieldLabel>Reason for the change</FieldLabel>
        <Textarea
          required
          submitShortcut="mod+enter"
          placeholder="What changed, and why?"
        />
        <FieldError match="valueMissing">
          Say why, so reviewers can follow.
        </FieldError>
      </Field>
    </form>
  );
}
