import { component$, type QRL } from "@builder.io/qwik";

type Props = {
  title: string;
  message: string;
  onClose$: QRL<() => void>;
};

export const AdminToast = component$<Props>(({ title, message, onClose$ }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      class="fixed right-4 top-4 z-[9999] w-[calc(100%-2rem)] max-w-[420px] rounded-2xl border border-cyan-400/30 bg-slate-950 p-4 text-left shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
            {title}
          </p>

          <p class="mt-2 break-words text-sm leading-6 text-slate-200">
            {message}
          </p>
        </div>

        <button
          type="button"
          aria-label="Fechar notificacao"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-300"
          onClick$={onClose$}
        >
          x
        </button>
      </div>
    </div>
  );
});