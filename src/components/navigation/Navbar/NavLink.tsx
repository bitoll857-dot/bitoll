import { component$ } from "@builder.io/qwik";

import type { NavLinkProps } from "./types";

export default component$<NavLinkProps>(
  ({ href, label }) => {
    return (
      <a
        href={href}
        class="text-slate-300 hover:text-cyan-400 transition duration-300"
      >
        {label}
      </a>
    );
  }
);