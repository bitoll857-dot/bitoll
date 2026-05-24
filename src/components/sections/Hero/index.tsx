import { component$, useSignal } from "@builder.io/qwik";
import AuthModal from "~/components/auth/AuthModal";
import QuoteRequestModal from "~/components/forms/QuoteRequestModal";
import Button from "~/components/ui/Button";
import HeroVisual from "~/components/visual/Hero";
import type { AuthMode } from "~/types/auth";

export default component$(() => {
  const quoteModal = useSignal(false);
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("register");

  return (
      <section class="relative overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent"></div>

        <div class="container mx-auto px-6 py-24 relative z-10">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* LEFT CONTENT */}
            <div class="max-w-3xl">

              <h1 class="font-bold leading-tight mb-6  ">
                <span class="text-5xl md:text-7xl " >Bitoll</span>
                <span class="text-3xl md:text-5xl block text-cyan-400 ">
                  Segurança e Tecnologia
                </span>
              </h1>

              <p class="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl px-4 py-4 bg-cyan-100/2">
                Soluções modernas em vedação elétrica, CCTV,
                automação de portões, controlo de acesso e
                tecnologias inteligentes para empresas,
                residências e indústrias.
              </p>

              <div class="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick$={() => {
                    quoteModal.value = true;
                  }}
                >
                  Solicitar Orçamento
                </Button>
                <Button
                  variant="secondary"
                  onClick$={() => {
                    authMode.value = "register";
                    authModal.value = true;
                  }}
                >
                  Criar conta
                </Button>
              </div>
            </div>

            {/* RIGHT IMAGE CARD */}
            <div class="relative">
              <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20"></div>

              <div class="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <HeroVisual />

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

        {quoteModal.value && (
          <QuoteRequestModal
            onClose$={() => {
              quoteModal.value = false;
            }}
          />
        )}

        {authModal.value && (
          <AuthModal
            mode={authMode.value}
            onClose$={() => {
              authModal.value = false;
            }}
            onModeChange$={(mode) => {
              authMode.value = mode;
            }}
          />
        )}
      </section>
  );
});
