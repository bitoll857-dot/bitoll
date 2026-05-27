import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import Header from "~/components/shared/header/Header";
import Hero from "~/components/shared/hero/Hero";
import NossosServicos from "~/components/shared/sections/NossosServicos";
import Sobre from "~/components/shared/sections/Sobre";
import CTA from "~/components/shared/sections/CTA";
import Footer from "~/components/shared/sections/Footer";
import VisitorGuide from "~/components/ui/guide";

export default component$(() => {
  return (
    <>
      <Header />
      <div class="min-h-screen bg-slate-950 text-white">
        <Hero />
        <NossosServicos />
        <Sobre />
        <CTA />
        <Footer />
        <VisitorGuide />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Bem-vindo a Bitoll",
  meta: [
    {
      name: "description",
      content:
        "Bitoll e uma plataforma web com informacoes sobre servicos, promocoes, orcamentos e acompanhamento de projetos.",
    },
  ],
};
