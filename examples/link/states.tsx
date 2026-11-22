import { Link } from "@grasp-os/ui/components/link";

// One link in one state. The docs draw it once per state; hover and keyboard focus are forced
// from the link's own CSS.
export default function LinkState({
  variant = "underline",
}: {
  variant?: "underline" | "plain";
}) {
  return (
    <Link href="#reports" variant={variant}>
      Quarterly report
    </Link>
  );
}
