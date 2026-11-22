import { Button } from "@grasp-os/ui/components/button";
import { ArrowRightIcon, Icon } from "@grasp-os/ui/lib/icons";

// To go somewhere, a link with a button's look: `asChild` draws the <a> itself, so it opens in a
// new tab on request.
export default function ButtonLink() {
  return (
    <>
      <Button variant="outline" asChild>
        <a href="/components/button#every-state">
          See every state
          <Icon icon={ArrowRightIcon} />
        </a>
      </Button>
      <Button variant="ghost" asChild>
        <a href="/foundations/colour">Colour</a>
      </Button>
    </>
  );
}
