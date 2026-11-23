import { Button } from "@grasp-os/ui/components-tw/button";

const projects = ["Spring launch", "Office move", "Hiring plan"];

// The same button on every row: its words stay "Delete", and its name says which row, starting
// with those words, so a voice command ("press Delete") still finds it.
export default function ButtonRows() {
  return (
    <ul className="m-0 grid w-full max-w-[420px] list-none gap-2 p-0">
      {projects.map((project) => (
        <li key={project} className="flex items-center justify-between gap-3">
          <span className="text-body-foreground font-sans text-(length:--damsko-text-sm)">
            {project}
          </span>
          <Button size="sm" variant="ghost" aria-label={`Delete ${project}`}>
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
