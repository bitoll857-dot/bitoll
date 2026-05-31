import { $, component$, type QRL, useSignal } from "@builder.io/qwik";

import PasswordField from "../fields/Password";
import TextField from "../fields/Text";
import Button from "../button/Button";
import { showBitollToast } from "~/components/ui/toast";
import { signUpWithPassword } from "~/lib/supabase/auth";

type RegisterFormProps = {
  onAuthenticated$?: QRL<() => Promise<void> | void>;
};

export default component$<RegisterFormProps>(({ onAuthenticated$ }) => {
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
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (password !== confirmPassword) {
          await showToast$("Dados incompletos", "As palavras-passe nao coincidem.");
          return;
        }

        isSubmitting.value = true;

        const result = await signUpWithPassword({
          email: String(formData.get("email") ?? "").trim(),
          name: String(formData.get("name") ?? "").trim(),
          password,
          phone: String(formData.get("phone") ?? "").trim(),
        });

        isSubmitting.value = false;

        if (!result.ok) {
          await showToast$("Conta nao criada", result.message);
          return;
        }

        await showToast$("Conta criada", result.message);

        if (result.hasSession) {
          await onAuthenticated$?.();
        }
      }}
    >
      <TextField
        id="register-name"
        label="Nome completo"
        name="name"
        placeholder="Nome do cliente"
        autoComplete="name"
        required
      />
      <p class="-mt-3 text-xs leading-5 text-slate-500">
        O email e opcional. Pode ser adicionado ou alterado depois no perfil.
      </p>

      <div class="grid gap-5 sm:grid-cols-2">
        <TextField
          id="register-phone"
          label="Telefone / WhatsApp"
          name="phone"
          type="tel"
          placeholder="+258..."
          autoComplete="tel"
          required
        />

        <TextField
          id="register-email"
          label="Email de contacto"
          name="email"
          type="email"
          placeholder="Opcional"
          autoComplete="email"
        />
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="register-password"
          label="Palavra-passe"
          name="password"
          placeholder="Criar palavra-passe"
          autoComplete="new-password"
          required
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirmar"
          name="confirmPassword"
          placeholder="Repetir palavra-passe"
          autoComplete="new-password"
          required
        />
      </div>

      <label class="flex items-start gap-3 text-sm leading-6 text-slate-400">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
        />
        Aceito que a Bitoll guarde estes dados para acompanhar pedidos e
        contactos futuros.
      </label>

      <Button
        type="submit"
        fullWidth
        spacing="none"
        buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
      >
        {isSubmitting.value ? "A criar..." : "Criar conta"}
      </Button>

    </form>
  );
});
