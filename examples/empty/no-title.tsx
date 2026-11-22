import {
  Empty,
  EmptyHeader,
  EmptyDescription,
} from "@grasp-os/ui/components/empty";

// In a card or one tab of a list, the sentence alone says it.
export default function EmptyNoTitle() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyDescription>Comments will appear here.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
