import { component$, type QRL } from "@builder.io/qwik";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "default";
  onCancel$: QRL<() => void>;
  onConfirm$: QRL<() => void>;
};

export const ConfirmModal = component$<Props>(
  ({ title, message, confirmLabel, tone, onCancel$, onConfirm$ }) => {
    return (
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 px-4 py-6 backdrop-blur-xl">
        <div class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
            Confirmacao
          </p>

          <h2 class="mt-3 text-2xl font-black text-white">{title}</h2>

          <p class="mt-3 text-sm leading-7 text-slate-300">{message}</p>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              autoFocus
              class="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50"
              onClick$={onCancel$}
            >
              Cancelar
            </button>

            <button
              type="button"
              class={[
                "rounded-xl px-4 py-2 text-sm font-black transition",
                tone === "danger"
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
              ]}
              onClick$={onConfirm$}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  },
);
