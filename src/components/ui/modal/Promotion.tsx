import { component$, type QRL, useSignal } from "@builder.io/qwik";

import Button from "../button/Button";
import type { Promotion } from "~/types/promotion";
import QuoteRequestModal from "../modal/QuoteRequest";

type PromotionDetailsModalProps = {
  promotion: Promotion;

  onClose$: QRL<() => void>;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

export default component$<PromotionDetailsModalProps>(
  ({ promotion, onClose$  }) => {
    
    const quoteModal = useSignal(false);

    const initialData = useSignal({
      service: "",
      source: "",
    });

    return (
      <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
        <button
          type="button"
          aria-label="Fechar detalhes da promocao"
          class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
          onClick$={onClose$}
        />

        <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[920px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
          <div class="relative h-64 overflow-hidden rounded-t-3xl">
            <img
              src={promotion.image}
              alt={promotion.title}
              width={1200}
              height={640}
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            <button
              type="button"
              aria-label="Fechar"
              class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-950/80 text-lg text-slate-300 backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              onClick$={onClose$}
            >
              x
            </button>
          </div>

          <div class="p-6 sm:p-8">
            <div class="flex flex-wrap items-center gap-3">
              {promotion.discount && (
                <span class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
                  {promotion.discount}
                </span>
              )}

              {promotion.badge && (
                <span class="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300">
                  {promotion.badge}
                </span>
              )}

              <span class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                {promotion.active ? "Ativa" : "Inativa"}
              </span>
            </div>

            <h2 class="mt-5 text-3xl font-bold text-white">
              {promotion.title}
            </h2>

            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {promotion.description}
            </p>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Periodo
                </p>
                <p class="mt-2 text-sm font-semibold text-slate-100">
                  {formatDate(promotion.startDate)} ate{" "}
                  {formatDate(promotion.endDate)}
                </p>
              </div>

              <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Condicao
                </p>
                <p class="mt-2 text-sm font-semibold text-slate-100">
                  Sujeita a avaliacao tecnica e disponibilidade.
                </p>
              </div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Inclui
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  {(promotion.features ?? []).map((feature) => (
                    <span
                      key={feature}
                      class="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Tecnologias
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  {(promotion.technologies ?? []).map((technology) => (
                    <span
                      key={technology}
                      class="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
              
            <Button
              spacing="none"
              buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
              onClick$={() => {
                initialData.value = {
                  service: promotion.slug,
                  source: "promotion",
                };

                quoteModal.value = true;
              }}
            >
              Solicitar cotacao
            </Button>

              <Button
                variant="secondary"
                spacing="none"
                buttonClass="rounded-2xl px-5 py-3 text-sm font-semibold"
                onClick$={onClose$}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>

        {quoteModal.value && (
          <QuoteRequestModal
            initialData={initialData.value}
            onClose$={() => {
              quoteModal.value = false;
            }}
          />
        )}

      </div>
    );
  },
);
