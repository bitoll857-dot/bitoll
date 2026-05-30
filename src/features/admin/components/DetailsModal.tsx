import { component$, type QRL } from "@builder.io/qwik";

type Props = {
  title: string;
  message: string;
  onClose$: QRL<() => void>;
};

export const DetailsModal = component$<Props>(
  ({ title, message, onClose$ }) => {
    return (
      <div class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/80 px-4">
        <div class="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                Detalhes
              </p>

              <h2 class="mt-2 text-xl font-black text-white">{title}</h2>
            </div>

            <button
              type="button"
              aria-label="Fechar detalhes"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm text-slate-300"
              onClick$={onClose$}
            >
              x
            </button>
          </div>

          <p class="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-300">
            {message}
          </p>
        </div>
      </div>
    );
  },
);