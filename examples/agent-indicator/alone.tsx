import { AgentIndicator } from "@grasp-os/ui/components/agent-indicator";

// Alone, with no words beside it: its label is said to a screen reader.
const AgentIndicatorAlone = () => (
  <AgentIndicator aria-label="Filling the column" />
);

export default AgentIndicatorAlone;
