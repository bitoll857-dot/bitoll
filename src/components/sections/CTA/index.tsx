import { component$, useSignal } from "@builder.io/qwik";
import AuthModal from "~/components/auth/AuthModal";
import Button from "~/components/ui/Button";
import type { AuthMode } from "~/types/auth";

export default component$(() => {
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("register");

  return (
      <section class="py-24">
        <div class="container mx-auto px-6">
          <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-3xl p-12 text-center">
            <h2 class="text-4xl font-bold mb-6">
              Proteja o seu espaço com tecnologia inteligente
            </h2>

            <p class="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
              Crie sua conta para melhor ter mais acesso do que é a nossa experiencia.
            </p>

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
