import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Navbar from "~/components/navigation/Navbar";
import NossosServicosPage from "~/components/sections/NossosServicosPage"
import Footer from "~/components/sections/Footer"

export default component$(() => {
  return (
    <>
    <Navbar />
    <div class="min-h-screen bg-slate-950 text-white py-24">

      {/* SERVICES */}
      <NossosServicosPage />
      
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
