"use client";

import { Badge } from "@grasp-os/ui/components/badge";
import { Button } from "@grasp-os/ui/components/button";
import { Combobox } from "@grasp-os/ui/components/combobox";
import { Input } from "@grasp-os/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@grasp-os/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@grasp-os/ui/components/toggle-group";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  stack: { display: "grid", gap: space["6"], width: "100%" },
  // Three fields on the first line; the field with a badge and the two Buttons on the second. On a
  // phone two a line, the Buttons on their own.
  row: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(3, minmax(0, 1fr))",
      [media.maxSm]: "repeat(2, minmax(0, 1fr))",
    },
    alignItems: "center",
    columnGap: space["2"],
    rowGap: space["4"],
  },
  part: { display: "contents" },
  actions: {
    gridColumn: "span 2",
    display: "flex",
    alignItems: "center",
    gap: space["2"],
  },
  fill: { width: "100%" },
});

const sizes = ["sm", "default", "lg"] as const;
const languages = ["English", "Nederlands", "Deutsch"];
const zones = ["Amsterdam", "London", "New York"];

// Every field part and a Button side by side at each size: one height and one text style a size,
// whatever the part.
export default function ControlsFieldRow() {
  return (
    <div {...stylex.props(layout.stack)}>
      {sizes.map((size) => (
        <div key={size} data-field-row={size} {...stylex.props(layout.row)}>
          <span data-part="Input" {...stylex.props(layout.part)}>
            <Input
              size={size}
              aria-label="Name"
              defaultValue="Sanne de Wit"
              style={layout.fill}
            />
          </span>
          <span data-part="Select" {...stylex.props(layout.part)}>
            <Select items={languages} defaultValue="English">
              <SelectTrigger
                size={size}
                aria-label="Language"
                style={layout.fill}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </span>
          <span data-part="Combobox" {...stylex.props(layout.part)}>
            <Combobox
              size={size}
              items={zones}
              defaultValue="Amsterdam"
              aria-label="Time zone"
              style={layout.fill}
            />
          </span>
          <span data-part="Input group" {...stylex.props(layout.part)}>
            <InputGroup size={size} style={layout.fill}>
              <InputGroupInput
                aria-label="Email"
                defaultValue="sanne@example.com"
              />
              <InputGroupAddon align="inline-end">
                <Badge>Admin</Badge>
              </InputGroupAddon>
            </InputGroup>
          </span>
          <div {...stylex.props(layout.actions)}>
            <span data-part="Button, outline" {...stylex.props(layout.part)}>
              <Button size={size} variant="outline">
                Settings
              </Button>
            </span>
            <span data-part="Button, default" {...stylex.props(layout.part)}>
              <Button size={size} variant="default">
                Connect
              </Button>
            </span>
            <span
              data-toggle-part="Toggle group"
              {...stylex.props(layout.part)}
            >
              <ToggleGroup
                size={size}
                aria-label="Days"
                defaultValue={["mon"]}
                multiple
              >
                <ToggleGroupItem value="mon">Mon</ToggleGroupItem>
                <ToggleGroupItem value="tue">Tue</ToggleGroupItem>
                <ToggleGroupItem value="wed">Wed</ToggleGroupItem>
              </ToggleGroup>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
