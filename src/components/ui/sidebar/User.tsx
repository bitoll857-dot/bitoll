import { $, component$, type QRL, useOnWindow, useSignal } from "@builder.io/qwik";

import UserAvatar from "../avatar/User";
import AuthModal from "../modal/Auth";
import Button from "../button/Button";
import { currentSession, currentUser } from "~/data/user";
import type { AuthMode } from "~/types/auth";
import type { ContactMethod, CustomerType, User } from "~/types/user";

type UserSidebarProps = {
  onClose$: QRL<() => void>;
  isAuthenticated?: boolean;
};

const formatSessionDuration = (startedAt?: string) => {
  if (!startedAt) {
    return "Sessao nao iniciada";
  }

  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const totalMinutes = Math.max(0, Math.floor((now - started) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes}min`;
};

const customerTypes: CustomerType[] = [
  "Particular",
  "Empresa",
  "Condominio",
  "Industria",
];

const contactMethods: ContactMethod[] = ["WhatsApp", "Telefone", "Email"];

export default component$<UserSidebarProps>(
({ onClose$, isAuthenticated = !!currentUser }) => {
  const authModal = useSignal(false);
  const authMode = useSignal<AuthMode>("login");
  const profileModal = useSignal(false);
  const sessionActive = useSignal(isAuthenticated && !!currentUser);
  const user = currentUser;
  const isLoggedIn = sessionActive.value && !!user;
  const editableUser = useSignal<User | null>(user ? { ...user } : null);
  const displayUser = isLoggedIn ? editableUser.value : null;
  const sessionDuration = formatSessionDuration(currentSession?.startedAt);
  const userDetails = displayUser
    ? [
        { label: "Nome", value: displayUser.name },
        { label: "Email Google", value: displayUser.email },
        { label: "Telefone", value: displayUser.phone },
        { label: "Perfil", value: displayUser.customerType },
        { label: "Cidade", value: displayUser.city },
        { label: "Contacto", value: displayUser.preferredContactMethod },
        { label: "Estado", value: displayUser.status },
        {
          label: "Sessao",
          value: `${currentSession?.provider ?? "Google"} · ${sessionDuration}`,
        },
      ]
    : [
        { label: "Estado", value: "Visitante" },
        { label: "Conta", value: "Nao autenticado" },
        { label: "Historico", value: "Disponivel apos login" },
      ];

  useOnWindow(
    "load",
    $(() => {
      sessionActive.value =
        !!currentUser && localStorage.getItem("bitoll-auth-state") !== "guest";
    }),
  );

  useOnWindow(
    "bitoll-auth-change",
    $((event) => {
      sessionActive.value =
        !!(event as CustomEvent<{ isAuthenticated: boolean }>).detail
          ?.isAuthenticated;
    }),
  );

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
                name={displayUser?.name}
                size="lg"
              />

              <div>
                <h3 class="text-xl font-bold text-white">
                  {displayUser?.name ?? "Cliente Bitoll"}
                </h3>

                <p class="mt-1 text-sm text-slate-400">
                  {displayUser?.email ?? "Entre ou crie uma conta para guardar acoes"}
                </p>

                <div
                  class={[
                    "mt-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                    isLoggedIn
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                      : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
                  ]}
                >
                  {displayUser?.verified
                    ? `Sessao ativa ha ${sessionDuration}`
                    : "Sem sessao iniciada"}
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
          <div class="grid gap-3">
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

                profileModal.value = true;
              }}
            >
              {isLoggedIn ? "Editar dados" : "Criar conta opcional"}
            </Button>

            {isLoggedIn && (
              <Button
                variant="secondary"
                size="none"
                fullWidth
                spacing="none"
                buttonClass="flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold"
                onClick$={() => {
                  sessionActive.value = false;
                  localStorage.setItem("bitoll-auth-state", "guest");
                  window.dispatchEvent(
                    new CustomEvent("bitoll-auth-change", {
                      detail: { isAuthenticated: false },
                    }),
                  );
                }}
              >
                Terminar sessao
              </Button>
            )}
          </div>
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

      {profileModal.value && displayUser && (
        <div class="fixed inset-0 z-[380] flex min-h-dvh items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar edicao de perfil"
            class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
            onClick$={() => {
              profileModal.value = false;
            }}
          />

          <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[680px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  Perfil do cliente
                </p>
                <h2 class="mt-2 text-2xl font-bold text-white">
                  Editar dados
                </h2>
                <p class="mt-2 max-w-[520px] text-sm leading-6 text-slate-400">
                  O email vem da conta Google ativa no navegador e nao pode ser
                  alterado aqui.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
                onClick$={() => {
                  profileModal.value = false;
                }}
              >
                x
              </button>
            </div>

            <form preventdefault:submit class="mt-7 space-y-5">
              <div class="grid gap-5 sm:grid-cols-2">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Nome
                  </span>
                  <input
                    value={displayUser.name}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
                    onInput$={(event) => {
                      const target = event.target as HTMLInputElement;
                      editableUser.value = {
                        ...displayUser,
                        name: target.value,
                      };
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Email Google
                  </span>
                  <input
                    value={displayUser.email}
                    disabled
                    class="mt-2 h-12 w-full cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-900/40 px-4 text-sm text-slate-500 outline-none"
                  />
                </label>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Telefone
                  </span>
                  <input
                    value={displayUser.phone}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
                    onInput$={(event) => {
                      const target = event.target as HTMLInputElement;
                      editableUser.value = {
                        ...displayUser,
                        phone: target.value,
                      };
                    }}
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Cidade
                  </span>
                  <input
                    value={displayUser.city}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
                    onInput$={(event) => {
                      const target = event.target as HTMLInputElement;
                      editableUser.value = {
                        ...displayUser,
                        city: target.value,
                      };
                    }}
                  />
                </label>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Perfil
                  </span>
                  <select
                    value={displayUser.customerType}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
                    onChange$={(event) => {
                      const target = event.target as HTMLSelectElement;
                      editableUser.value = {
                        ...displayUser,
                        customerType: target.value as CustomerType,
                      };
                    }}
                  >
                    {customerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label class="block">
                  <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Contacto preferido
                  </span>
                  <select
                    value={displayUser.preferredContactMethod}
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
                    onChange$={(event) => {
                      const target = event.target as HTMLSelectElement;
                      editableUser.value = {
                        ...displayUser,
                        preferredContactMethod: target.value as ContactMethod,
                      };
                    }}
                  >
                    {contactMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div class="flex flex-wrap gap-3 border-t border-slate-800 pt-6">
                <Button
                  type="submit"
                  spacing="none"
                  buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
                  onClick$={() => {
                    profileModal.value = false;
                  }}
                >
                  Guardar alteracoes
                </Button>
                <Button
                  variant="secondary"
                  spacing="none"
                  buttonClass="rounded-2xl px-5 py-3 text-sm font-semibold"
                  onClick$={() => {
                    profileModal.value = false;
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
