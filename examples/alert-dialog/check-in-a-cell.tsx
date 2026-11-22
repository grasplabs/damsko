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

// Opened from a cell whose words line up at the end, as a table's actions do. The panel sets its own
// alignment, so its words start where they always start.
export default function AlertDialogCheckInACell() {
  return (
    <table>
      <tbody>
        <tr>
          <td>Ana Ruiz</td>
          <td align="right">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Icon icon={TrashIcon} />
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Ana Ruiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    She loses access to Northwind and its 12 projects at once.
                    You can invite her again later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep her</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" value="confirm">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
