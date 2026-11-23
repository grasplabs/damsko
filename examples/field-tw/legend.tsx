import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@grasp-os/ui/components-tw/field";
import { Input } from "@grasp-os/ui/components-tw/input";
import { Switch } from "@grasp-os/ui/components/switch";

// Settings on a page, not in a card: a FieldSet named by a small legend over its rows, a hairline
// between them.
export default function FieldLegendExample() {
  return (
    <div className="w-full max-w-[720px]">
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
              className="w-full"
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
