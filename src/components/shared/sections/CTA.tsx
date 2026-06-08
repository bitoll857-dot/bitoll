import { $, component$, useOnWindow, useSignal } from "@builder.io/qwik";
import AuthModal from "../modal/Auth";
import Button from "../button/Button";
import ContactMenu from "~/components/ui/contact/ContactMenu";
import { getCachedAuthUser } from "~/lib/supabase/client";
import type { AuthMode } from "~/types/auth";

export default component$(() => {
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("register");
  const authReady = useSignal(false);
  const isLoggedIn = useSignal(false);

  useOnWindow(
    "load",
    $(() => {
      isLoggedIn.value =
        !!getCachedAuthUser() &&
        localStorage.getItem("bitoll-auth-state") !== "guest";
      authReady.value = true;
    }),
  );

  useOnWindow(
    "bitoll-auth-change",
    $((event) => {
      isLoggedIn.value =
        !!(event as CustomEvent<{ isAuthenticated: boolean }>).detail
          ?.isAuthenticated;
      authReady.value = true;
    }),
  );

  return (
      <section class="py-24">
        <div class="container mx-auto px-6">
          <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-3xl p-12 text-center">
            <h2 class="text-4xl font-bold mb-6">
              Proteja o seu espaço com tecnologia inteligente
            </h2>

            <p class="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              {authReady.value && isLoggedIn.value
                ? "Acompanhe os seus servicos, pedidos e actualizacoes pela area logada da Bitoll."
                : "Crie sua conta para melhor ter mais acesso do que e a nossa experiencia."}
            </p>

            <div class="flex flex-wrap justify-center gap-4">
              {authReady.value && !isLoggedIn.value && (
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
              <ContactMenu />
            </div>
          </div>
        </div>

        {authReady.value && !isLoggedIn.value && authModal.value && (
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
