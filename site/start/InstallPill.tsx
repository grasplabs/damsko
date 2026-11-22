// Get started's install command: the same control as the install line at the top of every
// component page, the library's Snippet (site/blocks/parts.tsx, CopyValue). One line whatever
// the width: a long command scrolls sideways inside the field, its end fading, and the copy icon
// stays at the field's end. The copying is the site's one copy behaviour (site/behaviour/copy.ts).
// Its place on the page is start.css ("Install").
import { CopyValue } from "../blocks/parts";

export default function InstallPill({ command }: { command: string }) {
  return (
    <div className="start-install">
      <CopyValue
        value={command}
        size="default"
        label="Copy the install command"
        said="Copied the install command"
      />
    </div>
  );
}
