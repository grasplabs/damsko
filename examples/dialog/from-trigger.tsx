import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  room: { position: "relative", width: "100%", minHeight: "32rem" },
  topEnd: {
    position: "absolute",
    insetBlockStart: space["4"],
    insetInlineEnd: space["4"],
  },
  bottomStart: {
    position: "absolute",
    insetBlockEnd: space["4"],
    insetInlineStart: space["4"],
  },
});

const Example = ({ label }: { label: string }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="secondary">{label}</Button>
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
    <div {...stylex.props(layout.room)}>
      <div {...stylex.props(layout.topEnd)}>
        <Example label="Share (top end)" />
      </div>
      <div {...stylex.props(layout.bottomStart)}>
        <Example label="Share (bottom start)" />
      </div>
    </div>
  );
}
