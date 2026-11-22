import { Text } from "@grasp-os/ui/components/text";

// The display face: one line in the serif that opens a card or a section, at a text size.
export default function TextDisplay() {
  return (
    <Text variant="display" size="lg" color="default">
      Choose the model your team's assistant runs on.
    </Text>
  );
}
