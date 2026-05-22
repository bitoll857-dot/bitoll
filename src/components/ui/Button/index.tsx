import { component$, Slot } from "@builder.io/qwik";

interface ButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "ghost";

  size?:
    | "sm"
    | "md"
    | "lg";

  position?:
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly";

  fullWidth?: boolean;
}

export default component$<ButtonProps>(
  ({
    variant = "primary",
    size = "md",
    position = "start",
    fullWidth = false,
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
        ]}
      >
        <button
          class={[
            "rounded-xl font-semibold transition duration-300  my-6",

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
          ]}
        >
          <Slot />
        </button>
      </div>
    );
  }
);