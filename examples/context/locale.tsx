import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextTrigger,
} from "@grasp-os/ui/components/context";
import { I18nProvider } from "@grasp-os/ui/lib/i18n";

const usage = { inputTokens: 52_300, outputTokens: 4800 };

// Numbers follow the I18nProvider's locale: here French, with its decimal comma and its euro sign.
// The words stay the catalogue's.
export default function ContextLocale() {
  return (
    <I18nProvider locale="fr-FR">
      <Context
        usedTokens={usage.inputTokens + usage.outputTokens}
        maxTokens={128_000}
        usage={usage}
        cost={{ currency: "EUR", input: 0.14, output: 0.05, total: 0.19 }}
      >
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
          <ContextContentBody>
            <ContextInputUsage />
            <ContextOutputUsage />
          </ContextContentBody>
          <ContextContentFooter />
        </ContextContent>
      </Context>
    </I18nProvider>
  );
}
