import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Header from "~/components/ui/navigation/Header";
import Hero from "~/components/ui/sections/Hero";
import NossosServicos from "~/components/ui/sections/NossosServicos"
import Sobre from "~/components/ui/sections/Sobre"
import CTA from "~/components/ui/sections/CTA"
import Footer from "~/components/ui/sections/Footer"

export default component$(() => {
  return (
    <>
    <Header />
    <div class="min-h-screen bg-slate-950 text-white">
      {/* HERO SECTION */}
      <Hero />

      {/* SERVICES */}
      <NossosServicos />

      {/* ABOUT */}
      <Sobre />

      {/* CTA All to action */}
      <CTA />

      {/* FOOTER */}
      <Footer />
      
    </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Bem-vindo à Bitoll",
  meta: [
    {
      name: "description",
      content: "Bitoll é uma plataforma web que contem informações sobre os serviços fornecidos.",
    },
  ],
};
