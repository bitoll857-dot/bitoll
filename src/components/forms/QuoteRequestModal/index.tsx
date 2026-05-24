import { component$, type QRL } from "@builder.io/qwik";

import SelectField from "~/components/auth/fields/SelectField";
import TextField from "~/components/auth/fields/TextField";
import Button from "~/components/ui/Button";

type QuoteRequestModalProps = {
  onClose$: QRL<() => void>;
};

const serviceOptions = [
  { label: "CCTV e monitoramento", value: "cctv" },
  { label: "Vedacao eletrica", value: "vedacao-eletrica" },
  { label: "Motor de portao", value: "motor-portao" },
  { label: "Tecnologia inteligente", value: "tecnologia-inteligente" },
  { label: "Outro servico", value: "outro" },
];

const customerTypeOptions = [
  { label: "Particular", value: "particular" },
  { label: "Empresa", value: "empresa" },
  { label: "Condominio", value: "condominio" },
  { label: "Industria", value: "industria" },
];

const contactOptions = [
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Chamada telefonica", value: "telefone" },
  { label: "Email", value: "email" },
];

export default component$<QuoteRequestModalProps>(({ onClose$ }) => {
  return (
    <div class="fixed inset-0 z-[400] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Fechar formulario de orcamento"
        class="absolute inset-0 h-full w-full bg-slate-950/75 backdrop-blur-xl"
        onClick$={onClose$}
      />

      <div class="relative z-10 max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Orcamento Bitoll
            </p>

            <h2 class="mt-2 text-2xl font-bold text-white">
              Solicitar orcamento
            </h2>

            <p class="mt-2 max-w-[520px] text-sm leading-6 text-slate-400">
              Preencha os dados principais para a equipa Bitoll perceber o
              pedido e entrar em contacto pelo canal preferido.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>
        </div>

        <form preventdefault:submit class="mt-7 space-y-5">
          <div class="grid gap-5 sm:grid-cols-2">
            <TextField
              id="quote-name"
              label="Nome"
              name="name"
              placeholder="Nome do cliente"
              autoComplete="name"
              required
            />

            <TextField
              id="quote-phone"
              label="Telefone / WhatsApp"
              name="phone"
              type="tel"
              placeholder="+258..."
              autoComplete="tel"
              required
            />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <TextField
              id="quote-email"
              label="Email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="email"
            />

            <TextField
              id="quote-location"
              label="Localizacao"
              name="location"
              placeholder="Cidade ou bairro"
              autoComplete="address-level2"
              required
            />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="quote-service"
              label="Servico"
              name="service"
              options={serviceOptions}
              required
            />

            <SelectField
              id="quote-customer-type"
              label="Tipo de cliente"
              name="customerType"
              options={customerTypeOptions}
              required
            />
          </div>

          <SelectField
            id="quote-contact-method"
            label="Contacto preferido"
            name="contactMethod"
            options={contactOptions}
            required
          />

          <label for="quote-message" class="block">
            <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Detalhes do pedido
            </span>

            <textarea
              id="quote-message"
              name="message"
              placeholder="Descreva o local, quantidade de equipamentos, urgencia ou qualquer detalhe importante."
              rows={4}
              class="mt-2 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-900"
            />
          </label>

          <label class="flex items-start gap-3 text-sm leading-6 text-slate-400">
            <input
              type="checkbox"
              name="allowContact"
              required
              class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400"
            />
            Autorizo a Bitoll a entrar em contacto para responder a este
            pedido de orcamento.
          </label>

          <Button
            type="submit"
            fullWidth
            spacing="none"
            buttonClass="flex h-12 items-center justify-center rounded-2xl text-sm font-bold"
          >
            Enviar pedido
          </Button>
        </form>
      </div>
    </div>
  );
});
