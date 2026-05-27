import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useTask$,
} from "@builder.io/qwik";

import Button from "../button/Button";

const storageKey = "bitoll_visitor_guide_v2";

type GuideTarget = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type GuideStep = {
  title: string;
  description: string;
  desktopTarget: string;
  mobileTarget: string;
  mobileDescription?: string;
};

const guideSteps: GuideStep[] = [
  {
    title: "Acessibilidade",
    description:
      "Clique aqui para ajustar contraste, tamanho do texto, tipo de letra e movimento.",
    desktopTarget: "accessibility",
    mobileTarget: "mobile-menu",
    mobileDescription:
      "No telemovel, toque no menu para encontrar a opcao de acessibilidade.",
  },
  {
    title: "Conta do cliente",
    description:
      "Clique no avatar para entrar ou criar uma conta opcional e guardar os seus pedidos.",
    desktopTarget: "account",
    mobileTarget: "account-mobile",
  },
  {
    title: "Pesquisa global",
    description:
      "Pesquise por termos como servicos de alta qualidade, CCTV, vedacao ou promocoes.",
    desktopTarget: "search",
    mobileTarget: "search",
  },
  {
    title: "Acompanhar projetos",
    description:
      "Depois de logado, use este botao flutuante para acompanhar o andamento dos servicos.",
    desktopTarget: "projects",
    mobileTarget: "projects",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default component$(() => {
  const isVisible = useSignal(false);
  const step = useSignal(0);
  const target = useSignal<GuideTarget | null>(null);
  const isMobile = useSignal(false);

  const updateTarget$ = $(() => {
    const currentStep = guideSteps[step.value];

    if (!currentStep) {
      target.value = null;
      return;
    }

    isMobile.value = window.matchMedia("(max-width: 767px)").matches;

    const targetName = isMobile.value
      ? currentStep.mobileTarget
      : currentStep.desktopTarget;
    const element = document.querySelector<HTMLElement>(
      `[data-guide="${targetName}"]`,
    );

    if (!element) {
      target.value = null;
      return;
    }

    const rect = element.getBoundingClientRect();

    target.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  });

  useOnWindow(
    "load",
    $(() => {
      isVisible.value = window.localStorage.getItem(storageKey) !== "closed";
      updateTarget$();
    }),
  );

  useOnWindow("resize", updateTarget$);
  useOnWindow("scroll", updateTarget$);

  useTask$(({ track }) => {
    track(() => step.value);

    if (typeof window === "undefined") {
      return;
    }

    window.setTimeout(() => {
      updateTarget$();
    }, 0);
  });

  if (!isVisible.value) {
    return null;
  }

  const currentStep = guideSteps[step.value];
  const isLastStep = step.value === guideSteps.length - 1;
  const currentDescription =
    isMobile.value && currentStep.mobileDescription
      ? currentStep.mobileDescription
      : currentStep.description;

  const cardTop = target.value
    ? clamp(target.value.top + target.value.height + 18, 96, window.innerHeight - 260)
    : 110;
  const cardLeft = target.value
    ? clamp(target.value.left, 16, window.innerWidth - 392)
    : 16;

  return (
    <>
      <div class="fixed inset-0 z-[230] bg-slate-950/45 backdrop-blur-[2px]" />

      {target.value && (
        <>
          <div
            class="pointer-events-none fixed z-[270] rounded-3xl border-2 border-cyan-300 shadow-[0_0_0_9999px_rgba(2,6,23,0.35),0_0_35px_rgba(34,211,238,0.55)]"
            style={{
              top: `${target.value.top - 8}px`,
              left: `${target.value.left - 8}px`,
              width: `${target.value.width + 16}px`,
              height: `${target.value.height + 16}px`,
            }}
          />

          <div
            class="pointer-events-none fixed z-[271] h-8 w-0.5 rounded-full bg-cyan-300"
            style={{
              top: `${target.value.top + target.value.height + 4}px`,
              left: `${target.value.left + target.value.width / 2}px`,
            }}
          />
        </>
      )}

      <div
        class="fixed z-[280] w-[calc(100%-2rem)] max-w-[376px] rounded-3xl border border-cyan-400/30 bg-slate-950 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.8)]"
        style={{
          top: `${cardTop}px`,
          left: `${cardLeft}px`,
        }}
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Guia Bitoll {step.value + 1}/{guideSteps.length}
            </p>
            <h2 class="mt-2 text-lg font-bold text-white">
              {currentStep.title}
            </h2>
          </div>

          <button
            type="button"
            aria-label="Fechar guia"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-sm text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:text-cyan-300"
            onClick$={() => {
              window.localStorage.setItem(storageKey, "closed");
              isVisible.value = false;
            }}
          >
            x
          </button>
        </div>

        <p class="mt-3 text-sm leading-6 text-slate-400">
          {currentDescription}
        </p>

        <div class="mt-4 flex gap-2">
          {guideSteps.map((item, index) => (
            <span
              key={item.title}
              class={[
                "h-1.5 flex-1 rounded-full",
                index <= step.value ? "bg-cyan-400" : "bg-slate-800",
              ]}
            />
          ))}
        </div>

        <div class="mt-5 flex flex-wrap gap-3">
          <Button
            spacing="none"
            buttonClass="rounded-2xl px-4 py-2 text-sm font-bold"
            onClick$={() => {
              if (isLastStep) {
                window.localStorage.setItem(storageKey, "closed");
                isVisible.value = false;
                return;
              }

              step.value += 1;
            }}
          >
            {isLastStep ? "Concluir" : "Continuar"}
          </Button>

          <Button
            variant="secondary"
            spacing="none"
            buttonClass="rounded-2xl px-4 py-2 text-sm font-semibold"
            onClick$={() => {
              window.localStorage.setItem(storageKey, "closed");
              isVisible.value = false;
            }}
          >
            Entendi
          </Button>
        </div>
      </div>
    </>
  );
});

