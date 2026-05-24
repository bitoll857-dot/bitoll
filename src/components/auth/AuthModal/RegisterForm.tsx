import { component$ } from "@builder.io/qwik";

import PasswordField from "../fields/PasswordField";
import SelectField from "../fields/SelectField";
import TextField from "../fields/TextField";
import Button from "~/components/ui/Button";

const customerTypeOptions = [
  { label: "Particular", value: "Particular" },
  { label: "Empresa", value: "Empresa" },
  { label: "Condominio", value: "Condominio" },
  { label: "Industria", value: "Industria" },
];

export default component$(() => {
  return (
    <form preventdefault:submit class="mt-6 space-y-5">
      <TextField
        id="register-name"
        label="Nome completo"
        name="name"
        placeholder="Nome do cliente"
        autoComplete="name"
        required
      />

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
          label="Email"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          autoComplete="email"
          required
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

      <div class="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="register-customer-type"
          label="Tipo de cliente"
          name="customerType"
          options={customerTypeOptions}
          required
        />

        <TextField
          id="register-city"
          label="Cidade"
          name="city"
          placeholder="Ex: Maputo"
          autoComplete="address-level2"
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
        Criar conta
      </Button>
    </form>
  );
});
