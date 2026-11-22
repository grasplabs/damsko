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
  box: { width: 400, maxWidth: "100%" },
});

// A page's name too long for the line is cut off, down to a few letters; its tooltip shows it whole.
export default function BreadcrumbLongPage() {
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
            </BreadcrumbEllipsis>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#reports">Quarterly reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Revenue by product line, second quarter, compared with the year
              before
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
