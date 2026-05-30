import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import QuoteRequestModal from "../modal/QuoteRequest";
import PromotionDetailsModal from "../modal/Promotion";
import AuthModal from "../modal/Auth";
import Button from "../button/Button";
import ActionToast from "~/components/ui/toast";
import { getCachedAuthUser } from "~/lib/supabase/client";
import {
  loadPromotionsFromSupabase,
  loadQuoteTemplateProductsFromSupabase,
} from "~/lib/supabase/platform-data";
import type { AuthMode } from "~/types/auth";
import type { Promotion } from "~/types/promotion";
import type { ServiceProduct } from "~/types/service-products";

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

const formatMoney = (value: number, currency: string) =>
  `${value.toLocaleString("pt-MZ")} ${currency}`;

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

export default component$(function PromotionsSection() {
  const selectedPromotionSlug = useSignal<string | null>(null);
  const quoteModal = useSignal(false);
  const loginNotice = useSignal(false);
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("login");
  const promotions = useSignal<Promotion[]>([]);
  const isLoading = useSignal(true);
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
    products: [],
    discountAmount: 0,
    currency: "MZN",
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    promotions.value = await loadPromotionsFromSupabase();
    isLoading.value = false;
  });

  const selectedPromotion = promotions.value.find(
    (promotion) => promotion.slug === selectedPromotionSlug.value,
  );

  return (
    <section class="relative overflow-hidden bg-slate-950 py-10">
      {/* Background Effects */}
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-32 left-0 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div class="absolute -bottom-32 right-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        class="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to_right, #ffffff_1px, transparent_1px),
            linear-gradient(to_bottom, #ffffff_1px, transparent_1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      <div class="container relative z-10 mx-auto p-6">
        <div class="mb-10 max-w-3xl">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Promocoes Bitoll
          </p>
          <h2 class="mt-3 text-3xl font-bold text-white">
            Ofertas ativas para instalacoes profissionais
          </h2>
          <p class="mt-4 text-sm leading-7 text-slate-400">
            Veja desconto, periodo, tecnologias e condicoes principais antes
            de solicitar uma cotacao.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {promotions.value.map((promotion) => (
            <article
              key={promotion.id}
              class="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div class="relative h-56 overflow-hidden">
                <img
                  src={promotion.image}
                  alt={promotion.title}
                  width={1200}
                  height={720}
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                <div class="absolute left-5 top-5 flex flex-wrap gap-2">
                  {promotion.discount && (
                    <span class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200 backdrop-blur-xl">
                      {promotion.discount}
                    </span>
                  )}

                  {promotion.badge && (
                    <span class="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-xl">
                      {promotion.badge}
                    </span>
                  )}
                </div>
              </div>

              <div class="p-6">
                <div class="flex items-center justify-between gap-3">
                  <span class="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {promotion.active ? "Ativa" : "Inativa"}
                  </span>

                  <span class="text-xs font-semibold text-slate-500">
                    ate {formatDate(promotion.endDate)}
                  </span>
                </div>

                <h3 class="mt-5 text-xl font-bold text-white">
                  {promotion.title}
                </h3>

                <p class="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                  {promotion.shortDescription}
                </p>

                <div class="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div class="flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-400">Subtotal</span>
                    <span class="font-semibold text-slate-200">
                      {formatMoney(getPromotionSubtotal(promotion), promotion.currency)}
                    </span>
                  </div>
                  <div class="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-400">Desconto</span>
                    <span class="font-semibold text-emerald-300">
                      -{formatMoney(promotion.discountAmount, promotion.currency)}
                    </span>
                  </div>
                  <div class="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span class="text-slate-400">IVA 12%</span>
                    <span class="font-semibold text-amber-200">
                      {formatMoney(getPromotionIva(promotion), promotion.currency)}
                    </span>
                  </div>
                  <div class="mt-3 border-t border-slate-800 pt-3">
                    <div class="flex items-center justify-between gap-3">
                      <span class="text-sm font-semibold text-white">Total</span>
                      <span class="text-lg font-bold text-cyan-200">
                        {formatMoney(getPromotionTotal(promotion), promotion.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-5 flex flex-wrap gap-2">
                  {(promotion.technologies ?? []).slice(0, 3).map((item) => (
                    <span
                      key={item}
                      class="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div class="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                  <Button
                    spacing="none"
                    buttonClass="rounded-2xl px-4 py-3 text-sm font-bold"
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
                    Solicitar
                  </Button>

                  <Button
                    variant="secondary"
                    spacing="none"
                    buttonClass="rounded-2xl px-4 py-3 text-sm font-semibold"
                    onClick$={() => {
                      selectedPromotionSlug.value = promotion.slug;
                    }}
                  >
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!isLoading.value && promotions.value.length === 0 && (
          <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            Ainda nao existem promocoes ativas no Supabase.
          </div>
        )}
      </div>

      {selectedPromotion && (
        <PromotionDetailsModal
          promotion={selectedPromotion}
          onClose$={() => {
            selectedPromotionSlug.value = null;
          }}
        />
      )}

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
        message="A cotacao da promocao precisa ficar ligada a uma conta para acompanhamento posterior."
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

    </section>
  );
});
