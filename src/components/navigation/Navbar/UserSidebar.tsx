import { component$, type QRL, useSignal } from "@builder.io/qwik";

import UserAvatar from "./UserAvatar";
import AuthModal from "~/components/auth/AuthModal";
import Button from "~/components/ui/Button";
import { currentUser } from "~/data/user";
import type { AuthMode } from "~/types/auth";

type UserSidebarProps = {
  onClose$: QRL<() => void>;
};

export default component$<UserSidebarProps>(({ onClose$ }) => {
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("login");
  const user = currentUser;
  const isLoggedIn = !!user;
  const userDetails = user
    ? [
        { label: "Nome", value: user.name },
        { label: "Email", value: user.email },
        { label: "Telefone", value: user.phone },
        { label: "Perfil", value: user.customerType },
        { label: "Cidade", value: user.city },
        { label: "Contacto", value: user.preferredContactMethod },
        { label: "Estado", value: user.status },
      ]
    : [
        { label: "Estado", value: "Visitante" },
        { label: "Conta", value: "Nao autenticado" },
        { label: "Historico", value: "Disponivel apos login" },
      ];

  return (
    <div class="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Fechar painel do usuario"
        class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-md"
        onClick$={onClose$}
      />

      <aside class="absolute right-0 top-0 flex h-screen min-h-screen w-full max-w-[420px] flex-col overflow-hidden border-l border-slate-800 bg-slate-950 shadow-[-30px_0_80px_rgba(15,23,42,0.55)]">
        <div class="flex items-center justify-between border-b border-slate-800 px-6 py-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              {isLoggedIn ? "Usuario" : "Visitante"}
            </p>

            <h2 class="mt-2 text-2xl font-bold text-white">
              {isLoggedIn ? "Minha conta" : "Acesso do cliente"}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            ×
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-8">
          <div class="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div class="flex items-center gap-4">
              <UserAvatar
                avatarUrl={user?.avatarUrl}
                isAuthenticated={isLoggedIn}
                name={user?.name}
                size="lg"
              />

              <div>
                <h3 class="text-xl font-bold text-white">
                  {user?.name ?? "Cliente Bitoll"}
                </h3>

                <p class="mt-1 text-sm text-slate-400">
                  {user?.email ?? "Entre ou crie uma conta para guardar acoes"}
                </p>

                <div
                  class={[
                    "mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                    isLoggedIn
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
                  ]}
                >
                  {user?.verified ? "Conta verificada" : "Sem sessao iniciada"}
                </div>
              </div>
            </div>

            {!isLoggedIn && (
              <div class="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="custom"
                  size="none"
                  fullWidth
                  spacing="none"
                  buttonClass="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/20"
                  onClick$={() => {
                    authMode.value = "login";
                    authModal.value = true;
                  }}
                >
                  Entrar
                </Button>

                <Button
                  variant="custom"
                  size="none"
                  fullWidth
                  spacing="none"
                  buttonClass="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30 hover:text-cyan-200"
                  onClick$={() => {
                    authMode.value = "register";
                    authModal.value = true;
                  }}
                >
                  Criar conta
                </Button>
              </div>
            )}
          </div>

          <div class="mt-10">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                Informacoes
              </h4>

              <div class="h-px flex-1 bg-slate-800 ml-4" />
            </div>

            <div class="space-y-4">
              {userDetails.map((item) => (
                <div
                  key={item.label}
                  class="group rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 transition duration-300 hover:border-cyan-400/20 hover:bg-slate-900"
                >
                  <p class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {item.label}
                  </p>

                  <p class="mt-2 text-sm font-semibold text-slate-100">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div class="mt-10 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 px-5 py-5">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                ⚡
              </div>

              <div>
                <p class="text-sm font-bold text-cyan-200">
                  Painel Bitoll
                </p>

                <p class="text-xs text-cyan-100/70">
                  Tecnologia & Segurança
                </p>
              </div>
            </div>

            <p class="mt-4 text-sm leading-7 text-slate-300">
              {isLoggedIn
                ? "Aqui podes acompanhar dados da conta, servicos contratados, notificacoes e futuras funcionalidades da plataforma."
                : "A conta e opcional. Quando o cliente entrar, o sistema podera guardar pedidos, servicos de interesse e historico para acompanhamento posterior."}
            </p>
          </div>
        </div>

        <div class="border-t border-slate-800 bg-slate-950/90 px-6 py-6">
          <Button
            variant="custom"
            size="none"
            fullWidth
            spacing="none"
            buttonClass="flex w-full items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-4 text-sm font-semibold text-cyan-200 hover:border-cyan-400/50 hover:bg-cyan-400/20"
            onClick$={() => {
              if (!isLoggedIn) {
                authMode.value = "register";
                authModal.value = true;
                return;
              }

              onClose$();
            }}
          >
            {isLoggedIn ? "Fechar painel" : "Criar conta opcional"}
          </Button>
        </div>
      </aside>

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
    </div>
  );
});
