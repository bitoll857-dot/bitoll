import { component$, useSignal } from "@builder.io/qwik";

import NavLink from "./NavLink";
import MobileMenu from "./MobileMenu";
import { navLinks } from "./data";

export default component$(() => {
  const mobileMenu = useSignal(false);

  return (
    <header class="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between h-20">

          {/* LOGO */}
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center font-bold text-slate-950">
              B
            </div>

            <div>
              <h1 class="text-xl font-bold text-white">
                Bitoll
              </h1>

              <p class="text-xs text-slate-400">
                Segurança & Tecnologia
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav class="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
              />
            ))}
          </nav>

          {/* CTA BUTTON */}
          <div class="hidden lg:block">
            <button class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition font-semibold text-slate-950">
              Solicitar Orçamento
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            class="lg:hidden text-white text-3xl"
            onClick$={() => {
              mobileMenu.value = !mobileMenu.value;
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenu.value && <MobileMenu />}
    </header>
  );
});