import { component$ } from "@builder.io/qwik";

import type { Service } from "./types";

export default component$<Service>(
  ({ title, description, image: Image }) => {
    return (
      <div
        class="
          relative
          overflow-hidden
          h-[420px]
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
          transition
          duration-500
          hover:-translate-y-2
          hover:border-cyan-400/40
          hover:shadow-2xl
          group
        "
      >
        {/* BACKGROUND IMAGE */}
        <Image />

        {/* OVERLAY */}
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        {/* CONTENT */}
        <div class="absolute bottom-0 left-0 p-8 z-10">
          <h3 class="text-2xl font-bold mb-4 text-white">
            {title}
          </h3>

          <p class="text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    );
  }
);