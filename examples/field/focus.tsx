import { Combobox } from "@grasp-os/ui/components/combobox";
import { Field } from "@grasp-os/ui/components/field";
import { Input, PasswordInput } from "@grasp-os/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@grasp-os/ui/components/input-group";
import { NumberField } from "@grasp-os/ui/components/number-field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import { Textarea } from "@grasp-os/ui/components/textarea";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: space[4],
    width: "100%",
    maxWidth: 720,
    alignItems: "start",
  },
});

const teams = ["Design", "Engineering", "Finance", "Operations"];
const countries = ["France", "Germany", "Netherlands", "Spain"];

type State = "rest" | "invalid" | "disabled";
const states: State[] = ["rest", "invalid", "disabled"];

const field = (kind: string, state: State) => {
  const label = `${kind}, ${state}`;
  switch (kind) {
    case "Input": {
      return <Input aria-label={label} defaultValue="Mara Jensen" />;
    }
    case "Password": {
      return <PasswordInput aria-label={label} defaultValue="correct horse" />;
    }
    case "Textarea": {
      return (
        <Textarea
          aria-label={label}
          defaultValue="Ask the team before Friday."
          rows={2}
        />
      );
    }
    case "Select": {
      return (
        <Select items={teams} defaultValue="Finance">
          <SelectTrigger aria-label={label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent />
        </Select>
      );
    }
    case "Input group": {
      return (
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>example.com/</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label={label} defaultValue="finance" />
        </InputGroup>
      );
    }
    case "Combobox": {
      return (
        <Combobox
          aria-label={label}
          items={countries}
          placeholder="Search countries"
        />
      );
    }
    default: {
      return (
        <NumberField aria-label={label} min={1} max={50} defaultValue={5} />
      );
    }
  }
};

const kinds = [
  "Input",
  "Password",
  "Textarea",
  "Select",
  "Input group",
  "Combobox",
  "Number",
];

// Every text field at rest, wrong and out of use, side by side, so their focus reads alike: press
// or Tab into one and its hairline goes a step darker with a faint halo round it, no ring.
export default function FieldFocus() {
  return (
    <div {...stylex.props(layout.grid)}>
      {kinds.flatMap((kind) =>
        states.map((state) => (
          <div
            key={`${kind}-${state}`}
            data-field-focus={kind}
            data-field-state={state}
          >
            <Field
              data-invalid={state === "invalid" || undefined}
              disabled={state === "disabled"}
            >
              {field(kind, state)}
            </Field>
          </div>
        ))
      )}
    </div>
  );
}
