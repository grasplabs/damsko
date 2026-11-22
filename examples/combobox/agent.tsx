import { Combobox } from "@grasp-os/ui/components/combobox";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";

import { pageAgent } from "../../site/behaviour/agent";

// The agent fixture: not shown on the page, used by tests/combobox.spec.ts. An agent bridge over
// two comboboxes, so the spec can prove an agent finds each by its label, reads its choices and
// its value, chooses by an item's label, and is refused a value that is not in the list.
pageAgent();

const countries = [
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "nl", label: "Netherlands" },
];

export default function ComboboxAgent() {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
      style={{ display: "grid", gap: 16, width: 280 }}
    >
      <Field name="country">
        <FieldLabel>Country</FieldLabel>
        <Combobox items={countries} defaultValue="fr" />
      </Field>
      <Field name="team">
        <FieldLabel>Team</FieldLabel>
        <Combobox
          items={["Design", "Engineering", "Sales"]}
          placeholder="Search teams"
        />
      </Field>
    </form>
  );
}
