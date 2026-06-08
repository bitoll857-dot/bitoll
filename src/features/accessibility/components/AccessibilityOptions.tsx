import { component$, Slot } from "@builder.io/qwik";

type AccessibilityOptionProps = {
  title: string;
};

export default component$<AccessibilityOptionProps>(({ title }) => {
  return (
    <div class="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 shadow-[0_16px_45px_rgba(6,182,212,0.08)]">
      <div class="flex gap-3">
        <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-sm font-black text-cyan-100">
          i
        </span>

        <div>
          <p class="text-sm font-black text-cyan-100">{title}</p>
          <p class="mt-1 text-sm leading-6 text-slate-300">
            <Slot />
          </p>
        </div>
      </div>
    </div>
  );
});
