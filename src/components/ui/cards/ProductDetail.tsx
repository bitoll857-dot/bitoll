import { component$ } from "@builder.io/qwik";

import type { ServiceProduct } from "~/types/service-products";

type ProductDetailCardProps = {
  product: ServiceProduct;
};

export default component$<ProductDetailCardProps>(({ product }) => {
  return (
    <div class="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Explicacao do produto
          </p>
          <h3 class="mt-2 text-lg font-bold text-white">{product.name}</h3>
        </div>

        <span class="rounded-full border border-cyan-400/30 bg-slate-950/60 px-3 py-1 text-xs font-semibold text-cyan-200">
          {product.category}
        </span>
      </div>

      <p class="mt-4 text-sm leading-7 text-slate-300">{product.detail}</p>
    </div>
  );
});
