import {
  component$,
  type QRL,
} from "@builder.io/qwik";

import SearchResultsTable from "../table/Search";

import type { SearchResult } from "~/types/search";

type Props = {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  onClose$: QRL<() => void>;
  onSearch$: QRL<(value: string) => void>;
};

export default component$<Props>(
  ({ isOpen, query, results, onClose$, onSearch$ }) => {
    if (!isOpen) {
      return null;
    }

    return (
      <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
        
        {/* BACKDROP */}
        <button
          type="button"
          aria-label="Fechar autenticacao"
          class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
          onClick$={onClose$}
        />

        {/* MODAL */}
        <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">

          {/* HEADER */}
          <div class="flex items-start justify-between gap-4">

            <div class="flex-1">

              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Bitoll
              </p>

              <h2 class="mt-2 text-2xl font-bold text-white">
                Pesquisa global
              </h2>

              {/* SEARCH INPUT */}
              <div class="mt-4">
                <input
                  type="text"
                  value={query}
                  placeholder="Continuar pesquisando..."
                  autoFocus
                  onInput$={(event) => {
                    const target = event.target as HTMLInputElement;
                    onSearch$(target.value);
                  }}
                  class="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>

              {/* RESULT COUNT */}
              <div class="mt-3">
                {results.length > 0 && (
                  <span class="inline-flex rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-400">
                    {results.length} resultado
                    {results.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              aria-label="Fechar"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              onClick$={onClose$}
            >
              ×
            </button>

          </div>

          {/* CONTENT */}
          <div class="mt-6 min-h-0 flex-1 overflow-y-auto">

            {results.length > 0 ? (
              <SearchResultsTable results={results} />
            ) : (
              <div class="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-800/80">

                {/* EMPTY ICON */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-slate-700"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>

                <div class="text-center">
                  <p class="text-sm font-medium text-slate-500">
                    Nenhum resultado encontrado
                  </p>

                  <p class="mt-0.5 text-xs text-slate-700">
                    Tente outros termos de pesquisa
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    );
  }
);