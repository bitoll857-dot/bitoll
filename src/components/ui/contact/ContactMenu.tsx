import { component$, useSignal } from "@builder.io/qwik";

const phoneDisplay = "+258 86 613 6316";
const phoneHref = "+258866136316";
const email = "bitoll857@gmail.com";
const whatsappMessage = encodeURIComponent(
  "Ola Bitoll, gostaria de falar convosco sobre os vossos servicos.",
);

const contactOptions = [
  {
    href: `https://wa.me/${phoneHref.replace("+", "")}?text=${whatsappMessage}`,
    label: "WhatsApp",
    meta: phoneDisplay,
    target: "_blank",
  },
  {
    href: `mailto:${email}`,
    label: "Email",
    meta: email,
  },
  {
    href: `tel:${phoneHref}`,
    label: "Chamada",
    meta: phoneDisplay,
  },
];

export default component$(() => {
  const isOpen = useSignal(false);

  return (
    <div class="inline-flex">
      <button
        type="button"
        aria-expanded={isOpen.value}
        aria-label="Contacte-nos"
        class="my-6 inline-flex items-center gap-3 rounded-xl border border-slate-700 px-6 py-3 text-base font-semibold text-white transition duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      >
        <span>Contacte-nos</span>
        <span
          aria-hidden="true"
          class={[
            "text-sm transition duration-300",
            isOpen.value ? "rotate-180 text-cyan-300" : "text-slate-500",
          ]}
        >
          v
        </span>
      </button>

      {isOpen.value && (
        <div class="fixed inset-0 z-[820] flex min-h-dvh items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar contactos"
            class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
            onClick$={() => {
              isOpen.value = false;
            }}
          />

          <div class="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
            <button
              type="button"
              aria-label="Fechar"
              autoFocus
              class="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              onClick$={() => {
                isOpen.value = false;
              }}
            >
              x
            </button>

            <div class="border-b border-slate-800 px-6 py-6 pr-20">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Contacte-nos
              </p>
              <h2 class="mt-2 text-2xl font-bold text-white">
                Fale com a Bitoll
              </h2>
              <p class="mt-2 text-sm leading-6 text-slate-400">
                Escolha o canal mais conveniente para falar connosco.
              </p>
            </div>

            <div class="grid gap-3 p-5">
              {contactOptions.map((option) => (
                <a
                  key={option.label}
                  href={option.href}
                  target={option.target}
                  rel={option.target ? "noreferrer" : undefined}
                  class="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4 text-left transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                  onClick$={() => {
                    isOpen.value = false;
                  }}
                >
                  <span class="min-w-0">
                    <span class="block text-sm font-bold text-slate-100 group-hover:text-cyan-200">
                      {option.label}
                    </span>
                    <span class="mt-1 block truncate text-xs text-slate-500 group-hover:text-slate-300">
                      {option.meta}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm font-bold text-slate-400 transition duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/10 group-hover:text-cyan-200"
                  >
                    &gt;
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
