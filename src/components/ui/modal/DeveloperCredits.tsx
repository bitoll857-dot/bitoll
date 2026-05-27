import { component$, type QRL } from "@builder.io/qwik";

type DeveloperCreditsModalProps = {
  onClose$: QRL<() => void>;
};

const team = [
  {
    role: "Desenvolvimento da Plataforma",
    name: "Goncalves Alberto Ubisse",
    description:
      "Responsavel pelo desenvolvimento tecnico, estrutura da aplicacao, componentes, fluxos e integracao progressiva da plataforma Bitoll.",
  },
  {
    role: "Analise e UX",
    name: "Sacrificio Junior Sithole",
    description:
      "Responsavel pela analise funcional, experiencia do utilizador e orientacao dos fluxos para clientes e equipa Bitoll.",
  },
];

export default component$<DeveloperCreditsModalProps>(({ onClose$ }) => {
  return (
    <div class="fixed inset-0 z-[360] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar sobre a equipa"
        class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
        onClick$={onClose$}
      />

      <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[760px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
        <button
          type="button"
          aria-label="Fechar"
          class="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
          onClick$={onClose$}
        >
          x
        </button>

        <div class="pr-14">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Sobre a equipa
          </p>
          <h2 class="mt-2 text-3xl font-bold text-white">
            Creditos da plataforma
          </h2>
          <p class="mt-3 max-w-[620px] text-sm leading-7 text-slate-400">
            Esta area apresenta os responsaveis pela concepcao e construcao da
            plataforma. O historial da equipa podera ser adicionado aqui numa
            fase posterior.
          </p>
        </div>

        <div class="mt-7 grid gap-4">
          {team.map((member) => (
            <article
              key={member.name}
              class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {member.role}
              </p>
              <h3 class="mt-2 text-xl font-bold text-white">
                {member.name}
              </h3>
              <p class="mt-3 text-sm leading-7 text-slate-400">
                {member.description}
              </p>
            </article>
          ))}
        </div>

        <div class="mt-7 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5">
          <p class="text-sm leading-7 text-cyan-100">
            Esta plataforma esta a ser desenvolvida por{" "}
            <span class="font-bold">Goncalves Alberto Ubisse</span>, em
            colaboracao com{" "}
            <span class="font-bold">Sacrificio Junior Sithole</span> na analise
            e experiencia do utilizador.
          </p>
        </div>
      </div>
    </div>
  );
});
