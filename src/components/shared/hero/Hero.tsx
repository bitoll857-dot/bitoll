import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import Button from "~/components/ui/button/Button";
import ContactMenu from "~/components/ui/contact/ContactMenu";
import ServiceProductsModal from "~/components/ui/modal/ServiceProducts";
import HeroVisual from "~/components/visual/Hero";
import { loadServicesFromSupabase } from "~/lib/supabase/platform-data";
import type { Service } from "~/types/services";

export default component$(() => {
  const services = useSignal<Service[]>([]);
  const servicePickerModal = useSignal(false);
  const selectedServiceSlug = useSignal<string | null>(null);
  const selectedServiceTitle = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    services.value = await loadServicesFromSupabase();
  });

  return (
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent" />

      <div class="container relative z-10 mx-auto px-6 py-24">
        <div class="grid items-center gap-16 lg:grid-cols-2">
          <div class="max-w-3xl">
            <h1 class="mb-6 font-bold leading-tight">
              <span class="text-5xl md:text-7xl">Bitoll</span>

              <span class="block text-3xl text-cyan-400 md:text-5xl">
                Seguranca e Tecnologia
              </span>
            </h1>

            <p class="mb-10 max-w-2xl bg-cyan-100/2 px-4 py-4 text-lg leading-relaxed text-slate-400 md:text-xl">
              Solucoes modernas em vedacao eletrica, CCTV, automacao de
              portoes, controlo de acesso e tecnologias inteligentes para
              empresas, residencias e industrias.
            </p>

            <div class="flex flex-wrap gap-4">
              <Button
                variant="primary"
                onClick$={() => {
                  servicePickerModal.value = true;
                }}
              >
                Solicitar Orcamento
              </Button>

              <ContactMenu />
            </div>
          </div>

          <div class="relative">
            <div class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 blur" />

            <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
              <HeroVisual />

              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <div class="absolute bottom-0 left-0 p-8">
                <span class="mb-4 inline-block rounded-full border border-cyan-400/20 bg-cyan-500/20 px-3 py-1 text-xs text-cyan-300">
                  Instalacao Profissional
                </span>

                <h3 class="mb-3 text-3xl font-bold">
                  Sistemas Inteligentes
                </h3>

                <p class="leading-relaxed text-slate-300">
                  Solucoes modernas em seguranca eletronica, CCTV e automacao
                  tecnologica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {servicePickerModal.value && (
        <div class="fixed inset-0 z-[260] flex min-h-dvh items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar escolha de servico"
            class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
            onClick$={() => {
              servicePickerModal.value = false;
            }}
          />

          <div class="relative z-10 mx-auto max-h-[90dvh] w-full max-w-[980px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
            <button
              type="button"
              aria-label="Fechar"
              autoFocus
              class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              onClick$={() => {
                servicePickerModal.value = false;
              }}
            >
              x
            </button>

            <div class="pr-14">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Solicitar orcamento
              </p>
              <h2 class="mt-2 text-2xl font-bold text-white">
                Escolha um servico preparado pela Bitoll
              </h2>
              <p class="mt-2 max-w-[680px] text-sm leading-6 text-slate-400">
                O pedido continua a partir das estruturas e cotacoes ja
                cadastradas no sistema.
              </p>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              {services.value.map((service) => {
                const serviceSlug = service.slug ?? "";
                const serviceTitle = service.title;
                const serviceImageUrl = service.imageUrl;
                const serviceDescription =
                  service.shortDescription || service.description;

                return (
                  <button
                    key={serviceSlug}
                    type="button"
                    class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
                    onClick$={() => {
                      selectedServiceSlug.value = serviceSlug || null;
                      selectedServiceTitle.value = serviceTitle;
                    }}
                  >
                    {serviceImageUrl && (
                      <img
                        src={serviceImageUrl}
                        alt={serviceTitle}
                        width={640}
                        height={280}
                        class="h-44 w-full object-cover"
                      />
                    )}
                    <span class="block p-5">
                      <span class="block text-lg font-bold text-white">
                        {serviceTitle}
                      </span>
                      <span class="mt-2 line-clamp-2 block text-sm leading-6 text-slate-400">
                        {serviceDescription}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {services.value.length === 0 && (
              <div class="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
                Ainda nao existem servicos publicados para solicitar.
              </div>
            )}
          </div>
        </div>
      )}

      {selectedServiceSlug.value && (
        <ServiceProductsModal
          serviceSlug={selectedServiceSlug.value}
          serviceTitle={selectedServiceTitle.value}
          onClose$={() => {
            selectedServiceSlug.value = null;
            selectedServiceTitle.value = "";
          }}
        />
      )}
    </section>
  );
});
