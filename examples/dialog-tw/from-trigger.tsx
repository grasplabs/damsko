import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components-tw/dialog";

const Example = ({ label }: { label: string }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">{label}</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share the report</DialogTitle>
        <DialogDescription>
          It grows from the button that opened it, and closes back toward it.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
        <DialogClose variant="default">Share</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Two triggers far from the window's middle: each dialog grows from its own trigger and ends centred.
export default function DialogFromTrigger() {
  return (
    <div className="relative min-h-[32rem] w-full">
      <div className="absolute end-4 top-4">
        <Example label="Share (top end)" />
      </div>
      <div className="absolute start-4 bottom-4">
        <Example label="Share (bottom start)" />
      </div>
    </div>
  );
}
