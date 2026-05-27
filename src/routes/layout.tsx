import { component$, Slot } from "@builder.io/qwik";

import CustomerProjectsButton from "~/components/ui/projects";

export default component$(() => {
  return (
    <>
      <Slot />
      <CustomerProjectsButton />
    </>
  );
});
