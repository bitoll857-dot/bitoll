import { component$, useSignal } from "@builder.io/qwik";

import AuthModal from "../modal/Auth";
import QuoteRequestModal from "../modal/QuoteRequest";
import ActionToast from "~/components/ui/toast";

import Button from "~/components/ui/button/Button";
import HeroVisual from "~/components/visual/Hero";
import { currentUser } from "~/data/user";

import type { AuthMode } from "~/types/auth";

export default component$(() => {
  const quoteModal = useSignal(false);
  const loginNotice = useSignal(false);

  const authModal = useSignal(false);

  const authMode = useSignal<AuthMode>("register");

  const initialData = useSignal({
    service: "",
    serviceTitle: "",
    source: "",
  });

  const isLoggedIn = !!currentUser;

  return (
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent" />

      <div class="container relative z-10 mx-auto px-6 py-24">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT CONTENT */}
          <div class="max-w-3xl">
            <h1 class="mb-6 font-bold leading-tight">
              <span class="text-5xl md:text-7xl">Bitoll</span>

              <span class="block text-3xl text-cyan-400 md:text-5xl">
                Segurança e Tecnologia
              </span>
            </h1>

            <p class="mb-10 max-w-2xl bg-cyan-100/2 px-4 py-4 text-lg leading-relaxed text-slate-400 md:text-xl">
              Soluções modernas em vedação elétrica, CCTV, automação de
              portões, controlo de acesso e tecnologias inteligentes para
              empresas, residências e indústrias.
            </p>

            <div class="flex flex-wrap gap-4">
              {/* DEFAULT BUTTON */}
              <Button
                variant="primary"
                onClick$={() => {
                  if (
                    !currentUser ||
                    localStorage.getItem("bitoll-auth-state") === "guest"
                  ) {
                    loginNotice.value = true;
                    return;
                  }

                  initialData.value = {
                    service: "cotação",
                    serviceTitle: "Cotacao geral",
                    source: "hero",
                  };

                  quoteModal.value = true;
                }}
              >
                Solicitar Orçamento
              </Button>

              {/* PROMOTION BUTTON */}
              

              {!isLoggedIn && (
                <Button
                  variant="secondary"
                  onClick$={() => {
                    authMode.value = "register";

                    authModal.value = true;
                  }}
                >
                  Criar conta
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT IMAGE CARD */}
          <div class="relative">
            <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 blur" />

            <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
              <HeroVisual />

              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div class="absolute bottom-0 left-0 p-8">
                <span class="mb-4 inline-block rounded-full border border-cyan-400/20 bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">
                  Instalação Profissional
                </span>

                <h3 class="mb-3 text-3xl font-bold">
                  Sistemas Inteligentes
                </h3>

                <p class="leading-relaxed text-slate-300">
                  Soluções modernas em segurança eletrónica, CCTV e automação
                  tecnológica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUOTE MODAL */}
      {quoteModal.value && (
        <QuoteRequestModal
          initialData={initialData.value}
          onClose$={() => {
            quoteModal.value = false;
          }}
        />
      )}

      <ActionToast
        isOpen={loginNotice.value}
        title="Login necessario"
        message="A Bitoll precisa ligar o pedido a sua conta para guardar o historico e permitir acompanhamento posterior."
        actionLabel="Entrar"
        onClose$={() => {
          loginNotice.value = false;
        }}
        onAction$={() => {
          loginNotice.value = false;
          authMode.value = "login";
          authModal.value = true;
        }}
      />

      {/* AUTH MODAL */}
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
