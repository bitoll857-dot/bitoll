import { component$, useSignal } from "@builder.io/qwik";

import DeveloperCreditsModal from "~/components/ui/modal/DeveloperCredits";

export default component$(() => {
  const creditsModal = useSignal(false);

  return (
    <>
      <footer class="border-t border-slate-800 py-8">
        <div class="container mx-auto flex flex-col items-center justify-between gap-5 px-6 md:flex-row">
          <div>
            <h3 class="text-2xl font-bold text-cyan-400">
              Bitoll
            </h3>

            <p class="text-sm text-slate-500">
              Seguranca & Tecnologia Inteligente
            </p>
          </div>

          <div class="text-center md:text-right">
            <p class="text-sm text-slate-500">
              (c) 2026 Bitoll. Todos direitos reservados.
            </p>

            <button
              type="button"
              class="mt-2 text-sm font-semibold text-slate-400 transition duration-300 hover:text-cyan-300"
              onClick$={() => {
                creditsModal.value = true;
              }}
            >
              Desenvolvido por Goncalves Alberto Ubisse - UX & Analise por
              Sacrificio Junior Sithole
            </button>
          </div>
        </div>
      </footer>

      {creditsModal.value && (
        <DeveloperCreditsModal
          onClose$={() => {
            creditsModal.value = false;
          }}
        />
      )}
    </>
  );
});
