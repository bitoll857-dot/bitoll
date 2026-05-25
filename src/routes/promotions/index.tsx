import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Navbar from "~/components/ui/navigation/Header";
import Promocoes from "~/components/ui/sections/Promocoes"
import Footer from "~/components/ui/sections/Footer"

export default component$(() => {
  return (
    <>
    <Navbar />
    <div class="min-h-screen bg-slate-950 text-white py-24">

      {/* SERVICES */}
      <Promocoes />
      
      {/* FOOTER */}
      <Footer />
      
    </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Promoções na Bitoll",
  meta: [
    {
      name: "description",
      content: "Bitoll é uma plataforma web que contem informações sobre os serviços fornecidos.",
    },
  ],
};
