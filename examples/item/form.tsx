"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import {
  NativeSelect,
  NativeSelectOption,
} from "@grasp-os/ui/components/native-select";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  list: { width: "100%", maxWidth: 560 },
  form: { display: "flex", alignItems: "center", gap: space["2"] },
});

const versions = ["4.3", "4.2", "4.1"];

/** One channel: its release, and a form that releases another to it. */
const Channel = ({ name, start }: { name: string; start: string }) => {
  const [release, setRelease] = useState(start);
  return (
    <Item>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
        <ItemDescription>{`Version ${release}`}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <form
          aria-label={`Release to ${name}`}
          onSubmit={(event) => {
            event.preventDefault();
            const chosen = new FormData(event.currentTarget).get("version");
            if (typeof chosen === "string") {
              setRelease(chosen);
            }
          }}
          {...stylex.props(layout.form)}
        >
          <NativeSelect
            aria-label="Version"
            name="version"
            defaultValue={versions[0]}
            size="sm"
          >
            {versions.map((version) => (
              <NativeSelectOption key={version} value={version}>
                {version}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <Button type="submit" size="sm" variant="outline">
            Release
          </Button>
        </form>
      </ItemActions>
    </Item>
  );
};

// A form in a row: each channel's actions are a small form, a version and the Release button
// that sends it. ItemContent, ItemActions, ItemHeader and ItemFooter are
// blocks, so a form or a list stands in them as it would anywhere.
export default function ItemForm() {
  return (
    <ItemGroup aria-label="Release channels" separated style={layout.list}>
      <Channel name="Stable" start="4.1" />
      <Channel name="Beta" start="4.2" />
    </ItemGroup>
  );
}
