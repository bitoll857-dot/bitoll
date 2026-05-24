import type {
  AccessibilityPreferences,
  AccessibilitySegmentOption,
  ContrastMode,
  FontMode,
  MotionMode,
  TextSizeMode,
} from "~/types/accessibility";

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  contrastMode: "default",
  textSize: "normal",
  fontMode: "default",
  motionMode: "normal",
};

export const contrastOptions: AccessibilitySegmentOption<ContrastMode>[] = [
  {
    label: "Padrao",
    value: "default",
    description: "Mantem as cores originais da Bitoll.",
  },
  {
    label: "Escuro",
    value: "dark-high",
    description: "Fundo escuro com texto mais forte.",
  },
  {
    label: "Claro",
    value: "light-high",
    description: "Fundo claro com texto escuro.",
  },
  {
    label: "Leitura",
    value: "reading",
    description: "Reduz brilho e melhora conforto.",
  },
];

export const textSizeOptions: AccessibilitySegmentOption<TextSizeMode>[] = [
  {
    label: "Normal",
    value: "normal",
    description: "Tamanho original do site.",
  },
  {
    label: "Medio",
    value: "medium",
    description: "Texto um pouco maior.",
  },
  {
    label: "Grande",
    value: "large",
    description: "Texto maior para leitura facil.",
  },
];

export const fontOptions: AccessibilitySegmentOption<FontMode>[] = [
  {
    label: "Padrao",
    value: "default",
    description: "Mantem a fonte original.",
  },
  {
    label: "Legivel",
    value: "readable",
    description: "Usa uma fonte simples e clara.",
  },
];

export const motionOptions: AccessibilitySegmentOption<MotionMode>[] = [
  {
    label: "Normal",
    value: "normal",
    description: "Mantem transicoes e movimentos.",
  },
  {
    label: "Reduzido",
    value: "reduced",
    description: "Diminui animacoes e efeitos.",
  },
];
