import { $, component$, type QRL, useSignal } from "@builder.io/qwik";

import PasswordField from "../fields/Password";
import TextField from "../fields/Text";
import Button from "../button/Button";
import { showBitollToast } from "~/components/ui/toast";
import { signInWithGoogle, signInWithPassword } from "~/lib/supabase/auth";

type LoginFormProps = {
  onAuthenticated$?: QRL<() => Promise<void> | void>;
};

export default component$<LoginFormProps>(({ onAuthenticated$ }) => {
  const isSubmitting = useSignal(false);

  const showToast$ = $((title: string, message: string) => {
    showBitollToast(title, message);
  });

  return (
    <form
      preventdefault:submit
      class="mt-6 space-y-5"
      onSubmit$={async (event) => {
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const phone = String(formData.get("phone") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        isSubmitting.value = true;

        const result = await signInWithPassword(phone, password);

        isSubmitting.value = false;

        if (!result.ok) {
          await showToast$("Entrada nao concluida", result.message);
          return;
        }

        await showToast$("Sessao iniciada", result.message);
        await onAuthenticated$?.();
      }}
    >
      <Button
        type="button"
        variant="secondary"
        fullWidth
        spacing="none"
        buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
        onClick$={async () => {
          isSubmitting.value = true;

          const result = await signInWithGoogle();

          isSubmitting.value = false;

          if (!result.ok) {
            await showToast$("Entrada Google", result.message);
            return;
          }

          await showToast$("Entrada Google", result.message);
        }}
      >
        Entrar com Google
      </Button>

      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-800" />
        <span class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          ou
        </span>
        <div class="h-px flex-1 bg-slate-800" />
      </div>

      <TextField
        id="login-identifier"
        label="Telefone"
        name="phone"
        type="tel"
        placeholder="+258..."
        autoComplete="tel"
        required
      />

      <PasswordField
        id="login-password"
        label="Palavra-passe"
        name="password"
        placeholder="Digite a sua palavra-passe"
        autoComplete="current-password"
        required
      />

      <div class="flex flex-wrap items-center justify-between gap-3">
        <label class="flex items-center gap-3 text-sm text-slate-400">
          <input
            type="checkbox"
            name="remember"
            class="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
          />
          Lembrar-me
        </label>

        <button
          type="button"
          class="text-sm font-semibold text-cyan-300 transition duration-300 hover:text-cyan-200"
        >
          Esqueci a palavra-passe
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        spacing="none"
        buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
      >
        {isSubmitting.value ? "A entrar..." : "Entrar"}
      </Button>

    </form>
  );
});
