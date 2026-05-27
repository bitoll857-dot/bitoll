import { component$, type QRL } from "@builder.io/qwik";

import HeaderLink from "../link/Header";
import { headerLinks } from "~/data/links";

type MobileMenuProps = {
  onOpenAccessibility$: QRL<() => void>;
};

export default component$<MobileMenuProps>(({ onOpenAccessibility$ }) => {
  return (
    <div class="absolute left-0 top-20 w-full border-b border-slate-800 bg-slate-950 lg:hidden">
      <div class="container mx-auto flex flex-col gap-6 px-6 py-6">
        {headerLinks.map((link) => (
          <HeaderLink key={link.href} href={link.href} label={link.label} />
        ))}

        <button
          type="button"
          class="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-left text-sm font-semibold text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
          onClick$={onOpenAccessibility$}
        >
          <span>Acessibilidade</span>
          <span class="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/30 text-xs font-black text-cyan-300">
            A
          </span>
        </button>
      </div>
    </div>
  );
});
