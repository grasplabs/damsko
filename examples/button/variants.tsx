import { Button } from "@grasp-os/ui/components/button";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { colors, font, radius, space } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  // A page's cover: a painting, where a filled button would shout over the picture.
  cover: {
    colorScheme: "dark",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space["4"],
    boxSizing: "border-box",
    width: 280,
    maxWidth: "100%",
    minHeight: 120,
    padding: space["4"],
    borderRadius: radius.base,
    backgroundColor: colors.brandNight,
    backgroundImage: "url(/brand/looks/fine.small.jpg)",
    backgroundPosition: "center",
    backgroundSize: "cover",
    color: colors.foreground,
    fontSize: font.textBase,
    fontWeight: font.weightMedium,
  },
});

// Stand-in for a real request: a moment's work that succeeds.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const work = () => wait(900);

// Each button does its work and says so: while it works a spinner stands over its words, then it
// says how it went. Edit, the guide and the cover would open something this page has not, so they
// say that. Delete can be undone, so it happens at once, with Undo in a toast. Outline stands on
// the cover's painting: quiet enough for a surface that already carries a picture.
export default function ButtonVariants() {
  const [toast] = useState(() => createToaster());
  const remove = () =>
    toast("Workspace deleted", {
      action: { label: "Undo", onAction: () => toast("Workspace restored") },
    });
  return (
    <>
      <Button variant="default" onClick={work} successLabel="Saved">
        Save changes
      </Button>
      <Button variant="secondary" onClick={work} successLabel="Invited">
        Invite people
      </Button>
      <Button
        variant="ghost"
        onClick={() => toast("The editor would open here")}
      >
        Edit
      </Button>
      <Button variant="destructive" onClick={remove}>
        Delete workspace
      </Button>
      <Button variant="link" onClick={() => toast("The guide would open here")}>
        Read the guide
      </Button>
      <div {...stylex.props(layout.cover)}>
        <span>Spring launch</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("The cover picker would open here")}
        >
          Change cover
        </Button>
      </div>
      <Toaster toaster={toast} />
    </>
  );
}
