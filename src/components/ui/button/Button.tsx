import { component$, Slot, type QRL } from "@builder.io/qwik";

interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "ghost"
    | "custom";

  size?:
    | "sm"
    | "md"
    | "lg"
    | "none";

  position?:
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly";

  fullWidth?: boolean;
  onClick$?: QRL<() => Promise<void> | void>;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  disabled?: boolean;
  wrapperClass?: string;
  buttonClass?: string;
  spacing?: "normal" | "none";
}

export default component$<ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    position = "start",
    fullWidth = false,
    onClick$,
    type = "button",
    ariaLabel,
    disabled = false,
    wrapperClass,
    buttonClass,
    spacing = "normal",
  }) => {
    return (
      <div
        class={[
          "flex",

          /* POSITION */

          position === "start" &&
            "justify-start",

          position === "center" &&
            "justify-center",

          position === "end" &&
            "justify-end",

          position === "between" &&
            "justify-between",

          position === "around" &&
            "justify-around",

          position === "evenly" &&
            "justify-evenly",

          /* WIDTH */

          fullWidth &&
            "w-full",

          wrapperClass,
        ]}
      >
        <button
          type={type}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick$={onClick$}
          class={[
            "rounded-xl font-semibold transition duration-300",
            disabled && "cursor-not-allowed opacity-60",

            spacing === "normal" &&
              "my-6",

            /* VARIANTS */

            variant === "primary" &&
              "bg-cyan-500 hover:bg-cyan-400 text-slate-950",

            variant === "secondary" &&
              "border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 text-white",

            variant === "danger" &&
              "bg-red-500 hover:bg-red-400 text-white",

            variant === "success" &&
              "bg-green-500 hover:bg-green-400 text-white",

            variant === "ghost" &&
              "bg-transparent hover:bg-slate-800 text-white",

            /* SIZES */

            size === "sm" &&
              "px-4 py-2 text-sm",

            size === "md" &&
              "px-6 py-3 text-base",

            size === "lg" &&
              "px-8 py-4 text-lg",

            /* FULL WIDTH */

            fullWidth &&
              "w-full",

            buttonClass,
          ]}
        >
          <Slot />
        </button>
      </div>
    );
  }
);
