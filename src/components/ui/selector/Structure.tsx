import { component$, type QRL } from "@builder.io/qwik";

import type {
  ServiceStructureOption,
  StructureType,
} from "~/types/service-products";

type StructureSelectorProps = {
  options: ServiceStructureOption[];
  value: StructureType;
  onChange$: QRL<(value: StructureType) => void>;
};

export default component$<StructureSelectorProps>(({ options, value, onChange$ }) => {
  return (
    <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Nivel da estrutura
      </p>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              class={[
                "overflow-hidden rounded-2xl border text-left transition duration-300",
                isSelected
                  ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100"
                  : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-cyan-400/30 hover:text-cyan-200",
              ]}
              onClick$={() => onChange$(option.value)}
            >
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt={option.imageAlt}
                  width={320}
                  height={160}
                  class="h-28 w-full object-cover"
                />
              ) : (
                <span class="block h-28 w-full bg-slate-900" />
              )}

              <span class="block px-4 pt-4 text-sm font-bold">
                {option.label}
              </span>
              <span class="block px-4 pb-4 pt-2 text-xs leading-5 text-slate-400">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
