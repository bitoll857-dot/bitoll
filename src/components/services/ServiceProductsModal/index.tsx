import { component$, type QRL, useSignal } from "@builder.io/qwik";

import ProductDetailCard from "./ProductDetailCard";
import ProductsTable from "./ProductsTable";
import StructureSelector from "./StructureSelector";
import QuoteRequestModal from "~/components/forms/QuoteRequestModal";
import Button from "~/components/ui/Button";
import { getServiceProducts } from "~/data/service-products";
import type { StructureType } from "~/types/service-products";

type ServiceProductsModalProps = {
  serviceSlug: string;
  serviceTitle: string;
  onClose$: QRL<() => void>;
};

export default component$<ServiceProductsModalProps>(
  ({ serviceSlug, serviceTitle, onClose$ }) => {
    const structureType = useSignal<StructureType>("basica");
    const selectedProductId = useSignal<string | null>(null);
    const quoteModal = useSignal(false);
    const products = getServiceProducts(serviceSlug, structureType.value);
    const selectedProduct = products.find(
      (product) => product.id === selectedProductId.value,
    );

    return (
      <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
        <button
          type="button"
          aria-label="Fechar produtos do servico"
          class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
          onClick$={onClose$}
        />

        <div class="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[1180px] flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
          <div class="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-6 sm:px-8">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Produtos necessarios
              </p>

              <h2 class="mt-2 text-2xl font-bold text-white">
                {serviceTitle}
              </h2>

              <p class="mt-2 max-w-[720px] text-sm leading-6 text-slate-400">
                Escolha o nivel da estrutura para ver os produtos mais comuns
                associados a este servico.
              </p>
            </div>

            <button
              type="button"
              aria-label="Fechar"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              onClick$={onClose$}
            >
              x
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <StructureSelector
              value={structureType.value}
              onChange$={(value) => {
                structureType.value = value;
                selectedProductId.value = null;
              }}
            />

            <div class="mt-6">
              <ProductsTable
                products={products}
                selectedProductId={selectedProductId.value ?? undefined}
                onSelectProduct$={(productId) => {
                  selectedProductId.value =
                    selectedProductId.value === productId ? null : productId;
                }}
              />
            </div>

            {selectedProduct && (
              <div class="mt-5">
                <ProductDetailCard product={selectedProduct} />
              </div>
            )}

            {products.length === 0 && (
              <div class="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
                Ainda nao existem produtos definidos para esta combinacao.
              </div>
            )}
          </div>

          <div class="border-t border-slate-800 px-6 py-5 sm:px-8">
            <Button
              spacing="none"
              buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
              onClick$={() => {
                quoteModal.value = true;
              }}
            >
              Solicitar cotacao
            </Button>
          </div>
        </div>

        {quoteModal.value && (
          <QuoteRequestModal
            onClose$={() => {
              quoteModal.value = false;
            }}
          />
        )}
      </div>
    );
  },
);
