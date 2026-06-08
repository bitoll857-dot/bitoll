import {
  $,
  component$,
  type QRL,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import ProductsTable from "../table/Products";
import StructureSelector from "../selector/Structure";
import QuoteRequestModal from "../modal/QuoteRequest";
import AuthModal from "../modal/Auth";
import Button from "../button/Button";
import ActionToast from "../toast";

import { getCachedAuthUser } from "~/lib/supabase/client";
import {
  loadServiceQuoteTemplatesFromSupabase,
  loadServiceStructureOptionsFromSupabase,
} from "~/lib/supabase/platform-data";
import { formatMoney } from "~/lib/formatters/money";

import type {
  ServiceQuoteTemplateOption,
  ServiceStructureOption,
  StructureType,
} from "~/types/service-products";
import type { ServiceProduct } from "~/types/service-products";
import type { AuthMode } from "~/types/auth";

type ServiceProductsModalProps = {
  serviceSlug: string;

  serviceTitle: string;

  onClose$: QRL<() => void>;
};

export default component$<ServiceProductsModalProps>(
  ({ serviceSlug, serviceTitle, onClose$ }) => {
    const structureType = useSignal<StructureType>("basica");

    const selectedProductId = useSignal<string | null>(null);
    const selectedQuoteId = useSignal<string | null>(null);
    const productDisplayMode = useSignal<"table" | "cards" | "compact">("table");

    const quoteModal = useSignal(false);
    const quotePreviewModal = useSignal(false);
    const loginNotice = useSignal(false);
    const authModal = useSignal(false);
    const authMode = useSignal<AuthMode>("login");
    const quotes = useSignal<ServiceQuoteTemplateOption[]>([]);
    const quotesLoading = useSignal(true);
    const structureOptions = useSignal<ServiceStructureOption[]>([]);
    const structuresLoading = useSignal(true);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async () => {
      structuresLoading.value = true;
      const options = await loadServiceStructureOptionsFromSupabase(serviceSlug);
      structureOptions.value = options;

      if (
        options.length > 0 &&
        !options.some((option) => option.value === structureType.value)
      ) {
        structureType.value = options[0].value;
      }

      structuresLoading.value = false;
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(async ({ track }) => {
      track(() => structureType.value);
      track(() => structureOptions.value.length);

      if (structureOptions.value.length === 0) {
        quotes.value = [];
        quotesLoading.value = false;
        return;
      }

      quotesLoading.value = true;
      quotes.value = await loadServiceQuoteTemplatesFromSupabase(
        serviceSlug,
        structureType.value,
      );
      selectedQuoteId.value = null;
      selectedProductId.value = null;
      quotesLoading.value = false;
    });

    const initialData = useSignal({
      service: "",
      serviceTitle: "",
      originLabel: "",
      source: "",
      structureType: "",
      products: [] as ServiceProduct[],
      discountAmount: 0,
      structureCostPercentage: 0,
      currency: "MZN",
    });

    const selectedQuote = quotes.value.find(
      (quote) => quote.id === selectedQuoteId.value,
    );
    const selectedStructure = structureOptions.value.find(
      (option) => option.value === structureType.value,
    );
    const selectedStructureCostPercentage = Math.max(
      0,
      selectedStructure?.structureCostPercentage ??
        selectedQuote?.structureCostPercentage ??
        0,
    );
    const selectedProduct = selectedQuote?.products.find(
      (product) => product.id === selectedProductId.value,
    );
    const selectedProductTotal =
      selectedProduct && typeof selectedProduct.unitPrice === "number"
        ? selectedProduct.unitPrice * (selectedProduct.estimatedQuantity ?? 1)
        : null;
    const openQuotePreview = $((quoteId: string) => {
      selectedQuoteId.value = quoteId;
      selectedProductId.value = null;
      quotePreviewModal.value = true;
    });
    const requestSelectedQuote = $(() => {
      const quote = quotes.value.find((item) => item.id === selectedQuoteId.value);

      if (!quote) {
        loginNotice.value = true;
        return;
      }

      if (
        !getCachedAuthUser() ||
        localStorage.getItem("bitoll-auth-state") === "guest"
      ) {
        loginNotice.value = true;
        return;
      }

      initialData.value = {
        service: serviceSlug,
        serviceTitle,
        originLabel: `cotacao ${quote.title}`,
        source: "service-products",
        structureType: structureType.value,
        products: quote.products,
        discountAmount: 0,
        structureCostPercentage:
          structureOptions.value.find(
            (option) => option.value === structureType.value,
          )?.structureCostPercentage ??
          quote.structureCostPercentage,
        currency: quote.currency,
      };

      quotePreviewModal.value = false;
      quoteModal.value = true;
    });

    return (
      <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
        <button
          type="button"
          aria-label="Fechar produtos do servico"
          class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
          onClick$={onClose$}
        />

        <div class="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[1180px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
          <button
            type="button"
            aria-label="Fechar"
            autoFocus
            class="absolute right-5 top-5 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>

          <div class="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-6 pr-20 sm:px-8">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Produtos necessarios
              </p>

              <h2 class="mt-2 text-2xl font-bold text-white">
                {serviceTitle}
              </h2>

              <p class="mt-2 max-w-[720px] text-sm leading-6 text-slate-400">
                Escolha o nivel da estrutura para ver a cotacao padrao que o
                admin ja preparou para este servico.
              </p>
            </div>

          </div>

          <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            {structuresLoading.value ? (
              <div class="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
                A carregar opcoes deste servico...
              </div>
            ) : structureOptions.value.length > 0 ? (
              <StructureSelector
                options={structureOptions.value}
                value={structureType.value}
                onChange$={(value) => {
                  structureType.value = value;

                  selectedProductId.value = null;
                  selectedQuoteId.value = null;
                }}
              />
            ) : (
              <div class="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm leading-6 text-amber-100">
                Este servico ainda nao tem estruturas publicas cadastradas na
                base de dados. Crie as opcoes no admin em Estruturas para que
                os produtos necessarios aparecam corretamente.
              </div>
            )}

            {quotesLoading.value ? (
              <div class="mt-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
                A carregar cotacoes deste nivel...
              </div>
            ) : quotes.value.length > 0 ? (
              <div class="mt-6 grid gap-4 md:grid-cols-2">
                {quotes.value.map((quote) => (
                  <div
                    key={quote.id}
                    class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5"
                  >
                    <p class="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-400">
                      Cotacao padrao
                    </p>
                    <h3 class="mt-2 text-lg font-bold text-white">
                      {quote.title}
                    </h3>
                    <div class="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                      <div>
                        <span class="block text-xs uppercase tracking-[0.12em] text-slate-500">
                          Nivel
                        </span>
                        <span class="mt-1 block font-semibold capitalize text-slate-100">
                          {quote.structure}
                        </span>
                      </div>
                      <div>
                        <span class="block text-xs uppercase tracking-[0.12em] text-slate-500">
                          Artigos
                        </span>
                        <span class="mt-1 block font-semibold text-slate-100">
                          {quote.products.length}
                        </span>
                      </div>
                      <div>
                        <span class="block text-xs uppercase tracking-[0.12em] text-slate-500">
                          Subtotal
                        </span>
                        <span class="mt-1 block font-semibold text-cyan-200">
                          {formatMoney(quote.subtotal, quote.currency)}
                        </span>
                      </div>
                    </div>
                    {selectedStructureCostPercentage > 0 && (
                      <p class="mt-3 text-xs font-semibold text-amber-100">
                        Custo da estrutura: {selectedStructureCostPercentage}%
                        sobre o subtotal desta cotacao.
                      </p>
                    )}
                    <div class="mt-5">
                      <Button
                        variant="secondary"
                        spacing="none"
                        buttonClass="rounded-2xl px-4 py-3 text-sm font-bold"
                        onClick$={() => openQuotePreview(quote.id)}
                      >
                        Ver cotacao
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!quotesLoading.value && quotes.value.length === 0 && (
              <div class="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
                Ainda nao existe cotacao padrao publica para esta estrutura.
                Crie a cotacao no admin para ela aparecer aqui.
              </div>
            )}
          </div>

          <div class="border-t border-slate-800 px-6 py-5 text-sm text-slate-400 sm:px-8">
            Escolha uma cotacao para ver os artigos e solicitar.
          </div>
        </div>

        {quotePreviewModal.value && selectedQuote && (
          <div class="fixed inset-0 z-[360] flex min-h-dvh items-center justify-center p-4">
            <button
              type="button"
              aria-label="Fechar cotacao"
              class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
              onClick$={() => {
                quotePreviewModal.value = false;
              }}
            />

            <div class="relative z-10 mx-auto flex max-h-[90dvh] w-full max-w-[1080px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
              <button
                type="button"
                aria-label="Fechar"
                autoFocus
                class="absolute right-5 top-5 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  quotePreviewModal.value = false;
                }}
              >
                x
              </button>

              <div class="border-b border-slate-800 px-6 py-6 pr-20 sm:px-8">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Cotacao recomendada
                </p>
                <h3 class="mt-2 text-2xl font-bold text-white">
                  {selectedQuote.title}
                </h3>
                <p class="mt-2 text-sm text-slate-400">
                  {selectedQuote.products.length} artigo(s) preparados pelo admin
                  para o nivel <span class="capitalize">{selectedQuote.structure}</span>.
                </p>
              </div>

              <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-slate-300">
                    Escolha como quer ver os artigos
                  </p>
                  <div class="flex rounded-2xl border border-slate-800 bg-slate-900/70 p-1">
                    {[
                      { label: "Tabela", value: "table" },
                      { label: "Cards", value: "cards" },
                      { label: "Lista", value: "compact" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        class={[
                          "rounded-xl px-3 py-2 text-xs font-bold transition duration-300",
                          productDisplayMode.value === option.value
                            ? "bg-cyan-400 text-slate-950"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white",
                        ]}
                        onClick$={() => {
                          productDisplayMode.value = option.value as
                            | "table"
                            | "cards"
                            | "compact";
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <ProductsTable
                  currency={selectedQuote.currency}
                  displayMode={productDisplayMode.value}
                  products={selectedQuote.products}
                  selectedProductId={selectedProductId.value ?? undefined}
                  onSelectProduct$={(productId) => {
                    selectedProductId.value = productId;
                  }}
                />

                <div class="mt-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div class="space-y-3 text-sm">
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-slate-400">Subtotal da cotacao</span>
                      <span class="font-bold text-cyan-200">
                        {formatMoney(selectedQuote.subtotal, selectedQuote.currency)}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <span class="text-slate-400">
                        Custo da estrutura ({selectedStructureCostPercentage}%)
                      </span>
                      <span class="font-bold text-amber-100">
                        {formatMoney(
                          selectedQuote.subtotal *
                            (selectedStructureCostPercentage / 100),
                          selectedQuote.currency,
                        )}
                      </span>
                    </div>
                    <div class="border-t border-slate-800 pt-3">
                      <div class="flex items-center justify-between gap-4">
                        <span class="font-bold text-white">Subtotal final</span>
                        <span class="text-lg font-bold text-cyan-200">
                          {formatMoney(
                            selectedQuote.subtotal +
                              selectedQuote.subtotal *
                                (selectedStructureCostPercentage / 100),
                            selectedQuote.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 px-6 py-5 sm:px-8">
                <Button
                  variant="secondary"
                  spacing="none"
                  buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
                  onClick$={() => {
                    quotePreviewModal.value = false;
                  }}
                >
                  Fechar
                </Button>
                <Button
                  spacing="none"
                  buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
                  onClick$={requestSelectedQuote}
                >
                  Solicitar cotacao
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedProduct && (
          <div class="fixed inset-0 z-[380] flex min-h-dvh items-center justify-center p-4">
            <button
              type="button"
              aria-label="Fechar detalhe do produto"
              class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
              onClick$={() => {
                selectedProductId.value = null;
              }}
            />

            <div class="relative z-10 max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
              <button
                type="button"
                aria-label="Fechar"
                autoFocus
                class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  selectedProductId.value = null;
                }}
              >
                x
              </button>

              <p class="pr-14 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Detalhes do artigo
              </p>
              <h3 class="mt-2 pr-14 text-xl font-bold text-white">
                {selectedProduct.name}
              </h3>

              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  width={640}
                  height={360}
                  class="mt-5 h-72 w-full rounded-2xl border border-slate-800 object-cover"
                />
              ) : (
                <div class="mt-5 flex h-56 w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Imagem indisponivel
                </div>
              )}

              <div class="mt-5 grid gap-3 sm:grid-cols-3">
                <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200/80">
                    Preco unidade
                  </span>
                  <span class="mt-1 block text-lg font-bold text-cyan-100">
                    {typeof selectedProduct.unitPrice === "number"
                      ? formatMoney(selectedProduct.unitPrice, selectedQuote?.currency)
                      : "Preco por confirmar"}
                  </span>
                </div>
                <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Quantidade
                  </span>
                  <span class="mt-1 block text-sm font-semibold text-slate-200">
                    {selectedProduct.quantity}
                  </span>
                </div>
                <div class="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Total
                  </span>
                  <span class="mt-1 block text-lg font-bold text-white">
                    {selectedProductTotal !== null
                      ? formatMoney(selectedProductTotal, selectedQuote?.currency)
                      : "Total por confirmar"}
                  </span>
                </div>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Categoria
                  </span>
                  <span class="mt-1 block text-sm font-semibold text-slate-200">
                    {selectedProduct.category}
                  </span>
                </div>
                <div class="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Estado
                  </span>
                  <span class="mt-1 block text-sm font-semibold text-slate-200">
                    {selectedProduct.required ? "Obrigatorio" : "Opcional"}
                  </span>
                </div>
                {selectedProduct.brand && (
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Marca
                    </span>
                    <span class="mt-1 block text-sm font-semibold text-slate-200">
                      {selectedProduct.brand}
                    </span>
                  </div>
                )}
                {selectedProduct.model && (
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Modelo
                    </span>
                    <span class="mt-1 block text-sm font-semibold text-slate-200">
                      {selectedProduct.model}
                    </span>
                  </div>
                )}
                {selectedProduct.system && (
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Sistema
                    </span>
                    <span class="mt-1 block text-sm font-semibold text-slate-200">
                    {selectedProduct.system}
                  </span>
                </div>
                )}
              </div>

              {(selectedProduct.detail || selectedProduct.description) && (
                <div class="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Descricao
                  </span>
                  <p class="mt-2 text-sm leading-7 text-slate-300">
                    {selectedProduct.detail || selectedProduct.description}
                  </p>
                </div>
              )}

              {selectedProduct.description &&
                selectedProduct.detail &&
                selectedProduct.description !== selectedProduct.detail && (
                  <div class="mt-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Observacao
                    </span>
                    <p class="mt-2 text-sm leading-7 text-slate-400">
                      {selectedProduct.description}
                    </p>
                  </div>
              )}
            </div>
          </div>
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
          title={
            structureOptions.value.length === 0
              ? "Estrutura em falta"
              : quotes.value.length === 0
                ? "Cotacao em falta"
              : "Login necessario"
          }
          message={
            structureOptions.value.length === 0
              ? "Ainda nao existem estruturas publicas cadastradas para este servico."
              : quotes.value.length === 0
                ? "Ainda nao existe uma cotacao padrao publica para esta estrutura."
              : "Esta cotacao sera ligada aos seus dados e ao acompanhamento do pedido."
          }
          actionLabel={
            structureOptions.value.length === 0 || quotes.value.length === 0
              ? undefined
              : "Entrar"
          }
          onClose$={() => {
            loginNotice.value = false;
          }}
          onAction$={() => {
            if (structureOptions.value.length === 0 || quotes.value.length === 0) {
              return;
            }

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
