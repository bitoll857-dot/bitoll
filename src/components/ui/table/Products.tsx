import { component$, type QRL } from "@builder.io/qwik";

import Button from "../button/Button";
import { formatMoney as formatCurrency } from "~/lib/formatters/money";
import type { ServiceProduct } from "~/types/service-products";

type ProductsTableProps = {
  currency?: string;
  displayMode?: "table" | "cards" | "compact";
  products: ServiceProduct[];
  selectedProductId?: string;
  onSelectProduct$: QRL<(productId: string) => void>;
};

export default component$<ProductsTableProps>(
  ({
    currency = "MZN",
    displayMode = "table",
    products,
    selectedProductId,
    onSelectProduct$,
  }) => {
    const formatMoney = (value?: number) =>
      typeof value === "number"
        ? formatCurrency(value, currency)
        : "Preco por confirmar";
    const getProductTotal = (product: ServiceProduct) =>
      typeof product.unitPrice === "number"
        ? product.unitPrice * (product.estimatedQuantity ?? 1)
        : undefined;
    const isLaborProduct = (product: ServiceProduct) => {
      const label = `${product.id} ${product.name} ${product.category}`.toLowerCase();

      return (
        Boolean(product.laborSourceProductId) ||
        product.id.startsWith("labor-") ||
        label.includes("mao de obra")
      );
    };
    const sortedProducts = [...products].sort((first, second) => {
      if (isLaborProduct(first) === isLaborProduct(second)) {
        return 0;
      }

      return isLaborProduct(first) ? 1 : -1;
    });

    if (displayMode === "cards") {
      return (
        <div class="grid gap-5 lg:grid-cols-3">
          {sortedProducts.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <button
                key={product.id}
                type="button"
                class={[
                  "group overflow-hidden rounded-2xl border bg-slate-900/60 text-left transition duration-300",
                  isSelected
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-slate-800 hover:border-cyan-400/40 hover:bg-slate-900",
                ]}
                onClick$={() => onSelectProduct$(product.id)}
              >
                <div class="relative h-64 w-full overflow-hidden bg-slate-950">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      width={900}
                      height={260}
                      class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div class="flex h-full w-full items-center justify-center px-6 text-center">
                      <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Imagem indisponivel
                      </span>
                    </div>
                  )}

                  <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-5 pt-16">
                    <h4 class="text-base font-bold leading-6 text-white">
                      {product.name}
                    </h4>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        class={[
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          product.required
                            ? "border-cyan-400/30 bg-cyan-400/15 text-cyan-100"
                            : "border-slate-600 bg-slate-950/75 text-slate-300",
                        ]}
                      >
                        {product.required ? "Obrigatorio" : "Opcional"}
                      </span>
                      <span class="rounded-full border border-slate-600 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-slate-300">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="grid gap-3 p-4">
                  <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200/80">
                      Preco unidade
                    </span>
                    <span class="mt-1 block text-lg font-bold text-cyan-100">
                      {formatMoney(product.unitPrice)}
                    </span>
                  </div>

                  <div class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Quantidade
                    </span>
                    <span class="mt-1 block text-sm font-semibold text-slate-200">
                      {product.quantity}
                    </span>
                  </div>

                  <div class="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Total
                    </span>
                    <span class="mt-1 block text-lg font-bold text-white">
                      {formatMoney(getProductTotal(product))}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (displayMode === "compact") {
      return (
        <div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
          {sortedProducts.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <button
                key={product.id}
                type="button"
                class={[
                  "flex w-full items-center justify-between gap-4 border-b border-slate-800 px-5 py-4 text-left transition duration-300 last:border-b-0",
                  isSelected ? "bg-cyan-400/10" : "hover:bg-slate-900",
                ]}
                onClick$={() => onSelectProduct$(product.id)}
              >
                <span>
                  <span class="block text-sm font-semibold text-white">
                    {product.name}
                  </span>
                  <span class="mt-1 block text-xs text-slate-500">
                    {product.category} - {product.quantity}
                  </span>
                </span>
                <span class="shrink-0 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
                  {product.required ? "Obrigatorio" : "Opcional"}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] border-collapse text-left">
            <thead class="border-b border-slate-800 bg-slate-950/80">
              <tr>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Produto
                </th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Categoria
                </th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Quantidade
                </th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Estado
                </th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Acao
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedProducts.map((product) => {
                const isSelected = selectedProductId === product.id;

                return (
                  <tr
                    key={product.id}
                    class={[
                      "border-b border-slate-800 transition duration-300 last:border-b-0",
                      isSelected ? "bg-cyan-400/10" : "hover:bg-slate-900",
                    ]}
                  >
                    <td class="px-5 py-4">
                      <p class="text-sm font-semibold text-white">
                        {product.name}
                      </p>
                      <p class="mt-1 text-xs leading-5 text-slate-400">
                        {product.description}
                      </p>
                    </td>
                    <td class="px-5 py-4 text-sm text-slate-300">
                      {product.category}
                    </td>
                    <td class="px-5 py-4 text-sm font-semibold text-cyan-300">
                      {product.quantity}
                    </td>
                    <td class="px-5 py-4">
                      <span
                        class={[
                          "rounded-full border px-3 py-1 text-xs font-semibold",
                          product.required
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                            : "border-slate-700 bg-slate-950/70 text-slate-400",
                        ]}
                      >
                        {product.required ? "Obrigatorio" : "Opcional"}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        spacing="none"
                        buttonClass="rounded-xl bg-slate-950/70 text-xs text-slate-300 hover:text-cyan-200"
                        onClick$={() => onSelectProduct$(product.id)}
                      >
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
