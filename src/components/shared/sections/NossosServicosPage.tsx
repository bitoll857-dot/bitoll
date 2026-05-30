import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

import ServiceProductsModal from "../modal/ServiceProducts";
import Button from "../button/Button";
import { loadServicesFromSupabase } from "~/lib/supabase/platform-data";
import type { Service } from "~/types/services";

export default component$(function ServicesSection() {
  const selectedServiceSlug = useSignal<string | null>(null);
  const selectedServiceTitle = useSignal("");
  const services = useSignal<Service[]>([]);
  const isLoading = useSignal(true);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    services.value = await loadServicesFromSupabase();
    isLoading.value = false;
  });

  return (
    <section class="relative overflow-hidden bg-slate-950 py-10">
      {/* Background Effects */}
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-32 left-0 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div class="absolute -bottom-32 right-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        class="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to_right, #ffffff_1px, transparent_1px),
            linear-gradient(to_bottom, #ffffff_1px, transparent_1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      <div class="container relative z-10 mx-auto p-6">
        {/* Services Grid */}
        <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {services.value.map((service) => {
            const Image = service.image;
            const serviceSlug = service.slug;
            const serviceTitle = service.title;
            const serviceFeatures = service.features ?? [];

            return (
              <div
                key={serviceSlug}
                class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition-all duration-500 hover:-translate-y-3 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <div class="relative h-[400px] overflow-hidden">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={serviceTitle}
                      class="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <Image />
                  )}

                  {/* Overlay */}
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

                  {/* Bottom Content */}
                  <div class="absolute bottom-0 left-0 right-0 z-20 p-8">
                    <p class="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-300">
                      {service.shortDescription}
                    </p>

                    {/* Features */}
                    <div class="mb-8 flex flex-wrap gap-2">
                      {serviceFeatures.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          class="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-400 backdrop-blur-xl"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div class="flex items-center justify-between border-t border-slate-800 pt-6">
                      <div>
                        <p class="text-xs uppercase tracking-widest text-slate-500">
                          Solucao Profissional
                        </p>
                        <p class="text-sm font-semibold text-cyan-400">
                          {serviceTitle}
                        </p>
                      </div>

                      <Button
                        variant="custom"
                        size="none"
                        spacing="none"
                        aria-label={`Ver produtos para ${serviceTitle}`}
                        buttonClass="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-2xl transition-all duration-300 group-hover:translate-x-1 group-hover:border-cyan-400 group-hover:bg-cyan-400/10 group-hover:text-cyan-400"
                        onClick$={() => {
                          selectedServiceSlug.value = serviceSlug ?? null;
                          selectedServiceTitle.value = serviceTitle;
                        }}
                      >
                        &gt;
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading.value && services.value.length === 0 && (
          <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
            Ainda nao existem servicos publicados no Supabase.
          </div>
        )}
      </div>

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
