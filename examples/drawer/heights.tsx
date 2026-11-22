import { Button } from "@grasp-os/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@grasp-os/ui/components/drawer";

const stops = [
  "Central station",
  "Market square",
  "Old harbour",
  "University",
  "North park",
  "Airport",
];

export default function DrawerHeights() {
  return (
    <Drawer snapPoints={[0.4, 0.85]}>
      <DrawerTrigger asChild>
        <Button variant="outline">Show the stops</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Stops on this route</DrawerTitle>
          <DrawerDescription>
            Drag the grip, or press it, to see more.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          {stops.map((stop) => (
            <p key={stop}>{stop}</p>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
