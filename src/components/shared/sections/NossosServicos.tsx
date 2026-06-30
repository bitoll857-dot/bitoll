import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

import Button from "../button/Button"
import ServiceProductsModal from "../modal/ServiceProducts";
import ServiceCard from "../cards/Servicos";
import { loadServicesFromSupabase } from "~/lib/supabase/platform-data";
import type { Service } from "~/types/services";

export default component$(function ServicesSection() {
  const navigate = useNavigate();
  const selectedServiceSlug = useSignal<string | null>(null);
  const selectedServiceTitle = useSignal("");
  const services = useSignal<Service[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    services.value = await loadServicesFromSupabase();
  });

  return (
    <section class="py-6">
      <div class="container mx-auto px-6">

        {/* HEADER */}
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold mb-6">
            Nossos Serviços
          </h2>

          <p class="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tecnologia moderna e soluções inteligentes
            para proteção, automação e segurança.
          </p>
        </div>

        {/* GRID */}
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.value.map((service) => {
            const serviceSlug = service.slug;
            const serviceTitle = service.title;

            return (
              <ServiceCard
                key={serviceTitle}
                title={serviceTitle}
                description={service.description}
                image={service.image}
                imageUrl={service.imageUrl}
                slug={serviceSlug}
                onOpen$={() => {
                  if (!serviceSlug) {
                    navigate("/services");
                    return;
                  }

                  selectedServiceSlug.value = serviceSlug;
                  selectedServiceTitle.value = serviceTitle;
                }}
              />
            );
          })}
        </div>
        <Button
          variant="secondary"
          position="end"
          onClick$={() => {
            navigate("/services");
          }}
        >
          Ver mais sobre nossos servicos
        </Button>
        
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
