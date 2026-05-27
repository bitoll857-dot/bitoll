import { component$, type QRL, useSignal } from "@builder.io/qwik";

import ProductDetailCard from "../cards/ProductDetail";
import ProductsTable from "../table/Products";
import StructureSelector from "../selector/Structure";
import QuoteRequestModal from "../modal/QuoteRequest";
import AuthModal from "../modal/Auth";
import Button from "../button/Button";
import ActionToast from "../toast";

import { currentUser } from "~/data/user";
import { getServiceProducts } from "~/data/service-products";

import type { StructureType } from "~/types/service-products";
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

    const quoteModal = useSignal(false);
    const loginNotice = useSignal(false);
    const authModal = useSignal(false);
    const authMode = useSignal<AuthMode>("login");

    const products = getServiceProducts(
      serviceSlug,
      structureType.value,
    );

    const initialData = useSignal({
      service: "",
      serviceTitle: "",
      originLabel: "",
      source: "",
      structureType: "",
      products,
      discountAmount: 0,
      currency: "MZN",
    });

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
          <button
            type="button"
            aria-label="Fechar"
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
                Escolha o nivel da estrutura para ver os produtos mais comuns
                associados a este servico.
              </p>
            </div>

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
                    selectedProductId.value === productId
                      ? null
                      : productId;
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
                if (
                  !currentUser ||
                  localStorage.getItem("bitoll-auth-state") === "guest"
                ) {
                  loginNotice.value = true;
                  return;
                }

                initialData.value = {
                  service: serviceSlug,
                  serviceTitle,
                  originLabel: `servico ${serviceTitle}`,
                  source: "service-products",
                  structureType: structureType.value,
                  products,
                  discountAmount: 0,
                  currency: "MZN",
                };

                quoteModal.value = true;
              }}
            >
              Solicitar cotacao
            </Button>
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
          message="Esta cotacao sera ligada aos seus dados e ao acompanhamento do pedido."
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
