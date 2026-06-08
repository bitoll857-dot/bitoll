import { component$, type QRL, useSignal } from "@builder.io/qwik";

import Button from "../button/Button";
import type { Promotion } from "~/types/promotion";
import QuoteRequestModal from "../modal/QuoteRequest";
import AuthModal from "../modal/Auth";
import ActionToast from "../toast";
import { getCachedAuthUser } from "~/lib/supabase/client";
import { loadQuoteTemplateProductsFromSupabase } from "~/lib/supabase/platform-data";
import { formatMoney } from "~/lib/formatters/money";
import type { AuthMode } from "~/types/auth";
import type { ServiceProduct } from "~/types/service-products";

type PromotionDetailsModalProps = {
  promotion: Promotion;

  onClose$: QRL<() => void>;
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

const getPromotionSubtotal = (promotion: Promotion) =>
  promotion.articles.reduce(
    (total, article) => total + article.quantity * article.unitPrice,
    0,
  ) + promotion.installationFee;

const getPromotionTaxable = (promotion: Promotion) =>
  Math.max(getPromotionSubtotal(promotion) - promotion.discountAmount, 0);

const getPromotionIva = (promotion: Promotion) =>
  getPromotionTaxable(promotion) * 0.12;

const getPromotionTotal = (promotion: Promotion) =>
  getPromotionTaxable(promotion) + getPromotionIva(promotion);

const getQuoteProducts = (promotion: Promotion) =>
  promotion.articles.map((article) => ({
    id: article.id,
    name: article.name,
    quantity: `${article.quantity} unidade${article.quantity > 1 ? "s" : ""}`,
    estimatedQuantity: article.quantity,
    unitPrice: article.unitPrice,
    brand: article.brand,
    model: article.model,
    system: article.system,
    category: article.system,
    description: `${article.brand} ${article.model}`,
    detail: article.description,
    required: true,
  }));

export default component$<PromotionDetailsModalProps>(
  ({ promotion, onClose$  }) => {
    
    const quoteModal = useSignal(false);
    const loginNotice = useSignal(false);
    const authModal = useSignal(false);
    const authMode = useSignal<AuthMode>("login");

    const initialData = useSignal<{
      service: string;
      serviceTitle: string;
      originLabel: string;
      source: string;
      products: ServiceProduct[];
      discountAmount: number;
      currency: string;
    }>({
      service: "",
      serviceTitle: "",
      originLabel: "",
      source: "",
      products: getQuoteProducts(promotion),
      discountAmount: 0,
      currency: "MZN",
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

            <div class="mt-7 rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Factura da promocao
                </p>
                <p class="text-sm font-bold text-cyan-200">
                  Total: {formatMoney(getPromotionTotal(promotion), promotion.currency)}
                </p>
              </div>

              <div class="mt-4 overflow-x-auto">
                <table class="w-full min-w-[760px] text-left">
                  <thead class="border-b border-slate-800 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th class="py-3 pr-4">Artigo</th>
                      <th class="py-3 pr-4">Marca / Modelo</th>
                      <th class="py-3 pr-4">Sistema</th>
                      <th class="py-3 pr-4">Qtd</th>
                      <th class="py-3 pr-4">Unitario</th>
                      <th class="py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotion.articles.map((article) => (
                      <tr
                        key={article.id}
                        class="border-b border-slate-800 last:border-b-0"
                      >
                        <td class="py-3 pr-4">
                          <p class="text-sm font-semibold text-white">
                            {article.name}
                          </p>
                          <p class="mt-1 text-xs text-slate-500">
                            {article.description}
                          </p>
                        </td>
                        <td class="py-3 pr-4 text-sm text-slate-300">
                          {article.brand} / {article.model}
                        </td>
                        <td class="py-3 pr-4 text-sm text-cyan-200">
                          {article.system}
                        </td>
                        <td class="py-3 pr-4 text-sm text-slate-300">
                          {article.quantity}
                        </td>
                        <td class="py-3 pr-4 text-sm text-slate-300">
                          {formatMoney(article.unitPrice, promotion.currency)}
                        </td>
                        <td class="py-3 text-sm font-semibold text-white">
                          {formatMoney(
                            article.quantity * article.unitPrice,
                            promotion.currency,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div class="mt-5 grid gap-3 sm:grid-cols-4">
                <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Instalacao
                  </p>
                  <p class="mt-2 text-sm font-semibold text-slate-100">
                    {formatMoney(promotion.installationFee, promotion.currency)}
                  </p>
                </div>
                <div class="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-emerald-300">
                    Desconto
                  </p>
                  <p class="mt-2 text-sm font-semibold text-emerald-100">
                    -{formatMoney(promotion.discountAmount, promotion.currency)}
                  </p>
                </div>
                <div class="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-amber-300">
                    IVA 12%
                  </p>
                  <p class="mt-2 text-sm font-semibold text-amber-100">
                    {formatMoney(getPromotionIva(promotion), promotion.currency)}
                  </p>
                </div>
                <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <p class="text-xs uppercase tracking-[0.14em] text-cyan-300">
                    Total
                  </p>
                  <p class="mt-2 text-sm font-bold text-cyan-100">
                    {formatMoney(getPromotionTotal(promotion), promotion.currency)}
                  </p>
                </div>
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
              onClick$={async () => {
                if (
                  !getCachedAuthUser() ||
                  localStorage.getItem("bitoll-auth-state") === "guest"
                ) {
                  loginNotice.value = true;
                  return;
                }

                const templateProducts = promotion.quoteTemplateId
                  ? await loadQuoteTemplateProductsFromSupabase(
                      promotion.quoteTemplateId,
                    )
                  : [];

                initialData.value = {
                  service: promotion.serviceSlug,
                  serviceTitle: promotion.title,
                  originLabel: `promocao ${promotion.title}`,
                  source: "promotion",
                  products: templateProducts.length
                    ? templateProducts
                    : getQuoteProducts(promotion),
                  discountAmount: promotion.discountAmount,
                  currency: promotion.currency,
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

        <ActionToast
          isOpen={loginNotice.value}
          title="Login necessario"
          message="Esta solicitacao precisa ficar ligada a sua conta para ser acompanhada depois."
          actionLabel="Entrar"
          onClose$={() => {
            loginNotice.value = false;
          }}
          onAction$={() => {
            loginNotice.value = false;
            authMode.value = "login";
            authModal.value = true;
          }}
        />

        {authModal.value && (
          <AuthModal
            mode={authMode.value}
            onClose$={() => {
              authModal.value = false;
            }}
            onModeChange$={(mode) => {
              authMode.value = mode;
            }}
          />
        )}

      </div>
    );
  },
);
