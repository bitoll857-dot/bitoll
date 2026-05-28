import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import {
  getCachedAdminAccess,
  loadAdminAccess,
  type AdminAccess,
} from "~/lib/supabase/admin";
import { getCachedAuthUser, getSupabaseBrowserClient } from "~/lib/supabase/client";
import type { User } from "~/types/user";

type AdminMetric = {
  label: string;
  value: string;
};

const emptyAccess: AdminAccess = { isAdmin: false, role: null };

const countTable = async (table: string) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return 0;
  }

  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  return count ?? 0;
};

export default component$(() => {
  const authUser = useSignal<User | null>(null);
  const adminAccess = useSignal<AdminAccess>(emptyAccess);
  const isLoading = useSignal(true);
  const metrics = useSignal<AdminMetric[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    authUser.value = getCachedAuthUser();
    adminAccess.value = getCachedAdminAccess();

    const access = await loadAdminAccess();
    adminAccess.value = access;

    if (access.isAdmin) {
      const [services, products, promotions, quotes] = await Promise.all([
        countTable("services"),
        countTable("service_products"),
        countTable("promotions"),
        countTable("quotes"),
      ]);

      metrics.value = [
        { label: "Servicos", value: String(services) },
        { label: "Produtos", value: String(products) },
        { label: "Promocoes", value: String(promotions) },
        { label: "Cotacoes", value: String(quotes) },
      ];
    }

    isLoading.value = false;
  });

  return (
    <main class="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <section class="mx-auto w-full max-w-6xl">
        <div class="flex flex-wrap items-start justify-between gap-5 border-b border-slate-800 pb-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Bitoll Admin
            </p>
            <h1 class="mt-3 text-3xl font-black tracking-normal text-white md:text-4xl">
              Dashboard
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Gestao interna da plataforma, dados comerciais e pedidos dos
              clientes.
            </p>
          </div>

          <a
            href="/"
            class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
          >
            Voltar ao site
          </a>
        </div>

        {isLoading.value && (
          <div class="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
            A verificar permissao administrativa...
          </div>
        )}

        {!isLoading.value && !authUser.value && (
          <div class="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <h2 class="text-xl font-bold text-amber-100">Login necessario</h2>
            <p class="mt-2 text-sm leading-6 text-amber-100/80">
              Entre com a conta Google autorizada pela Bitoll para abrir o
              painel admin.
            </p>
          </div>
        )}

        {!isLoading.value && authUser.value && !adminAccess.value.isAdmin && (
          <div class="mt-8 rounded-2xl border border-red-400/30 bg-red-400/10 p-6">
            <h2 class="text-xl font-bold text-red-100">Acesso bloqueado</h2>
            <p class="mt-2 text-sm leading-6 text-red-100/80">
              A conta {authUser.value.email} esta autenticada, mas ainda nao
              esta registada como administradora da Bitoll.
            </p>
          </div>
        )}

        {!isLoading.value && adminAccess.value.isAdmin && (
          <div class="mt-8 space-y-8">
            <div class="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <p class="text-sm font-semibold text-cyan-100">
                Sessao admin ativa
              </p>
              <p class="mt-1 text-sm text-cyan-100/70">
                {authUser.value?.name} / {authUser.value?.email} / papel{" "}
                {adminAccess.value.role}
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.value.map((metric) => (
                <article
                  key={metric.label}
                  class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
                >
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {metric.label}
                  </p>
                  <p class="mt-3 text-3xl font-black text-white">
                    {metric.value}
                  </p>
                </article>
              ))}
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              {[
                {
                  title: "Conteudo comercial",
                  description:
                    "Proximo passo: gerir servicos, produtos por estrutura e promocoes publicas.",
                },
                {
                  title: "Pedidos dos clientes",
                  description:
                    "Proximo passo: acompanhar cotacoes, mudar estados e responder aos clientes.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
                >
                  <h2 class="text-xl font-bold text-white">{item.title}</h2>
                  <p class="mt-3 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Admin | Bitoll",
};
