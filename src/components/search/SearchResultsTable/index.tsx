import { component$ } from "@builder.io/qwik";

import type { SearchResult } from "~/types/search";

type Props = {
  results: SearchResult[];
};

export default component$<Props>(({ results }) => {
  return (
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr class="border-b border-slate-700 bg-slate-900">
            <th class="p-3">Tipo</th>
            <th class="p-3">Título</th>
            <th class="p-3">Categoria</th>
            <th class="p-3">Estado</th>
          </tr>
        </thead>

        <tbody>
          {results.map((item) => (
            <tr
              key={item.id}
              class="border-b border-slate-800 transition hover:bg-slate-900"
            >
              <td class="p-3 capitalize text-cyan-400">
                {item.type}
              </td>

              <td class="p-3">
                <div class="font-semibold text-white">
                  {item.title}
                </div>

                <div class="text-sm text-slate-400">
                  {item.description}
                </div>
              </td>

              <td class="p-3 text-slate-300">
                {item.category}
              </td>

              <td class="p-3 text-slate-300">
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});