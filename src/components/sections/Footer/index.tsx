import { component$ } from "@builder.io/qwik";
import Button from "~/components/ui/Button";

export default component$(() => {
  return (
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
    );
});