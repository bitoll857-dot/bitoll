import { component$ } from "@builder.io/qwik";

import NavLink from "./NavLink";
import { navLinks } from "./data";

export default component$(() => {
  return (
    <div class="lg:hidden absolute top-20 left-0 w-full border-b border-slate-800 bg-slate-950">
      <div class="container mx-auto px-6 py-6 flex flex-col gap-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
          />
        ))}
      </div>
    </div>
  );
});