import { component$, type QRL, useSignal } from "@builder.io/qwik";

import AccessibilityOption from "../options/Accessibility";
import AccessibilitySegment from "../segments/Accessibility";
import Button from "../button/Button";
import {
  contrastOptions,
  defaultAccessibilityPreferences,
  fontOptions,
  motionOptions,
  textSizeOptions,
} from "~/data/accessibility";
import type {
  AccessibilityPreferences,
  ContrastMode,
  FontMode,
  MotionMode,
  TextSizeMode,
} from "~/types/accessibility";
import {
  getAccessibilityPreferences,
  resetAccessibilityPreferences,
  saveAccessibilityPreferences,
} from "~/utils/accessibility-storage";

type AccessibilityModalProps = {
  onClose$: QRL<() => void>;
};

export default component$<AccessibilityModalProps>(({ onClose$ }) => {
  const preferences = useSignal<AccessibilityPreferences>(
    getAccessibilityPreferences(),
  );
  const selectedContrast =
    contrastOptions.find(
      (option) => option.value === preferences.value.contrastMode,
    ) ?? contrastOptions[0];
  const selectedTextSize =
    textSizeOptions.find((option) => option.value === preferences.value.textSize) ??
    textSizeOptions[0];

  return (
    <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar acessibilidade"
        class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
        onClick$={onClose$}
      />

      <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[820px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.75)]">
        <button
          type="button"
          aria-label="Fechar"
          class="absolute right-5 top-5 z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/95 text-lg text-slate-300 shadow-xl transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
          onClick$={onClose$}
        >
          x
        </button>

        <div class="max-h-[92dvh] overflow-y-auto p-6 sm:p-8">
          <div class="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.35)]">
            <div class="flex flex-wrap items-start justify-between gap-5 pr-14">
              <div class="flex min-w-0 items-start gap-4">
                <div
                  role="img"
                  aria-label="Bitoll"
                  class="h-14 w-14 shrink-0 rounded-2xl bg-cover bg-center shadow-[0_0_35px_rgba(6,182,212,0.18)]"
                  style={{
                    backgroundImage: "url('/brand/bitoll-mark-bg-navy.svg')",
                  }}
                />

                <div class="min-w-0">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Acessibilidade
                  </p>

                  <h2 class="mt-2 text-2xl font-black text-white">
                    Ajustar leitura
                  </h2>

                  <p class="mt-2 max-w-[560px] text-sm leading-6 text-slate-400">
                    Escolha uma combinacao confortavel de contraste, tamanho,
                    fonte e movimento.
                  </p>
                </div>
              </div>

              <div class="hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right sm:block">
                <p class="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200">
                  Atual
                </p>
                <p class="mt-1 text-sm font-bold text-white">
                  {selectedContrast.label} / {selectedTextSize.label}
                </p>
              </div>
            </div>

            <div class="mt-5 grid gap-3 md:grid-cols-[1fr_240px]">
              <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Previa
                </p>
                <p class="mt-2 text-base font-black text-white">
                  Texto legivel, fundo consistente.
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-400">
                  Use esta area para confirmar se a combinacao escolhida esta
                  confortavel para os olhos.
                </p>
              </div>

              <div class="grid gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
                <div class="flex items-center justify-between gap-3">
                  <span class="text-slate-500">Contraste</span>
                  <strong class="text-white">{selectedContrast.label}</strong>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span class="text-slate-500">Texto</span>
                  <strong class="text-white">{selectedTextSize.label}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 space-y-5">
            <AccessibilityOption title="Guardado automaticamente">
              Quando muda uma opcao, o sistema aplica imediatamente e guarda
              neste navegador.
            </AccessibilityOption>

            <AccessibilitySegment
              title="Contraste"
              value={preferences.value.contrastMode}
              options={contrastOptions}
              onChange$={(value) => {
                const updatedPreferences = {
                  ...preferences.value,
                  contrastMode: value as ContrastMode,
                };

                preferences.value = updatedPreferences;
                saveAccessibilityPreferences(updatedPreferences);
              }}
            />

            <AccessibilitySegment
              title="Tamanho do texto"
              value={preferences.value.textSize}
              options={textSizeOptions}
              onChange$={(value) => {
                const updatedPreferences = {
                  ...preferences.value,
                  textSize: value as TextSizeMode,
                };

                preferences.value = updatedPreferences;
                saveAccessibilityPreferences(updatedPreferences);
              }}
            />

            <AccessibilitySegment
              title="Tipo de letra"
              value={preferences.value.fontMode}
              options={fontOptions}
              onChange$={(value) => {
                const updatedPreferences = {
                  ...preferences.value,
                  fontMode: value as FontMode,
                };

                preferences.value = updatedPreferences;
                saveAccessibilityPreferences(updatedPreferences);
              }}
            />

            <AccessibilitySegment
              title="Movimento"
              value={preferences.value.motionMode}
              options={motionOptions}
              onChange$={(value) => {
                const updatedPreferences = {
                  ...preferences.value,
                  motionMode: value as MotionMode,
                };

                preferences.value = updatedPreferences;
                saveAccessibilityPreferences(updatedPreferences);
              }}
            />
          </div>

          <div class="sticky bottom-0 -mx-6 mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-800 bg-slate-950/95 px-6 pt-5 backdrop-blur-xl sm:-mx-8 sm:px-8">
            <Button
              variant="custom"
              size="none"
              spacing="none"
              buttonClass="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/30 hover:text-cyan-200"
              onClick$={() => {
                preferences.value = defaultAccessibilityPreferences;
                resetAccessibilityPreferences();
              }}
            >
              Restaurar padrao
            </Button>

            <Button
              spacing="none"
              buttonClass="rounded-2xl px-5 py-3 text-sm font-bold"
              onClick$={onClose$}
            >
              Concluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
