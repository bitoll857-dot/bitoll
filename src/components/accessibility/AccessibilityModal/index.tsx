import { component$, type QRL, useSignal } from "@builder.io/qwik";

import AccessibilityOption from "./AccessibilityOption";
import AccessibilitySegment from "./AccessibilitySegment";
import Button from "~/components/ui/Button";
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

  return (
    <div class="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar acessibilidade"
        class="absolute inset-0 h-full w-full bg-slate-950/80 backdrop-blur-xl"
        onClick$={onClose$}
      />

      <div class="relative z-10 mx-auto max-h-[92dvh] w-full max-w-[760px] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.75)] sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Acessibilidade
            </p>

            <h2 class="mt-2 text-2xl font-bold text-white">
              Ajustar experiencia
            </h2>

            <p class="mt-2 max-w-[560px] text-sm leading-6 text-slate-400">
              Escolha modos seguros para leitura. As preferencias ficam
              guardadas neste navegador e aplicam-se em todas as paginas.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-lg text-slate-300 transition duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            onClick$={onClose$}
          >
            x
          </button>
        </div>

        <div class="mt-7 space-y-5">
          <AccessibilityOption title="Guardado automaticamente">
            Quando muda uma opcao, o sistema aplica imediatamente e guarda no
            localStorage deste navegador.
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

        <div class="mt-7 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
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
  );
});
