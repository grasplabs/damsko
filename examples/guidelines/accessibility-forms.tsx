"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@grasp-os/ui/components/field";
import { Input } from "@grasp-os/ui/components/input";
import { media, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

import { heard, nameOf, useRead } from "./accessibility-fixtures";

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [media.md]: "minmax(0, 1fr) minmax(0, 1fr)",
    },
    gap: space["6"],
    alignItems: "start",
    width: "100%",
    maxWidth: 760,
    minWidth: 0,
  },
  form: {
    display: "grid",
    gap: space["5"],
    justifyItems: "start",
    minWidth: 0,
  },
  field: { width: "100%" },
});

// The field as a screen reader is given it, read from the page: its name from the label, required
// from the control, what describes it (the description, then the error while it shows) and
// whether it is wrong.
const read = (root: HTMLElement) => {
  const input = root.querySelector("input");
  if (input === null) {
    return "";
  }
  const described = (input.getAttribute("aria-describedby") ?? "")
    .split(/\s+/u)
    .map((id) =>
      id === "" ? "" : (document.getElementById(id)?.textContent ?? "").trim()
    )
    .filter((words) => words !== "");
  return [
    `${nameOf(input)}, edit text${input.required ? ", required" : ""}${input.getAttribute("aria-invalid") === "true" ? ", invalid entry" : ""}`,
    ...described,
  ].join("\n");
};

// Press Save email with the field empty: the error shows under the field, is tied to it and is
// said once. What was typed stays. Type an address and save again: the error goes.
export default function AccessibilityForms() {
  const id = useId();
  const lines = useRead(id, read);
  return (
    <div {...stylex.props(styles.grid)}>
      <form
        id={id}
        noValidate
        {...stylex.props(styles.form)}
        onSubmit={(event) => {
          event.preventDefault();
          event.currentTarget.checkValidity();
        }}
      >
        <Field name="billing-email" style={styles.field}>
          <FieldLabel>Billing email</FieldLabel>
          <Input type="email" autoComplete="email" required />
          <FieldDescription>Invoices go here.</FieldDescription>
          <FieldError match="valueMissing">
            Enter the email invoices go to.
          </FieldError>
          <FieldError match="typeMismatch">
            Enter an email address, such as finance@northwind.example.
          </FieldError>
        </Field>
        <Button type="submit" variant="secondary">
          Save email
        </Button>
      </form>
      <figure {...stylex.props(heard.box)}>
        <figcaption {...stylex.props(heard.title)}>
          What a screen reader hears on the field, read from the page
        </figcaption>
        <ol {...stylex.props(heard.list)}>
          {lines
            .split("\n")
            .filter(Boolean)
            .map((line) => (
              <li key={line}>{line}</li>
            ))}
        </ol>
      </figure>
    </div>
  );
}
