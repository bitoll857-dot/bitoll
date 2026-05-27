import { component$, Slot } from "@builder.io/qwik";

type AccessibilityOptionProps = {
  title: string;
};

export default component$<AccessibilityOptionProps>(({ title }) => {
  return (
    <div class="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <p class="text-sm font-bold text-cyan-200">{title}</p>
      <p class="mt-2 text-sm leading-6 text-slate-300">
        <Slot />
      </p>
    </div>
  );
});
