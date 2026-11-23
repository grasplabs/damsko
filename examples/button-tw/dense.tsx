import { Button } from "@grasp-os/ui/components-tw/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@grasp-os/ui/components/card";
import { Toaster, createToaster } from "@grasp-os/ui/components/toast";
import { useState } from "react";

const requests = [
  { name: "Q3 budget review", due: "Due Friday" },
  { name: "Brand refresh brief", due: "Due Monday" },
  { name: "Office move plan", due: "Due next week" },
];

// The same action on every row of a list: a column of edged, lifted buttons would be too heavy, so
// each is `secondary`, flat, a step quieter than `outline`. Each press says what it would do.
export default function ButtonDense() {
  const [toast] = useState(() => createToaster());
  return (
    <div className="w-full max-w-[480px]">
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Open requests</CardTitle>
            <CardDescription>Waiting on someone in the team.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="m-0 grid list-none gap-3 p-0">
              {requests.map((request) => (
                <li
                  key={request.name}
                  className="flex items-center justify-between gap-3"
                >
                  <span>
                    <span className="text-foreground text-(length:--damsko-text-sm)">
                      {request.name}
                    </span>{" "}
                    <span className="text-muted-foreground text-(length:--damsko-text-sm)">
                      {request.due}
                    </span>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Duplicate ${request.name}`}
                    onClick={() => toast(`${request.name} duplicated`)}
                  >
                    Duplicate
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </section>
      </Card>
      <Toaster toaster={toast} />
    </div>
  );
}
