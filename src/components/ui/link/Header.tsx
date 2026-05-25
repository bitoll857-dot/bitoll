import { component$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";

import type { HeaderLinkProps } from "~/types/header";

export default component$<HeaderLinkProps>(
  ({ href, label }) => {
    const location = useLocation();
    const pathname = location.url.pathname;
    const isActive =
      href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

    return (
      <a
        href={href}
        aria-current={isActive ? "page" : undefined}
        class={[
          "relative text-slate-300 transition duration-300 hover:text-cyan-400",
          isActive &&
            "font-semibold text-cyan-300 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-cyan-400",
        ]}
      >
        {label}
      </a>
    );
  }
);
