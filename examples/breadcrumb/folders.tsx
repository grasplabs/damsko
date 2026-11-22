import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

const styles = stylex.create({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: 480,
    maxWidth: "100%",
  },
  folders: { display: "flex", flexWrap: "wrap", gap: 4 },
});

const inside: Record<string, string[]> = {
  Places: ["SharePoint", "OneDrive"],
  SharePoint: ["Policies", "Contracts"],
  OneDrive: ["Notes"],
  Policies: ["Leave", "Travel"],
};

// A folder picker's trail, inside a dialog: a step opens that folder again in place, with no page to
// go to, so each step is a button, given with `asChild`. The folder you are in is the page.
export default function BreadcrumbFolders() {
  const [trail, setTrail] = useState(["Places", "SharePoint", "Policies"]);
  const here = trail.at(-1) ?? "Places";
  return (
    <div {...stylex.props(styles.box)}>
      <Breadcrumb aria-label="Folder">
        <BreadcrumbList>
          {trail.map((folder, at) => (
            <Fragment key={folder}>
              {at > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {at === trail.length - 1 ? (
                  <BreadcrumbPage>{folder}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setTrail(trail.slice(0, at + 1));
                      }}
                    >
                      {folder}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div {...stylex.props(styles.folders)}>
        {(inside[here] ?? []).map((folder) => (
          <Button
            key={folder}
            variant="ghost"
            size="sm"
            onClick={() => {
              setTrail([...trail, folder]);
            }}
          >
            {folder}
          </Button>
        ))}
      </div>
    </div>
  );
}
