import { component$ } from "@builder.io/qwik";

import Button from "~/components/ui/Button"
import ServiceCard from "~/components/cards/Servicos";
import { services } from "./data";

export default component$(function ServicesSection() {
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
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              image={service.image}
            />
          ))}
        </div>
        <Button variant="secondary" position="end">Ver mais sobre nossos servicos</Button>
        
      </div>
    </section>
  );
});