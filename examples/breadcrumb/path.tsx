import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@grasp-os/ui/components/breadcrumb";

// A file's path, shown beside the file in a list: none of its steps is a link, and none is the page
// you are on, so each is a BreadcrumbLink without `href` and none is a BreadcrumbPage.
export default function BreadcrumbPath() {
  return (
    <Breadcrumb aria-label="Where the file is">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Finance</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Invoices 2026</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>march-northwind.pdf</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
