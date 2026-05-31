import { component$, Slot } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import CustomerProjectsButton from "~/components/ui/projects";
import { ToastHost } from "~/components/ui/toast";

export default component$(() => {
  const location = useLocation();
  const isAdminRoute = location.url.pathname.startsWith("/admin");

  return (
    <>
      <Slot />
      {!isAdminRoute && <CustomerProjectsButton />}
      <ToastHost />
    </>
  );
});
