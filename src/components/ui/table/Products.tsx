import { component$, type QRL } from "@builder.io/qwik";

import Button from "../button/Button";
import type { ServiceProduct } from "~/types/service-products";

type ProductsTableProps = {
  products: ServiceProduct[];
  selectedProductId?: string;
  onSelectProduct$: QRL<(productId: string) => void>;
};

export default component$<ProductsTableProps>(
  ({ products, selectedProductId, onSelectProduct$ }) => {
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
              {products.map((product) => {
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
