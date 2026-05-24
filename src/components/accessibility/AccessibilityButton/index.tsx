import { component$, type QRL } from "@builder.io/qwik";

type AccessibilityButtonProps = {
  onClick$: QRL<() => void>;
};

export default component$<AccessibilityButtonProps>(({ onClick$ }) => {
  return (
    <button
      type="button"
      aria-label="Abrir opcoes de acessibilidade"
      class="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-sm font-black text-cyan-300 backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"
      onClick$={onClick$}
    >
      A
    </button>
  );
});
