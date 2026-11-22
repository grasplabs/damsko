import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@grasp-os/ui/components/context";

const usage = { inputTokens: 8420, outputTokens: 1260, reasoningTokens: 980 };
const used = usage.inputTokens + usage.outputTokens + usage.reasoningTokens;

// How much of the window the conversation has used. Rest on the trigger, or tab to it, to see the
// tokens used of the most and a row per kind.
export default function ContextBasic() {
  return (
    <Context usedTokens={used} maxTokens={128_000} usage={usage}>
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
        </ContextContentBody>
      </ContextContent>
    </Context>
  );
}
