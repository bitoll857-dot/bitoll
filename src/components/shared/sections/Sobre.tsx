import { component$, useSignal } from "@builder.io/qwik";

import Button from "../button/Button";
import AboutBitollModal from "~/components/ui/modal/AboutBitoll";

export default component$(() => {
  const aboutModal = useSignal(false);

  return (
    <section id="sobre" class="border-y border-slate-800 bg-slate-900/50 py-24">
      <div class="container mx-auto px-6">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <span class="font-semibold text-cyan-400">Sobre a Bitoll</span>

            <h2 class="mb-6 mt-4 text-4xl font-bold">
              Tecnologia que protege. Seguranca que transforma.
            </h2>

            <p class="mb-6 leading-relaxed text-slate-400">
              A Bitoll e uma empresa especializada em seguranca eletronica e
              solucoes tecnologicas modernas.
            </p>

            <p class="mb-6 leading-relaxed text-slate-400">
              Trabalhamos com instalacao de vedacao eletrica, CCTV, motores de
              portoes, controlo de acesso e sistemas inteligentes adaptados ao
              ambiente profissional.
            </p>

            <p class="leading-relaxed text-slate-400">
              Nosso objetivo e entregar seguranca, inovacao e confiabilidade
              para empresas e residencias.
            </p>

            <Button
              variant="secondary"
              onClick$={() => {
                aboutModal.value = true;
              }}
            >
              Ver mais sobre a Bitoll
            </Button>
          </div>

          <div class="grid grid-cols-2 gap-6">
            {[
              ["+100", "Projetos realizados"],
              ["+50", "Clientes satisfeitos"],
              ["24/7", "Suporte tecnico"],
              ["100%", "Tecnologia moderna"],
            ].map(([value, label]) => (
              <div
                key={label}
                class="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"
              >
                <h3 class="mb-2 text-5xl font-bold text-cyan-400">
                  {value}
                </h3>
                <p class="text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {aboutModal.value && (
        <AboutBitollModal
          onClose$={() => {
            aboutModal.value = false;
          }}
        />
      )}
    </section>
  );
});

