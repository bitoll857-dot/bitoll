import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="min-h-screen bg-slate-950 text-white">
      {/* HERO SECTION */}
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent"></div>

        <div class="container mx-auto px-6 py-24 relative z-10">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT CONTENT */}
            <div class="max-w-3xl">
              <span class="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-sm mb-6">
                Segurança & Tecnologia Inteligente
              </span>

              <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6">
                Bitoll
                <span class="block text-cyan-400">
                  Segurança e Tecnologia
                </span>
              </h1>

              <p class="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
                Soluções modernas em vedação elétrica, CCTV,
                automação de portões, controlo de acesso e
                tecnologias inteligentes para empresas,
                residências e indústrias.
              </p>

              <div class="flex flex-wrap gap-4">
                <button class="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 transition rounded-xl font-semibold text-slate-950">
                  Solicitar Orçamento
                </button>

                <button class="px-8 py-4 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 transition rounded-xl">
                  Conhecer Serviços
                </button>
              </div>
            </div>

            {/* RIGHT IMAGE CARD */}
            <div class="relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20"></div>

              <div class="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <img
                  src="/images/security-installation.jpg"
                  alt="Instalação de Segurança"
                  class="w-full h-[500px] object-cover"
                />

                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                <div class="absolute bottom-0 left-0 p-8">
                  <span class="inline-block px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 text-xs mb-4">
                    Instalação Profissional
                  </span>

                  <h3 class="text-3xl font-bold mb-3">
                    Sistemas Inteligentes
                  </h3>

                  <p class="text-slate-300 leading-relaxed">
                    Soluções modernas em segurança eletrónica,
                    CCTV e automação tecnológica.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section class="py-24">
        <div class="container mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold mb-4">
              Nossos Serviços
            </h2>

            <p class="text-slate-400 max-w-2xl mx-auto">
              Tecnologia moderna e soluções inteligentes
              para proteção, automação e segurança.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CARD */}
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/40 transition">
              <div class="text-cyan-400 text-4xl mb-4">⚡</div>

              <h3 class="text-xl font-semibold mb-3">
                Vedação Elétrica
              </h3>

              <p class="text-slate-400 leading-relaxed">
                Sistemas modernos de proteção perimetral
                para máxima segurança.
              </p>
            </div>

            {/* CARD */}
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/40 transition">
              <div class="text-cyan-400 text-4xl mb-4">📹</div>

              <h3 class="text-xl font-semibold mb-3">
                CCTV
              </h3>

              <p class="text-slate-400 leading-relaxed">
                Monitoramento inteligente com câmeras HD
                e acesso remoto.
              </p>
            </div>

            {/* CARD */}
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/40 transition">
              <div class="text-cyan-400 text-4xl mb-4">🚪</div>

              <h3 class="text-xl font-semibold mb-3">
                Motores de Portões
              </h3>

              <p class="text-slate-400 leading-relaxed">
                Automação eficiente para portões
                residenciais e industriais.
              </p>
            </div>

            {/* CARD */}
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400/40 transition">
              <div class="text-cyan-400 text-4xl mb-4">🛰️</div>

              <h3 class="text-xl font-semibold mb-3">
                Tecnologia Inteligente
              </h3>

              <p class="text-slate-400 leading-relaxed">
                Soluções modernas em automação,
                controlo e infraestrutura tecnológica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
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

      {/* CTA */}
      <section class="py-24">
        <div class="container mx-auto px-6">
          <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-3xl p-12 text-center">
            <h2 class="text-4xl font-bold mb-6">
              Proteja o seu espaço com tecnologia inteligente
            </h2>

            <p class="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              Entre em contacto com a Bitoll e descubra
              soluções modernas para segurança e automação.
            </p>

            <button class="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 transition rounded-xl font-semibold text-slate-950">
              Entrar em Contacto
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer class="border-t border-slate-800 py-8">
        <div class="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 class="text-2xl font-bold text-cyan-400">
              Bitoll
            </h3>

            <p class="text-slate-500 text-sm">
              Segurança & Tecnologia Inteligente
            </p>
          </div>

          <p class="text-slate-500 text-sm">
            © 2026 Bitoll. Todos direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
