import { component$ } from "@builder.io/qwik";

import { formatMoney } from "~/lib/formatters/money";
import type { SearchResult } from "~/types/search";

type Props = {
  results: SearchResult[];
};

export default component$<Props>(({ results }) => {
  const typeLabels: Record<SearchResult["type"], string> = {
    product: "Artigos",
    promotion: "Promocoes",
    request: "Solicitacoes",
    service: "Servicos",
  };
  const groupedResults = results.reduce(
    (groups, item) => ({
      ...groups,
      [item.type]: [...(groups[item.type] ?? []), item],
    }),
    {} as Record<SearchResult["type"], SearchResult[]>,
  );

  return (
    <div class="grid gap-4">
      {(Object.keys(groupedResults) as SearchResult["type"][]).map((type) => (
        <section
          key={type}
          class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-sm font-black text-white">
              Encontramos {groupedResults[type].length} em {typeLabels[type]}
            </h3>

            <span class="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
              {typeLabels[type]}
            </span>
          </div>

          <div class="grid gap-3">
            {groupedResults[type].map((item) => (
              <article
                key={item.id}
                class="grid gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-[112px_1fr]"
              >
                <div class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      width={224}
                      height={160}
                      class="h-32 w-full object-cover sm:h-28"
                    />
                  ) : (
                    <div class="flex h-32 items-center justify-center px-3 text-center text-xs font-bold text-slate-600 sm:h-28">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div class="min-w-0">
                  <h4 class="font-semibold text-white">{item.title}</h4>

                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    {item.description || "Sem detalhe registado."}
                  </p>

                  <div class="mt-3 flex flex-wrap gap-2">
                    {item.category && (
                      <span class="rounded-full border border-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                        {item.category}
                      </span>
                    )}

                    {item.relatedService && (
                      <span class="rounded-full border border-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                        {item.relatedService}
                      </span>
                    )}

                    {typeof item.price === "number" && item.price > 0 && (
                      <span class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
                        {formatMoney(item.price)}
                      </span>
                    )}

                    {item.status && (
                      <span class="rounded-full border border-slate-800 px-3 py-1 text-xs font-bold text-slate-400">
                        {item.status}
                      </span>
                    )}
                  </div>

                  {item.imageUrl && (
                    <a
                      href={item.imageUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      class="mt-4 inline-flex items-center rounded-xl border border-slate-700 px-4 py-2 text-xs font-black text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
                    >
                      Baixar imagem
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
});
