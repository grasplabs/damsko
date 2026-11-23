import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import {
  ArrowRightIcon,
  DownloadIcon,
  Icon,
  PlusIcon,
  SettingsIcon,
} from "@grasp-os/ui/lib/icons";
import { useState } from "react";

// Stand-in for a real request: a moment's work that succeeds.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const work = () => wait(900);

// Every size does its work. An icon-only button takes an icon size and its name from aria-label.
// Filter and Settings would open something this page has not, so they say that.
export default function ButtonSizes() {
  const [toast] = useState(() => createToaster());
  return (
    <>
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label="Download the report"
        onClick={work}
      >
        <Icon icon={DownloadIcon} />
      </Button>
      <Button
        size="xs"
        variant="outline"
        onClick={() => toast("The filters would open here")}
      >
        Filter
      </Button>
      <Button size="sm" variant="outline" onClick={work} successText="Exported">
        Export
      </Button>
      <Button variant="outline" onClick={work} successText="Invited">
        <Icon icon={PlusIcon} />
        Invite people
      </Button>
      <Button size="lg" variant="default" onClick={work} successText="Started">
        Start the review
        <Icon icon={ArrowRightIcon} />
      </Button>
      <Button
        size="icon-lg"
        variant="outline"
        aria-label="Settings"
        onClick={() => toast("Settings would open here")}
      >
        <Icon icon={SettingsIcon} />
      </Button>
      <Toaster toaster={toast} />
    </>
  );
}
