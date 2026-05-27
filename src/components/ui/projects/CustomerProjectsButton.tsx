import { $, component$, useOnWindow, useSignal } from "@builder.io/qwik";

import Button from "../button/Button";
import { customerProjects } from "~/data/customer-projects";
import { currentUser } from "~/data/user";
import type { CustomerProject } from "~/types/customer-project";

type PanelMode = "active" | "completed" | "chat";

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

const activeProjects = customerProjects.filter(
  (project) => project.status !== "Concluido",
);

const completedProjects = customerProjects.filter(
  (project) => project.status === "Concluido",
);

const ActionIcon = component$<{ mode: PanelMode }>(({ mode }) => {
  if (mode === "completed") {
    return (
      <svg
        aria-hidden="true"
        class="h-6 w-6"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }

  if (mode === "active") {
    return (
      <svg
        aria-hidden="true"
        class="h-6 w-6"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8v4l3 3" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      class="h-6 w-6"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
});

const ProjectCard = component$<{ project: CustomerProject }>(({ project }) => {
  return (
    <article class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {project.service}
          </p>
          <h3 class="mt-2 text-xl font-bold text-white">
            {project.title}
          </h3>
          <p class="mt-2 text-sm text-slate-400">
            {project.location} · solicitado em {formatDate(project.requestedAt)}
          </p>
        </div>

        <span class="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
          {project.status}
        </span>
      </div>

      <div class="mt-5">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Progresso</span>
          <span>{project.progress}%</span>
        </div>
        <div class="mt-2 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full bg-cyan-400"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div class="mt-5 grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Proximo passo
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            {project.nextStep}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Responsavel
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            {project.technician}
          </p>
        </div>
        <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Previsao
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            {formatDate(project.estimatedCompletion)}
          </p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        {project.updates.map((update) => (
          <span
            key={update}
            class="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300"
          >
            {update}
          </span>
        ))}
      </div>
    </article>
  );
});

export default component$(() => {
  const panelMode = useSignal<PanelMode | null>(null);
  const isAuthenticated = useSignal(!!currentUser);

  useOnWindow(
    "load",
    $(() => {
      isAuthenticated.value =
        !!currentUser && localStorage.getItem("bitoll-auth-state") !== "guest";
    }),
  );

  useOnWindow(
    "bitoll-auth-change",
    $((event) => {
      isAuthenticated.value =
        !!(event as CustomEvent<{ isAuthenticated: boolean }>).detail
          ?.isAuthenticated;
    }),
  );

  if (!currentUser || !isAuthenticated.value) {
    return null;
  }

  const isOpen = !!panelMode.value;
  const projects =
    panelMode.value === "completed" ? completedProjects : activeProjects;
  const title =
    panelMode.value === "completed"
      ? "Servicos terminados"
      : panelMode.value === "chat"
        ? "Chat GSB"
        : "Servicos em andamento";

  return (
    <>
      <div class="fixed inset-x-0 bottom-4 z-[250] flex justify-center px-4 md:inset-x-auto md:right-5 md:bottom-5 md:flex-col md:items-end">
        <div class="flex gap-3 rounded-3xl border border-slate-800 bg-slate-950/85 p-2 shadow-[0_18px_70px_rgba(2,6,23,0.45)] backdrop-blur-xl md:flex-col">
          {[
            {
              mode: "completed" as const,
              label: "Abrir servicos terminados",
              tone:
                "border-emerald-400/30 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400 hover:text-slate-950",
            },
            {
              mode: "active" as const,
              label: "Abrir servicos em andamento",
              tone:
                "border-cyan-400/30 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400 hover:text-slate-950",
            },
            {
              mode: "chat" as const,
              label: "Abrir chat GSB",
              tone:
                "border-violet-400/30 bg-violet-400/15 text-violet-200 hover:bg-violet-400 hover:text-slate-950",
            },
          ].map((action) => (
            <button
              key={action.mode}
              type="button"
              aria-label={action.label}
              title={action.label}
              data-guide={action.mode === "active" ? "projects" : undefined}
              class={[
                "flex h-13 w-13 items-center justify-center rounded-2xl border transition duration-300 hover:-translate-y-0.5 md:h-14 md:w-14",
                action.tone,
              ]}
              onClick$={() => {
                panelMode.value = action.mode;
              }}
            >
              <ActionIcon mode={action.mode} />
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div class="fixed inset-0 z-[360] flex min-h-dvh items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar painel do cliente"
            class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
            onClick$={() => {
              panelMode.value = null;
            }}
          />

          <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[980px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Area do cliente
                </p>
                <h2 class="mt-2 text-3xl font-bold text-white">
                  {title}
                </h2>
                <p class="mt-2 max-w-[620px] text-sm leading-6 text-slate-400">
                  Simulacao ligada a conta de {currentUser.name}.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  panelMode.value = null;
                }}
              >
                x
              </button>
            </div>

            {panelMode.value === "chat" ? (
              <div class="mt-7 rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5">
                <div class="flex items-center gap-4">
                  <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-400/20 text-violet-100">
                    <ActionIcon mode="chat" />
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-white">
                      Assistente GSB
                    </h3>
                    <p class="mt-1 text-sm leading-6 text-slate-300">
                      Ola, {currentUser.name}. Posso ajudar a consultar
                      pedidos, explicar servicos, procurar promocoes ou orientar
                      sobre um novo orcamento.
                    </p>
                  </div>
                </div>

                <div class="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
                  Exemplo: "Quero saber o estado do CCTV residencial" ou
                  "Preciso de uma solucao de seguranca para uma empresa".
                </div>
              </div>
            ) : (
              <div class="mt-7 grid gap-5">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}

                {projects.length === 0 && (
                  <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
                    Ainda nao existem servicos nesta categoria.
                  </div>
                )}
              </div>
            )}

            <div class="mt-7 border-t border-slate-800 pt-6">
              <Button
                spacing="none"
                buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
                onClick$={() => {
                  panelMode.value = null;
                }}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
