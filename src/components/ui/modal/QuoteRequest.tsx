import { component$, type QRL } from "@builder.io/qwik";

import QuoteRequestForm from "../forms/QuoteRequest";
import type { ServiceProduct } from "~/types/service-products";

type QuoteRequestModalProps = {
  onClose$: QRL<() => void>;
  initialData: {
    service?: string;
    serviceTitle?: string;
    originLabel?: string;
    source?: string;
    structureType?: string;
    products?: ServiceProduct[];
    discountAmount?: number;
    currency?: string;
  };
};

export default component$<QuoteRequestModalProps>(
  ({ onClose$, initialData }) => {
    return (
      <div class="fixed inset-0 z-[400] grid place-items-center p-4">
        <button
          type="button"
          aria-label="Fechar formulario de orcamento"
          class="absolute inset-0 h-full w-full bg-slate-950/75 backdrop-blur-xl"
          onClick$={onClose$}
        />

        <div class="relative z-10 max-h-[92vh] w-full max-w-[1280px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute right-5 top-5 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>

          <div class="flex items-start justify-between gap-4 pr-14">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Orcamento Bitoll
              </p>

              <h2 class="mt-2 text-2xl font-bold text-white">
                Solicitar{" "}
                <span class="text-red-500">
                  {initialData.serviceTitle ?? initialData.service}
                </span>
              </h2>

              <p class="mt-2 max-w-[720px] text-sm leading-6 text-slate-400">
                Preencha os dados principais para a equipa Bitoll perceber o
                pedido, confirmar as imagens da obra e ajustar a cotacao.
              </p>
            </div>
          </div>

          <QuoteRequestForm initialData={initialData} />
        </div>
      </div>
    );
  },
);
