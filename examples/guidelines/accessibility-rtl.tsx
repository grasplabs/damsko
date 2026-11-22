"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@grasp-os/ui/components/breadcrumb";
import { Button } from "@grasp-os/ui/components/button";
import { Field, FieldLabel } from "@grasp-os/ui/components/field";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationPage,
  PaginationNext,
} from "@grasp-os/ui/components/pagination";
import { Switch } from "@grasp-os/ui/components/switch";
import { Icon, SearchIcon } from "@grasp-os/ui/lib/icons";
import { colors, font, size, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const styles = stylex.create({
  column: {
    display: "grid",
    gap: space["5"],
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
  },
  box: {
    display: "grid",
    gap: space["4"],
    justifyItems: "start",
    minWidth: 0,
    paddingBlock: space["4"],
    borderBlockStartWidth: size.hairline,
    borderBlockStartStyle: "solid",
    borderBlockStartColor: colors.border,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space["3"],
  },
  size: {
    margin: 0,
    fontFamily: font.sans,
    fontSize: font.textSm,
    lineHeight: font.textSmLine,
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
  },
});

// Turn on Right to left: the parts below take dir="rtl" and mirror by themselves, with no style of
// their own. The chevrons turn, the search glass does not, and 12 MB keeps its number before its unit.
export default function AccessibilityRtl() {
  const [rtl, setRtl] = useState(false);
  return (
    <div {...stylex.props(styles.column)}>
      <Field orientation="horizontal">
        <FieldLabel>Right to left</FieldLabel>
        <Switch
          checked={rtl}
          onCheckedChange={(on) => {
            setRtl(on);
          }}
        />
      </Field>
      <div dir={rtl ? "rtl" : undefined} {...stylex.props(styles.box)}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#reports">Reports</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#quarterly">Quarterly</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Q3 summary</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div {...stylex.props(styles.row)}>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Search the reports"
          >
            <Icon icon={SearchIcon} />
          </Button>
          <p {...stylex.props(styles.size)}>12 MB of 50 MB</p>
        </div>
        <Pagination
          total={60}
          pageSize={10}
          defaultPage={2}
          aria-label="Report pages"
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationPage />
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
