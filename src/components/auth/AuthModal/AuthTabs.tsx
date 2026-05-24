import { component$, type QRL } from "@builder.io/qwik";

import type { AuthMode } from "~/types/auth";

type AuthTabsProps = {
  mode: AuthMode;
  onModeChange$: QRL<(mode: AuthMode) => void>;
};

const tabs: { label: string; mode: AuthMode }[] = [
  { label: "Entrar", mode: "login" },
  { label: "Criar conta", mode: "register" },
];

export default component$<AuthTabsProps>(({ mode, onModeChange$ }) => {
  return (
    <div class="grid grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          class={[
            "h-11 rounded-xl text-sm font-semibold transition duration-300",
            mode === tab.mode
              ? "bg-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.20)]"
              : "text-slate-400 hover:text-cyan-200",
          ]}
          onClick$={() => onModeChange$(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});
