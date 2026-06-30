import { component$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

import type {
  PhotoPromptAccessForm,
  PhotoPromptAccessMode,
} from "../types";
import { whatsappCountryCodes } from "../storage.helpers";

type AccessGateProps = {
  access: PhotoPromptAccessForm;
  lockedWhatsapp: boolean;
  mode: PhotoPromptAccessMode;
  onCreateAccount$: QRL<() => void>;
  onGeneratePassword$: QRL<() => void>;
  onLogin$: QRL<() => void>;
  onRequestRecovery$: QRL<() => void>;
  onResetPassword$: QRL<() => void>;
  onSetMode$: QRL<(mode: PhotoPromptAccessMode) => void>;
};

export default component$((props: AccessGateProps) => (
  <section class="container mx-auto grid min-h-[calc(100vh-10rem)] place-items-center px-6 py-10">
    <div class="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
        Ferramentas IA
      </p>
      <h1 class="mt-3 text-3xl font-black text-white">
        Acesso ao gerador de fotos
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-400">
        Use o seu numero de WhatsApp como ID. Se ainda nao tiver acesso, crie
        uma senha automatica e altere quando quiser.
      </p>

      <div class="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950 p-1">
        <button
          type="button"
          class={[
            "rounded-lg px-3 py-2 text-sm font-bold",
            props.mode === "login"
              ? "bg-cyan-300 text-slate-950"
              : "text-slate-300",
          ]}
          onClick$={() => props.onSetMode$("login")}
        >
          Entrar
        </button>
        <button
          type="button"
          class={[
            "rounded-lg px-3 py-2 text-sm font-bold",
            props.mode === "create"
              ? "bg-cyan-300 text-slate-950"
              : "text-slate-300",
          ]}
          onClick$={() => props.onSetMode$("create")}
        >
          Criar acesso
        </button>
      </div>

      {props.mode !== "reset" && (
        <div class="mt-5 grid gap-3 sm:grid-cols-[190px_1fr]">
          <label>
            <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Pais
            </span>
            <select
              value={props.access.countryDialCode}
              class="mt-2 h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-white outline-none focus:border-cyan-400/60"
              onChange$={(event) => {
                props.access.countryDialCode = (
                  event.target as HTMLSelectElement
                ).value;
              }}
            >
              {whatsappCountryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              ID / numero de WhatsApp
            </span>
            <input
              value={props.access.whatsapp}
              placeholder="Ex.: 84 000 0000"
              autocomplete="tel"
              inputMode="tel"
              readOnly={props.lockedWhatsapp && props.mode === "create"}
              type="tel"
              class={[
                "mt-2 h-12 w-full rounded-xl border border-slate-800 px-4 text-sm text-white outline-none focus:border-cyan-400/60",
                props.lockedWhatsapp && props.mode === "create"
                  ? "bg-slate-900 text-slate-400"
                  : "bg-slate-950",
              ]}
              onInput$={(event) => {
                if (!(props.lockedWhatsapp && props.mode === "create")) {
                  props.access.whatsapp = (
                    event.target as HTMLInputElement
                  ).value;
                }
              }}
            />
            {props.lockedWhatsapp && props.mode === "create" && (
              <span class="mt-2 block text-xs font-bold text-cyan-200">
                Este numero vem do perfil da plataforma.
              </span>
            )}
          </label>
        </div>
      )}

      {props.mode === "login" && (
        <div class="mt-4 grid gap-4">
          <input
            value={props.access.password}
            placeholder="Senha"
            autocomplete="current-password"
            type="password"
            class="h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
            onInput$={(event) => {
              props.access.password = (event.target as HTMLInputElement).value;
            }}
          />
          <button
            type="button"
            class="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
            onClick$={props.onLogin$}
          >
            Entrar
          </button>
          <button
            type="button"
            class="text-left text-sm font-bold text-cyan-200"
            onClick$={() => props.onSetMode$("recover")}
          >
            Reposicao de senha
          </button>
        </div>
      )}

      {props.mode === "create" && (
        <div class="mt-4 grid gap-4">
          <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={props.access.generatedPassword}
              placeholder="Senha automatica"
              autocomplete="new-password"
              class="h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
              onInput$={(event) => {
                props.access.generatedPassword = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
            <button
              type="button"
              class="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-200"
              onClick$={props.onGeneratePassword$}
            >
              Gerar senha
            </button>
          </div>
          <button
            type="button"
            class="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
            onClick$={props.onCreateAccount$}
          >
            Criar e entrar
          </button>
        </div>
      )}

      {props.mode === "recover" && (
        <div class="mt-4 grid gap-4">
          <button
            type="button"
            class="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950"
            onClick$={props.onRequestRecovery$}
          >
            Receber codigo no WhatsApp
          </button>
          <input
            value={props.access.recoveryCode}
            placeholder="Codigo recebido"
            class="h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
            onInput$={(event) => {
              props.access.recoveryCode = (event.target as HTMLInputElement).value;
            }}
          />
          <input
            value={props.access.newPassword}
            placeholder="Nova senha"
            autocomplete="new-password"
            type="password"
            class="h-12 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-white outline-none focus:border-cyan-400/60"
            onInput$={(event) => {
              props.access.newPassword = (event.target as HTMLInputElement).value;
            }}
          />
          <button
            type="button"
            class="rounded-xl border border-cyan-300 px-4 py-3 text-sm font-black text-cyan-100"
            onClick$={props.onResetPassword$}
          >
            Alterar senha
          </button>
        </div>
      )}

      {props.access.message && (
        <p class="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm font-bold text-cyan-100">
          {props.access.message}
        </p>
      )}
    </div>
  </section>
));
