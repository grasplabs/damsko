import { Button } from "@grasp-os/ui/components-tw/button";
import { EllipsisIcon, FolderIcon, Icon } from "@grasp-os/ui/lib-tw/icons";

// A long name in a narrow head: on one line, cut with an ellipsis, whole in its name.
export default function ButtonTruncate() {
  return (
    <div className="grid justify-items-start gap-3">
      <div
        role="group"
        aria-label="Narrow head"
        className="corner-squircle bg-card shadow-edge box-border flex w-[120px] items-center gap-1 rounded-xl px-2 py-1"
      >
        <Button truncate size="sm" variant="ghost">
          <Icon icon={FolderIcon} />
          Quarterly planning
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More actions">
          <Icon icon={EllipsisIcon} />
        </Button>
      </div>
      <div
        role="group"
        aria-label="Wide head"
        className="corner-squircle bg-card shadow-edge box-border flex w-[240px] items-center gap-1 rounded-xl px-2 py-1"
      >
        <Button truncate size="sm" variant="ghost">
          <Icon icon={FolderIcon} />
          Quarterly planning
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="More actions">
          <Icon icon={EllipsisIcon} />
        </Button>
      </div>
    </div>
  );
}
