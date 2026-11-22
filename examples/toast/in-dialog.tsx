"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@grasp-os/ui/components/alert-dialog";
import { Button } from "@grasp-os/ui/components/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@grasp-os/ui/components/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@grasp-os/ui/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@grasp-os/ui/components/popover";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@grasp-os/ui/components/sheet";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

const layout = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    justifyContent: "center",
  },
  list: {
    display: "grid",
    gap: space["2"],
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  team: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
  },
});

const allTeams = ["Finance", "Design", "Sales"];

// A layer whose row removes something, with an Undo toast: the toast's Undo, pressed while the layer
// is open, keeps the layer open and runs. One for each layer a toast may stand over.
export default function ToastInDialog() {
  const [toast] = useState(() => createToaster());
  useEffect(() => () => toast.dismiss(), [toast]);
  const [shared, setShared] = useState(allTeams);
  const unshare = (team: string) => {
    setShared((now) => now.filter((each) => each !== team));
    toast(`${team} can no longer see it`, {
      action: {
        label: "Undo",
        onAction: () => {
          setShared((now) =>
            now.includes(team)
              ? now
              : allTeams.filter((each) => now.includes(each) || each === team)
          );
        },
      },
    });
  };
  const teams = (
    <ul data-teams={shared.join(",")} {...stylex.props(layout.list)}>
      {shared.map((team) => (
        <li key={team} {...stylex.props(layout.team)}>
          {team}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              unshare(team);
            }}
          >
            {`Unshare ${team}`}
          </Button>
        </li>
      ))}
    </ul>
  );
  return (
    <div {...stylex.props(layout.row)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Share in a dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share the workflow</DialogTitle>
            <DialogDescription>Who can see it.</DialogDescription>
          </DialogHeader>
          <DialogBody>{teams}</DialogBody>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="secondary">Share in an alert dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share the workflow</AlertDialogTitle>
            <AlertDialogDescription>Who can see it.</AlertDialogDescription>
          </AlertDialogHeader>
          {teams}
        </AlertDialogContent>
      </AlertDialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary">Share in a sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Share the workflow</SheetTitle>
            <SheetDescription>Who can see it.</SheetDescription>
          </SheetHeader>
          <SheetBody>{teams}</SheetBody>
        </SheetContent>
      </Sheet>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="secondary">Share in a drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Share the workflow</DrawerTitle>
            <DrawerDescription>Who can see it.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>{teams}</DrawerBody>
        </DrawerContent>
      </Drawer>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Share in a popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Share the workflow</PopoverTitle>
            <PopoverDescription>Who can see it.</PopoverDescription>
          </PopoverHeader>
          {teams}
        </PopoverContent>
      </Popover>
      <Toaster toaster={toast} />
    </div>
  );
}
