import { Link } from "@grasp-os/ui/components/link";

// On its own line: foreground and medium, underlined under the pointer. The words say where it goes.
export default function LinkStandalone() {
  return (
    <Link href="#reports" variant="plain">
      View all reports
    </Link>
  );
}
