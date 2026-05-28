import { component$, type QRL, useSignal } from "@builder.io/qwik";

import PasswordField from "../fields/Password";
import TextField from "../fields/Text";
import Button from "../button/Button";
import { signInWithGoogle, signInWithPassword } from "~/lib/supabase/auth";

type LoginFormProps = {
  onAuthenticated$?: QRL<() => Promise<void> | void>;
};

export default component$<LoginFormProps>(({ onAuthenticated$ }) => {
  const errorMessage = useSignal("");
  const successMessage = useSignal("");
  const isSubmitting = useSignal(false);

  return (
    <form
      preventdefault:submit
      class="mt-6 space-y-5"
      onSubmit$={async (event) => {
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const identifier = String(formData.get("identifier") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        errorMessage.value = "";
        successMessage.value = "";
        isSubmitting.value = true;

        const result = await signInWithPassword(identifier, password);

        isSubmitting.value = false;

        if (!result.ok) {
          errorMessage.value = result.message;
          return;
        }

        successMessage.value = result.message;
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
          errorMessage.value = "";
          successMessage.value = "";
          isSubmitting.value = true;

          const result = await signInWithGoogle();

          isSubmitting.value = false;

          if (!result.ok) {
            errorMessage.value = result.message;
            return;
          }

          successMessage.value = result.message;
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
        label="Email"
        name="identifier"
        placeholder="email@exemplo.com"
        autoComplete="username"
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

      {(errorMessage.value || successMessage.value) && (
        <p
          class={[
            "rounded-2xl border px-4 py-3 text-sm leading-6",
            errorMessage.value
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
          ]}
        >
          {errorMessage.value || successMessage.value}
        </p>
      )}
    </form>
  );
});
