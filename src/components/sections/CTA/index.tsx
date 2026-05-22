import { component$ } from "@builder.io/qwik";
import Button from "~/components/ui/Button";

export default component$(() => {
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

            <button class="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 transition rounded-xl font-semibold text-slate-950">
              Criar conta
            </button>
          </div>
        </div>
      </section>
    );
});