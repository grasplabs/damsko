import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@grasp-os/ui/components/context";

const usage = {
  inputTokens: 96_400,
  outputTokens: 7200,
  reasoningTokens: 3100,
  cachedInputTokens: 41_000,
};

// The product works out what the usage cost, from its own prices; the card only formats it, by
// kind and in all, under a hairline.
const cost = {
  currency: "USD",
  input: 0.29,
  output: 0.11,
  reasoning: 0.05,
  cache: 0.03,
  total: 0.48,
};

export default function ContextCost() {
  return (
    <Context
      usedTokens={
        usage.inputTokens + usage.outputTokens + usage.reasoningTokens
      }
      maxTokens={200_000}
      usage={usage}
      cost={cost}
      defaultOpen
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  );
}
