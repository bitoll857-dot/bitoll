import { component$ } from "@builder.io/qwik";
import Button from "~/components/ui/Button";

export default component$(() => {
  return (
      <section class="py-24 bg-slate-900/50 border-y border-slate-800">
        <div class="container mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span class="text-cyan-400 font-semibold">
                Sobre a Bitoll
              </span>

              <h2 class="text-4xl font-bold mt-4 mb-6">
                Tecnologia que protege.
                Segurança que transforma.
              </h2>

              <p class="text-slate-400 leading-relaxed mb-6">
                A Bitoll é uma empresa especializada em
                segurança eletrónica e soluções tecnológicas
                modernas.
              </p>

              <p class="text-slate-400 leading-relaxed mb-6">
                Trabalhamos com instalação de vedação
                elétrica, CCTV, motores de portões,
                controlo de acesso e sistemas inteligentes
                adaptados ao ambiente profissional.
              </p>

              <p class="text-slate-400 leading-relaxed">
                Nosso objetivo é entregar segurança,
                inovação e confiabilidade para empresas
                e residências.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <h3 class="text-5xl font-bold text-cyan-400 mb-2">
                  +100
                </h3>

                <p class="text-slate-400">
                  Projetos Realizados
                </p>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <h3 class="text-5xl font-bold text-cyan-400 mb-2">
                  +50
                </h3>

                <p class="text-slate-400">
                  Clientes Satisfeitos
                </p>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <h3 class="text-5xl font-bold text-cyan-400 mb-2">
                  24/7
                </h3>

                <p class="text-slate-400">
                  Suporte Técnico
                </p>
              </div>

              <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <h3 class="text-5xl font-bold text-cyan-400 mb-2">
                  100%
                </h3>

                <p class="text-slate-400">
                  Tecnologia Moderna
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
});