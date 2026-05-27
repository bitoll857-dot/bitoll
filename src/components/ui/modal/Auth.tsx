import { component$, type QRL } from "@builder.io/qwik";

import AuthTabs from "../tabs/Auth";
import LoginForm from "../forms/Login";
import RegisterForm from "../forms/Register";
import type { AuthMode } from "~/types/auth";

type AuthModalProps = {
  mode: AuthMode;
  onClose$: QRL<() => void>;
  onModeChange$: QRL<(mode: AuthMode) => void>;
};

export default component$<AuthModalProps>(
  ({ mode, onClose$, onModeChange$ }) => {
    const isLogin = mode === "login";

    return (
      <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
        <button
          type="button"
          aria-label="Fechar autenticacao"
          class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
          onClick$={onClose$}
        />

        <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute right-5 top-5 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>

          <div class="flex items-start justify-between gap-4 pr-14">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Conta Bitoll
              </p>

              <h2 class="mt-2 text-2xl font-bold text-white">
                {isLogin ? "Entrar na conta" : "Criar conta"}
              </h2>

              <p class="mt-2 max-w-[420px] text-sm leading-6 text-slate-400">
                {isLogin
                  ? "Acesse para guardar pedidos, interesses e historico de atendimento."
                  : "A conta e opcional, mas ajuda a acompanhar pedidos e futuras respostas da Bitoll."}
              </p>
            </div>

          </div>

          <div class="mt-6">
            <AuthTabs mode={mode} onModeChange$={onModeChange$} />
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    );
  },
);
