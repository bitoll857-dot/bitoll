import { component$, type QRL, useTask$ } from "@builder.io/qwik";

type ActionToastProps = {
  isOpen: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction$?: QRL<() => void>;
  onClose$: QRL<() => void>;
};

export default component$<ActionToastProps>(
  ({ isOpen, title, message, actionLabel, onAction$, onClose$ }) => {
    useTask$(({ track, cleanup }) => {
      track(() => isOpen);

      if (!isOpen) {
        return;
      }

      const timeoutId = setTimeout(() => {
        onClose$();
      }, 5000);

      cleanup(() => clearTimeout(timeoutId));
    });

    if (!isOpen) {
      return null;
    }

    return (
      <div class="fixed bottom-5 left-5 z-[650] w-[calc(100%-2.5rem)] max-w-[420px] rounded-3xl border border-cyan-400/25 bg-slate-950/95 p-4 text-left shadow-[0_18px_70px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {title}
            </p>
            <p class="mt-2 text-sm leading-6 text-slate-300">
              {message}
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar notificacao"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-sm text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200"
            onClick$={onClose$}
          >
            x
          </button>
        </div>

        {actionLabel && onAction$ && (
          <button
            type="button"
            class="mt-4 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition duration-300 hover:bg-cyan-300"
            onClick$={onAction$}
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  },
);
