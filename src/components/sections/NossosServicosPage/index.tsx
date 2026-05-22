import { component$ } from "@builder.io/qwik";
import { services } from "./data";

export default component$(function ServicesSection() {
  return (
    <section class="relative overflow-hidden bg-slate-950 py-10">
      {/* Background Effects */}
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-32 left-0 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div class="absolute -bottom-32 right-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        class="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to_right, #ffffff_1px, transparent_1px),
            linear-gradient(to_bottom, #ffffff_1px, transparent_1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      <div class="container relative z-10 mx-auto p-6">


        {/* Services Grid */}
        <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-4 ">
          {services.map((service) => {
            const Image = "";
            Image = service.image;

            return (
              <div
                class="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition-all duration-500 hover:-translate-y-3 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                <div class="relative h-[400px] overflow-hidden">
                  <Image
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                  />

                  {/* Overlay */}
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

                  {/* Top Info - Mais alinhado */}
                  <div class="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
                    <span class="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/90 px-4 py-2 text-xs font-medium text-cyan-300 backdrop-blur-xl">
                      <span class="h-2 w-2 rounded-full bg-cyan-400 bold" />
                      {service.title}
                    </span>

                    <div class="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 text-3xl backdrop-blur-xl transition-colors group-hover:border-cyan-400/40">
                      {service.icon}
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div class="absolute bottom-0 left-0 right-0 z-20 p-8">

                    <p class="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-300">
                      {service.shortDescription}
                    </p>

                    {/* Features */}
                    <div class="mb-8 flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          class="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-400 backdrop-blur-xl"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div class="flex items-center justify-between border-t border-slate-800 pt-6">
                      <div>
                        <p class="text-xs uppercase tracking-widest text-slate-500">
                          Solução Profissional
                        </p>
                        <p class="text-sm font-semibold text-cyan-400">Bitoll Technology</p>
                      </div>

                      <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-2xl transition-all duration-300 group-hover:border-cyan-400 group-hover:bg-cyan-400/10 group-hover:text-cyan-400 group-hover:translate-x-1">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});