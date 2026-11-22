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

import { Not, Pair, Write } from "./pair";

// Each question as a product asks it: press Delete project to open it. The right one names the
// thing and what is lost, and is answered with its verb.
const Question = ({
  title,
  description,
  keep,
  confirm,
}: {
  title: string;
  description: string;
  keep: string;
  confirm: string;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">
        <Icon icon={TrashIcon} />
        Delete project
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{keep}</AlertDialogCancel>
        <AlertDialogAction variant="destructive" value="confirm">
          {confirm}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default function WritingQuestions() {
  return (
    <Pair>
      <Write why="names it, answered with its verb">
        <Question
          title="Delete Quarterly review?"
          description="Its 14 pages and 6 comments are deleted for everyone."
          keep="Keep it"
          confirm="Delete"
        />
      </Write>
      <Not why="a question about nothing">
        <Question
          title="Are you sure?"
          description="This action cannot be undone."
          keep="No"
          confirm="Yes"
        />
      </Not>
    </Pair>
  );
}
