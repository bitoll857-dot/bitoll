import { $, component$, useSignal } from "@builder.io/qwik";

import type { AdminPanelState } from "../hooks/useAdminPanel";
import type {
  AdminProcedureStep,
  AdminStructureOption,
  OperatorQuote,
} from "../types/admin.types";

type Props = {
  admin: AdminPanelState;
};

const tableClass = "w-full text-left text-sm max-md:block";
const tableHeadClass =
  "text-xs uppercase tracking-[0.14em] text-slate-500 max-md:hidden";
const tableBodyClass =
  "divide-y divide-slate-800 max-md:grid max-md:gap-3 max-md:divide-y-0";
const tableRowClass =
  "max-md:block max-md:rounded-xl max-md:border max-md:border-slate-800 max-md:bg-slate-950 max-md:p-4";
const tableCellClass =
  "py-3 max-md:flex max-md:items-start max-md:justify-between max-md:gap-4 max-md:border-b max-md:border-slate-800 max-md:py-3 max-md:text-right max-md:last:border-b-0 max-md:before:shrink-0 max-md:before:content-[attr(data-label)] max-md:before:text-left max-md:before:text-xs max-md:before:font-bold max-md:before:uppercase max-md:before:tracking-[0.12em] max-md:before:text-slate-500";
const tableActionCellClass = `${tableCellClass} text-right`;

const asProcedureSteps = (
  quote: OperatorQuote,
  structures: AdminStructureOption[],
): AdminProcedureStep[] => {
  const steps = quote.request_payload?.procedureSteps;

  if (Array.isArray(steps) && steps.length > 0) {
    return steps
      .map((step) => {
        if (!step || typeof step !== "object") {
          return null;
        }

        const record = step as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label.trim() : "";
        const day =
          typeof record.day === "number" || typeof record.day === "string"
            ? Math.max(1, Math.ceil(Number(record.day) || 1))
            : 1;

        return label ? { checked: Boolean(record.checked), day, label } : null;
      })
      .filter((step): step is AdminProcedureStep => Boolean(step));
  }

  const structureType =
    typeof quote.request_payload?.structureType === "string"
      ? quote.request_payload.structureType
      : "";
  const structure = structures.find(
    (option) =>
      option.service_slug === quote.service_slug &&
      option.structure === structureType,
  );

  return (structure?.steps ?? []).map((step) => ({
    checked: false,
    day: step.day,
    label: step.label,
  }));
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Por definir";
  }

  const [year, month, day] = value.split("-");

  return day && month && year ? `${day}/${month}/${year}` : value;
};

const getStartDate = (quote: OperatorQuote) =>
  typeof quote.request_payload?.serviceStartDate === "string"
    ? quote.request_payload.serviceStartDate
    : quote.created_at.slice(0, 10);

const getProgress = (
  quote: OperatorQuote,
  structures: AdminStructureOption[],
) => {
  const steps = asProcedureSteps(quote, structures);
  const completed = steps.filter((step) => step.checked).length;

  return {
    completed,
    percent: steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0,
    steps,
  };
};

const isAssignedToCurrentOperator = (
  admin: AdminPanelState,
  quote: OperatorQuote,
) => {
  if (admin.adminAccess.value.role !== "operador") {
    return true;
  }

  return quote.technician_id === String(admin.authUser.value?.id ?? "");
};

