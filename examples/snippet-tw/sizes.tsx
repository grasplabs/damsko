import { Snippet } from "@grasp-os/ui/components-tw/snippet";

export default function SnippetSizes() {
  return (
    <div className="grid justify-items-start gap-3">
      <Snippet size="sm" value="usr_4f81c2" aria-label="Copy the user ID" />
      <Snippet value="usr_4f81c2" aria-label="Copy the user ID" />
    </div>
  );
}
