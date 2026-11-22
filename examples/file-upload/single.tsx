import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { FileUpload } from "@grasp-os/ui/components/file-upload";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  field: { width: "100%", maxWidth: 440 },
});

// One file, sent with the form: a new one takes the place of the one there. Without script it is a
// plain file field.
export default function FileUploadSingle() {
  return (
    <Field name="logo" style={layout.field}>
      <FieldLabel>Logo</FieldLabel>
      <FileUpload
        accept={["image/png", "image/svg+xml"]}
        maxFileSize={2_000_000}
        description="PNG or SVG, up to 2 MB"
      />
      <FieldDescription>
        Shown at the top of every shared report.
      </FieldDescription>
    </Field>
  );
}
