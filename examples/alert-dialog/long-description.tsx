import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import { Icon, TrashIcon } from "@grasp-os/ui/lib/icons";

// When what is lost is long, the description wraps, and past the window's height it scrolls on
// its own while the question and the answers stay put.
export default function AlertDialogLongDescription() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Icon icon={TrashIcon} />
          Delete organisation
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete Northwind Trading and everything in it?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Its 4 workspaces, 48 projects and 2,310 files are deleted for
            everyone, with every comment, review and version history. The 36
            members lose access at once, and the links they shared stop working.
            Scheduled reports stop, the connections to Slack and Google Drive
            are removed, and the billing plan ends today without a refund.
            Exports made earlier stay where they were saved. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            value="confirm"
            agentConfirm="Deletes the organisation Northwind Trading and all its workspaces"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
