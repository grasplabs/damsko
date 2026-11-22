import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import * as stylex from "@stylexjs/stylex";

import { Not, Pair, Write } from "./pair";
import { writing } from "./writing-fixtures";

// The error under its field says what to do. The wrong ones name a fault, or the person who made it.
export default function WritingErrors() {
  return (
    <Pair>
      <Write why="what to do">
        <div {...stylex.props(writing.column)}>
          <Field data-invalid>
            <FieldLabel>Work email</FieldLabel>
            <Input type="email" defaultValue="amara@" />
            <FieldError match>
              Enter your work email, such as amara@northwind.example.
            </FieldError>
          </Field>
        </div>
      </Write>
      <Not why="a fault, or blame">
        <div {...stylex.props(writing.column)}>
          <Field data-invalid>
            <FieldLabel>Work email</FieldLabel>
            <Input type="email" defaultValue="amara@" />
            <FieldError match>Invalid input</FieldError>
          </Field>
          <Field data-invalid>
            <FieldLabel>Work email</FieldLabel>
            <Input type="email" defaultValue="amara@" />
            <FieldError match>You entered an invalid email.</FieldError>
          </Field>
        </div>
      </Not>
    </Pair>
  );
}
