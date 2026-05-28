import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";

import {
  exchangeSupabaseAuthCode,
  syncSupabaseAuthSession,
} from "~/lib/supabase/auth";

export default component$(() => {
  const status = useSignal("A confirmar a sessao com Supabase...");
  const hasError = useSignal(false);
  const nav = useNavigate();

  useVisibleTask$(async () => {
    const code = new URLSearchParams(window.location.search).get("code");
    const result = code
      ? await exchangeSupabaseAuthCode(code)
      : await syncSupabaseAuthSession();

    status.value = result.message;
    hasError.value = !result.ok;

    if (result.ok && result.hasSession) {
      window.setTimeout(() => {
        nav("/");
      }, 700);
    }
  });

  return (
    <main class="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <section class="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Conta Bitoll
        </p>

        <h1 class="mt-3 text-3xl font-bold">
          {hasError.value ? "Nao foi possivel entrar" : "A validar acesso"}
        </h1>

        <p class="mt-4 text-sm leading-7 text-slate-300">{status.value}</p>

        {hasError.value && (
          <a
            href="/"
            class="mt-6 inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Voltar para a plataforma
          </a>
        )}
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: "A validar acesso | Bitoll",
};
