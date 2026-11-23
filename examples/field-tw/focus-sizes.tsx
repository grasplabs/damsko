import { Input, PasswordInput } from "@grasp-os/ui/components-tw/input";
import { Combobox } from "@grasp-os/ui/components/combobox";
import { DatePicker } from "@grasp-os/ui/components/date-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@grasp-os/ui/components/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@grasp-os/ui/components/input-otp";
import { NumberField } from "@grasp-os/ui/components/number-field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import type { SelectVariant } from "@grasp-os/ui/components/select";
import { TagsInput } from "@grasp-os/ui/components/tags-input";
import { Textarea } from "@grasp-os/ui/components/textarea";

type Size = "sm" | "default" | "lg";
const sizes: Size[] = ["sm", "default", "lg"];
const teams = ["Design", "Engineering", "Finance", "Operations"];
const countries = ["France", "Germany", "Netherlands", "Spain"];

const select = (label: string, size: Size, variant: SelectVariant) => (
  <Select items={teams} defaultValue="Finance">
    <SelectTrigger aria-label={label} size={size} variant={variant}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent />
  </Select>
);

const code = (label: string, size: "default" | "lg") => (
  <InputOTP maxLength={4} aria-label={label} size={size} defaultValue="42">
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
      <InputOTPSlot index={3} />
    </InputOTPGroup>
  </InputOTP>
);

// Each text field at each of its sizes, and the variants that change how it is drawn, so every one
// can be shown to take the same focus: its hairline a step darker and a faint halo, no ring.
const kinds: {
  kind: string;
  cells: (size: Size, label: string) => React.ReactNode;
}[] = [
  {
    kind: "Input",
    cells: (size, label) => (
      <Input aria-label={label} size={size} defaultValue="Invoice chaser" />
    ),
  },
  {
    kind: "Input mono",
    cells: (size, label) => (
      <Input aria-label={label} size={size} mono defaultValue="0 9 * * 1" />
    ),
  },
  {
    kind: "Password",
    cells: (size, label) => (
      <PasswordInput
        aria-label={label}
        size={size}
        defaultValue="correct horse"
      />
    ),
  },
  { kind: "Select", cells: (size, label) => select(label, size, "default") },
  { kind: "Select text", cells: (size, label) => select(label, size, "ghost") },
  {
    kind: "Input group",
    cells: (size, label) => (
      <InputGroup size={size}>
        <InputGroupAddon>
          <InputGroupText>example.com/</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label={label} defaultValue="finance" />
      </InputGroup>
    ),
  },
  {
    kind: "Combobox",
    cells: (size, label) => (
      <Combobox
        aria-label={label}
        size={size}
        items={countries}
        placeholder="Search countries"
      />
    ),
  },
  {
    kind: "Number",
    cells: (size, label) => (
      <NumberField
        aria-label={label}
        size={size}
        min={1}
        max={50}
        defaultValue={5}
      />
    ),
  },
  {
    kind: "Tag input",
    cells: (size, label) => (
      <TagsInput
        aria-label={label}
        size={size}
        defaultValue={["Finance"]}
        placeholder="Add a label"
      />
    ),
  },
  {
    kind: "Date picker",
    cells: (size, label) => (
      <DatePicker aria-label={label} size={size} defaultValue="2026-11-20" />
    ),
  },
  {
    kind: "Textarea",
    cells: (size, label) =>
      size === "default" ? (
        <Textarea
          aria-label={label}
          rows={2}
          defaultValue="Ask the team before Friday."
        />
      ) : null,
  },
  {
    kind: "Textarea mono",
    cells: (size, label) =>
      size === "default" ? (
        <Textarea
          aria-label={label}
          rows={2}
          mono
          defaultValue='{ "team": "finance" }'
        />
      ) : null,
  },
  {
    kind: "Code",
    cells: (size, label) => (size === "sm" ? null : code(label, size)),
  },
];

export default function FieldFocusSizes() {
  return (
    <div className="grid w-full max-w-[840px] grid-cols-[repeat(3,minmax(0,1fr))] items-start gap-4">
      {kinds.flatMap(({ kind, cells }) =>
        sizes.map((size) => {
          const cell = cells(size, `${kind}, ${size}`);
          return (
            <div
              key={`${kind}-${size}`}
              data-field-focus={cell === null ? undefined : kind}
              data-field-size={size}
            >
              {cell}
            </div>
          );
        })
      )}
    </div>
  );
}
