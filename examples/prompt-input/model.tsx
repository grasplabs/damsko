"use client";

import { Button } from "@grasp-os/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@grasp-os/ui/components/dropdown-menu";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@grasp-os/ui/components/prompt-input";
import { ChevronDownIcon, Icon } from "@grasp-os/ui/lib/icons";
import { colors } from "@grasp-os/ui/lib/tokens.stylex";
import * as stylex from "@stylexjs/stylex";
import { Fragment, useState } from "react";

import { layout } from "./layout";

const providers = [
  {
    name: "Anthropic",
    models: [
      { id: "opus", name: "Claude Opus 5.5" },
      { id: "sonnet", name: "Claude Sonnet 5.5" },
    ],
  },
  {
    name: "Google",
    models: [
      { id: "gemini-pro", name: "Gemini 3 Pro" },
      { id: "gemini-flash", name: "Gemini 3 Flash" },
    ],
  },
];

const models = providers.flatMap((provider) => provider.models);

const efforts = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const styles = stylex.create({
  // The tools take the row beside Submit, so the menus after the plus stand at its end; on a narrow
  // card they wrap inside it, and Submit stays at the foot's end.
  tools: { flexGrow: 1, flexBasis: 0, minWidth: 0 },
  menus: { marginInlineStart: "auto" },
  submit: { alignSelf: "end" },
  quiet: { color: colors.mutedForeground },
});

// shadcn's demo: the plus, then a model and an effort menu beside Submit, both DropdownMenus with
// radio items. The prompt input holds none of it; the page keeps the choices and sends them along.
export default function PromptInputModel() {
  const [model, setModel] = useState("opus");
  const [effort, setEffort] = useState("medium");
  const [sent, setSent] = useState("");
  const modelName = models.find((each) => each.id === model)?.name ?? "";
  const effortName = efforts.find((each) => each.value === effort)?.label;
  return (
    <div {...stylex.props(layout.column)}>
      <PromptInput
        aria-label="Message the assistant"
        onSubmit={({ text }) => {
          setSent(`${modelName}, ${effortName} effort: ${text}`);
        }}
      >
        <PromptInputHeader>
          <PromptInputAttachments />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            aria-label="Message"
            placeholder="Ask the agent to change your code"
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools style={styles.tools}>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Model: ${modelName}`}
                  style={styles.menus}
                >
                  {modelName}
                  <Icon icon={ChevronDownIcon} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={model}
                  onValueChange={(next: string) => {
                    setModel(next);
                  }}
                >
                  {providers.map((provider, index) => (
                    <Fragment key={provider.name}>
                      {index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>{provider.name}</DropdownMenuLabel>
                        {provider.models.map((each) => (
                          <DropdownMenuRadioItem
                            key={each.id}
                            value={each.id}
                            closeOnSelect
                          >
                            {each.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuGroup>
                    </Fragment>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Effort: ${effortName}`}
                >
                  <span {...stylex.props(styles.quiet)}>Effort</span>
                  {effortName}
                  <Icon icon={ChevronDownIcon} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={effort}
                  onValueChange={(next: string) => {
                    setEffort(next);
                  }}
                >
                  <DropdownMenuLabel>Effort</DropdownMenuLabel>
                  {efforts.map((each) => (
                    <DropdownMenuRadioItem
                      key={each.value}
                      value={each.value}
                      closeOnSelect
                    >
                      {each.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </PromptInputTools>
          <PromptInputSubmit style={styles.submit} />
        </PromptInputFooter>
      </PromptInput>
      <p aria-live="polite" {...stylex.props(layout.sent)}>
        {sent === "" ? "Nothing sent yet." : `Sent with ${sent}`}
      </p>
    </div>
  );
}
