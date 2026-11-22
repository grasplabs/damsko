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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";
import * as stylex from "@stylexjs/stylex";

const layout = stylex.create({
  box: { width: "100%", maxWidth: 560 },
});

const members = [
  { name: "Amara Okafor", role: "Owner" },
  { name: "Jonas Weber", role: "Editor" },
  { name: "Lena Ruiz", role: "Viewer" },
];

// A `flush` CardContent: a table runs edge to edge under a hairline, which is what it is for.
export default function CardFlush() {
  return (
    <div {...stylex.props(layout.box)}>
      <Card asChild>
        <section>
          <CardHeader>
            <CardTitle level={2}>Members</CardTitle>
            <CardDescription>Who can open this workspace.</CardDescription>
            <CardAction>
              <Button size="sm" variant="secondary">
                Invite
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent flush>
            <Table aria-label="Members">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell rowHeader>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>3 of 25 seats used</CardFooter>
        </section>
      </Card>
    </div>
  );
}
