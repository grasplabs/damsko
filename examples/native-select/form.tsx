"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldError, FieldLabel } from "@grasp-os/ui/components/field";
import { Form, FormFooter } from "@grasp-os/ui/components/form";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import { Text } from "@grasp-os/ui/components/text";
import { useState } from "react";

// In a form it is a <select>: sent under its Field's name, required until a value other than ""
// is chosen (its FieldError says so after a send), and back to its first value on a reset.
export default function NativeSelectForm() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <Form
      aria-label="New release"
      onSubmit={(event) => {
        event.preventDefault();
        const channel = new FormData(event.currentTarget).get("channel");
        setSent(typeof channel === "string" ? channel : null);
      }}
      onReset={() => {
        setSent(null);
      }}
    >
      <Field name="channel">
        <FieldLabel>Release channel</FieldLabel>
        <NativeSelect defaultValue="" required>
          <NativeSelectOption value="">Choose a channel</NativeSelectOption>
          <NativeSelectOption value="stable">Stable</NativeSelectOption>
          <NativeSelectOption value="beta">Beta</NativeSelectOption>
        </NativeSelect>
        <FieldError match="valueMissing">
          Choose the channel this release goes to.
        </FieldError>
      </Field>
      <div role="status">
        {sent !== null && (
          <Text size="sm" color="muted">
            Sent: {sent}
          </Text>
        )}
      </div>
      <FormFooter>
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit" variant="default">
          Publish
        </Button>
      </FormFooter>
    </Form>
  );
}
