import { defaultAccessibilityPreferences } from "~/data/accessibility";
import type {
  AccessibilityPreferences,
  ContrastMode,
  FontMode,
  MotionMode,
  TextSizeMode,
} from "~/types/accessibility";

export const accessibilityStorageKey = "bitoll_accessibility_preferences";

const contrastModes: ContrastMode[] = [
  "default",
  "blue",
  "green",
  "red",
  "gray",
  "white",
  "elegant-light",
  "dark-high",
  "light-high",
  "reading",
];

const textSizeModes: TextSizeMode[] = ["normal", "medium", "large"];
const fontModes: FontMode[] = ["default", "readable"];
const motionModes: MotionMode[] = ["normal", "reduced"];

const accessibilityClasses = [
  ...contrastModes.map((mode) => `a11y-contrast-${mode}`),
  ...textSizeModes.map((mode) => `a11y-text-${mode}`),
  ...fontModes.map((mode) => `a11y-font-${mode}`),
  ...motionModes.map((mode) => `a11y-motion-${mode}`),
];

const isValidValue = <T extends string>(value: unknown, allowed: T[]): value is T =>
  typeof value === "string" && allowed.includes(value as T);

export const normalizeAccessibilityPreferences = (
  value: Partial<AccessibilityPreferences> | null,
): AccessibilityPreferences => {
  return {
    contrastMode: isValidValue(value?.contrastMode, contrastModes)
      ? value.contrastMode
      : defaultAccessibilityPreferences.contrastMode,
    textSize: isValidValue(value?.textSize, textSizeModes)
      ? value.textSize
      : defaultAccessibilityPreferences.textSize,
    fontMode: isValidValue(value?.fontMode, fontModes)
      ? value.fontMode
      : defaultAccessibilityPreferences.fontMode,
    motionMode: isValidValue(value?.motionMode, motionModes)
      ? value.motionMode
      : defaultAccessibilityPreferences.motionMode,
  };
};

export const getAccessibilityPreferences = (): AccessibilityPreferences => {
  if (typeof window === "undefined") {
    return defaultAccessibilityPreferences;
  }

  try {
    const savedValue = window.localStorage.getItem(accessibilityStorageKey);

    if (!savedValue) {
      return defaultAccessibilityPreferences;
    }

    return normalizeAccessibilityPreferences(JSON.parse(savedValue));
  } catch {
    return defaultAccessibilityPreferences;
  }
};

export const applyAccessibilityPreferences = (
  preferences: AccessibilityPreferences,
) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.classList.remove(...accessibilityClasses);
  root.classList.add(
    `a11y-contrast-${preferences.contrastMode}`,
    `a11y-text-${preferences.textSize}`,
    `a11y-font-${preferences.fontMode}`,
    `a11y-motion-${preferences.motionMode}`,
  );
};

export const saveAccessibilityPreferences = (
  preferences: AccessibilityPreferences,
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    accessibilityStorageKey,
    JSON.stringify(preferences),
  );
  applyAccessibilityPreferences(preferences);
};

export const resetAccessibilityPreferences = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(accessibilityStorageKey);
  }

  applyAccessibilityPreferences(defaultAccessibilityPreferences);
};
