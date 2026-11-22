"use client";

import { Button } from "@grasp-os/ui/components/button";
import { Toaster, toast } from "@grasp-os/ui/components/toast";

// A check's page (tests/toast.spec.ts, "one region"), not one to copy: two Toasters on the same toasts,
// which the console says is wrong. A page keeps one <Toaster />, at its root.
export default function ToastTwoToasters() {
  return (
    <>
      <Button variant="outline" onClick={() => toast("Report archived")}>
        Archive report
      </Button>
      <Toaster />
      <Toaster position="top-right" />
    </>
  );
}
