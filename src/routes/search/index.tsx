import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <section>
      <h1>Search</h1>
      <p>Feature ainda não implementada.</p>
    </section>
  );
});

export const head: DocumentHead = {
  title: "Search",
  meta: [
    {
      name: "description",
      content: "Feature ainda não implementada.",
    },
  ],
};
