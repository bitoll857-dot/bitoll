import { component$ } from "@builder.io/qwik";

type Props = {
  role: string | null;
};

export const AdminHeader = component$<Props>(({ role }) => {
  return (
    <div class="flex flex-wrap items-start justify-between gap-5 border-b border-slate-800 pb-6">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Bitoll Admin
        </p>

        <h1 class="mt-3 text-3xl font-black tracking-normal text-white md:text-4xl">
          {role === "operador" ? "Painel do operador" : "Dashboard"}
        </h1>

        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          {role === "operador"
            ? "Atualizacao do progresso dos servicos aprovados para o cliente acompanhar."
            : "Gestao interna da plataforma, dados comerciais e pedidos dos clientes."}
        </p>
      </div>

      <a
        href="/"
        class="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
      >
        Voltar ao site
      </a>
    </div>
  );
});