import { component$ } from "@builder.io/qwik";

import PasswordField from "../fields/Password";
import TextField from "../fields/Text";
import Button from "../button/Button";

export default component$(() => {
  return (
    <form preventdefault:submit class="mt-6 space-y-5">
      <TextField
        id="login-identifier"
        label="Email ou telefone"
        name="identifier"
        placeholder="email@exemplo.com ou +258..."
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
        Entrar
      </Button>
    </form>
  );
});
