import { renderToStaticMarkup } from "react-dom/server";
// Audit B2: a checkbox's own error inside a group. A grouped row (a horizontal Field inside the
// group's Field) is no field of its own, so it says its error and its control points to it by id;
// it was once dropped without a word. Rendered on the server, no browser.
import { describe, expect, test } from "vitest";

import { Checkbox, CheckboxGroup } from "../src/components/checkbox.tsx";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "../src/components/field.tsx";
import { RadioGroup, RadioGroupItem } from "../src/components/radio-group.tsx";

describe("a choice in a group", () => {
  test("a checkbox in a group says its own error, and its control points to it", () => {
    const html = renderToStaticMarkup(
      <Field>
        <FieldLabel>Updates</FieldLabel>
        <CheckboxGroup>
          <Field orientation="horizontal" data-invalid>
            <Checkbox value="summary" />
            <FieldContent>
              <FieldLabel>Weekly summary</FieldLabel>
              <FieldError>Choose a day for the summary.</FieldError>
            </FieldContent>
          </Field>
        </CheckboxGroup>
      </Field>
    );
    expect(html).toContain("Choose a day for the summary.");
    const said = /id="(?<id>[^"]+)"[^>]*>Choose a day/u.exec(html)?.groups?.id;
    expect(said).toBeDefined();
    expect(html).toMatch(new RegExp(`aria-describedby="[^"]*${said}`, "u"));
    expect(html).toContain('aria-invalid="true"');
  });

  test("a checkbox in a group with no error says none", () => {
    const html = renderToStaticMarkup(
      <Field>
        <FieldLabel>Updates</FieldLabel>
        <CheckboxGroup>
          <Field orientation="horizontal">
            <Checkbox value="summary" />
            <FieldLabel>Weekly summary</FieldLabel>
          </Field>
        </CheckboxGroup>
      </Field>
    );
    expect(html).not.toContain('aria-invalid="true"');
  });

  test("a radio group that is wrong says so on the group, with its error", () => {
    const html = renderToStaticMarkup(
      <Field data-invalid>
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup>
          <Field orientation="horizontal">
            <RadioGroupItem value="a" />
            <FieldLabel>A</FieldLabel>
          </Field>
        </RadioGroup>
        <FieldError>Choose a plan.</FieldError>
      </Field>
    );
    expect(html).toMatch(/role="radiogroup"[^>]*aria-invalid="true"/u);
    expect(html).toContain("Choose a plan.");
  });
});
