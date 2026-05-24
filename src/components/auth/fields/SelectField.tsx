import { component$ } from "@builder.io/qwik";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  options: SelectOption[];
  required?: boolean;
};

export default component$<SelectFieldProps>(
  ({ id, label, name, options, required = false }) => {
    return (
      <label for={id} class="block">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>

        <select
          id={id}
          name={name}
          required={required}
          class="mt-2 h-12 w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 text-sm text-white outline-none transition duration-300 focus:border-cyan-400/50 focus:bg-slate-900"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  },
);
