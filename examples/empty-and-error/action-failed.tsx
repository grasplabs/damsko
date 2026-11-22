import { Button } from "@grasp-os/ui/components/button";

// A stand-in for a request that fails.
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const archiveProject = async () => {
  await wait(1200);
  throw new Error("The project was not archived.");
};

// An action that failed says so on the control itself, in words, and can be pressed again.
export default function ActionFailed() {
  const archive = archiveProject;
  return (
    <Button
      variant="outline"
      onClick={archive}
      loadingLabel="Archiving"
      successLabel="Archived"
      errorLabel="Not archived"
    >
      Archive project
    </Button>
  );
}
