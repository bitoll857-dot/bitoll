import { component$, type QRL } from "@builder.io/qwik";

import Button from "../button/Button";

type AboutBitollModalProps = {
  onClose$: QRL<() => void>;
};

const values = [
  "Seguranca com responsabilidade tecnica",
  "Instalacoes claras, organizadas e documentadas",
  "Solucoes adaptadas ao espaco e ao orcamento",
  "Acompanhamento antes, durante e depois do servico",
];

const capabilities = [
  "Vedacao eletrica residencial, comercial e industrial",
  "CCTV com monitoramento local e remoto",
  "Motores de portoes e automacao de acessos",
  "Controlo de acesso e tecnologia inteligente",
  "Infraestrutura de rede, energia e organizacao tecnica",
];

export default component$<AboutBitollModalProps>(({ onClose$ }) => {
  return (
    <div class="fixed inset-0 z-[360] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar sobre a Bitoll"
        class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
        onClick$={onClose$}
      />

      <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[960px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Sobre a Bitoll
            </p>
            <h2 class="mt-2 text-3xl font-bold text-white">
              Seguranca, automacao e tecnologia para ambientes mais confiaveis
            </h2>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>
        </div>

        <div class="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="space-y-5 text-sm leading-7 text-slate-300">
            <p>
              A Bitoll atua na implementacao de solucoes modernas de seguranca
              eletronica, automacao e infraestrutura tecnologica. O foco e
              entregar sistemas uteis, bem instalados e preparados para
              acompanhar o crescimento do cliente.
            </p>
            <p>
              Cada projeto pode iniciar com uma avaliacao simples do espaco,
              identificacao dos riscos, escolha do nivel de estrutura e
              organizacao dos produtos necessarios. Assim o cliente entende o
              que esta a contratar e consegue acompanhar melhor cada etapa.
            </p>
            <p>
              A conta do cliente usa o telefone como identificador principal.
              O email fica apenas como contacto opcional, pode ser atualizado
              no perfil e nao bloqueia a criacao da conta no primeiro acesso.
            </p>
          </div>

          <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Atuacao
            </p>
            <div class="mt-4 space-y-3">
              {capabilities.map((item) => (
                <div
                  key={item}
                  class="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div class="mt-7 grid gap-4 md:grid-cols-2">
          {values.map((item) => (
            <div
              key={item}
              class="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm font-semibold text-cyan-100"
            >
              {item}
            </div>
          ))}
        </div>

        <div class="mt-8 border-t border-slate-800 pt-6">
          <Button
            spacing="none"
            buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
            onClick$={onClose$}
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
});
