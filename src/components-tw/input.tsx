// Input: one line of text,
// in Tailwind, built on UI SDK's Input, with the field box every text field shares
// (lib/styles' inputStyles, as Textarea and InputGroup draw it): a white fill, a hairline that can
// be found on every ground, one corner, and the heights of Button, so a field and a button stand
// level in one row. With it, PasswordInput, a password with a show button, and SecretInput, a key
// pasted once.
//
//   <Field>
//     <FieldLabel>Work email</FieldLabel>
//     <Input type="email" autoComplete="email" required />
//   </Field>
//   <Input aria-label="Search projects" type="search" />       no visible label: aria-label names it
//   <Input secret />                                             an agent may fill it, never read it
//   <PasswordInput autoComplete="new-password" />
//   <SecretInput maskedValue="9c1e" onReplace={…} />             a saved key: its last four, and Replace
//
// A Field round any of them names it, describes it and says when it is wrong; the field needs no
// ids and no spread. A caller may set layout and width only (`className`).
"use client";

import {
  InputGroup as BoxPrimitive,
  Input as InputPrimitive,
} from "@ui-sdk/react/input";
import type { InputState } from "@ui-sdk/react/input";
import {
  PasswordInput as PasswordInputPrimitive,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input";
import type { PasswordInputState } from "@ui-sdk/react/password-input";
import { useEffect, useRef } from "react";
import type { ClipboardEvent, ComponentProps, Ref } from "react";

// Not ported in the experiment: SecretInput's saved state draws the StyleX InputGroup.
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "../components/input-group";
import { useRunsLong } from "../hooks/use-runs-long";
import { EyeIcon, EyeOffIcon, Icon } from "../lib-tw/icons";
import type { IconData } from "../lib-tw/icons";
import { inputStyles } from "../lib-tw/styles";
import { assignRef, cn, isInvalid, warnUnnamed } from "../lib-tw/utils";
import type { LayoutClass } from "../lib-tw/utils";
import { useI18n } from "../lib/i18n";

/** The height: the same as Button's. */
export type InputSize = "sm" | "default" | "lg";

type PrimitiveProps = ComponentProps<typeof InputPrimitive>;

/** Every prop an Input takes: these, and the rest of UI SDK's Input and an <input>. */
export interface InputProps extends Omit<
  PrimitiveProps,
  "className" | "style" | "render" | "size" | "children" | "width" | "height"
> {
  /**
   * The height, the same as Button's: `sm` 32px, `default` 36px, `lg` 44px. On a touch screen
   * every size has a 44px target and 16px words.
   * @default "default"
   */
  size?: InputSize;
  /**
   * What kind of text: `text`, `email`, `password`, `search`, `tel` or `url`. It brings the right
   * keyboard on a phone and the browser's own check. `time` is a time of day in the field's look:
   * typed or stepped with the arrow keys, a phone's own picker on a tap; its value is `HH:mm`.
   * @default "text"
   */
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "time";
  /**
   * Words a machine reads, in the system's mono face: a cron line, an id, a key. A step smaller,
   * on the same line, so the field keeps its height; 16px on a touch screen as every field is.
   * @default false
   */
  mono?: boolean;
  /**
   * The value it starts with. A form reset returns here. For a value you keep in state, pass
   * `value` and `onValueChange` instead.
   */
  defaultValue?: string;
  /** The value, when you keep it in state. Pair it with `onValueChange`. */
  value?: string;
  /**
   * Called with the new value and why it changed: typing (`input-change`), a form reset (`reset`),
   * or code and agents (`imperative`). `details.source` is `"agent"` when an agent changed it, and
   * `details.cancel()` keeps the value as it was.
   */
  onValueChange?: PrimitiveProps["onValueChange"];
  /**
   * An example of what goes in, never the label or an instruction ("name@example.com"). It goes
   * when typing starts, so what the field is for belongs in its label.
   */
  placeholder?: string;
  /**
   * Needs a value before the form is sent. Inside a Field, its label shows the required mark.
   * @default false
   */
  required?: boolean;
  /**
   * Can be read, selected and copied, and is sent with the form, but not changed. Drawn on a
   * quieter fill, with no hover, caret or focus ring, so it does not invite typing; focus from the
   * keys darkens its hairline, with no halo.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Out of use: not focusable, not sent, half strength. Say why near it. Prefer `readOnly` for a
   * value someone may still want to copy.
   * @default false
   */
  disabled?: boolean;
  /**
   * An agent may fill it in but never read it back: a key, a token, a tax number. Passwords are
   * secret without it.
   * @default false
   */
  secret?: boolean;
  /** An icon at the start, when it says what goes in faster than the label alone: SearchIcon, from lib/icons. */
  icon?: IconData;
  /** Layout only: margins, alignment and width. Colours, heights and corners belong to the input. */
  className?: LayoutClass;
  /** The <input> itself, to focus it or read it. */
  ref?: Ref<HTMLInputElement>;
}

// ---- The look --------------------------------------------------------------------------------------

const styles = {
  // The box holds the input and its touch target. It is as wide as the column it stands in.
  box: "relative flex items-stretch box-border w-full min-w-0 max-w-full",
  // An icon at the start: it stands over the input, in muted, and lets presses through to it.
  icon: "icon-sm absolute z-1 inset-y-0 start-3 flex items-center text-muted-foreground pointer-events-none",
  // The words start after the icon and the gap beside it.
  iconStart:
    "ps-[calc(var(--damsko-space-3)+var(--damsko-icon-sm)+var(--damsko-space-2))]",
  // Above its touch target, so a press on the words puts the caret where it lands. No border: the
  // edge is a hairline drawn inside; in forced colours the shadow is dropped, so a real one shows.
  // 16px on a phone or a touch screen, or Safari zooms the page in when the field takes focus. A
  // placeholder too long ends in an ellipsis; a search field shows no cross of the browser's; a
  // time field draws no clock button; selected words in the system's own tone.
  input: [
    "relative grow box-border w-full min-w-0 m-0 appearance-none border-0 forced-colors:border border-solid border-current corner-squircle",
    "bg-input-bg text-foreground caret-foreground font-sans text-sm phone-or-coarse:text-(length:--damsko-input-text-touch) font-normal tracking-ui text-start",
    "text-clip placeholder-shown:text-ellipsis px-3 transition-[box-shadow,background-color] duration-(--damsko-duration-hover) ease-ui",
    "[&::-webkit-search-cancel-button]:hidden [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit]:p-0",
    "selection:bg-input-selection selection:text-foreground placeholder:text-muted-foreground placeholder:[-webkit-text-fill-color:var(--damsko-muted-foreground)] placeholder:opacity-100 placeholder:text-ellipsis",
  ],
  // A value longer than the field fades out at its end, never a cut through a letter: the words are
  // painted through a gradient clipped to the text, plain ink while the field has focus. Not in
  // Firefox, which does not clip a form control's words (the @supports below).
  long: [
    "supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:[-webkit-text-fill-color:transparent] supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:focus:[-webkit-text-fill-color:currentColor] supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:forced-colors:[-webkit-text-fill-color:currentColor]",
    "supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:bg-[linear-gradient(to_right,currentColor_calc(100%-var(--damsko-space-5)),transparent),linear-gradient(transparent,transparent)] supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:rtl:bg-[linear-gradient(to_left,currentColor_calc(100%-var(--damsko-space-5)),transparent),linear-gradient(transparent,transparent)]",
    "supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:[background-origin:content-box,padding-box] supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:[background-clip:text,padding-box] supports-[(background-clip:text)_and_(not_(-moz-appearance:none))]:bg-no-repeat",
  ],
  // Words a machine reads: the mono face a step smaller, on the same line (the size's line height
  // is said again: tailwind-merge drops `text-sm`, line height and all, for this font size).
  mono: "font-mono text-(length:--damsko-text-xs) leading-(--damsko-text-sm-line) phone-or-coarse:text-(length:--damsko-input-text-touch)",
  // Can be read and copied, not changed: the soft ground, a hairline and no lift or hover, its words
  // a step quieter. Focus from the keys shows as the hairline one step stronger.
  readOnly:
    "bg-input-bg-read shadow-[inset_0_0_0_1px_var(--damsko-input)] focus-key:shadow-(--damsko-input-focus-read) text-input-foreground-read caret-transparent cursor-default",
};

const sizeStyles = {
  sm: inputStyles.sm,
  default: inputStyles.default,
  lg: inputStyles.lg,
} as const;
const targetStyles = {
  sm: inputStyles.targetSm,
  default: inputStyles.targetDefault,
  lg: inputStyles.targetLg,
} as const;

/** Input, with the name of its box: Input's own, or SecretInput's. */
const TextInput = ({
  slot,
  size = "default",
  type = "text",
  secret = false,
  mono = false,
  icon,
  className,
  ref,
  ...rest
}: InputProps & { slot: string }) => {
  const { setInput, long } = useRunsLong();
  // In development, say so when nothing names the input: no Field label, no aria-label.
  const own = useRef<HTMLInputElement | null>(null);
  const attach = (element: HTMLInputElement | null) => {
    own.current = element;
    setInput(element);
    assignRef(ref, element);
  };
  useEffect(() => {
    warnUnnamed("Input", own.current);
  }, []);

  return (
    <BoxPrimitive
      render={<div data-slot={slot} />}
      className={cn(styles.box, className)}
    >
      <span
        aria-hidden="true"
        className={cn(inputStyles.target, targetStyles[size])}
      />
      {icon && (
        <span aria-hidden="true" className={styles.icon}>
          <Icon icon={icon} />
        </span>
      )}
      <InputPrimitive
        {...rest}
        type={type}
        ref={attach}
        data-agent-secret={secret ? "" : undefined}
        // UI SDK's props (its ref among them) go on our own <input>, styled from its state.
        render={(props: Record<string, unknown>, state: InputState) => (
          <input
            {...props}
            data-slot="input"
            className={cn(
              styles.input,
              long && styles.long,
              sizeStyles[size],
              mono && styles.mono,
              icon && styles.iconStart,
              !(state.disabled || state.readOnly) && inputStyles.enabled,
              state.readOnly && styles.readOnly,
              state.disabled && inputStyles.disabled,
              isInvalid(props["aria-invalid"]) && inputStyles.invalid,
              state.readOnly ? "focus-field-read-only" : "focus-field"
            )}
          />
        )}
      />
    </BoxPrimitive>
  );
};

/** One line of text, in the field box every text field shares. */
export const Input = (props: InputProps) => (
  // UI SDK's own name for the box round the input, as it has always had.
  <TextInput {...props} slot="input-group" />
);

// ---- PasswordInput ---------------------------------------------------------------------------------

type PasswordPrimitiveProps = ComponentProps<typeof PasswordInputPrimitive>;

/** Every prop a PasswordInput takes. */
export interface PasswordInputProps {
  /**
   * What a password manager fills in: `current-password` to sign in, `new-password` to choose
   * one.
   * @default "current-password"
   */
  autoComplete?: "current-password" | "new-password" | "off";
  /** The value it starts with. A form reset returns here. */
  defaultValue?: string;
  /** The value, when you keep it in state. Pair it with `onValueChange`. */
  value?: string;
  /** Called with the new value and why it changed. */
  onValueChange?: PasswordPrimitiveProps["onValueChange"];
  /** The height, as Input's: `sm` 32px, `default` 36px, `lg` 44px. @default "default" */
  size?: InputSize;
  /** The name it is sent under in a form. Inside a Field, the Field's `name` serves. */
  name?: string;
  /** Needs a value before the form is sent. @default false */
  required?: boolean;
  /** Can be shown but not changed. @default false */
  readOnly?: boolean;
  /** Out of use: not focusable, not sent, half strength. @default false */
  disabled?: boolean;
  /** A hint while it is empty, such as what length it needs. Never the only place a rule is said. */
  placeholder?: string;
  /** Its name when no FieldLabel names it. */
  "aria-label"?: string;
  /** Layout only: margins, alignment and width. */
  className?: LayoutClass;
}

const passwordStyles = {
  // Room at the end for the button, so the words never run under it.
  roomSm: "pe-[calc(var(--damsko-control-sm)+var(--damsko-space-1))]",
  roomDefault: "pe-[calc(var(--damsko-control-default)+var(--damsko-space-1))]",
  roomLg: "pe-[calc(var(--damsko-control-lg)+var(--damsko-space-1))]",
  // The button: a square at the end, set in from the field's edge by space-1 on every side, so its
  // focus ring stands inside the field. Its corner nests inside the field's. Muted, ink under a pointer.
  toggle:
    "icon-sm absolute z-1 inset-y-1 end-1 flex items-center justify-center m-0 p-0 border-0 rounded-[max(0px,calc(var(--damsko-radius-xl)-var(--damsko-space-1)))] corner-squircle bg-transparent text-muted-foreground hover:text-foreground cursor-pointer tap-highlight-none touch-manipulation transition-[color] duration-(--damsko-duration-hover) ease-ui",
  toggleSm: "w-[calc(var(--damsko-control-sm)-2*var(--damsko-space-1))]",
  toggleDefault:
    "w-[calc(var(--damsko-control-default)-2*var(--damsko-space-1))]",
  toggleLg: "w-[calc(var(--damsko-control-lg)-2*var(--damsko-space-1))]",
  // A finger needs 44px around the button too, centred on it as the button is set in.
  toggleTarget:
    "absolute -inset-1 coarse:inset-[calc((100%-var(--damsko-tap-target))/2)]",
};

const roomStyles = {
  sm: passwordStyles.roomSm,
  default: passwordStyles.roomDefault,
  lg: passwordStyles.roomLg,
} as const;
const squareStyles = {
  sm: passwordStyles.toggleSm,
  default: passwordStyles.toggleDefault,
  lg: passwordStyles.toggleLg,
} as const;

/**
 * A password with a button that shows and hides it, on UI SDK's PasswordInput. The button keeps
 * the caret where it was, the field hides itself again when its form is sent, and an agent may
 * fill it but never read it back.
 */
export const PasswordInput = ({
  size = "default",
  autoComplete = "current-password",
  className,
  "aria-label": ariaLabel,
  placeholder,
  ...options
}: PasswordInputProps) => {
  const words = useI18n().input;
  return (
    <PasswordInputPrimitive
      {...options}
      autoComplete={autoComplete}
      className={cn(styles.box, className)}
    >
      <span
        aria-hidden="true"
        className={cn(inputStyles.target, targetStyles[size])}
      />
      <PasswordInputControl
        aria-label={ariaLabel}
        placeholder={placeholder}
        render={(props: Record<string, unknown>, state: PasswordInputState) => (
          <input
            {...props}
            className={cn(
              styles.input,
              // A password field always paints its words through the fade (StyleX's own drew it
              // with no measure of its length).
              styles.long,
              sizeStyles[size],
              roomStyles[size],
              !(state.disabled || state.readOnly) && inputStyles.enabled,
              state.readOnly && styles.readOnly,
              state.disabled && inputStyles.disabled,
              isInvalid(props["aria-invalid"]) && inputStyles.invalid,
              state.readOnly ? "focus-field-read-only" : "focus-field"
            )}
          />
        )}
      />
      <PasswordInputToggle
        className={(state: PasswordInputState) =>
          cn(
            passwordStyles.toggle,
            squareStyles[size],
            "focus-ring",
            state.disabled && inputStyles.disabled
          )
        }
      >
        {(state: PasswordInputState) => (
          <>
            <span aria-hidden="true" className={passwordStyles.toggleTarget} />
            <Icon
              icon={state.visible ? EyeOffIcon : EyeIcon}
              label={state.visible ? words.hidePassword : words.showPassword}
            />
          </>
        )}
      </PasswordInputToggle>
    </PasswordInputPrimitive>
  );
};

// ---- SecretInput -----------------------------------------------------------------------------------

/** Every prop a SecretInput takes: an Input's, but never its type, its secret or its autoComplete. */
export type SecretInputProps = Omit<
  InputProps,
  "type" | "secret" | "autoComplete"
> & {
  /**
   * The last characters of the key already saved ("9c1e"): the field then shows only them, read
   * only, with Replace. Never the key itself; the host keeps that.
   */
  maskedValue?: string;
  /** Runs when Replace is pressed: the host clears `maskedValue`, and the field is empty and focused. */
  onReplace?: () => void;
};

// Each password manager's own mark for a field it must leave alone: 1Password, LastPass,
// Bitwarden, Dashlane.
const unmanaged = {
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-bwignore": "",
  "data-form-type": "other",
} as const;

/** Pastes the clipboard's words whole, the spaces and line breaks round them taken off. */
const pasteTrimmed = (event: ClipboardEvent<HTMLInputElement>) => {
  const pasted = event.clipboardData.getData("text");
  const trimmed = pasted.trim();
  if (trimmed === pasted) {
    return;
  }
  event.preventDefault();
  const field = event.currentTarget;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  field.setRangeText(trimmed, start, end, "end");
  // Told as typing is, so the form and the host's state hear it.
  field.dispatchEvent(new Event("input", { bubbles: true }));
};

/**
 * A key, a token, a secret someone pastes once: masked, never offered to a password manager, never
 * read back by an agent, and pasted whole. Once it is saved the field never holds it again: it shows
 * only its last four, read only, with Replace, which empties it and puts the caret in it.
 */
export const SecretInput = ({
  maskedValue,
  onReplace,
  ref,
  ...rest
}: SecretInputProps) => {
  const words = useI18n().input;
  // Replace unmounts its own button: the new, empty field takes the caret once it is there.
  const replaced = useRef(false);
  const attach = (element: HTMLInputElement | null) => {
    assignRef(ref, element);
    if (element !== null && replaced.current) {
      replaced.current = false;
      element.focus();
    }
  };
  if (maskedValue !== undefined && maskedValue !== "") {
    return (
      <InputGroup>
        <InputGroupInput
          readOnly
          dir="ltr"
          value={`…${maskedValue}`}
          aria-label={rest["aria-label"]}
        />
        <InputGroupButton
          onClick={() => {
            replaced.current = true;
            onReplace?.();
          }}
        >
          {words.replace}
        </InputGroupButton>
      </InputGroup>
    );
  }
  // A key reads left to right in every language: the field does too, in a right-to-left page.
  return (
    <TextInput
      {...rest}
      {...unmanaged}
      ref={attach}
      slot="secret-input"
      dir="ltr"
      type="password"
      secret
      autoComplete="off"
      spellCheck={false}
      onPaste={pasteTrimmed}
    />
  );
};
