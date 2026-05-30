import { component$ } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import { operatorStatuses } from "../utils/admin.utils";

type Props = {
  admin: AdminPanelState;
};

export const OperatorQuotesPanel = component$<Props>(({ admin }) => {
  return (
    <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 class="text-xl font-black text-white">Servicos em progresso</h2>

      <p class="mt-2 text-sm leading-6 text-slate-400">
        Atualize o estado dos pedidos aprovados para o cliente acompanhar.
      </p>

      <div class="mt-5 grid gap-4">
        {admin.operatorQuotes.value.map((quote) => {
          const draft = admin.drafts[quote.id];

          return (
            <article
              key={quote.id}
              class="rounded-2xl border border-slate-800 bg-slate-950 p-4"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                    {quote.quote_number}
                  </p>

                  <h3 class="mt-2 text-lg font-black text-white">
                    {quote.profiles?.full_name ?? "Cliente"}
                  </h3>

                  <p class="mt-1 text-xs text-slate-500">
                    {quote.profiles?.phone ?? quote.profiles?.email ?? "Sem contacto"}
                  </p>
                </div>

                <span class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
                  {draft?.status ?? "Em avaliacao"}
                </span>
              </div>

              {draft && (
                <div class="mt-4 grid gap-3 md:grid-cols-2">
                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Estado
                    </span>

                    <select
                      value={draft.status}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                      onChange$={(event) => {
                        draft.status = (
                          event.target as HTMLSelectElement
                        ).value as typeof draft.status;
                      }}
                    >
                      {operatorStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Progresso
                    </span>

                    <input
                      value={draft.progress}
                      type="number"
                      min={0}
                      max={100}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                      onInput$={(event) => {
                        draft.progress = Number(
                          (event.target as HTMLInputElement).value || 0,
                        );
                      }}
                    />
                  </label>

                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Tecnico
                    </span>

                    <input
                      value={draft.technician}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                      onInput$={(event) => {
                        draft.technician = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label class="block">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Previsao
                    </span>

                    <input
                      value={draft.estimatedCompletion}
                      type="date"
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                      onInput$={(event) => {
                        draft.estimatedCompletion = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label class="block md:col-span-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Proximo passo
                    </span>

                    <input
                      value={draft.nextStep}
                      class="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none"
                      onInput$={(event) => {
                        draft.nextStep = (
                          event.target as HTMLInputElement
                        ).value;
                      }}
                    />
                  </label>

                  <label class="block md:col-span-2">
                    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Atualizacoes
                    </span>

                    <textarea
                      value={draft.updatesText}
                      class="mt-2 min-h-24 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none"
                      onInput$={(event) => {
                        draft.updatesText = (
                          event.target as HTMLTextAreaElement
                        ).value;
                      }}
                    />
                  </label>
                </div>
              )}

              <button
                type="button"
                class="mt-4 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
                onClick$={() => admin.saveQuoteProgress$(quote.id)}
              >
                Guardar progresso
              </button>
            </article>
          );
        })}

        {admin.operatorQuotes.value.length === 0 && (
          <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
            Nenhuma cotacao em progresso encontrada.
          </div>
        )}
      </div>
    </section>
  );
});