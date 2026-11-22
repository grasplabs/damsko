"use client";

import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { NumberField } from "@grasp-os/ui/components/number-field";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  stack: { display: "grid", gap: 16, width: "100%", maxWidth: 240 },
});

const left = 12;

// More than there is: the field says so and why. Read only and disabled below it.
export default function NumberFieldStates() {
  const [tickets, setTickets] = useState<number | null>(14);
  const tooMany = tickets !== null && tickets > left;
  return (
    <div {...stylex.props(layout.stack)}>
      <Field name="tickets" data-invalid={tooMany}>
        <FieldLabel>Tickets</FieldLabel>
        <NumberField min={1} value={tickets} onValueChange={setTickets} />
        {tooMany ? (
          <FieldError match>Only {left} tickets are left.</FieldError>
        ) : null}
      </Field>
      <Field name="year">
        <FieldLabel>Year</FieldLabel>
        <NumberField
          readOnly
          defaultValue={2026}
          format={{ useGrouping: false }}
        />
      </Field>
      <Field name="copies" disabled>
        <FieldLabel>Copies</FieldLabel>
        <NumberField defaultValue={1} />
      </Field>
    </div>
  );
}
