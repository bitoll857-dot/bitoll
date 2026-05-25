import { component$ } from "@builder.io/qwik";

type PasswordFieldProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
};

export default component$<PasswordFieldProps>(
  ({ id, label, name, placeholder, autoComplete, required = false }) => {
    return (
      <label for={id} class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>

        <input
          id={id}
          name={name}
          type="password"
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-900"
        />
      </label>
    );
  },
);
