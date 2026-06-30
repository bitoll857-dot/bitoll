import { component$, type QRL } from "@builder.io/qwik";

type AccessibilitySegmentOption = {
  label: string;
  value: string;
  description: string;
};

type AccessibilitySegmentProps = {
  title: string;
  value: string;
  options: AccessibilitySegmentOption[];
  onChange$: QRL<(value: string) => void>;
};

export default component$<AccessibilitySegmentProps>(
  ({ title, value, options, onChange$ }) => {
    return (
      <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_16px_45px_rgba(2,6,23,0.24)]">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">
            {title}
          </h3>

          <span class="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] text-slate-400">
            {options.find((option) => option.value === value)?.label ?? "Padrao"}
          </span>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = value === option.value;
            const swatchClass =
              option.value === "blue"
                ? "bg-[#2563EB]"
                : option.value === "green"
                  ? "bg-[#16A34A]"
                  : option.value === "red"
                    ? "bg-[#DC2626]"
                    : option.value === "gray"
                      ? "bg-[#374151]"
                      : option.value === "white"
                        ? "bg-white"
                        : option.value === "elegant-light"
                          ? "bg-[#F8FAFC]"
                          : "bg-slate-300";

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                class={[
                  "group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition duration-300",
                  isSelected
                    ? "border-cyan-300/80 bg-cyan-400/15 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.18),0_18px_45px_rgba(6,182,212,0.12)]"
                    : "border-slate-800 bg-slate-950/80 text-slate-300 hover:border-cyan-400/40 hover:bg-slate-900 hover:text-cyan-100",
                ]}
                onClick$={() => onChange$(option.value)}
              >
                {isSelected && (
                  <span class="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />
                )}

                <span class="flex items-center gap-2 pr-5 text-sm font-black">
                  {title === "Contraste" && (
                    <span
                      aria-hidden="true"
                      class={[
                        "h-3.5 w-3.5 rounded-full border border-white/50 shadow-sm",
                        swatchClass,
                      ]}
                    />
                  )}
                  <span>{option.label}</span>
                </span>
                <span class="mt-1 block text-xs leading-5 text-slate-400">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);
