import { component$ } from "@builder.io/qwik";

type TextFieldProps = {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "email" | "tel" | "text";
  autoComplete?: string;
  required?: boolean;
};

export default component$<TextFieldProps>(
  ({
    id,
    label,
    name,
    placeholder,
    type = "text",
    autoComplete,
    required = false,
  }) => {
    return (
      <label for={id} class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-slate-900"
        />
      </label>
    );
  },
);
