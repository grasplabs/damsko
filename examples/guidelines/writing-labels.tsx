import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// The label names the field and stays while someone types; the placeholder is an example of an
// answer. Wrong: the placeholder as the label and the instruction, gone at the first letter.
export default function WritingLabels() {
  return (
    <Pair>
      <Write why="a label that stays, an example inside">
        <div {...stylex.props(writing.column)}>
          <Field>
            <FieldLabel>Work email</FieldLabel>
            <Input type="email" placeholder="amara@northwind.example" />
            <FieldDescription>
              The invite goes to this address.
            </FieldDescription>
          </Field>
        </div>
      </Write>
      <Not why="the placeholder as the label">
        <div {...stylex.props(writing.column)}>
          <Field>
            <Input
              type="email"
              placeholder="Enter your work email to receive the invite"
            />
          </Field>
        </div>
      </Not>
    </Pair>
  );
}
