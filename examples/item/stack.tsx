import {
  Item,
  ItemContent,
  ItemDetail,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@grasp-os/ui/components/item";
import { SidePanelSection } from "@grasp-os/ui/components/side-panel";
import { FileIcon, Icon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";
import { Fragment } from "react";

const layout = stylex.create({
  section: { width: "100%", maxWidth: 560 },
});

const files = [
  {
    id: "notes",
    name: "Notes from the planning day with the whole team",
    detail: "Upload · Only you · 24 Nov 2026",
  },
  {
    id: "plan",
    name: "Quarterly plan",
    detail: "Shared drive · Everyone · 12 Nov 2026",
  },
];

// A card of files that open, where the name matters as much as the detail: with `stack`, a list
// narrower than 30rem (a phone) puts each row's detail on a line under its name and lets the name
// wrap whole; wider, the detail stands at the row's end.
export default function ItemStack() {
  return (
    <SidePanelSection title="Files" style={layout.section}>
      <ItemGroup aria-label="Files" stack>
        {files.map((file, index) => (
          <Fragment key={file.id}>
            {index > 0 && <ItemSeparator />}
            <Item size="xs" href={`#${file.id}`}>
              <ItemMedia>
                <Icon icon={FileIcon} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {file.name}
                  <ItemDetail>{file.detail}</ItemDetail>
                </ItemTitle>
              </ItemContent>
            </Item>
          </Fragment>
        ))}
      </ItemGroup>
    </SidePanelSection>
  );
}
