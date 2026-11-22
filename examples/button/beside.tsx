import { Button } from "@grasp-os/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Text } from "@grasp-os/ui/components/text";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 480 },
});

// The variants by role, as shadcn/ui sets them. Invite people stands on its own in the section's
// head, an ordinary action: `outline`. At the foot, Save changes is the main step, `default`, and
// Cancel is the lesser button beside it: `outline` too. Each press says what it would do.
export default function ButtonBeside() {
  const [toast] = useState(() => createToaster());
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Members</CardTitle>
            <CardDescription>Who can open this workspace.</CardDescription>
            <CardAction>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast("The invite would open here")}
              >
                Invite people
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Text size="sm" color="muted">
              18 of 25 seats in use.
            </Text>
          </CardContent>
          <CardFooter justify="end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast("Nothing changed")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => toast("Changes saved")}
            >
              Save changes
            </Button>
          </CardFooter>
        </section>
      </Card>
      <Toaster toaster={toast} />
    </div>
  );
}
