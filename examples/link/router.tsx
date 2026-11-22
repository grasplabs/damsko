import { Link } from "@grasp-os/ui/components/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

// A router's own link, as a product has one (React Router's or TanStack's `Link`): a stand-in here
// that draws an `a` from its `to`. Given as the child with `asChild`, it is the element: one link,
// the look on it, its own props and words kept, no wrapper.
const RouterLink = ({
  to,
  ...rest
}: {
  to: string;
  children?: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a {...rest} href={to} data-router-link="" />
);

export default function LinkRouter() {
  return (
    <p>
      Every change is in the{" "}
      <Link asChild>
        <RouterLink to="#activity">activity log</RouterLink>
      </Link>
      , newest first.
    </p>
  );
}
