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
      <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
        <h3 class="text-sm font-bold uppercase tracking-[0.16em] text-slate-300">
          {title}
        </h3>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                class={[
                  "rounded-2xl border px-4 py-4 text-left transition duration-300",
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100"
                    : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200",
                ]}
                onClick$={() => onChange$(option.value)}
              >
                <span class="block text-sm font-bold">{option.label}</span>
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