export const OperatorQuotesPanel = component$<Props>(({ admin }) => {
  const segmentQuoteId = useSignal("");
  const segmentComplaintText = useSignal("");
  const savingQuoteId = useSignal("");
  const assignedQuotes = admin.operatorQuotes.value.filter((quote) =>
    isAssignedToCurrentOperator(admin, quote),
  );
  const activeQuotes = assignedQuotes.filter(
    (quote) => quote.status === "em_atividade" || quote.status === "aprovado",
  );
  const unfinishedQuotes = assignedQuotes.filter(
    (quote) => quote.status !== "finalizado" && quote.status !== "concluido",
  );
  const finishedQuotes = assignedQuotes.filter(
    (quote) => quote.status === "finalizado" || quote.status === "concluido",
  );
  const segmentQuote = assignedQuotes.find(
    (quote) => quote.id === segmentQuoteId.value,
  );
  const segmentProgress = segmentQuote
    ? getProgress(segmentQuote, admin.ownerStructureOptions.value)
    : { completed: 0, percent: 0, steps: [] as AdminProcedureStep[] };

  return (
    <section class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
            Operacao
          </p>
          <h2 class="mt-1 text-2xl font-black text-white">
            Servicos em progresso
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Acompanhe actividades, continue servicos por terminar e consulte o
            historico dos trabalhos finalizados.
          </p>
        </div>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-3">
        <div class="rounded-xl border border-cyan-300/20 bg-slate-950 p-4">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/70">
            Actividades ativas
          </p>
          <p class="mt-2 text-2xl font-black text-cyan-100">
            {activeQuotes.length}
          </p>
        </div>
        <div class="rounded-xl border border-amber-300/20 bg-slate-950 p-4">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-amber-100/70">
            Por terminar
          </p>
          <p class="mt-2 text-2xl font-black text-amber-100">
            {unfinishedQuotes.length}
          </p>
        </div>
        <div class="rounded-xl border border-emerald-300/20 bg-slate-950 p-4">
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/70">
            Terminados por mim
          </p>
          <p class="mt-2 text-2xl font-black text-emerald-100">
            {finishedQuotes.length}
          </p>
        </div>
      </div>

      <div class="mt-6 grid gap-5">
        <section class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-black text-white">Actividades ativas</h3>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              {activeQuotes.length} em curso
            </span>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeQuotes.map((quote) => {
              const progress = getProgress(quote, admin.ownerStructureOptions.value);

              return (
                <article
                  key={`active-${quote.id}`}
                  class="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                    {quote.quote_number}
                  </p>
                  <h4 class="mt-2 font-black text-white">
                    {quote.service_slug ?? "Servico Bitoll"}
                  </h4>
                  <p class="mt-1 text-sm text-slate-400">
                    {quote.profiles?.full_name ?? "Cliente"}
                  </p>
                  <p class="mt-2 text-xs font-bold text-slate-500">
                    Inicio: {formatDate(getStartDate(quote))} / Fim:{" "}
                    {formatDate(quote.estimated_completion)}
                  </p>
                  <div class="mt-3">
                    <div class="flex justify-between text-xs font-bold text-slate-500">
                      <span>
                        {progress.completed}/{progress.steps.length} passos
                      </span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        class="h-full rounded-full bg-cyan-300"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}

            {activeQuotes.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                Nenhuma actividade ativa atribuida a este operador.
              </div>
            )}
          </div>
        </section>

        <section class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-black text-white">Servicos por terminar</h3>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              {unfinishedQuotes.length} pendente
              {unfinishedQuotes.length === 1 ? "" : "s"}
            </span>
          </div>

          <div class="mt-4 md:overflow-x-auto">
            <table class={[tableClass, "md:min-w-[760px]"]}>
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Servico</th>
                  <th class="pb-3">Periodo</th>
                  <th class="pb-3">Progresso</th>
                  <th class="pb-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody class={tableBodyClass}>
                {unfinishedQuotes.map((quote) => {
                  const progress = getProgress(
                    quote,
                    admin.ownerStructureOptions.value,
                  );

                  return (
                    <tr key={`unfinished-${quote.id}`} class={tableRowClass}>
                      <td data-label="Servico" class={tableCellClass}>
                        <div class="font-semibold text-white">
                          {quote.service_slug ?? "Servico Bitoll"}
                        </div>
                        <div class="mt-1 text-xs text-slate-500">
                          {quote.quote_number} /{" "}
                          {quote.profiles?.full_name ?? "Cliente"}
                        </div>
                      </td>
                      <td data-label="Periodo" class={tableCellClass}>
                        {formatDate(getStartDate(quote))} -{" "}
                        {formatDate(quote.estimated_completion)}
                      </td>
                      <td data-label="Progresso" class={tableCellClass}>
                        <span class="font-bold text-slate-200">
                          {progress.completed}/{progress.steps.length} passos
                        </span>
                        <span class="ml-2 text-xs text-slate-500">
                          {progress.percent}%
                        </span>
                      </td>
                      <td data-label="Acoes" class={tableActionCellClass}>
                        <button
                          type="button"
                          class="inline-flex h-9 items-center rounded-full border border-cyan-300/40 px-3 text-xs font-black text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
                          onClick$={() => {
                            segmentQuoteId.value = quote.id;
                            segmentComplaintText.value = "";
                          }}
                        >
                          Seguimentar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {unfinishedQuotes.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                Nenhum servico por terminar.
              </div>
            )}
          </div>
        </section>

        <section class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-lg font-black text-white">Historico terminado</h3>
            <span class="rounded-full border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
              {finishedQuotes.length} finalizado
              {finishedQuotes.length === 1 ? "" : "s"}
            </span>
          </div>

          <div class="mt-4 md:overflow-x-auto">
            <table class={[tableClass, "md:min-w-[680px]"]}>
              <thead class={tableHeadClass}>
                <tr>
                  <th class="pb-3">Servico</th>
                  <th class="pb-3">Periodo</th>
                  <th class="pb-3">Cliente</th>
                </tr>
              </thead>
              <tbody class={tableBodyClass}>
                {finishedQuotes.map((quote) => (
                  <tr key={`finished-${quote.id}`} class={tableRowClass}>
                    <td data-label="Servico" class={tableCellClass}>
                      <div class="font-semibold text-white">
                        {quote.service_slug ?? "Servico Bitoll"}
                      </div>
                      <div class="mt-1 text-xs text-slate-500">
                        {quote.quote_number}
                      </div>
                    </td>
                    <td data-label="Periodo" class={tableCellClass}>
                      {formatDate(getStartDate(quote))} -{" "}
                      {formatDate(quote.estimated_completion)}
                    </td>
                    <td data-label="Cliente" class={tableCellClass}>
                      {quote.profiles?.full_name ?? "Cliente"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {finishedQuotes.length === 0 && (
              <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
                Ainda nao ha servicos terminados por este operador.
              </div>
            )}
          </div>
        </section>
      </div>

      {segmentQuote && (
        <div class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
          <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl shadow-slate-950">
            <div class="sticky top-0 z-10 border-b border-slate-800 bg-slate-950 p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                    Seguimentar servico
                  </p>
                  <h3 class="mt-1 text-xl font-black text-white">
                    {segmentQuote.service_slug ?? "Servico Bitoll"}
                  </h3>
                  <p class="mt-1 text-sm text-slate-400">
                    {segmentQuote.profiles?.full_name ?? "Cliente"} /{" "}
                    {segmentQuote.quote_number}
                  </p>
                </div>

                <button
                  type="button"
                  class="h-9 w-9 rounded-full border border-slate-700 text-sm font-black text-slate-200"
                  aria-label="Fechar seguimento"
                  onClick$={() => {
                    segmentQuoteId.value = "";
                    segmentComplaintText.value = "";
                  }}
                >
                  x
                </button>
              </div>

              <div class="mt-4">
                <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>
                    {segmentProgress.completed}/{segmentProgress.steps.length}{" "}
                    passos concluidos
                  </span>
                  <span>{segmentProgress.percent}%</span>
                </div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    class="h-full rounded-full bg-cyan-300"
                    style={{ width: `${segmentProgress.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div class="grid gap-3 p-5">
              {segmentProgress.steps.map((step, index) => (
                <label
                  key={`segment-${segmentQuote.id}-${index}`}
                  class={[
                    "flex flex-col gap-3 rounded-xl border p-3 text-sm transition md:flex-row md:items-center md:justify-between",
                    step.checked
                      ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50"
                      : "border-slate-800 bg-slate-900/70 text-slate-200",
                  ]}
                >
                  <span class="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={step.checked}
                      class="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-400"
                      onChange$={(event) => {
                        const nextSteps = segmentProgress.steps.map(
                          (item, stepIndex) =>
                            stepIndex === index
                              ? {
                                  ...item,
                                  checked: (event.target as HTMLInputElement)
                                    .checked,
                                }
                              : item,
                        );

                        segmentQuote.request_payload = {
                          ...(segmentQuote.request_payload ?? {}),
                          procedureSteps: nextSteps,
                        };
                        admin.operatorQuotes.value = [
                          ...admin.operatorQuotes.value,
                        ];
                      }}
                    />
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-cyan-200">
                      {index + 1}
                    </span>
                    <span class="min-w-0 font-bold">{step.label}</span>
                  </span>

                  <span class="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-slate-400">
                    Dia {step.day}
                  </span>
                </label>
              ))}

              {segmentProgress.steps.length === 0 && (
                <div class="rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
                  Este servico ainda nao tem passos definidos pelo admin.
                </div>
              )}

              <label class="block">
                <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Reclamacao opcional
                </span>
                <textarea
                  value={segmentComplaintText.value}
                  class="mt-2 min-h-28 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-white outline-none"
                  onInput$={(event) => {
                    segmentComplaintText.value = (
                      event.target as HTMLTextAreaElement
                    ).value;
                  }}
                />
              </label>

              <div class="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
                  onClick$={() => {
                    segmentQuoteId.value = "";
                    segmentComplaintText.value = "";
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  class="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
                  disabled={savingQuoteId.value === segmentQuote.id}
                  onClick$={$(async () => {
                    savingQuoteId.value = segmentQuote.id;
                    await admin.saveQuoteProgress$(
                      segmentQuote.id,
                      segmentComplaintText.value,
                    );
                    savingQuoteId.value = "";
                    segmentQuoteId.value = "";
                    segmentComplaintText.value = "";
                  })}
                >
                  Guardar seguimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
