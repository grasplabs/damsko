import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { Switch } from "@grasp-os/ui/components/switch";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  control: { width: "100%" },
});

// Settings on a page, not in a card: a FieldSet named by a small legend over its rows, a hairline
// between them.
export default function FieldLegendExample() {
  return (
    <div {...stylex.props(layout.box)}>
      <FieldSet>
        <FieldLegend variant="label">Organization</FieldLegend>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Name</FieldLabel>
              <FieldDescription>Your company's name.</FieldDescription>
            </FieldContent>
            <Input
              size="sm"
              defaultValue="Contoso Finance"
              style={layout.control}
            />
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>Weekly summary</FieldLabel>
              <FieldDescription>
                An email every Monday with what changed.
              </FieldDescription>
            </FieldContent>
            <Switch defaultChecked />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
}
