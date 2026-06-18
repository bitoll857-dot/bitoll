import { component$, type PropFunction } from "@builder.io/qwik";

import type { OwnerTab } from "../types/admin.types";

type Props = {
  activeTab?: OwnerTab;
  onTabChange$?: PropFunction<(tab: OwnerTab) => void>;
  role: string | null;
};

export const AdminHeader = component$<Props>(({ activeTab, onTabChange$, role }) => {
  const roleLabel = role === "operador" ? "Operador" : "Owner";
  const title =
    role === "operador" ? "Operacao e acompanhamento" : "Gestao da plataforma";

  return (
      <header class="fixed left-0 top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-blue-500/[0.03]" />

        <div class="container relative z-10 mx-auto px-4 sm:px-6">
          <div class="flex h-20 items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-3">
              <div
                role="img"
                aria-label="Bitoll"
                class="h-11 w-11 shrink-0 rounded-2xl bg-cover bg-center shadow-[0_0_25px_rgba(6,182,212,0.20)]"
                style={{ backgroundImage: "url('/brand/bitoll-mark-bg-navy.svg')" }}
              />

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="truncate text-lg font-bold tracking-wide text-white">
                    Bitoll Admin
                  </h1>

                  <span class="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">
                    {roleLabel}
                  </span>
                </div>

                <p class="mt-0.5 truncate text-xs tracking-wide text-slate-400">
                  {title}
                </p>
              </div>
            </div>

            {role !== "operador" ? (
              <nav class="hidden min-w-0 items-center gap-2 md:flex">
                {(
                  [
                    { label: "Geral", value: "services" },
                    { label: "Receitas", value: "revenues" },
                    { label: "Usuarios", value: "users" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    class={[
                      "rounded-2xl border px-4 py-2.5 text-sm font-bold backdrop-blur-xl transition",
                      (item.value === "services"
                        ? activeTab !== "users" && activeTab !== "revenues"
                        : activeTab === item.value)
                        ? "border-cyan-400/40 bg-cyan-400 text-slate-950"
                        : "border-slate-800 bg-slate-900/70 text-slate-200 hover:border-cyan-400/40",
                    ]}
                    onClick$={() => onTabChange$?.(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : (
              <div class="hidden min-w-0 items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 backdrop-blur-xl md:flex">
                <span class="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.55)]" />
                <span class="truncate text-sm font-bold text-slate-200">
                  Ambiente administrativo
                </span>
              </div>
            )}

            <div class="flex shrink-0 items-center gap-3">
              <span class="hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm font-bold text-slate-300 backdrop-blur-xl lg:inline-flex">
                Sistema ativo
              </span>

              <a
                href="/"
                aria-label="Voltar para o modo cliente"
                title="Voltar para o modo cliente"
                class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-white backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M10 17l-5-5 5-5" />
                  <path d="M5 12h12" />
                  <path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>
  );
});
