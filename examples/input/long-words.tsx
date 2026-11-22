import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Card, CardDescription, CardTitle } from "@grasp-os/ui/components/card";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "start",
    gap: space[4],
  },
  narrow: { width: 132 },
});

// How interface words break, in narrow columns: a long Dutch compound (lang="nl") breaks with a
// hyphen, in a Label and a Card; a short English word ("already") is never cut, in a FieldError; a
// Button's and a Badge's short words stay whole.
export default function InputLongWords() {
  return (
    <div {...stylex.props(layout.row)}>
      <div lang="nl" data-case="label" {...stylex.props(layout.narrow)}>
        <Field>
          <FieldLabel>Aansprakelijkheidsverzekering</FieldLabel>
          <Input defaultValue="" />
        </Field>
      </div>
      <div data-case="error" {...stylex.props(layout.narrow)}>
        <Field data-invalid>
          <FieldLabel>Email</FieldLabel>
          <Input defaultValue="amara@contoso.example" />
          <FieldError match>This address is already invited.</FieldError>
        </Field>
      </div>
      <div lang="nl" data-case="card" {...stylex.props(layout.narrow)}>
        <Card>
          <CardTitle>Polis</CardTitle>
          <CardDescription>
            Aansprakelijkheidsverzekering voor bedrijven
          </CardDescription>
        </Card>
      </div>
      <div data-case="button" {...stylex.props(layout.narrow)}>
        <Button variant="outline">Already sent</Button>
      </div>
      <div data-case="badge" {...stylex.props(layout.narrow)}>
        <Badge variant="warning">Already waiting</Badge>
      </div>
    </div>
  );
}
