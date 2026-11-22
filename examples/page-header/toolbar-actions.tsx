"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupClear,
  InputGroupInput,
} from "@grasp-os/ui/components/input-group";
import {
  PageHeader,
  PageHeaderToolbar,
} from "@grasp-os/ui/components/page-header";
import { Icon, PlusIcon, SearchIcon } from "@grasp-os/ui/lib/icons";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 720 },
  search: { flexGrow: 1 },
});

// A search and the page's own action under the title, with no kinds to browse: the search takes the room.
export default function PageHeaderToolbarActions() {
  return (
    <PageHeader
      title="Blueprints"
      size="sm"
      style={layout.box}
      toolbar={
        <PageHeaderToolbar
          start={
            <InputGroup style={layout.search}>
              <InputGroupAddon>
                <Icon icon={SearchIcon} />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                aria-label="Search blueprints"
                placeholder="Search blueprints"
              />
              <InputGroupClear aria-label="Clear search" />
            </InputGroup>
          }
          end={
            <Button>
              <Icon icon={PlusIcon} />
              New blueprint
            </Button>
          }
        />
      }
    />
  );
}
