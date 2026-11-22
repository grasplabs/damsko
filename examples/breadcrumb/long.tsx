import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@grasp-os/ui/components/breadcrumb";
import { DropdownMenuItem } from "@grasp-os/ui/components/dropdown-menu";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  box: { width: 480, maxWidth: "100%" },
});

// A long path keeps its first level and the parent; the levels between wait in the "…" menu, as
// links, in the path's order.
export default function BreadcrumbLong() {
  return (
    <div {...stylex.props(styles.box)}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#workspace">Workspace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis>
              <DropdownMenuItem asChild>
                <a href="#customers">Customers in the north region</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#accounts">Accounts</a>
              </DropdownMenuItem>
            </BreadcrumbEllipsis>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#reports">Quarterly reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Revenue by product line</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
