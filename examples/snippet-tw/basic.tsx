import { Snippet } from "@grasp-os/ui/components-tw/snippet";

export default function SnippetBasic() {
  return (
    <Snippet
      value="pnpm dlx shadcn@4.23.0 add @damsko/button"
      aria-label="Copy the install command"
    />
  );
}
