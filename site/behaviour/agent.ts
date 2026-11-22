// The page's one agent bridge: an agent lists the UI SDK components on a page and operates them by
// name (createAgent, from @ui-sdk/react/agent), and a browser's own agent gets the same through
// WebMCP. One per page, shared: UI SDK's bridge has no destroy, and two would both register every
// part, so every agent fixture (examples/<name>/agent.tsx) calls `pageAgent()` instead of making
// its own, and the checks drive it as `window.damskoAgent`.
//
// Anything marked `data-agent-confirm` (every danger and approve Button) waits for the person: they
// are asked in the page's own words, and the press is refused unless they say yes. A check answers
// for them by setting `window.damskoAgentYes` to true or false. An ApprovalRequest keeps its answers
// out of the bridge's sight, so an agent can never approve its own request, whatever is answered.
//
// To try it in the console: `damskoAgent.snapshot()`, then
// `await damskoAgent.act({ steps: [{ ref: "Save changes", action: "press" }] })`.
import { createAgent, registerTools } from "@ui-sdk/react/agent";

type Agent = ReturnType<typeof createAgent>;

declare global {
  interface Window {
    damskoAgent?: Agent;
    damskoAgentYes?: boolean;
  }
}

const ask = (sentence: string) =>
  typeof window.damskoAgentYes === "boolean"
    ? window.damskoAgentYes
    : window.confirm(`An agent asks to do this: ${sentence}. Allow it?`);

/** The page's agent bridge, made on first use; nothing on the server. */
export function pageAgent(): Agent | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (!window.damskoAgent) {
    const agent = createAgent({
      allow: (step) => !step.confirm || ask(step.confirm),
    });
    // The bridge has already asked the person; a second question per step would only repeat it.
    registerTools(agent, { allow: () => true });
    window.damskoAgent = agent;
  }
  return window.damskoAgent;
}
