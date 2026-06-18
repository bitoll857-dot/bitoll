import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

import AuthModal from "~/components/ui/modal/Auth";
import { formatMoney } from "~/lib/formatters/money";
import { getCachedAuthUser } from "~/lib/supabase/client";
import { loadCustomerProjectsFromSupabase } from "~/lib/supabase/platform-data";
import type { AuthMode } from "~/types/auth";
import type { CustomerProject } from "~/types/customer-project";
import type { User } from "~/types/user";

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return day && month && year ? `${day}/${month}/${year}` : value;
};

const statusTone = (status: CustomerProject["status"]) =>
  ({
    "Em actividade": "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    "Em processamento": "border-amber-300/30 bg-amber-300/10 text-amber-100",
    Finalizado: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    Reclamacao: "border-orange-300/30 bg-orange-300/10 text-orange-100",
    Recusado: "border-red-300/30 bg-red-300/10 text-red-100",
  })[status];

const ProjectCard = component$<{ project: CustomerProject }>(({ project }) => {
  return (
    <article class="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            {project.quoteNumber}
          </p>
          <h2 class="mt-2 text-lg font-black text-white">{project.service}</h2>
          <p class="mt-1 text-sm text-slate-400">
            Solicitado em {formatDate(project.requestedAt)}
          </p>
        </div>

        <span
          class={[
            "rounded-full border px-3 py-1 text-xs font-black",
            statusTone(project.status),
          ]}
        >
          {project.status}
        </span>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Valor
          </p>
          <p class="mt-1 text-base font-black text-white">
            {formatMoney(project.total, project.currency)}
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Responsavel
          </p>
          <p class="mt-1 text-sm font-bold text-slate-200">
            {project.technician}
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Previsao
          </p>
          <p class="mt-1 text-sm font-bold text-slate-200">
            {formatDate(project.estimatedCompletion)}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Progresso</span>
          <span>{project.progress}%</span>
        </div>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full bg-cyan-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div class="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          Proximo passo
        </p>
        <p class="mt-2 text-sm leading-6 text-slate-300">{project.nextStep}</p>
      </div>

      {project.updates.length > 0 && (
        <div class="mt-4 flex flex-wrap gap-2">
          {project.updates.map((update) => (
            <span
              key={update}
              class="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
            >
              {update}
            </span>
          ))}
        </div>
      )}
    </article>
  );
});

export default component$(() => {
  const authUser = useSignal<User | null>(null);
  const authMode = useSignal<AuthMode>("login");
  const accessModalOpen = useSignal(false);
  const projects = useSignal<CustomerProject[]>([]);
  const loading = useSignal(true);

  const reloadProfile$ = $(async () => {
    authUser.value = getCachedAuthUser();

    if (authUser.value) {
      projects.value = await loadCustomerProjectsFromSupabase();
      accessModalOpen.value = false;
      return;
    }

    projects.value = [];
    accessModalOpen.value = true;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    await reloadProfile$();
    loading.value = false;
  });

  const activeProjects = projects.value.filter(
    (project) =>
      project.status !== "Finalizado" && project.status !== "Recusado",
  );
  const refusedProjects = projects.value.filter(
    (project) => project.status === "Recusado",
  );
  const completedProjects = projects.value.filter(
    (project) => project.status === "Finalizado",
  );

  return (
    <main class="min-h-screen bg-slate-950 px-4 py-28 text-white sm:px-6">
      <section class="mx-auto w-full max-w-6xl">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
            Perfil do cliente
          </p>
          <h1 class="mt-2 text-2xl font-black text-white">
            Acompanhamento dos servicos
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Aqui aparecem as solicitacoes ligadas a sua conta, incluindo pedidos
            em processamento, em actividade, reclamacoes, recusados e finalizados.
          </p>
        </div>

        {loading.value && (
          <div class="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
            A carregar informacoes do perfil...
          </div>
        )}

        {!loading.value && !authUser.value && (
          <div class="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-6 text-amber-100">
            <p>
              Entre com o telefone e a senha temporaria recebida no WhatsApp para
              acompanhar os seus servicos.
            </p>
            <button
              type="button"
              class="mt-4 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950"
              onClick$={() => {
                authMode.value = "login";
                accessModalOpen.value = true;
              }}
            >
              Acessar acompanhamento
            </button>
          </div>
        )}

        {!loading.value && authUser.value && (
          <>
            <div class="mt-5 grid gap-3 md:grid-cols-4">
              <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  Cliente
                </p>
                <p class="mt-2 text-lg font-black text-white">
                  {authUser.value.name}
                </p>
                <p class="mt-1 text-sm text-slate-400">
                  {authUser.value.phone || authUser.value.email || "Sem contacto"}
                </p>
              </div>
              <div class="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-cyan-100/70">
                  Em curso
                </p>
                <p class="mt-2 text-2xl font-black text-cyan-100">
                  {activeProjects.length}
                </p>
              </div>
              <div class="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/70">
                  Finalizados
                </p>
                <p class="mt-2 text-2xl font-black text-emerald-100">
                  {completedProjects.length}
                </p>
              </div>
            </div>

            <section class="mt-6">
              <h2 class="text-lg font-black text-white">Servicos em curso</h2>
              <div class="mt-3 grid gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {activeProjects.length === 0 && (
                  <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-400">
                    Nao ha servicos em curso neste momento.
                  </div>
                )}
              </div>
            </section>

            {refusedProjects.length > 0 && (
              <section class="mt-6">
                <h2 class="text-lg font-black text-white">Solicitacoes recusadas</h2>
                <div class="mt-3 grid gap-4">
                  {refusedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {completedProjects.length > 0 && (
              <section class="mt-6">
                <h2 class="text-lg font-black text-white">Servicos finalizados</h2>
                <div class="mt-3 grid gap-4">
                  {completedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </section>

      {accessModalOpen.value && !authUser.value && (
        <AuthModal
          mode={authMode.value}
          onModeChange$={$((mode: AuthMode) => {
            authMode.value = mode;
          })}
          onClose$={$(async () => {
            await reloadProfile$();
          })}
        />
      )}
    </main>
  );
});

export const head: DocumentHead = {
  title: "Perfil | Bitoll",
  meta: [
    {
      name: "description",
      content: "Acompanhamento de servicos e solicitacoes do cliente Bitoll.",
    },
  ],
};
